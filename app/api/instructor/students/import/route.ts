
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@server/db';
import { users, activityLog } from '@shared/schema';
import { hashPassword } from '@/lib/auth';
import { eq } from 'drizzle-orm';

export async function POST(req: NextRequest) {
    const session = await getSession();

    if (!session || session.role !== 'instructor') {
        return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
    }

    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;
        const schoolId = formData.get('schoolId') as string;
        const fileType = formData.get('fileType') as string;

        if (!file || !schoolId) {
            return NextResponse.json({
                error: 'File and school ID are required'
            }, { status: 400 });
        }

        const text = await file.text();
        const lines = text.split('\n').filter(line => line.trim());

        if (lines.length < 2) {
            return NextResponse.json({
                error: 'File must contain at least a header and one student'
            }, { status: 400 });
        }

        // Parse CSV (works for both CSV and Excel exported as CSV)
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        const requiredHeaders = ['name', 'email', 'studentid', 'password'];

        const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
        if (missingHeaders.length > 0) {
            return NextResponse.json({
                error: `Missing required columns: ${missingHeaders.join(', ')}`
            }, { status: 400 });
        }

        const nameIndex = headers.indexOf('name');
        const emailIndex = headers.indexOf('email');
        const studentIdIndex = headers.indexOf('studentid');
        const passwordIndex = headers.indexOf('password');
        const gradeIndex = headers.indexOf('grade');

        const studentsToImport = [];
        const errors = [];

        // Process each student row
        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.trim());

            const name = values[nameIndex];
            const email = values[emailIndex];
            const studentId = values[studentIdIndex];
            const password = values[passwordIndex];
            const grade = gradeIndex >= 0 ? values[gradeIndex] : null;

            if (!name || !email || !password) {
                errors.push(`Row ${i + 1}: Missing required fields`);
                continue;
            }

            // Check if email already exists
            const [existingUser] = await db
                .select()
                .from(users)
                .where(eq(users.email, email))
                .limit(1);

            if (existingUser) {
                errors.push(`Row ${i + 1}: Email ${email} already exists`);
                continue;
            }

            // Check if studentId already exists
            if (studentId) {
                const [existingStudentId] = await db
                    .select()
                    .from(users)
                    .where(eq(users.studentId, studentId))
                    .limit(1);

                if (existingStudentId) {
                    errors.push(`Row ${i + 1}: Student ID ${studentId} already exists`);
                    continue;
                }
            }

            studentsToImport.push({
                name,
                email,
                studentId: studentId || null,
                password: await hashPassword(password),
                grade: grade || null,
                role: 'student' as const,
            });
        }

        if (studentsToImport.length === 0) {
            return NextResponse.json({
                error: 'No valid students to import',
                errors
            }, { status: 400 });
        }

        // Insert all students
        const insertedStudents = await db
            .insert(users)
            .values(studentsToImport)
            .returning();

        // Assign all students to the school
        const schoolAssignments = insertedStudents.map(student => ({
            schoolId,
            userId: student.id,
        }));

        // await db.insert(schoolStudents).values(schoolAssignments);

        // Log the import activity
        await db.insert(activityLog).values({
            userId: session.userId,
            entityType: 'user',
            entityId: insertedStudents[0].id,
            action: 'imported',
            description: `Imported ${insertedStudents.length} students to school ${schoolId}`,
        });

        return NextResponse.json({
            count: insertedStudents.length,
            students: insertedStudents.map(s => ({
                id: s.id,
                name: s.name,
                email: s.email,
            })),
            errors: errors.length > 0 ? errors : undefined
        }, { status: 201 });
    } catch (error) {
        console.error('Error importing students:', error);
        return NextResponse.json({
            error: 'Failed to import students'
        }, { status: 500 });
    }
}

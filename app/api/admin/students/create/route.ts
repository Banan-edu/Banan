
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@server/db';
import { users, schoolStudents, activityLog } from '@shared/schema';
import { hashPassword } from '@/lib/auth';
import { eq } from 'drizzle-orm';

export async function POST(req: NextRequest) {
    const session = await getSession();

    if (!session || session.role !== 'admin') {
        return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
    }

    const { name, email, password, studentId, grade, schoolId, accessibility } = await req.json();

    if (!name || !email || !password) {
        return NextResponse.json({
            error: 'Name, email, and password are required'
        }, { status: 400 });
    }

    try {
        // Check if email already exists
        const [existingUser] = await db
            .select()
            .from(users)
            .where(eq(users.email, email))
            .limit(1);

        if (existingUser) {
            return NextResponse.json({
                error: 'A user with this email already exists'
            }, { status: 400 });
        }

        // Check if studentId already exists (if provided)
        if (studentId) {
            const [existingStudentId] = await db
                .select()
                .from(users)
                .where(eq(users.studentId, studentId))
                .limit(1);

            if (existingStudentId) {
                return NextResponse.json({
                    error: 'A user with this student ID already exists'
                }, { status: 400 });
            }
        }

        // Hash password
        const hashedPassword = await hashPassword(password);

        // Create the student user
        const [newStudent] = await db
            .insert(users)
            .values({
                name,
                email,
                password: hashedPassword,
                studentId: studentId || null,
                grade: grade || null,
                role: 'student',
                accessibility: accessibility || [],
            })
            .returning();

        // Assign student to school if provided
        if (schoolId) {
            await db.insert(schoolStudents).values({
                schoolId: parseInt(schoolId),
                userId: newStudent.id,
            });

            await db.insert(activityLog).values({
                userId: session.userId,
                entityType: 'school students',
                entityId: newStudent.id,
                action: 'added',
                description: `Assigned student ${name} (${email}) to school ${schoolId}`,
            });
        }

        // Log the creation activity
        await db.insert(activityLog).values({
            userId: session.userId,
            entityType: 'user',
            entityId: newStudent.id,
            action: 'created',
            description: `Created student: ${name} (${email})`,
        });

        return NextResponse.json({
            student: {
                id: newStudent.id,
                name: newStudent.name,
                email: newStudent.email,
                studentId: newStudent.studentId,
                grade: newStudent.grade,
                role: newStudent.role,
                accessibility: newStudent.accessibility,
                createdAt: newStudent.createdAt,
            }
        }, { status: 201 });
    } catch (error) {
        console.error('Error creating student:', error);
        return NextResponse.json({
            error: 'Failed to create student'
        }, { status: 500 });
    }
}

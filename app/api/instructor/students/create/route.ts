
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@server/db';
import { users, classStudents, activityLog, instructorPermissions } from '@shared/schema';
import { hashPassword } from '@/lib/auth';
import { eq } from 'drizzle-orm';

export async function POST(req: NextRequest) {
    const session = await getSession();

    if (!session || session.role !== 'instructor') {
        return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
    }

    // Check if instructor has permission to CRUD students
    //   const [permissions] = await db
    //     .select()
    //     .from(instructorPermissions)
    //     .where(eq(instructorPermissions.userId, session.userId))
    //     .limit(1);

    //   if (!permissions?.canCrudStudents) {
    //     return NextResponse.json({ 
    //       error: 'You do not have permission to create students' 
    //     }, { status: 403 });
    //   }

    const { name, email, password, studentId, grade, classId, accessibility } = await req.json();

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

        // Enroll student in classes if provided
        if (classId !== 'none') {
            await db.insert(classStudents).values({
                classId,
                userId: newStudent.id,
            });
            await db.insert(activityLog).values({
                userId: session.userId,
                entityType: 'class students',
                entityId: newStudent.id,
                action: 'added',
                description: `Assigned student ${name} (${email}) to class ${classId}`,
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

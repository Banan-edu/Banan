
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@server/db';
import { users, instructorPermissions, schoolAdmins, classInstructors } from '@shared/schema';
import { eq, inArray, sql } from 'drizzle-orm';
import { hashPassword } from '@/lib/auth';

export async function GET(req: NextRequest) {
    const session = await getSession();

    if (!session || session.role !== 'admin') {
        return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
    }

    // Get all instructors with their class counts
    const instructorsData = await db
        .select({
            id: users.id,
            name: users.name,
            email: users.email,
            role: users.role,
            lastLogin: users.lastLogin,
            classCount: sql<number>`count(distinct ${classInstructors.classId})`,
        })
        .from(users)
        .leftJoin(classInstructors, eq(users.id, classInstructors.userId))
        .where(inArray(users.role, ['instructor', 'admin', 'school_admin', 'billing_admin']))
        .groupBy(users.id);

    return NextResponse.json({ instructors: instructorsData });
}

export async function POST(req: NextRequest) {
    const session = await getSession();

    if (!session || session.role !== 'admin') {
        return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
    }

    const { name, email, studentId, password, role, schoolIds, permissions } = await req.json();

    if (!name || !email || !password || !role) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const hashedPassword = await hashPassword(password);

    const [newUser] = await db
        .insert(users)
        .values({
            name,
            email,
            studentId: studentId || null,
            password: hashedPassword,
            role,
        })
        .returning();

    // If role is instructor, create permissions
    if (role === 'instructor' && permissions) {
        await db.insert(instructorPermissions).values({
            userId: newUser.id,
            canAccessAllStudents: permissions.accessAllStudents || false,
            canCrudStudents: permissions.canCrudStudents || false,
            canRenameDeleteClasses: permissions.canRenameClasses || permissions.canDeleteClasses || false,
        });
    }

    // If role is school_admin, assign schools
    if (role === 'school_admin' && schoolIds && schoolIds.length > 0) {
        await db.insert(schoolAdmins).values(
            schoolIds.map((schoolId: number) => ({
                userId: newUser.id,
                schoolId,
            }))
        );
    }

    return NextResponse.json({ user: newUser });
}

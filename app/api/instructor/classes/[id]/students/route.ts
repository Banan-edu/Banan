
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@server/db';
import { classStudents, users } from '@shared/schema';
import { eq } from 'drizzle-orm';

type RouteContext = {
    params: Promise<{ id: string }>;
};

export async function GET(
    req: NextRequest,
    context: RouteContext
) {
    const session = await getSession();

    if (!session || session.role !== 'instructor') {
        return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const classId = parseInt(id);

    const students = await db
        .select({
            id: users.id,
            name: users.name,
            email: users.email,
            grade: users.grade,
            lastActivity: users.lastActivity,
        })
        .from(classStudents)
        .innerJoin(users, eq(classStudents.userId, users.id))
        .where(eq(classStudents.classId, classId));

    return NextResponse.json({ students });
}


export async function POST(
    req: NextRequest,
    context: RouteContext
) {
    const session = await getSession();

    if (!session || session.role !== 'instructor') {
        return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const classId = parseInt(id);
    const { studentId } = await req.json();

    await db.insert(classStudents).values({
        classId,
        userId: studentId,
    });

    return NextResponse.json({ success: true });
}



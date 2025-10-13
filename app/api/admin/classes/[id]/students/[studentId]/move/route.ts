
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@server/db';
import { classStudents } from '@shared/schema';
import { eq, and } from 'drizzle-orm';
type RouteContext = {
    params: Promise<{ id: string; studentId: string }>;
};
export async function POST(
    req: NextRequest,
    context: RouteContext
) {
    const session = await getSession();

    if (!session || session.role !== 'admin') {
        return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
    }

    const { id, studentId } = await context.params;
    const classId = parseInt(id);
    const studentIdNum = parseInt(studentId);
    const { targetClassId } = await req.json();

    // Remove from current class
    await db
        .delete(classStudents)
        .where(
            and(
                eq(classStudents.classId, classId),
                eq(classStudents.userId, studentIdNum)
            )
        );

    // Add to target class
    await db.insert(classStudents).values({
        classId: parseInt(targetClassId),
        userId: studentIdNum,
    });

    return NextResponse.json({ success: true });
}


import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@server/db';
import { lessonProgress, classStudents } from '@shared/schema';
import { eq, and, inArray } from 'drizzle-orm';

type RouteContext = {
    params: Promise<{ id: string; courseId: string }>;
};

export async function DELETE(
    req: NextRequest, context: RouteContext
) {
    const session = await getSession();

    if (!session || session.role !== 'admin') {
        return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
    }

    const { id, courseId } = await context.params;
    const classId = parseInt(id);

    // Get all students in class
    const students = await db
        .select({ userId: classStudents.userId })
        .from(classStudents)
        .where(eq(classStudents.classId, classId));

    const studentIds = students.map(s => s.userId);

    if (studentIds.length > 0) {
        // Delete progress for all students in this class for this course
        await db
            .delete(lessonProgress)
            .where(inArray(lessonProgress.userId, studentIds));
    }

    return NextResponse.json({ success: true });
}

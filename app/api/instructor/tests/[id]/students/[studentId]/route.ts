
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@server/db';
import { testStudents } from '@shared/schema';
import { and, eq } from 'drizzle-orm';

type RouteContext = {
    params: Promise<{ id: string; studentId: string }>;
};

export async function DELETE(
    req: NextRequest,
    context: RouteContext
) {
    const session = await getSession();

    if (!session || session.role !== 'instructor') {
        return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
    }

    const { id, studentId } = await context.params;
    const testId = parseInt(id);
    const userId = parseInt(studentId);

    try {
        await db
            .delete(testStudents)
            .where(and(eq(testStudents.testId, testId), eq(testStudents.userId, userId)));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error removing student from test:', error);
        return NextResponse.json({ error: 'Failed to remove student' }, { status: 500 });
    }
}


import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@server/db';
import { classInstructors } from '@shared/schema';
import { eq, and } from 'drizzle-orm';

type RouteContext = {
    params: Promise<{ id: string; classId: string }>;
};

export async function DELETE(
    req: NextRequest,
    context: RouteContext
) {
    const session = await getSession();

    if (!session || session.role !== 'admin') {
        return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
    }

    const { id, classId } = await context.params;
    const instructorId = parseInt(id);
    const classIdNum = parseInt(classId);

    await db
        .delete(classInstructors)
        .where(
            and(
                eq(classInstructors.userId, instructorId),
                eq(classInstructors.classId, classIdNum)
            )
        );

    return NextResponse.json({ success: true });
}

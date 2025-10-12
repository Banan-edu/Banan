
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { unassignInstructorToClasses } from '@/lib/instructorService';

type RouteContext = {
    params: Promise<{ id: string; classId: string }>;
};

export async function DELETE(
    req: NextRequest,
    context: RouteContext
) {
    const session = await getSession();

    if (!session || session.role !== 'school_admin') {
        return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
    }

    const { id, classId } = await context.params;
    const instructorId = parseInt(id);
    const classIdNum = parseInt(classId);

    await unassignInstructorToClasses(instructorId, classIdNum, session.userId);

    return NextResponse.json({ success: true });
}

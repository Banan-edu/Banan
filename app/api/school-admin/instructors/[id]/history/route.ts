
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getInstructorLogs } from '@/lib/instructorService';

type RouteContext = {
    params: Promise<{ id: string }>;
};

export async function GET(
    req: NextRequest,
    context: RouteContext
) {
    const session = await getSession();

    if (!session || session.role !== 'admin') {
        return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const instructorId = parseInt(id);

    const logs = await getInstructorLogs(instructorId);

    return NextResponse.json({ logs });
}


import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@server/db';
import { testStudents } from '@shared/schema';

type RouteContext = {
    params: Promise<{ id: string }>;
};

export async function POST(
    req: NextRequest, context: RouteContext
) {
    const session = await getSession();

    if (!session || session.role !== 'school_admin') {
        return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const testId = parseInt(id);
    const { studentId } = await req.json();

    try {
        await db.insert(testStudents).values({
            testId,
            userId: studentId,
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error adding student to test:', error);
        return NextResponse.json({ error: 'Failed to add student' }, { status: 500 });
    }
}

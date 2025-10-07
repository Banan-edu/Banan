
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@server/db';
import { lessons } from '@shared/schema';
import { eq } from 'drizzle-orm';

type RouteContext = {
    params: Promise<{ id: string }>;
};

export async function PATCH(req: NextRequest, context: RouteContext) {
    const session = await getSession();

    if (!session || session.role !== 'instructor') {
        return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
    }

    const { lessonOrders } = await req.json();

    try {
        for (const { id, order, sectionId } of lessonOrders) {
            await db
                .update(lessons)
                .set({ order, sectionId })
                .where(eq(lessons.id, id));
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error reordering lessons:', error);
        return NextResponse.json({ error: 'Failed to reorder lessons' }, { status: 500 });
    }
}

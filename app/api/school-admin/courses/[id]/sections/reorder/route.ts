
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@server/db';
import { sections } from '@shared/schema';
import { eq } from 'drizzle-orm';

type RouteContext = {
    params: Promise<{ id: string }>;
};

export async function PATCH(req: NextRequest, context: RouteContext) {
    const session = await getSession();

    if (!session || session.role !== 'school_admin') {
        return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
    }
    const { id } = await context.params;
    const courseId = parseInt(id);
    const { sectionOrders } = await req.json();

    for (const { id, order } of sectionOrders) {
        await db
            .update(sections)
            .set({ order })
            .where(eq(sections.id, id));
    }

    return NextResponse.json({ success: true });
}

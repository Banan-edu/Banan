
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@server/db';
import { sections, courses } from '@shared/schema';
import { eq, and } from 'drizzle-orm';

type RouteContext = {
    params: Promise<{ id: string; sectionId: string }>;
};

export async function PATCH(
    req: NextRequest,
    context: RouteContext
) {
    const session = await getSession();

    if (!session || session.role !== 'school_admin') {
        return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
    }

    const { id, sectionId } = await context.params;
    const courseId = parseInt(id);
    const sectionID = parseInt(sectionId);
    const { name, order } = await req.json();

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (order !== undefined) updateData.order = order;

    const [updatedSection] = await db
        .update(sections)
        .set(updateData)
        .where(eq(sections.id, sectionID))
        .returning();

    return NextResponse.json({ section: updatedSection });
}

export async function DELETE(
    req: NextRequest,
    context: RouteContext
) {
    const session = await getSession();

    if (!session || session.role !== 'school_admin') {
        return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
    }

    const { id, sectionId } = await context.params;
    const courseId = parseInt(id);
    const sectionID = parseInt(sectionId);

    const [section] = await db
        .select()
        .from(sections)
        .where(and(eq(sections.id, sectionID), eq(sections.courseId, courseId)))
        .limit(1);

    if (!section) {
        return NextResponse.json({ error: 'Section not found' }, { status: 404 });
    }

    await db.delete(sections).where(eq(sections.id, sectionID));

    return NextResponse.json({ success: true });
}

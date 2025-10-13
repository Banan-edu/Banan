
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@server/db';
import { lessons, sections } from '@shared/schema';
import { eq } from 'drizzle-orm';

type RouteContext = {
    params: Promise<{ id: string; lessonId: string }>;
};

export async function PATCH(
    req: NextRequest,
    context: RouteContext
) {
    const session = await getSession();

    if (!session || session.role !== 'school_admin') {
        return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
    }
    const { lessonId } = await context.params;
    const lessonID = parseInt(lessonId);

    const data = await req.json();

    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.order !== undefined) updateData.order = data.order;
    if (data.sectionId !== undefined) updateData.sectionId = data.sectionId;
    if (data.content !== undefined) updateData.text = data.content;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.language !== undefined) updateData.codeLanguage = data.language;

    const [updatedLesson] = await db
        .update(lessons)
        .set(updateData)
        .where(eq(lessons.id, lessonID))
        .returning();

    return NextResponse.json({ lesson: updatedLesson });
}

export async function DELETE(
    req: NextRequest,
    context: RouteContext
) {
    const session = await getSession();

    if (!session || session.role !== 'school_admin') {
        return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
    }
    const { lessonId } = await context.params;
    const lessonID = parseInt(lessonId);

    await db.delete(lessons).where(eq(lessons.id, lessonID));

    return NextResponse.json({ success: true });
}

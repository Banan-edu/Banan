import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@server/db';
import { sections, courses } from '@shared/schema';
import { eq, and } from 'drizzle-orm';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(req: NextRequest, context: RouteContext) {
  const session = await getSession();

  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }
  const { id } = await context.params;
  const courseId = parseInt(id);
  const { name } = await req.json();

  const [course] = await db
    .select()
    .from(courses)
    .where(eq(courses.id, courseId))
    .limit(1);

  if (!course) {
    return NextResponse.json({ error: 'Course not found' }, { status: 404 });
  }

  const existingSections = await db
    .select()
    .from(sections)
    .where(eq(sections.courseId, courseId));

  const [newSection] = await db
    .insert(sections)
    .values({
      courseId,
      name,
      order: existingSections.length + 1,
    })
    .returning();

  return NextResponse.json({ section: newSection });
}

import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@server/db';
import { sections, courses } from '@shared/schema';
import { eq, and } from 'drizzle-orm';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();

  if (!session || session.role !== 'instructor') {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }

  const courseId = parseInt(params.id);
  const { name } = await req.json();

  const [course] = await db
    .select()
    .from(courses)
    .where(and(
      eq(courses.id, courseId),
      eq(courses.instructorId, session.userId)
    ))
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

import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@server/db';
import { lessons, sections, courses } from '@shared/schema';
import { eq, and } from 'drizzle-orm';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();

  if (!session || session.role !== 'instructor') {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }

  const courseId = parseInt(params.id);
  const { sectionId, name, type, content, language } = await req.json();

  const [section] = await db
    .select()
    .from(sections)
    .where(eq(sections.id, sectionId))
    .limit(1);

  if (!section || section.courseId !== courseId) {
    return NextResponse.json({ error: 'Section not found' }, { status: 404 });
  }

  const [course] = await db
    .select()
    .from(courses)
    .where(eq(courses.id, courseId))
    .limit(1);

  if (!course) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  }

  const existingLessons = await db
    .select()
    .from(lessons)
    .where(eq(lessons.sectionId, sectionId));

  const [newLesson] = await db
    .insert(lessons)
    .values({
      sectionId,
      name,
      type,
      text: content,
      codeLanguage: type === 'coding' ? language : null,
      order: existingLessons.length + 1,
    })
    .returning();

  return NextResponse.json({ lesson: newLesson });
}

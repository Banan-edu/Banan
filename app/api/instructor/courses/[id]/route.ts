import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@server/db';
import { courses, sections, lessons } from '@shared/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();

  if (!session || session.role !== 'instructor') {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }

  const courseId = parseInt(params.id);

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

  const courseSections = await db
    .select()
    .from(sections)
    .where(eq(sections.courseId, courseId))
    .orderBy(sections.order);

  const sectionsWithLessons = await Promise.all(
    courseSections.map(async (section) => {
      const sectionLessons = await db
        .select()
        .from(lessons)
        .where(eq(lessons.sectionId, section.id))
        .orderBy(lessons.order);

      return {
        ...section,
        lessons: sectionLessons,
      };
    })
  );

  return NextResponse.json({
    course,
    sections: sectionsWithLessons,
  });
}

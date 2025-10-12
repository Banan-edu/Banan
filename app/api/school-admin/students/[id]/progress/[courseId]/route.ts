
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@server/db';
import { lessonProgress, lessons, sections } from '@shared/schema';
import { and, eq, inArray } from 'drizzle-orm';
type RouteContext = {
  params: Promise<{ id: string; courseId: string }>;
};

export async function DELETE(
  req: NextRequest,
  context: RouteContext
) {
  const session = await getSession();

  if (!session || session.role !== 'school_admin') {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }

  const { id, courseId } = await context.params;
  const studentId = parseInt(id);
  const courseIdNum = parseInt(courseId);

  // Get all lessons in the course
  const courseSections = await db
    .select({ id: sections.id })
    .from(sections)
    .where(eq(sections.courseId, courseIdNum));

  const sectionIds = courseSections.map(s => s.id);

  if (sectionIds.length > 0) {
    const courseLessons = await db
      .select({ id: lessons.id })
      .from(lessons)
      .where(inArray(lessons.sectionId, sectionIds));

    const lessonIds = courseLessons.map(l => l.id);

    if (lessonIds.length > 0) {
      await db
        .delete(lessonProgress)
        .where(
          and(
            eq(lessonProgress.userId, studentId),
            inArray(lessonProgress.lessonId, lessonIds)
          )
        );
    }
  }

  return NextResponse.json({ success: true });
}

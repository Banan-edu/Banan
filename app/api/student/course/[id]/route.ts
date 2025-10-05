import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@server/db';
import { courses, sections, lessons, lessonProgress } from '@shared/schema';
import { eq } from 'drizzle-orm';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();

  if (!session || session.role !== 'student') {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }

  const courseId = parseInt(params.id);

  const [course] = await db
    .select()
    .from(courses)
    .where(eq(courses.id, courseId))
    .limit(1);

  if (!course) {
    return NextResponse.json({ error: 'Course not found' }, { status: 404 });
  }

  const courseSections = await db
    .select()
    .from(sections)
    .where(eq(sections.courseId, courseId))
    .orderBy(sections.order);

  const lessonsData = await Promise.all(
    courseSections.map(async (section) => {
      const sectionLessons = await db
        .select()
        .from(lessons)
        .where(eq(lessons.sectionId, section.id))
        .orderBy(lessons.order);

      const lessonsWithProgress = await Promise.all(
        sectionLessons.map(async (lesson) => {
          const [progress] = await db
            .select()
            .from(lessonProgress)
            .where(eq(lessonProgress.lessonId, lesson.id))
            .where(eq(lessonProgress.userId, session.userId))
            .limit(1);

          return {
            ...lesson,
            progress: progress || null,
          };
        })
      );

      return {
        ...section,
        lessons: lessonsWithProgress,
      };
    })
  );

  return NextResponse.json({
    course,
    sections: lessonsData,
  });
}

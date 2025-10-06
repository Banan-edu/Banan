import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@server/db';
import { courses, sections, lessons, lessonProgress, classCourses, classStudents } from '@shared/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();

  if (!session || session.role !== 'student') {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }
  const { id } = await params;
  const courseId = parseInt(id);

  const studentClasses = await db
    .select({ classId: classStudents.classId })
    .from(classStudents)
    .where(eq(classStudents.userId, session.userId));

  const classIds = studentClasses.map(c => c.classId);

  if (classIds.length === 0) {
    return NextResponse.json({ error: 'Not enrolled in any classes' }, { status: 403 });
  }

  const enrolledCourses = await db
    .select({ classId: classCourses.classId })
    .from(classCourses)
    .where(eq(classCourses.courseId, courseId));

  const hasAccess = enrolledCourses.some(ec => classIds.includes(ec.classId));

  if (!hasAccess) {
    return NextResponse.json({ error: 'Not authorized to access this course' }, { status: 403 });
  }

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
            .where(and(
              eq(lessonProgress.lessonId, lesson.id),
              eq(lessonProgress.userId, session.userId)
            ))
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

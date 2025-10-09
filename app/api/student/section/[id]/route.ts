
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@server/db';
import { courses, sections, lessons, lessonProgress, classCourses, classStudents } from '@shared/schema';
import { eq, and } from 'drizzle-orm';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(req: NextRequest, context:RouteContext) {
  const session = await getSession();

  if (!session || session.role !== 'student') {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }
const { id } = await context.params;
  const sectionIdNum = parseInt(id);

  // Get section details
  const [section] = await db
    .select()
    .from(sections)
    .where(eq(sections.id, sectionIdNum))
    .limit(1);

  if (!section) {
    return NextResponse.json({ error: 'Section not found' }, { status: 404 });
  }

  // Get course details
  const [course] = await db
    .select()
    .from(courses)
    .where(eq(courses.id, section.courseId))
    .limit(1);

  // Check if student has access to this course
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
    .where(eq(classCourses.courseId, section.courseId));

  const hasAccess = enrolledCourses.some(ec => classIds.includes(ec.classId));

  if (!hasAccess) {
    return NextResponse.json({ error: 'Not authorized to access this section' }, { status: 403 });
  }

  // Get lessons with progress
  const sectionLessons = await db
    .select()
    .from(lessons)
    .where(eq(lessons.sectionId, sectionIdNum))
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

  return NextResponse.json({
    section: {
      ...section,
      lessons: lessonsWithProgress,
    },
    courseName: course?.name || 'Course',
  });
}

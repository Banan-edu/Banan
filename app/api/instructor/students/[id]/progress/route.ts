
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@server/db';
import { lessonProgress, lessons, sections, courses, classCourses, classStudents } from '@shared/schema';
import { eq, and, inArray, sum, avg } from 'drizzle-orm';
type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(
  req: NextRequest,
  context: RouteContext
) {
  const session = await getSession();

  if (!session || session.role !== 'instructor') {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }

  const { id } = await context.params;
  const studentId = parseInt(id);

  // Get student's classes
  const studentClasses = await db
    .select({ classId: classStudents.classId })
    .from(classStudents)
    .where(eq(classStudents.userId, studentId));

  const classIds = studentClasses.map(c => c.classId);

  if (classIds.length === 0) {
    return NextResponse.json({ courses: [] });
  }

  // Get enrolled courses
  const enrolledCourses = await db
    .select({ courseId: classCourses.courseId, courseName: courses.name })
    .from(classCourses)
    .innerJoin(courses, eq(classCourses.courseId, courses.id))
    .where(inArray(classCourses.classId, classIds));

  // Get progress for each course
  const coursesWithProgress = await Promise.all(
    enrolledCourses.map(async (course) => {
      const [stats] = await db
        .select({
          totalScore: sum(lessonProgress.score),
          totalStars: sum(lessonProgress.stars),
          totalTime: sum(lessonProgress.timeSpent),
          totalAttempts: sum(lessonProgress.attempts),
        })
        .from(lessonProgress)
        .innerJoin(lessons, eq(lessonProgress.lessonId, lessons.id))
        .innerJoin(sections, eq(lessons.sectionId, sections.id))
        .where(
          and(
            eq(sections.courseId, course.courseId),
            eq(lessonProgress.userId, studentId)
          )
        );

      return {
        id: course.courseId,
        name: course.courseName,
        totalScore: Number(stats?.totalScore || 0),
        totalStars: Number(stats?.totalStars || 0),
        totalTime: Number(stats?.totalTime || 0),
        totalAttempts: Number(stats?.totalAttempts || 0),
        progress: 0, // Calculate based on completed lessons
      };
    })
  );

  return NextResponse.json({ courses: coursesWithProgress });
}


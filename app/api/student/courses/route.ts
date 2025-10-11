import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@server/db';
import { courses, classCourses, classStudents, sections, lessons, lessonProgress } from '@shared/schema';
import { eq, inArray, and, sql } from 'drizzle-orm';

export async function GET() {
  const session = await getSession();

  if (!session || session.role !== 'student') {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }

  try {
    // Get student's classes
    const studentClasses = await db
      .select({ classId: classStudents.classId })
      .from(classStudents)
      .where(eq(classStudents.userId, session.userId));

    const classIds = studentClasses.map(c => c.classId);

    if (classIds.length === 0) {
      return NextResponse.json({ courses: [] });
    }

    // Get assigned courses
    const assignedCourses = await db
      .select({
        courseId: classCourses.courseId,
        courseName: courses.name,
        courseDescription: courses.description,
        courseLanguage: courses.language,
      })
      .from(classCourses)
      .innerJoin(courses, eq(classCourses.courseId, courses.id))
      .where(inArray(classCourses.classId, classIds));

    // Get lesson counts and progress for each course
    const coursesWithProgress = await Promise.all(
      assignedCourses.map(async (course) => {
        const courseSections = await db
          .select({ id: sections.id })
          .from(sections)
          .where(eq(sections.courseId, course.courseId));

        const sectionIds = courseSections.map(s => s.id);

        let lessonsCount = 0;
        let completedLessons = 0;

        if (sectionIds.length > 0) {
          const lessonsData = await db
            .select({ id: lessons.id })
            .from(lessons)
            .where(inArray(lessons.sectionId, sectionIds));

          lessonsCount = lessonsData.length;

          // Get completed lessons count
          if (lessonsCount > 0) {
            const lessonIds = lessonsData.map(l => l.id);
            const completedData = await db
              .select({ count: sql<number>`count(*)` })
              .from(lessonProgress)
              .where(
                and(
                  eq(lessonProgress.userId, session.userId),
                  inArray(lessonProgress.lessonId, lessonIds),
                  eq(lessonProgress.completed, true)
                )
              );

            completedLessons = Number(completedData[0]?.count || 0);
          }
        }

        const progress = lessonsCount > 0 ? Math.round((completedLessons / lessonsCount) * 100) : 0;

        return {
          id: course.courseId,
          name: course.courseName,
          description: course.courseDescription,
          language: course.courseLanguage,
          lessonsCount,
          completedLessons,
          progress,
          isCompleted: progress === 100
        };
      })
    );

    return NextResponse.json({ courses: coursesWithProgress });
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 });
  }
}
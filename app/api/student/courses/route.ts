import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@server/db';
import { courses, classCourses, classStudents, sections, lessons } from '@shared/schema';
import { eq, inArray } from 'drizzle-orm';

export async function GET() {
  const session = await getSession();

  if (!session || session.role !== 'student') {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }

  const studentClasses = await db
    .select({ classId: classStudents.classId })
    .from(classStudents)
    .where(eq(classStudents.userId, session.userId));

  const classIds = studentClasses.map(c => c.classId);

  if (classIds.length === 0) {
    return NextResponse.json({ courses: [] });
  }

  const assignedCourses = await db
    .select({
      courseId: classCourses.courseId,
    })
    .from(classCourses)
    .where(inArray(classCourses.classId, classIds));

  const courseIds = [...new Set(assignedCourses.map(c => c.courseId))];

  if (courseIds.length === 0) {
    return NextResponse.json({ courses: [] });
  }

  const coursesData = await db
    .select()
    .from(courses)
    .where(inArray(courses.id, courseIds));

  const coursesWithLessons = await Promise.all(
    coursesData.map(async (course) => {
      const courseSections = await db
        .select({ id: sections.id })
        .from(sections)
        .where(eq(sections.courseId, course.id));

      const sectionIds = courseSections.map(s => s.id);
      let lessonsCount = 0;

      if (sectionIds.length > 0) {
        const lessonsData = await db
          .select({ id: lessons.id })
          .from(lessons)
          .where(inArray(lessons.sectionId, sectionIds));
        lessonsCount = lessonsData.length;
      }

      return {
        ...course,
        lessonsCount,
      };
    })
  );

  return NextResponse.json({ courses: coursesWithLessons });
}

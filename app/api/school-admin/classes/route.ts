
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@server/db';
import { classCourses, classes, classInstructors, classStudents, courses } from '@shared/schema';
import { eq } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  const session = await getSession();

  if (!session || session.role !== 'school_admin') {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }

  const allClasses = await db.select().from(classes);

  const classesWithStats = await Promise.all(
    allClasses.map(async (classItem) => {
      const [students, assignedCourses, instructors] = await Promise.all([
        db.select({ id: classStudents.userId })
          .from(classStudents)
          .where(eq(classStudents.classId, classItem.id)),
        db
          .select({ id: courses.id, name: courses.name })
          .from(classCourses)
          .innerJoin(courses, eq(classCourses.courseId, courses.id))
          .where(eq(classCourses.classId, classItem.id)),
        db
          .select({ userId: classInstructors.userId })
          .from(classInstructors)
          .where(eq(classInstructors.classId, classItem.id)),
      ]);

      return {
        ...classItem,
        studentCount: students.length,
        courseCount: assignedCourses.length,
        instructorCount: instructors.length,
        courses: assignedCourses,
      };
    })
  );

  return NextResponse.json({ classes: classesWithStats });
}

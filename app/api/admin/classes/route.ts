import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@server/db';
import { classes, classInstructors, classStudents, classCourses, courses } from '@shared/schema';
import { eq, inArray } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  const session = await getSession();

  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }

  // --- Fetch classes ---
  const allClasses = await db
    .select()
    .from(classes);

  // --- Attach stats (same for both roles) ---
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


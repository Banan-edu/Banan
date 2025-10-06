import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@server/db';
import { schools, classes, schoolAdmins, classInstructors, classStudents } from '@shared/schema';
import { eq, sql, and, inArray } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  const session = await getSession();

  if (!session || session.role !== 'instructor') {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }

  // Get classes where this instructor teaches
  const instructorClasses = await db
    .select({ classId: classInstructors.classId })
    .from(classInstructors)
    .where(eq(classInstructors.userId, session.userId));

  const classIds = instructorClasses.map(c => c.classId);

  if (classIds.length === 0) {
    return NextResponse.json({ schools: [] });
  }

  // Get schools from those classes
  const classesWithSchools = await db
    .select({ schoolId: classes.schoolId })
    .from(classes)
    .where(inArray(classes.id, classIds));

  const schoolIds = [...new Set(classesWithSchools.map(c => c.schoolId).filter(id => id !== null))];

  if (schoolIds.length === 0) {
    return NextResponse.json({ schools: [] });
  }

  // Get school details
  const instructorSchools = await db
    .select()
    .from(schools)
    .where(inArray(schools.id, schoolIds as number[]));

  // Add statistics for each school
  const schoolsWithStats = await Promise.all(
    instructorSchools.map(async (school) => {
      const classCount = await db
        .select({ count: sql<number>`count(*)` })
        .from(classes)
        .where(eq(classes.schoolId, school.id));

      const adminCount = await db
        .select({ count: sql<number>`count(*)` })
        .from(schoolAdmins)
        .where(eq(schoolAdmins.schoolId, school.id));

      const schoolClasses = await db
        .select({ id: classes.id })
        .from(classes)
        .where(eq(classes.schoolId, school.id));

      const schoolClassIds = schoolClasses.map(c => c.id);

      let instructorCount = 0;
      let studentCount = 0;

      if (schoolClassIds.length > 0) {
        const instructors = await db
          .select({ userId: classInstructors.userId })
          .from(classInstructors)
          .where(inArray(classInstructors.classId, schoolClassIds));

        const uniqueInstructors = new Set(instructors.map(i => i.userId));
        instructorCount = uniqueInstructors.size;

        const students = await db
          .select({ userId: classStudents.userId })
          .from(classStudents)
          .where(inArray(classStudents.classId, schoolClassIds));

        const uniqueStudents = new Set(students.map(s => s.userId));
        studentCount = uniqueStudents.size;
      }

      return {
        ...school,
        classCount: Number(classCount[0]?.count || 0),
        adminCount: Number(adminCount[0]?.count || 0),
        instructorCount,
        studentCount,
      };
    })
  );

  return NextResponse.json({ schools: schoolsWithStats });
}

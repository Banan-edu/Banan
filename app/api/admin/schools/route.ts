import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@server/db';
import { schools, classes, schoolAdmins, classInstructors, classStudents, users } from '@shared/schema';
import { eq, sql, and, inArray } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  const session = await getSession();

  if (!session || (session.role !== 'admin' && session.role !== 'instructor')) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }

  const allSchools = await db.select().from(schools);

  const schoolsWithStats = await Promise.all(
    allSchools.map(async (school) => {
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

      const classIds = schoolClasses.map(c => c.id);

      let instructorCount = 0;
      let studentCount = 0;

      if (classIds.length > 0) {
        const instructors = await db
          .select({ userId: classInstructors.userId })
          .from(classInstructors)
          .where(inArray(classInstructors.classId, classIds));

        const uniqueInstructors = new Set(instructors.map(i => i.userId));
        instructorCount = uniqueInstructors.size;

        const students = await db
          .select({ userId: classStudents.userId })
          .from(classStudents)
          .where(inArray(classStudents.classId, classIds));

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

export async function POST(req: NextRequest) {
  const session = await getSession();

  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }

  const { name, country, address, phone } = await req.json();

  if (!name || !country || !address) {
    return NextResponse.json({ error: 'Name, country and address are required' }, { status: 400 });
  }

  const [newSchool] = await db
    .insert(schools)
    .values({
      name,
      country,
      address,
      phone: phone || null,
    })
    .returning();

  return NextResponse.json({ school: newSchool });
}

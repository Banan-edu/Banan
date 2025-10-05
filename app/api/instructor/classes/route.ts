import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@server/db';
import { classes, users, classStudents, classCourses, courses } from '@shared/schema';
import { eq, and, inArray } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  const session = await getSession();

  if (!session || session.role !== 'instructor') {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }

  const instructorClasses = await db
    .select({
      id: classes.id,
      name: classes.name,
      description: classes.description,
      createdAt: classes.createdAt,
    })
    .from(classes)
    .where(eq(classes.instructorId, session.userId));

  const classesWithStats = await Promise.all(
    instructorClasses.map(async (classItem) => {
      const students = await db
        .select({ id: classStudents.userId })
        .from(classStudents)
        .where(eq(classStudents.classId, classItem.id));

      const assignedCourses = await db
        .select({ 
          id: courses.id,
          name: courses.name 
        })
        .from(classCourses)
        .innerJoin(courses, eq(classCourses.courseId, courses.id))
        .where(eq(classCourses.classId, classItem.id));

      return {
        ...classItem,
        studentCount: students.length,
        courseCount: assignedCourses.length,
        courses: assignedCourses,
      };
    })
  );

  return NextResponse.json({ classes: classesWithStats });
}

export async function POST(req: NextRequest) {
  const session = await getSession();

  if (!session || session.role !== 'instructor') {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }

  const { name, description, schoolId } = await req.json();

  if (!name) {
    return NextResponse.json({ error: 'Class name is required' }, { status: 400 });
  }

  const [newClass] = await db
    .insert(classes)
    .values({
      name,
      description: description || null,
      instructorId: session.userId,
      schoolId: schoolId || 1,
    })
    .returning();

  return NextResponse.json({ class: newClass });
}

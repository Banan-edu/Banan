import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@server/db';
import { classes, classInstructors, classStudents, classCourses, courses } from '@shared/schema';
import { eq, inArray } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  const session = await getSession();

  if (!session || session.role !== 'instructor') {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }

  const instructorClassIds = await db
    .select({ classId: classInstructors.classId })
    .from(classInstructors)
    .where(eq(classInstructors.userId, session.userId));

  const classIds = instructorClassIds.map(c => c.classId);

  if (classIds.length === 0) {
    return NextResponse.json({ classes: [] });
  }

  const instructorClasses = await db
    .select({
      id: classes.id,
      name: classes.name,
      description: classes.description,
      createdAt: classes.createdAt,
    })
    .from(classes)
    .where(inArray(classes.id, classIds));

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

  const { name, description, grade, instructorIds, courseIds } = await req.json();

  if (!name) {
    return NextResponse.json({ error: 'Class name is required' }, { status: 400 });
  }

  const [newClass] = await db
    .insert(classes)
    .values({
      name,
      description: description || null,
      grade: grade || 'Unassigned',
    })
    .returning();

  // Add current instructor
  await db.insert(classInstructors).values({
    classId: newClass.id,
    userId: session.userId,
  });

  // Add additional instructors if provided
  if (instructorIds && instructorIds.length > 0) {
    const instructorValues = instructorIds
      .filter((id: number) => id !== session.userId)
      .map((id: number) => ({
        classId: newClass.id,
        userId: id,
      }));
    
    if (instructorValues.length > 0) {
      await db.insert(classInstructors).values(instructorValues);
    }
  }

  // Assign courses if provided
  if (courseIds && courseIds.length > 0) {
    const courseValues = courseIds.map((courseId: number) => ({
      classId: newClass.id,
      courseId,
    }));
    await db.insert(classCourses).values(courseValues);
  }

  return NextResponse.json({ class: newClass });
}

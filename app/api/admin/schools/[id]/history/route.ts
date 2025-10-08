
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@server/db';
import { activityLog, users, classes, classStudents, classInstructors } from '@shared/schema';
import { eq, and, desc, inArray, or } from 'drizzle-orm';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(
  req: NextRequest,
  context: RouteContext
) {
  const session = await getSession();

  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }

  const { id } = await context.params;
  const schoolId = parseInt(id);

  if (isNaN(schoolId)) {
    return NextResponse.json({ error: 'Invalid school ID' }, { status: 400 });
  }

  // Get all classes in this school
  const schoolClasses = await db
    .select({ id: classes.id })
    .from(classes)
    .where(eq(classes.schoolId, schoolId));

  const classIds = schoolClasses.map(c => c.id);

  // Get all students in these classes
  const students = await db
    .select({ userId: classStudents.userId })
    .from(classStudents)
    .where(inArray(classStudents.classId, classIds));

  const studentIds = [...new Set(students.map(s => s.userId))];

  // Get all instructors in these classes
  const instructors = await db
    .select({ userId: classInstructors.userId })
    .from(classInstructors)
    .where(inArray(classInstructors.classId, classIds));

  const instructorIds = [...new Set(instructors.map(i => i.userId))];

  // Build conditions for all school-related activities
  const conditions = [
    // School activities
    and(
      eq(activityLog.entityType, 'school'),
      eq(activityLog.entityId, schoolId)
    ),
    // Class activities
    and(
      eq(activityLog.entityType, 'class'),
      inArray(activityLog.entityId, classIds.length > 0 ? classIds : [-1])
    ),
    // Student activities
    and(
      eq(activityLog.entityType, 'student'),
      inArray(activityLog.entityId, studentIds.length > 0 ? studentIds : [-1])
    ),
    // Instructor activities
    and(
      eq(activityLog.entityType, 'instructor'),
      inArray(activityLog.entityId, instructorIds.length > 0 ? instructorIds : [-1])
    ),
  ];

  // Get activity logs related to this school and all its entities
  const logs = await db
    .select({
      id: activityLog.id,
      action: activityLog.action,
      description: activityLog.description,
      createdAt: activityLog.createdAt,
      entityType: activityLog.entityType,
      entityId: activityLog.entityId,
      userName: users.name,
      userEmail: users.email,
    })
    .from(activityLog)
    .innerJoin(users, eq(activityLog.userId, users.id))
    .where(or(...conditions))
    .orderBy(desc(activityLog.createdAt))
    .limit(100);

  return NextResponse.json({ logs });
}

import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@server/db';
import { schools, classes, classInstructors, activityLog, users } from '@shared/schema';
import { eq, and, inArray, desc } from 'drizzle-orm';

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
  const schoolId = parseInt(id);

  if (isNaN(schoolId)) {
    return NextResponse.json({ error: 'Invalid school ID' }, { status: 400 });
  }

  // Verify instructor teaches at this school
  const instructorClasses = await db
    .select({ classId: classInstructors.classId })
    .from(classInstructors)
    .where(eq(classInstructors.userId, session.userId));

  const classIds = instructorClasses.map(c => c.classId);

  if (classIds.length === 0) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  }

  const classesWithSchools = await db
    .select({ id: classes.id, schoolId: classes.schoolId })
    .from(classes)
    .where(inArray(classes.id, classIds));

  const hasAccessToSchool = classesWithSchools.some(c => c.schoolId === schoolId);

  if (!hasAccessToSchool) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  }

  // Get activity logs related to this school
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
    .where(
      and(
        eq(activityLog.entityType, 'school'),
        eq(activityLog.entityId, schoolId)
      )
    )
    .orderBy(desc(activityLog.createdAt))
    .limit(100);

  return NextResponse.json({ logs });
}

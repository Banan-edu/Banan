import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@server/db';
import { schools, classes, schoolAdmins, classInstructors, classStudents } from '@shared/schema';
import { eq, sql, and, inArray } from 'drizzle-orm';
import { ActivityLogger } from '@/lib/activityLogger';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();

  if (!session || session.role !== 'instructor') {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }

  const { id } = await params;
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

  // Get school details
  const school = await db
    .select()
    .from(schools)
    .where(eq(schools.id, schoolId))
    .limit(1);

  if (!school.length) {
    return NextResponse.json({ error: 'School not found' }, { status: 404 });
  }

  // Get statistics
  const classCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(classes)
    .where(eq(classes.schoolId, schoolId));

  const adminCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(schoolAdmins)
    .where(eq(schoolAdmins.schoolId, schoolId));

  const schoolClasses = await db
    .select({ id: classes.id })
    .from(classes)
    .where(eq(classes.schoolId, schoolId));

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

  return NextResponse.json({
    school: {
      ...school[0],
      classCount: Number(classCount[0]?.count || 0),
      adminCount: Number(adminCount[0]?.count || 0),
      instructorCount,
      studentCount,
    },
  });
}

export async function PUT(
  req: NextRequest,
  context: RouteContext
) {
  const session = await getSession();

  if (!session || session.role !== 'instructor') {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }

  const { id } = await context.params;
  const schoolId = parseInt(id);
  const body = await req.json();

  const [updatedSchool] = await db
    .update(schools)
    .set({
      ...body,
      updatedAt: new Date(),
    })
    .where(eq(schools.id, schoolId))
    .returning();

  // Log the activity
  await ActivityLogger.update(session.userId, 'school', schoolId, updatedSchool.name);

  return NextResponse.json({ school: updatedSchool });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();

  if (!session || session.role !== 'instructor') {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }

  const { id } = await params;
  const schoolId = parseInt(id);

  const [school] = await db
    .select()
    .from(schools)
    .where(eq(schools.id, schoolId))
    .limit(1);

  if (!school) {
    return NextResponse.json({ error: 'School not found' }, { status: 404 });
  }

  // Log before deleting
  await ActivityLogger.delete(session.userId, 'school', schoolId, school.name);

  await db.delete(schools).where(eq(schools.id, schoolId));

  return NextResponse.json({ success: true });
}
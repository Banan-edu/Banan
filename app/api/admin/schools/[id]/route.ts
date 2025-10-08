import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@server/db';
import { schools, classes, schoolAdmins, classInstructors, classStudents } from '@shared/schema';
import { eq, sql, and, inArray } from 'drizzle-orm';


type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(req: Request,
  context: RouteContext) {
  const session = await getSession();

  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }

  const { id } = await context.params;
  const schoolId = parseInt(id);

  if (isNaN(schoolId)) {
    return NextResponse.json({ error: 'Invalid school ID' }, { status: 400 });
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

  return NextResponse.json({
    school: school[0],
    stats: {
      classCount: Number(classCount[0]?.count || 0),
      adminCount: Number(adminCount[0]?.count || 0),
      instructorCount,
      studentCount,
    },
  });
}

// Soft delete - mark as inactive
export async function PATCH(
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

  const { action } = await req.json();

  if (action === 'soft_delete') {
    // Soft delete - mark as inactive and set deletedAt
    const [updatedSchool] = await db
      .update(schools)
      .set({
        isActive: false,
        deletedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(schools.id, schoolId))
      .returning();

    if (!updatedSchool) {
      return NextResponse.json({ error: 'School not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'School deactivated successfully',
      school: updatedSchool
    });
  }

  if (action === 'restore') {
    // Restore soft deleted school
    const [restoredSchool] = await db
      .update(schools)
      .set({
        isActive: true,
        deletedAt: null,
        updatedAt: new Date(),
      })
      .where(eq(schools.id, schoolId))
      .returning();

    if (!restoredSchool) {
      return NextResponse.json({ error: 'School not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'School restored successfully',
      school: restoredSchool
    });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}

// Hard delete - permanently remove from database
export async function DELETE(
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

  try {
    // Get all classes for this school
    const schoolClasses = await db
      .select({ id: classes.id })
      .from(classes)
      .where(eq(classes.schoolId, schoolId));

    const classIds = schoolClasses.map(c => c.id);

    // Delete in correct order to avoid foreign key constraints
    if (classIds.length > 0) {
      // 1. Delete class students
      await db
        .delete(classStudents)
        .where(inArray(classStudents.classId, classIds));

      // 2. Delete class instructors
      await db
        .delete(classInstructors)
        .where(inArray(classInstructors.classId, classIds));

      // 3. Delete classes
      await db
        .delete(classes)
        .where(inArray(classes.id, classIds));
    }

    // 4. Delete school admins
    await db
      .delete(schoolAdmins)
      .where(eq(schoolAdmins.schoolId, schoolId));

    // 5. Finally delete the school
    const [deletedSchool] = await db
      .delete(schools)
      .where(eq(schools.id, schoolId))
      .returning();

    if (!deletedSchool) {
      return NextResponse.json({ error: 'School not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'School and all related data permanently deleted',
      deletedSchool
    });
  } catch (error) {
    console.error('Error deleting school:', error);
    return NextResponse.json({
      error: 'Failed to delete school and related data'
    }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, context: RouteContext) {
  const session = await getSession();

  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  }

  const { id } = await context.params;
  const schoolId = parseInt(id);

  if (isNaN(schoolId)) {
    return NextResponse.json({ error: 'Invalid school ID' }, { status: 400 });
  }

  const { name, country, address, phone } = await req.json();

  if (!name || !country || !address) {
    return NextResponse.json({ error: 'Name, country and address are required' }, { status: 400 });
  }

  const [updatedSchool] = await db
    .update(schools)
    .set({
      name,
      country,
      address,
      phone: phone || null,
    })
    .where(eq(schools.id, schoolId))
    .returning();

  return NextResponse.json({ school: updatedSchool });
}


import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@server/db';
import { users, schoolStudents, schools } from '@shared/schema';
import { eq, and } from 'drizzle-orm';
import { ActivityLogger } from '@/lib/activityLogger';

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
  const studentId = parseInt(id);

  // Get student data
  const [student] = await db
    .select()
    .from(users)
    .where(and(eq(users.id, studentId), eq(users.role, 'student')))
    .limit(1);

  if (!student) {
    return NextResponse.json({ error: 'Student not found' }, { status: 404 });
  }

  // Get school from schoolStudents junction table
  const [studentSchool] = await db
    .select({
      schoolId: schoolStudents.schoolId,
    })
    .from(schoolStudents)
    .where(eq(schoolStudents.userId, studentId))
    .limit(1);

  let schoolName = 'N/A';
  if (studentSchool?.schoolId) {
    const [school] = await db
      .select({ name: schools.name })
      .from(schools)
      .where(eq(schools.id, studentSchool.schoolId))
      .limit(1);

    schoolName = school?.name || 'N/A';
  }

  return NextResponse.json({
    user: {
      id: student.id,
      name: student.name,
      email: student.email,
      studentId: student.studentId,
      grade: student.grade,
      accessibility: student.accessibility,
      lastLogin: student.lastLogin,
      lastActivity: student.lastActivity,
    },
    schoolName,
    schoolId: studentSchool?.schoolId || null,
  });
}

export async function PUT(
  req: NextRequest,
  context: RouteContext
) {
  const session = await getSession();

  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }

  const { id } = await context.params;
  const studentId = parseInt(id);
  const { name, email, studentId: newStudentId, password, grade, schoolId } = await req.json();

  if (!name || !email) {
    return NextResponse.json({
      error: 'Name and email are required'
    }, { status: 400 });
  }

  try {
    // Check if student exists
    const [student] = await db
      .select()
      .from(users)
      .where(and(eq(users.id, studentId), eq(users.role, 'student')))
      .limit(1);

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Check if email is already used by another user
    if (email !== student.email) {
      const [existingUser] = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (existingUser && existingUser.id !== studentId) {
        return NextResponse.json({
          error: 'Email already in use'
        }, { status: 400 });
      }
    }

    // Prepare update data
    const updateData: any = {
      name,
      email,
      studentId: newStudentId,
      grade,
    };

    // Only update password if a new one is provided
    if (password && password.trim() !== '') {
      const { hashPassword } = await import('@/lib/auth');
      updateData.password = await hashPassword(password);
    }

    // Update student
    const [updatedStudent] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, studentId))
      .returning();

    await ActivityLogger.update(session.userId, 'student', studentId, updatedStudent.name);

    // Update school assignment if provided
    if (schoolId) {
      // Delete existing school assignment
      await db
        .delete(schoolStudents)
        .where(eq(schoolStudents.userId, studentId));

      // Create new school assignment
      await db.insert(schoolStudents).values({
        userId: studentId,
        schoolId: parseInt(schoolId),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating student:', error);
    return NextResponse.json({
      error: 'Failed to update student'
    }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  context: RouteContext
) {
  const session = await getSession();

  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }

  const { id } = await context.params;
  const studentId = parseInt(id);

  const [deletedUser] = await db
    .update(users)
    .set({ deletedAt: new Date() })
    .where(eq(users.id, studentId))
    .returning();

  // Log the deletion
  await ActivityLogger.delete(
    session.userId,
    'student',
    studentId,
    `Soft deleted student: ${deletedUser.name}`
  );

  return NextResponse.json({ success: true });
}

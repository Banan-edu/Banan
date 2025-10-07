
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@server/db';
import { users, classStudents, classes, schools, instructorPermissions } from '@shared/schema';
import { eq, and, inArray } from 'drizzle-orm';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(
  req: NextRequest,
  context:RouteContext
) {
  const session = await getSession();

  if (!session || session.role !== 'instructor') {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }

  const { id } = await context.params;
  const studentId = parseInt(id);
  // Check permissions
//   const [permissions] = await db
//   .select()
//   .from(instructorPermissions)
//   .where(eq(instructorPermissions.userId, session.userId))
//   .limit(1);
  
//   console.log(permissions)
//   if (!permissions?.canAccessAllStudents && !permissions?.canCrudStudents) {
//     return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
//   }

  // Get student data
  const [student] = await db
    .select()
    .from(users)
    .where(and(eq(users.id, studentId), eq(users.role, 'student')))
    .limit(1);

  if (!student) {
    return NextResponse.json({ error: 'Student not found' }, { status: 404 });
  }

  // Get class count
  const studentClasses = await db
    .select({ classId: classStudents.classId })
    .from(classStudents)
    .where(eq(classStudents.userId, studentId));

  const classCount = studentClasses.length;

  // Get school name (from first class)
  let schoolName = 'N/A';
  if (studentClasses.length > 0) {
    const [firstClass] = await db
      .select({ schoolId: classes.schoolId })
      .from(classes)
      .where(eq(classes.id, studentClasses[0].classId))
      .limit(1);

    if (firstClass?.schoolId) {
      const [school] = await db
        .select({ name: schools.name })
        .from(schools)
        .where(eq(schools.id, firstClass.schoolId))
        .limit(1);
      
      schoolName = school?.name || 'N/A';
    }
  }

  return NextResponse.json({
    user: {
      id: student.id,
      name: student.name,
      email: student.email,
      studentId: student.studentId,
      lastLogin: student.lastLogin,
      lastActivity: student.lastActivity,
    },
    classCount,
    schoolName,
  });
}

export async function DELETE(
  req: NextRequest,
  context:RouteContext
) {
  const session = await getSession();

  if (!session || session.role !== 'instructor') {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }

  const { id } = await context.params;
  const studentId = parseInt(id);

  // Delete the student user
  await db
    .delete(users)
    .where(and(eq(users.id, studentId), eq(users.role, 'student')));

  return NextResponse.json({ success: true });
}

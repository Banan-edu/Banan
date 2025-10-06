
import { NextRequest, NextResponse } from 'next/server';
import { getSession, generateToken, setAuthCookie } from '@/lib/auth';
import { db } from '@server/db';
import { users, instructorPermissions } from '@shared/schema';
import { eq, and } from 'drizzle-orm';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(
  req: NextRequest,
  context: RouteContext
) {
  const session = await getSession();

  if (!session || session.role !== 'instructor') {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }

  // Check permissions
  // const [permissions] = await db
  //   .select()
  //   .from(instructorPermissions)
  //   .where(eq(instructorPermissions.userId, session.userId))
  //   .limit(1);

  // if (!permissions?.canAccessAllStudents) {
  //   return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  // }

  const { id } = await context.params;
  const studentId = parseInt(id);

  const [student] = await db
    .select()
    .from(users)
    .where(and(eq(users.id, studentId), eq(users.role, 'student')))
    .limit(1);

  if (!student) {
    return NextResponse.json({ error: 'Student not found' }, { status: 404 });
  }

  const token = generateToken(student);
  await setAuthCookie(token);

  return NextResponse.json({ success: true });
}

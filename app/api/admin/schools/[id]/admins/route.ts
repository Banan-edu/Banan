
import { getSession } from '@/lib/auth';
import { db } from '@/server/db';
import { schoolAdmins, schools, users } from '@/shared/schema';
import { and, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(req: Request, context: RouteContext) {
  const session = await getSession();

  if (!session || !session.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (session.role !== 'admin') {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  }

  const { id } = await context.params;
  const schoolId = parseInt(id);

  if (isNaN(schoolId)) {
    return NextResponse.json({ error: 'Invalid school ID' }, { status: 400 });
  }

  // Get school admins through the schoolAdmins junction table
  const admins = await db
    .select({
      id: schoolAdmins.id,
      userId: schoolAdmins.userId,
      assignedAt: schoolAdmins.assignedAt,
      name: users.name,
      email: users.email,
      role: users.role,
    })
    .from(schoolAdmins)
    .innerJoin(users, eq(schoolAdmins.userId, users.id))
    .where(eq(schoolAdmins.schoolId, schoolId));

  return NextResponse.json({
    admins,
  });
}

export async function POST(req: Request, context: RouteContext) {
  const session = await getSession();

  if (!session || !session.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (session.role !== 'admin') {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  }

  const { id } = await context.params;
  const schoolId = parseInt(id);

  if (isNaN(schoolId)) {
    return NextResponse.json({ error: 'Invalid school ID' }, { status: 400 });
  }

  const { email, name, role } = await req.json();

  if (!email || !name || !role) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  // Check if user already exists
  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  let userId: number;

  if (existingUser.length > 0) {
    userId = existingUser[0].id;

    // Check if already assigned to this school
    const existingAssignment = await db
      .select()
      .from(schoolAdmins)
      .where(and(eq(schoolAdmins.userId, userId), eq(schoolAdmins.schoolId, schoolId)))
      .limit(1);

    if (existingAssignment.length > 0) {
      return NextResponse.json({ error: 'User already assigned to this school' }, { status: 409 });
    }
  } else {
    // Create new user
    const [newUser] = await db
      .insert(users)
      .values({
        email,
        name,
        role,
        password: 'temp_password', // Should be changed on first login
      })
      .returning();

    userId = newUser.id;
  }

  // Assign user to school
  await db.insert(schoolAdmins).values({
    userId,
    schoolId,
  });

  return NextResponse.json({ message: 'Admin assigned successfully' });
}

export async function DELETE(req: Request, context: RouteContext) {
  const session = await getSession();

  if (!session || !session.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (session.role !== 'admin') {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  }

  const { id } = await context.params;
  const schoolId = parseInt(id);
  const { adminId } = await req.json();

  if (isNaN(schoolId) || !adminId) {
    return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
  }

  // Remove admin assignment from school (not deleting the user)
  await db
    .delete(schoolAdmins)
    .where(and(eq(schoolAdmins.userId, adminId), eq(schoolAdmins.schoolId, schoolId)));

  return NextResponse.json({ message: 'Admin removed from school successfully' });
}

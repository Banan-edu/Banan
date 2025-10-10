import { getSession } from '@/lib/auth';
import { getSchoolAdmins, assignSchoolAdmin, unassignSchoolAdmin } from '@/lib/schoolsFeature';
import { db } from '@/server/db';
import { users } from '@/shared/schema';
import { eq } from 'drizzle-orm';
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

  const admins = await getSchoolAdmins(schoolId);

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

  const { userId } = await req.json();

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  // Check if user exists and is an instructor
  const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);

  if (!user || user.length === 0) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  if (user[0].role !== 'instructor') {
    return NextResponse.json({ error: 'User must be an instructor' }, { status: 400 });
  }

  const newAdmin = await assignSchoolAdmin(schoolId, userId);

  return NextResponse.json({
    newAdmin,
  });
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

  if (isNaN(schoolId)) {
    return NextResponse.json({ error: 'Invalid school ID' }, { status: 400 });
  }

  const { adminId } = await req.json();

  if (!adminId) {
    return NextResponse.json({ error: 'Admin ID is required' }, { status: 400 });
  }

  await unassignSchoolAdmin(adminId);

  return NextResponse.json({
    message: 'Admin unassigned successfully',
  });
}
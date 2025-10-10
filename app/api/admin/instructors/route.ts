import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getInstructors, createInstructor } from '@/lib/instructorService';

export async function GET(req: NextRequest) {
  const session = await getSession();

  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }

  const instructors = await getInstructors();

  return NextResponse.json({ instructors });
}

export async function POST(req: NextRequest) {
  const session = await getSession();

  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }

  const { name, email, studentId, password, role, schoolIds, permissions } = await req.json();

  if (!name || !email || !password || !role) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const newUser = await createInstructor({
    name,
    email,
    studentId,
    password,
    role,
    schoolIds,
    permissions,
    createdBy: session.userId,
  });

  return NextResponse.json({ user: newUser });
}


import { NextRequest, NextResponse } from 'next/server';
import { getSession, hashPassword } from '@/lib/auth';
import { deleteInstructor, getInstructorById, getInstructorClassesCountById, getInstructorSchoolCountCountById, updateInstructor } from '@/lib/instructorService';

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
  const instructorId = parseInt(id);

  const instructor = await getInstructorById(instructorId);

  if (!instructor) {
    return NextResponse.json({ error: 'Instructor not found' }, { status: 404 });
  }

  const classCount = await getInstructorClassesCountById(instructorId)

  const schoolCount = await getInstructorSchoolCountCountById(instructorId);

  return NextResponse.json({
    ...instructor,
    classCount,
    schoolCount,
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
  const instructorId = parseInt(id);

  if (isNaN(instructorId)) {
    return NextResponse.json({ error: 'Invalid instructor ID' }, { status: 400 });
  }

  const data = await req.json();

  try {
    const updatedUser = await updateInstructor(instructorId, data, session.userId)

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error('Error updating instructor:', error);
    return NextResponse.json({ error: 'Failed to update instructor' }, { status: 500 });
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
  const instructorId = parseInt(id);

  if (isNaN(instructorId)) {
    return NextResponse.json({ error: 'Invalid instructor ID' }, { status: 400 });
  }

  try {
    await deleteInstructor(instructorId, session.userId)

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting instructor:', error);
    return NextResponse.json({ error: 'Failed to delete instructor' }, { status: 500 });
  }
}
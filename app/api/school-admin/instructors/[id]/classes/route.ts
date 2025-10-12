
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { assignInstructorToClasses, getInstructorsClasses } from '@/lib/instructorService';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(
  req: NextRequest,
  context: RouteContext
) {
  const session = await getSession();

  if (!session || session.role !== 'school_admin') {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }

  const { id } = await context.params;
  const instructorId = parseInt(id);

  const classesWithStudentCount = await getInstructorsClasses(instructorId);

  return NextResponse.json({ classes: classesWithStudentCount });
}

export async function POST(
  req: NextRequest,
  context: RouteContext
) {
  const session = await getSession();

  if (!session || session.role !== 'school_admin') {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }

  const { id } = await context.params;
  const instructorId = parseInt(id);
  const { classIds } = await req.json();

  await assignInstructorToClasses(instructorId, classIds, session.userId)

  return NextResponse.json({ success: true });
}

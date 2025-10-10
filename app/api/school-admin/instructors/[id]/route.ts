
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getInstructorById, getInstructorClassesCountById, getInstructorSchoolCountCountById } from '@/lib/instructorService';

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

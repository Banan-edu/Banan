
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@server/db';
import { users, classInstructors, classes, schoolAdmins } from '@shared/schema';
import { eq, sql } from 'drizzle-orm';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();

  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }

  const { id } = await params;
  const instructorId = parseInt(id);

  const [instructor] = await db
    .select()
    .from(users)
    .where(eq(users.id, instructorId))
    .limit(1);

  if (!instructor) {
    return NextResponse.json({ error: 'Instructor not found' }, { status: 404 });
  }

  const instructorClasses = await db
    .select({ classId: classInstructors.classId })
    .from(classInstructors)
    .where(eq(classInstructors.userId, instructorId));

  const classCount = instructorClasses.length;

  const schoolAdminRecords = await db
    .select({ schoolId: schoolAdmins.schoolId })
    .from(schoolAdmins)
    .where(eq(schoolAdmins.userId, instructorId));
  const schoolCount = new Set(schoolAdminRecords.map(s => s.schoolId)).size;

  return NextResponse.json({
    ...instructor,
    classCount,
    schoolCount,
  });
}

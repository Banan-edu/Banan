
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@server/db';
import { classInstructors, classes, classStudents } from '@shared/schema';
import { eq, inArray, sql } from 'drizzle-orm';

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

  const instructorClasses = await db
    .select({
      id: classes.id,
      name: classes.name,
      assignedAt: classInstructors.assignedAt,
    })
    .from(classInstructors)
    .innerJoin(classes, eq(classInstructors.classId, classes.id))
    .where(eq(classInstructors.userId, instructorId));

  const classesWithStudentCount = await Promise.all(
    instructorClasses.map(async (cls) => {
      const studentCount = await db
        .select({ count: sql<number>`count(*)` })
        .from(classStudents)
        .where(eq(classStudents.classId, cls.id));

      return {
        ...cls,
        studentCount: Number(studentCount[0]?.count || 0),
      };
    })
  );

  return NextResponse.json({ classes: classesWithStudentCount });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();

  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }

  const { id } = await params;
  const instructorId = parseInt(id);
  const { classIds } = await req.json();

  for (const classId of classIds) {
    await db.insert(classInstructors).values({
      userId: instructorId,
      classId,
    });
  }

  return NextResponse.json({ success: true });
}

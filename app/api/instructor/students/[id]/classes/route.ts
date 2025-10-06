
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@server/db';
import { classStudents, classes } from '@shared/schema';
import { eq } from 'drizzle-orm';
type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(
  req: NextRequest,
  context: RouteContext
) {
  const session = await getSession();

  if (!session || session.role !== 'instructor') {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }

  const { id } = await context.params;
  const studentId = parseInt(id);

  const studentClasses = await db
    .select({
      id: classes.id,
      name: classes.name,
      description: classes.description,
      enrolledAt: classStudents.enrolledAt,
      studentCount: classes.id, // Will be calculated
    })
    .from(classStudents)
    .innerJoin(classes, eq(classStudents.classId, classes.id))
    .where(eq(classStudents.userId, studentId));

  return NextResponse.json({ classes: studentClasses });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();

  if (!session || session.role !== 'instructor') {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }

  const { id } = await params;
  const studentId = parseInt(id);
  const { classId } = await req.json();

  await db.insert(classStudents).values({
    userId: studentId,
    classId,
  });

  return NextResponse.json({ success: true });
}

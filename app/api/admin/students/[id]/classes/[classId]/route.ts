
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@server/db';
import { classStudents } from '@shared/schema';
import { and, eq } from 'drizzle-orm';
type RouteContext = {
  params: Promise<{ id: string; classId: string }>;
};

export async function DELETE(
  req: NextRequest,
  context: RouteContext
) {
  const session = await getSession();

  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }

  const { id, classId } = await context.params;
  const studentId = parseInt(id);
  const classIdNum = parseInt(classId);

  await db
    .delete(classStudents)
    .where(
      and(
        eq(classStudents.userId, studentId),
        eq(classStudents.classId, classIdNum)
      )
    );

  return NextResponse.json({ success: true });
}


import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@server/db';
import { lessonProgress } from '@shared/schema';
import { eq, avg, sum } from 'drizzle-orm';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();

  if (!session || session.role !== 'instructor') {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }

  const { id } = await params;
  const studentId = parseInt(id);

  const [performance] = await db
    .select({
      avgSpeed: avg(lessonProgress.speed),
      avgAccuracy: avg(lessonProgress.accuracy),
      totalTime: sum(lessonProgress.timeSpent),
    })
    .from(lessonProgress)
    .where(eq(lessonProgress.userId, studentId));

  return NextResponse.json({
    avgSpeed: Math.round(Number(performance?.avgSpeed || 0)),
    avgAccuracy: Math.round(Number(performance?.avgAccuracy || 0)),
    totalTime: Number(performance?.totalTime || 0),
  });
}

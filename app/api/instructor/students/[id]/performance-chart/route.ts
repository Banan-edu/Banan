
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@server/db';
import { lessonProgress, lessons } from '@shared/schema';
import { eq, avg, sum, sql, desc, gte } from 'drizzle-orm';

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

  const { searchParams } = new URL(req.url);
  const range = searchParams.get('range') || 'week';

  // Calculate date range
  const now = new Date();
  let startDate = new Date();
  if (range === 'week') {
    startDate.setDate(now.getDate() - 7);
  } else if (range === 'month') {
    startDate.setDate(now.getDate() - 30);
  } else {
    startDate.setFullYear(2000); // All time
  }

  // Get overall performance stats
  const [performance] = await db
    .select({
      avgSpeed: avg(lessonProgress.speed),
      avgAccuracy: avg(lessonProgress.accuracy),
      totalTime: sum(lessonProgress.timeSpent),
    })
    .from(lessonProgress)
    .where(
      eq(lessonProgress.userId, studentId)
    );

  // Get progress over time
  const progressOverTime = await db
    .select({
      date: sql<string>`DATE(${lessonProgress.lastAttemptAt})`,
      speed: sql<number>`AVG(${lessonProgress.speed})`,
      accuracy: sql<number>`AVG(${lessonProgress.accuracy})`,
    })
    .from(lessonProgress)
    .where(
      eq(lessonProgress.userId, studentId)
    )
    .groupBy(sql`DATE(${lessonProgress.lastAttemptAt})`)
    .orderBy(sql`DATE(${lessonProgress.lastAttemptAt})`);

  return NextResponse.json({
    avgSpeed: Math.round(Number(performance?.avgSpeed || 0)),
    avgAccuracy: Math.round(Number(performance?.avgAccuracy || 0)),
    totalTime: Number(performance?.totalTime || 0),
    progressOverTime: progressOverTime.map(p => ({
      date: p.date,
      speed: Math.round(Number(p.speed)),
      accuracy: Math.round(Number(p.accuracy)),
    })),
  });
}

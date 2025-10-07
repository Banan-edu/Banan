
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@server/db';
import { lessonProgress } from '@shared/schema';
import { eq, avg, sum, sql, gte } from 'drizzle-orm';

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
  const { searchParams } = new URL(req.url);
  const timeFrame = searchParams.get('timeFrame') || 'week';

  // Calculate date range based on timeFrame
  const now = new Date();
  let startDate = new Date();
  let groupByFormat = '';
  let daysToShow = 7;

  switch (timeFrame) {
    case 'day':
      startDate.setHours(0, 0, 0, 0);
      groupByFormat = '%H:00';
      daysToShow = 24; // hours
      break;
    case 'week':
      startDate.setDate(now.getDate() - 7);
      groupByFormat = '%Y-%m-%d';
      daysToShow = 7;
      break;
    case 'month':
      startDate.setDate(now.getDate() - 30);
      groupByFormat = '%Y-%m-%d';
      daysToShow = 30;
      break;
  }

  // Get overall performance
  const [performance] = await db
    .select({
      avgSpeed: avg(lessonProgress.speed),
      avgAccuracy: avg(lessonProgress.accuracy),
      totalTime: sum(lessonProgress.timeSpent),
    })
    .from(lessonProgress)
    .where(eq(lessonProgress.userId, studentId));

  // Get chart data (grouped by time)
  const chartData = await db
    .select({
      period: sql`strftime('${sql.raw(groupByFormat)}', ${lessonProgress.lastAttemptAt})`,
      accuracy: avg(lessonProgress.accuracy),
      speed: avg(lessonProgress.speed),
      practice: sum(lessonProgress.timeSpent),
    })
    .from(lessonProgress)
    .where(
      sql`${eq(lessonProgress.userId, studentId)} AND ${gte(lessonProgress.lastAttemptAt, startDate)}`
    )
    .groupBy(sql`strftime('${sql.raw(groupByFormat)}', ${lessonProgress.lastAttemptAt})`)
    .orderBy(sql`strftime('${sql.raw(groupByFormat)}', ${lessonProgress.lastAttemptAt})`);

  // Format chart data
  const formattedChartData = chartData.map((item: any) => ({
    label: item.period,
    accuracy: Math.round(Number(item.accuracy || 0)),
    coverage: Math.round(Math.random() * 100), // Mock coverage data
    speed: Math.round(Number(item.speed || 0)),
    practice: Math.round(Number(item.practice || 0) / 60), // Convert to minutes
  }));

  return NextResponse.json({
    avgSpeed: Math.round(Number(performance?.avgSpeed || 0)),
    avgAccuracy: Math.round(Number(performance?.avgAccuracy || 0)),
    totalTime: Number(performance?.totalTime || 0),
    coverage: Math.round(Math.random() * 100), // Mock coverage data
    chartData: formattedChartData,
  });
}

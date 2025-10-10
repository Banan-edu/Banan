
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@server/db';
import { lessonProgress } from '@shared/schema';
import { eq, sql, gte } from 'drizzle-orm';
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
  const studentId = parseInt(id);

  const sixtyDaysAgo = new Date();
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

  const practiceData = await db
    .select({
      date: sql<string>`DATE(${lessonProgress.lastAttemptAt})`,
      count: sql<number>`COUNT(*)`,
      totalTime: sql<number>`SUM(${lessonProgress.timeSpent})`,
    })
    .from(lessonProgress)
    .where(
      eq(lessonProgress.userId, studentId)
    )
    .groupBy(sql`DATE(${lessonProgress.lastAttemptAt})`);

  return NextResponse.json({ practiceData });
}

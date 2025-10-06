
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@server/db';
import { lessonProgress } from '@shared/schema';
import { eq, sql, gte } from 'drizzle-orm';

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

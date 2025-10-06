
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@server/db';
import { lessonProgress, lessons } from '@shared/schema';
import { eq, desc } from 'drizzle-orm';

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

  const recentActivity = await db
    .select({
      id: lessonProgress.id,
      lessonName: lessons.name,
      stars: lessonProgress.stars,
      score: lessonProgress.score,
      duration: lessonProgress.timeSpent,
      timestamp: lessonProgress.lastAttemptAt,
    })
    .from(lessonProgress)
    .innerJoin(lessons, eq(lessonProgress.lessonId, lessons.id))
    .where(eq(lessonProgress.userId, studentId))
    .orderBy(desc(lessonProgress.lastAttemptAt))
    .limit(50);

  return NextResponse.json({ activities: recentActivity });
}

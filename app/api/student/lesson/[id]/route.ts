import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@server/db';
import { lessons, lessonProgress } from '@shared/schema';
import { eq } from 'drizzle-orm';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();

  if (!session || session.role !== 'student') {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }

  const lessonId = parseInt(params.id);

  const [lesson] = await db
    .select()
    .from(lessons)
    .where(eq(lessons.id, lessonId))
    .limit(1);

  if (!lesson) {
    return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
  }

  const [progress] = await db
    .select()
    .from(lessonProgress)
    .where(eq(lessonProgress.lessonId, lessonId))
    .where(eq(lessonProgress.userId, session.userId))
    .limit(1);

  return NextResponse.json({ lesson, progress });
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();

  if (!session || session.role !== 'student') {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }

  const lessonId = parseInt(params.id);
  const { score, speed, accuracy, timeSpent } = await req.json();

  const stars = accuracy >= 95 && speed >= 40 ? 3 : accuracy >= 85 && speed >= 30 ? 2 : 1;
  const completed = accuracy >= 80;

  const [existing] = await db
    .select()
    .from(lessonProgress)
    .where(eq(lessonProgress.lessonId, lessonId))
    .where(eq(lessonProgress.userId, session.userId))
    .limit(1);

  if (existing) {
    const [updated] = await db
      .update(lessonProgress)
      .set({
        score: Math.max(existing.score, score),
        speed: Math.max(existing.speed, speed),
        accuracy: Math.max(existing.accuracy, accuracy),
        stars: Math.max(existing.stars, stars),
        timeSpent: existing.timeSpent + timeSpent,
        attempts: existing.attempts + 1,
        completed: completed || existing.completed,
        lastAttemptAt: new Date(),
        completedAt: completed && !existing.completed ? new Date() : existing.completedAt,
      })
      .where(eq(lessonProgress.id, existing.id))
      .returning();

    return NextResponse.json({ progress: updated });
  } else {
    const [created] = await db
      .insert(lessonProgress)
      .values({
        userId: session.userId,
        lessonId,
        score,
        speed,
        accuracy,
        stars,
        timeSpent,
        attempts: 1,
        completed,
        lastAttemptAt: new Date(),
        completedAt: completed ? new Date() : null,
      })
      .returning();

    return NextResponse.json({ progress: created });
  }
}

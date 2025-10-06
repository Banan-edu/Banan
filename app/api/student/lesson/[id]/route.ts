import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@server/db';
import { lessons, lessonProgress, sections, courses, classCourses, classStudents } from '@shared/schema';
import { eq, and, inArray } from 'drizzle-orm';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(req: NextRequest, context: RouteContext) {
  const session = await getSession();

  if (!session || session.role !== 'student') {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }
  const { id } = await context.params;
  const lessonId = parseInt(id);

  const [lesson] = await db
    .select()
    .from(lessons)
    .where(eq(lessons.id, lessonId))
    .limit(1);

  if (!lesson) {
    return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
  }

  const [section] = await db
    .select()
    .from(sections)
    .where(eq(sections.id, lesson.sectionId))
    .limit(1);

  if (!section) {
    return NextResponse.json({ error: 'Section not found' }, { status: 404 });
  }

  const studentClasses = await db
    .select({ classId: classStudents.classId })
    .from(classStudents)
    .where(eq(classStudents.userId, session.userId));

  const classIds = studentClasses.map(c => c.classId);

  if (classIds.length === 0) {
    return NextResponse.json({ error: 'Not enrolled in any classes' }, { status: 403 });
  }

  const enrolledCourses = await db
    .select({ courseId: classCourses.courseId })
    .from(classCourses)
    .where(and(
      eq(classCourses.courseId, section.courseId),
      inArray(classCourses.classId, classIds)
    ));

  if (enrolledCourses.length === 0) {
    return NextResponse.json({ error: 'Not authorized to access this lesson' }, { status: 403 });
  }

  const [progress] = await db
    .select()
    .from(lessonProgress)
    .where(and(
      eq(lessonProgress.lessonId, lessonId),
      eq(lessonProgress.userId, session.userId)
    ))
    .limit(1);

  return NextResponse.json({ lesson, progress });
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();

  if (!session || session.role !== 'student') {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }

  const lessonId = parseInt(params.id);
  const body = await req.json();

  const speed = Math.max(0, Math.min(200, parseInt(body.speed) || 0));
  const accuracy = Math.max(0, Math.min(100, parseInt(body.accuracy) || 0));
  const timeSpent = Math.max(0, Math.min(3600, parseInt(body.timeSpent) || 0));
  const score = Math.max(0, Math.min(1000, parseInt(body.score) || 0));

  const [lesson] = await db
    .select()
    .from(lessons)
    .where(eq(lessons.id, lessonId))
    .limit(1);

  if (!lesson) {
    return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
  }

  const [section] = await db
    .select()
    .from(sections)
    .where(eq(sections.id, lesson.sectionId))
    .limit(1);

  if (!section) {
    return NextResponse.json({ error: 'Section not found' }, { status: 404 });
  }

  const studentClasses = await db
    .select({ classId: classStudents.classId })
    .from(classStudents)
    .where(eq(classStudents.userId, session.userId));

  const classIds = studentClasses.map(c => c.classId);

  if (classIds.length === 0) {
    return NextResponse.json({ error: 'Not enrolled in any classes' }, { status: 403 });
  }

  const enrolledCourses = await db
    .select({ courseId: classCourses.courseId })
    .from(classCourses)
    .where(and(
      eq(classCourses.courseId, section.courseId),
      inArray(classCourses.classId, classIds)
    ));

  if (enrolledCourses.length === 0) {
    return NextResponse.json({ error: 'Not authorized to submit progress for this lesson' }, { status: 403 });
  }

  const stars = accuracy >= 95 && speed >= 40 ? 3 : accuracy >= 85 && speed >= 30 ? 2 : 1;
  const completed = accuracy >= 80;

  const [existing] = await db
    .select()
    .from(lessonProgress)
    .where(and(
      eq(lessonProgress.lessonId, lessonId),
      eq(lessonProgress.userId, session.userId)
    ))
    .limit(1);

  if (existing) {
    const [updated] = await db
      .update(lessonProgress)
      .set({
        score: Math.max((existing.score || 0), score),
        speed: Math.max((existing.speed || 0), speed),
        accuracy: Math.max((existing.accuracy || 0), accuracy),
        stars: Math.max((existing.stars || 0), stars),
        timeSpent: (existing.timeSpent || 0) + timeSpent,
        attempts: (existing.attempts || 0) + 1,
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

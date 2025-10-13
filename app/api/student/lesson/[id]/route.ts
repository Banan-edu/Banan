import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@server/db';
import { lessons, lessonProgress, sections, courses, classCourses, classStudents, letterProgress, letterStatistics, typingPatterns } from '@shared/schema';
import { eq, and, inArray } from 'drizzle-orm';
import { languages } from 'prismjs';

type ErrorPatternData = {
  count?: number;
  type?: string;
};

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
  const [course] = await db
    .select({ language: courses.language })
    .from(courses)
    .where(eq(courses.id, section.courseId))
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

  return NextResponse.json({ lesson: { ...lesson, ...course }, progress });
}

export async function POST(req: NextRequest, context: RouteContext) {
  const session = await getSession();

  if (!session || session.role !== 'student') {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }
  const { id } = await context.params;
  const lessonId = parseInt(id);
  const body = await req.json();

  const speed = Math.max(0, Math.min(200, parseInt(body.speed) || 0));
  const accuracy = Math.max(0, Math.min(100, parseInt(body.accuracy) || 0));
  const timeSpent = Math.max(0, Math.min(3600, parseInt(body.timeSpent) || 0));
  const score = Math.max(0, Math.min(1000, parseInt(body.score) || 0));

  // Extract detailed tracking data
  const sessionData = body.sessionData || null; // Keystroke timeline
  const letterData = body.letterData || []; // Per-letter statistics
  const errorPatterns = body.errorPatterns || {}; // Common error patterns

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

  let progressRecord;

  if (existing) {
    const [updated] = await db
      .update(lessonProgress)
      .set({
        score: Math.max(existing?.score || 0, score),
        speed: Math.max(existing?.speed || 0, speed),
        accuracy: Math.max(existing?.accuracy || 0, accuracy),
        stars: Math.max(existing?.stars || 0, stars),
        timeSpent: (existing?.timeSpent || 0) + timeSpent,
        attempts: (existing?.attempts || 0) + 1,
        completed: completed || existing.completed,
        sessionData,
        errorPatterns,
        lastAttemptAt: new Date(),
        completedAt: completed && !existing.completed ? new Date() : existing.completedAt,
      })
      .where(eq(lessonProgress.id, existing.id))
      .returning();

    progressRecord = updated;
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
        sessionData,
        errorPatterns,
        lastAttemptAt: new Date(),
        completedAt: completed ? new Date() : null,
      })
      .returning();

    progressRecord = created;
  }

  // Save per-lesson letter progress
  if (letterData && letterData.length > 0) {
    for (const letterStat of letterData) {
      await db.insert(letterProgress).values({
        userId: session.userId,
        lessonId,
        progressId: progressRecord.id,
        letter: letterStat.letter,
        correctCount: letterStat.correctCount || 0,
        incorrectCount: letterStat.incorrectCount || 0,
        avgTimeMs: letterStat.avgTimeMs || 0,
      });

      // Update aggregated letter statistics
      const [existing] = await db
        .select()
        .from(letterStatistics)
        .where(
          and(
            eq(letterStatistics.userId, session.userId),
            eq(letterStatistics.letter, letterStat.letter)
          )
        )
        .limit(1);

      if (existing) {
        const newCorrect = existing.correctCount + (letterStat.correctCount || 0);
        const newIncorrect = existing.incorrectCount + (letterStat.incorrectCount || 0);
        const newTotalTime = existing.totalTimeMs + (letterStat.totalTimeMs || 0);

        // Merge common errors
        const mergedErrors = { ...(existing.commonErrors as any) };
        if (letterStat.errors) {
          for (const [wrongChar, count] of Object.entries(letterStat.errors)) {
            mergedErrors[wrongChar] = (mergedErrors[wrongChar] || 0) + (count as number);
          }
        }

        await db
          .update(letterStatistics)
          .set({
            correctCount: newCorrect,
            incorrectCount: newIncorrect,
            totalTimeMs: newTotalTime,
            commonErrors: mergedErrors,
            lastPracticedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(letterStatistics.id, existing.id));
      } else {
        await db.insert(letterStatistics).values({
          userId: session.userId,
          letter: letterStat.letter,
          correctCount: letterStat.correctCount || 0,
          incorrectCount: letterStat.incorrectCount || 0,
          totalTimeMs: letterStat.totalTimeMs || 0,
          commonErrors: letterStat.errors || {},
          lastPracticedAt: new Date(),
        });
      }
    }
  }

  // Save typing patterns
  if (errorPatterns && typeof errorPatterns === 'object') {
    for (const [pattern, data] of Object.entries(errorPatterns as Record<string, ErrorPatternData>)) {
      const [from, to] = pattern.split('->');
      if (from && to) {
        const [existingPattern] = await db
          .select()
          .from(typingPatterns)
          .where(
            and(
              eq(typingPatterns.userId, session.userId),
              eq(typingPatterns.fromChar, from),
              eq(typingPatterns.toChar, to)
            )
          )
          .limit(1);

        if (existingPattern) {
          await db
            .update(typingPatterns)
            .set({
              occurrences: existingPattern.occurrences + (data?.count || 1),
              lastOccurrence: new Date(),
              avgSpeed: speed,
              avgAccuracy: accuracy,
              updatedAt: new Date(),
            })
            .where(eq(typingPatterns.id, existingPattern.id));
        } else {
          await db.insert(typingPatterns).values({
            userId: session.userId,
            patternType: data?.type || 'unknown',
            fromChar: from,
            toChar: to,
            occurrences: data?.count || 1,
            avgSpeed: speed,
            avgAccuracy: accuracy,
            lastOccurrence: new Date(),
          });
        }
      }
    }
  }

  return NextResponse.json({ progress: progressRecord });
}

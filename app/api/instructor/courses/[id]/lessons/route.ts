import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@server/db';
import { lessons, sections, courses } from '@shared/schema';
import { eq, and } from 'drizzle-orm';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(req: NextRequest, context: RouteContext) {
  const session = await getSession();

  // --- 1️⃣ Authorization check ---
  if (!session || session.role !== 'instructor') {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }

  const { id } =await context.params;
  const courseId = parseInt(id);
  const data = await req.json();

  const {
    sectionId,
    name,
    type,
    text,
    language,
    objective,
    disableBackspace,
    blockOnError,
    useMeaningfulWords,
    isPlacementTest,
    goalSpeed,
    minSpeed,
    minAccuracy,
    targetScore,
    timeLimit,
    instructions,
  } = data;

  // --- 2️⃣ Validate section belongs to course ---
  const [section] = await db
    .select()
    .from(sections)
    .where(eq(sections.id, sectionId))
    .limit(1);

  if (!section || section.courseId !== courseId) {
    return NextResponse.json({ error: 'Section not found' }, { status: 404 });
  }

  // --- 3️⃣ Verify course exists ---
  const [course] = await db
    .select()
    .from(courses)
    .where(eq(courses.id, courseId))
    .limit(1);

  if (!course) {
    return NextResponse.json({ error: 'Course not found' }, { status: 403 });
  }

  // --- 4️⃣ Determine lesson order ---
  const existingLessons = await db
    .select()
    .from(lessons)
    .where(eq(lessons.sectionId, sectionId));

  const order = existingLessons.length + 1;

  // --- 5️⃣ Insert new lesson with all fields ---
  const [newLesson] = await db
    .insert(lessons)
    .values({
      sectionId,
      name,
      type,
      text: text,
      codeLanguage: language || 'javascript',
      order,
      objective: objective || '',
      disableBackspace: disableBackspace ?? false,
      blockOnError: blockOnError ?? false,
      useMeaningfulWords: useMeaningfulWords ?? true,
      isPlacementTest: isPlacementTest ?? false,
      goalSpeed: goalSpeed ?? 20,
      minSpeed: minSpeed ?? 3,
      minAccuracy: minAccuracy ?? 80,
      targetScore: targetScore ?? 1000,
      timeLimit: timeLimit ?? 10,
      instructions: instructions ?? [],
    })
    .returning();

  return NextResponse.json({ lesson: newLesson });
}

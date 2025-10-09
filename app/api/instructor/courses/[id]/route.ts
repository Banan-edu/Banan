import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@server/db';
import { courses, courseEditors, sections, lessons } from '@shared/schema';
import { eq, and, or } from 'drizzle-orm';
type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(req: NextRequest, context: RouteContext) {
  const session = await getSession();

  if (!session || session.role !== 'instructor') {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }

  const { id } = await context.params;
  const courseId = parseInt(id);
  const [course] = await db
    .select()
    .from(courses)
    .where(eq(courses.id, courseId))
    .limit(1);

  if (!course) {
    return NextResponse.json({ error: 'Course not found' }, { status: 404 });
  }

  const isCreator = course.createdBy === session.userId;

  const [editorAccess] = await db
    .select()
    .from(courseEditors)
    .where(and(
      eq(courseEditors.courseId, courseId),
      eq(courseEditors.userId, session.userId)
    ))
    .limit(1);

  if (!isCreator && !editorAccess) {
    return NextResponse.json({ error: 'Not authorized to access this course' }, { status: 403 });
  }

  const courseSections = await db
    .select()
    .from(sections)
    .where(eq(sections.courseId, courseId))
    .orderBy(sections.order);

  const sectionsWithLessons = await Promise.all(
    courseSections.map(async (section) => {
      const sectionLessons = await db
        .select()
        .from(lessons)
        .where(eq(lessons.sectionId, section.id))
        .orderBy(lessons.order);

      return {
        ...section,
        lessons: sectionLessons,
      };
    })
  );

  return NextResponse.json({
    course,
    sections: sectionsWithLessons,
  });
}
export async function PUT(
  req: NextRequest,
  context: RouteContext
) {
  const session = await getSession();

  if (!session || session.role !== 'instructor') {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }
  const { id } = await context.params;
  const courseId = parseInt(id);
  const { name, description, language } = await req.json();

  if (!name || !language) {
    return NextResponse.json({ error: 'Name and language are required' }, { status: 400 });
  }

  // Verify the instructor owns this course
  const [course] = await db
    .select()
    .from(courses)
    .where(and(eq(courses.id, courseId), eq(courses.createdBy, session.userId)));

  if (!course) {
    return NextResponse.json({ error: 'Course not found or not authorized' }, { status: 404 });
  }

  const [updatedCourse] = await db
    .update(courses)
    .set({
      name,
      description: description || null,
      language,
    })
    .where(eq(courses.id, courseId))
    .returning();

  return NextResponse.json({ course: updatedCourse });
}

export async function DELETE(
  req: NextRequest,
  context: RouteContext
) {
  const session = await getSession();

  if (!session || session.role !== 'instructor') {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }
  const { id } = await context.params;
  const courseId = parseInt(id);

  // Verify the instructor owns this course
  const [course] = await db
    .select()
    .from(courses)
    .where(and(eq(courses.id, courseId), eq(courses.createdBy, session.userId)));

  if (!course) {
    return NextResponse.json({ error: 'Course not found or not authorized' }, { status: 404 });
  }

  // Get all sections for this course
  const courseSections = await db
    .select()
    .from(sections)
    .where(eq(sections.courseId, courseId));

  // Delete all lessons in all sections
  for (const section of courseSections) {
    await db.delete(lessons).where(eq(lessons.sectionId, section.id));
  }

  // Delete all sections
  await db.delete(sections).where(eq(sections.courseId, courseId));

  // Delete the course
  await db.delete(courses).where(eq(courses.id, courseId));

  return NextResponse.json({ success: true });
}

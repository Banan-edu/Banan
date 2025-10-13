import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@server/db';
import { courses, courseEditors, sections, lessons } from '@shared/schema';
import { eq, inArray } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  const session = await getSession();

  if (!session || session.role !== 'school_admin') {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }

  // --- Fetch created courses ---
  const createdCourses = await db
    .select({
      id: courses.id,
      name: courses.name,
      description: courses.description,
      createdAt: courses.createdAt,
    })
    .from(courses);

  // --- Fetch editable courses (by editors) ---
  const editorCourses = await db
    .select({ courseId: courseEditors.courseId })
    .from(courseEditors);

  const editorCourseIds = editorCourses.map(c => c.courseId);

  let editableCourses: any[] = [];
  if (editorCourseIds.length > 0) {
    editableCourses = await db
      .select({
        id: courses.id,
        name: courses.name,
        description: courses.description,
        createdAt: courses.createdAt,
      })
      .from(courses)
      .where(inArray(courses.id, editorCourseIds));
  }

  // --- Combine & deduplicate courses ---
  const allCourses = [...createdCourses, ...editableCourses];
  const uniqueCourses = Array.from(new Map(allCourses.map(c => [c.id, c])).values());

  // --- Add stats (sections + lessons count) ---
  const coursesWithStats = await Promise.all(
    uniqueCourses.map(async (course) => {
      const courseSections = await db
        .select({ id: sections.id })
        .from(sections)
        .where(eq(sections.courseId, course.id));

      let lessonCount = 0;
      if (courseSections.length > 0) {
        const sectionIds = courseSections.map(s => s.id);
        const sectionLessons = await db
          .select({ id: lessons.id })
          .from(lessons)
          .where(inArray(lessons.sectionId, sectionIds));
        lessonCount = sectionLessons.length;
      }

      return {
        ...course,
        sectionCount: courseSections.length,
        lessonCount,
      };
    })
  );

  return NextResponse.json({ courses: coursesWithStats });
}

export async function POST(req: NextRequest) {
  const session = await getSession();

  if (!session || session.role !== 'school_admin') {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }

  const { name, description, language } = await req.json();

  if (!name || !language) {
    return NextResponse.json({ error: 'Name and language are required' }, { status: 400 });
  }

  const [newCourse] = await db
    .insert(courses)
    .values({
      name,
      description: description || null,
      language,
      createdBy: session.userId,
    })
    .returning();

  return NextResponse.json({ course: newCourse });
}

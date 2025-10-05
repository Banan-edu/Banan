import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@server/db';
import { courses, courseEditors, sections, lessons } from '@shared/schema';
import { eq, inArray } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  const session = await getSession();

  if (!session || session.role !== 'instructor') {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }

  const createdCourses = await db
    .select()
    .from(courses)
    .where(eq(courses.createdBy, session.userId));

  const editorCourses = await db
    .select({ courseId: courseEditors.courseId })
    .from(courseEditors)
    .where(eq(courseEditors.userId, session.userId));

  const editorCourseIds = editorCourses.map(c => c.courseId);

  let editableCourses: any[] = [];
  if (editorCourseIds.length > 0) {
    editableCourses = await db
      .select()
      .from(courses)
      .where(inArray(courses.id, editorCourseIds));
  }

  const allCourseIds = new Set([...createdCourses.map(c => c.id), ...editableCourses.map(c => c.id)]);
  const instructorCourses = [...createdCourses, ...editableCourses].filter((course, index, self) => 
    index === self.findIndex(c => c.id === course.id)
  );

  const coursesWithStats = await Promise.all(
    instructorCourses.map(async (course) => {
      const courseSections = await db
        .select({ id: sections.id })
        .from(sections)
        .where(eq(sections.courseId, course.id));

      let lessonCount = 0;
      for (const section of courseSections) {
        const sectionLessons = await db
          .select({ id: lessons.id })
          .from(lessons)
          .where(eq(lessons.sectionId, section.id));
        lessonCount += sectionLessons.length;
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

  if (!session || session.role !== 'instructor') {
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

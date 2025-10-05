import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@server/db';
import { courses, sections, lessons } from '@shared/schema';
import { eq } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  const session = await getSession();

  if (!session || session.role !== 'instructor') {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }

  const instructorCourses = await db
    .select()
    .from(courses)
    .where(eq(courses.instructorId, session.userId));

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
      instructorId: session.userId,
    })
    .returning();

  return NextResponse.json({ course: newCourse });
}


import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@server/db';
import { lessonProgress, lessons, sections, courses } from '@shared/schema';
import { eq, and } from 'drizzle-orm';

type RouteContext = {
    params: Promise<{ id: string; courseId: string }>;
};

export async function GET(
    req: NextRequest,
    context: RouteContext
) {
    const session = await getSession();

    if (!session || session.role !== 'instructor') {
        return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
    }
    const { id, courseId } = await context.params;
    const studentId = parseInt(id);
    const courseIdNum = parseInt(courseId);

    // Get all sections for this course
    const courseSections = await db
        .select()
        .from(sections)
        .where(eq(sections.courseId, courseIdNum))
        .orderBy(sections.order);

    // Get all lessons with progress for each section
    const sectionsWithLessons = await Promise.all(
        courseSections.map(async (section) => {
            const sectionLessons = await db
                .select({
                    id: lessons.id,
                    name: lessons.name,
                    type: lessons.type,
                    order: lessons.order,
                })
                .from(lessons)
                .where(eq(lessons.sectionId, section.id))
                .orderBy(lessons.order);

            // Get progress for each lesson
            const lessonsWithProgress = await Promise.all(
                sectionLessons.map(async (lesson) => {
                    const [progress] = await db
                        .select({
                            completed: lessonProgress.completed,
                            stars: lessonProgress.stars,
                            score: lessonProgress.score,
                            attempts: lessonProgress.attempts,
                            timeSpent: lessonProgress.timeSpent,
                        })
                        .from(lessonProgress)
                        .where(
                            and(
                                eq(lessonProgress.lessonId, lesson.id),
                                eq(lessonProgress.userId, studentId)
                            )
                        );

                    return {
                        ...lesson,
                        progress: progress || null,
                    };
                })
            );

            return {
                id: section.id,
                name: section.name,
                lessons: lessonsWithProgress,
            };
        })
    );

    return NextResponse.json({ sections: sectionsWithLessons });
}

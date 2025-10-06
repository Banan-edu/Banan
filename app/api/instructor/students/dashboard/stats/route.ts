
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@server/db';
import {
    courses,
    classCourses,
    classStudents,
    sections,
    lessons,
    lessonProgress
} from '@shared/schema';
import { eq, inArray, and, sql, desc } from 'drizzle-orm';

export async function GET() {
    const session = await getSession();

    if (!session || session.role !== 'student') {
        return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
    }

    try {
        // Get student's classes
        const studentClasses = await db
            .select({ classId: classStudents.classId })
            .from(classStudents)
            .where(eq(classStudents.userId, session.userId));

        const classIds = studentClasses.map(c => c.classId);

        if (classIds.length === 0) {
            return NextResponse.json({
                stats: {
                    totalCourses: 0,
                    completedLessons: 0,
                    totalLessons: 0,
                    totalStars: 0,
                    totalScore: 0,
                    averageAccuracy: 0,
                    averageSpeed: 0,
                    totalTimeSpent: 0,
                    streak: 0
                },
                recentActivity: []
            });
        }

        // Get assigned courses
        const assignedCourses = await db
            .select({ courseId: classCourses.courseId })
            .from(classCourses)
            .where(inArray(classCourses.classId, classIds));

        const courseIds = [...new Set(assignedCourses.map(c => c.courseId))];

        // Get all sections for these courses
        const courseSections = await db
            .select({ id: sections.id, courseId: sections.courseId })
            .from(sections)
            .where(inArray(sections.courseId, courseIds));

        const sectionIds = courseSections.map(s => s.id);

        // Get all lessons
        let totalLessons = 0;
        if (sectionIds.length > 0) {
            const allLessons = await db
                .select({ id: lessons.id })
                .from(lessons)
                .where(inArray(lessons.sectionId, sectionIds));
            totalLessons = allLessons.length;
        }

        // Get student's progress stats
        const progressStats = await db
            .select({
                completedLessons: sql<number>`COUNT(CASE WHEN ${lessonProgress.completed} = true THEN 1 END)`,
                totalStars: sql<number>`COALESCE(SUM(${lessonProgress.stars}), 0)`,
                totalScore: sql<number>`COALESCE(SUM(${lessonProgress.score}), 0)`,
                averageAccuracy: sql<number>`COALESCE(AVG(${lessonProgress.accuracy}), 0)`,
                averageSpeed: sql<number>`COALESCE(AVG(${lessonProgress.speed}), 0)`,
                totalTimeSpent: sql<number>`COALESCE(SUM(${lessonProgress.timeSpent}), 0)`,
            })
            .from(lessonProgress)
            .where(eq(lessonProgress.userId, session.userId));

        const stats = progressStats[0] || {
            completedLessons: 0,
            totalStars: 0,
            totalScore: 0,
            averageAccuracy: 0,
            averageSpeed: 0,
            totalTimeSpent: 0
        };

        // Get recent activity (last 10 completed lessons)
        const recentActivityData = await db
            .select({
                id: lessonProgress.id,
                lessonId: lessonProgress.lessonId,
                score: lessonProgress.score,
                stars: lessonProgress.stars,
                accuracy: lessonProgress.accuracy,
                speed: lessonProgress.speed,
                completedAt: lessonProgress.completedAt,
            })
            .from(lessonProgress)
            .where(
                and(
                    eq(lessonProgress.userId, session.userId),
                    eq(lessonProgress.completed, true)
                )
            )
            .orderBy(desc(lessonProgress.completedAt))
            .limit(10);

        // Get lesson and course names for recent activity
        const recentActivity = await Promise.all(
            recentActivityData.map(async (activity) => {
                const [lesson] = await db
                    .select({ name: lessons.name, sectionId: lessons.sectionId })
                    .from(lessons)
                    .where(eq(lessons.id, activity.lessonId))
                    .limit(1);

                if (!lesson) return null;

                const [section] = await db
                    .select({ courseId: sections.courseId })
                    .from(sections)
                    .where(eq(sections.id, lesson.sectionId))
                    .limit(1);

                if (!section) return null;

                const [course] = await db
                    .select({ name: courses.name })
                    .from(courses)
                    .where(eq(courses.id, section.courseId))
                    .limit(1);

                return {
                    id: activity.id,
                    lessonName: lesson.name,
                    courseName: course?.name || 'Unknown Course',
                    score: activity.score,
                    stars: activity.stars,
                    accuracy: activity.accuracy,
                    speed: activity.speed,
                    completedAt: activity.completedAt?.toISOString() || '',
                };
            })
        );

        return NextResponse.json({
            stats: {
                totalCourses: courseIds.length,
                completedLessons: Number(stats.completedLessons),
                totalLessons,
                totalStars: Number(stats.totalStars),
                totalScore: Number(stats.totalScore),
                averageAccuracy: Math.round(Number(stats.averageAccuracy)),
                averageSpeed: Math.round(Number(stats.averageSpeed)),
                totalTimeSpent: Number(stats.totalTimeSpent),
                streak: 0, // Can be calculated based on consecutive days
            },
            recentActivity: recentActivity.filter(a => a !== null)
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
    }
}

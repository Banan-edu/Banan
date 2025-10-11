
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
                recentActivity: [],
                letterStats: [],
                patterns: []
            });
        }

        // Get enrolled courses
        const enrolledCourses = await db
            .select({
                courseId: classCourses.courseId,
                courseName: courses.name
            })
            .from(classCourses)
            .innerJoin(courses, eq(classCourses.courseId, courses.id))
            .where(inArray(classCourses.classId, classIds));

        const courseIds = enrolledCourses.map(c => c.courseId);

        // Get total lessons count
        let totalLessons = 0;
        if (courseIds.length > 0) {
            const lessonCounts = await db
                .select({ count: sql<number>`count(*)` })
                .from(lessons)
                .innerJoin(sections, eq(lessons.sectionId, sections.id))
                .where(inArray(sections.courseId, courseIds));

            totalLessons = Number(lessonCounts[0]?.count || 0);
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

        // Get recent activity
        const recentActivity = await db
            .select({
                id: lessonProgress.id,
                lessonName: lessons.name,
                courseName: courses.name,
                score: lessonProgress.score,
                stars: lessonProgress.stars,
                accuracy: lessonProgress.accuracy,
                speed: lessonProgress.speed,
                completedAt: lessonProgress.lastAttemptAt
            })
            .from(lessonProgress)
            .innerJoin(lessons, eq(lessonProgress.lessonId, lessons.id))
            .innerJoin(sections, eq(lessons.sectionId, sections.id))
            .innerJoin(courses, eq(sections.courseId, courses.id))
            .where(eq(lessonProgress.userId, session.userId))
            .orderBy(desc(lessonProgress.lastAttemptAt))
            .limit(10);

        // TODO: Fetch letter-level statistics when the tables are created
        // This will include data from letterProgress and letterStatistics tables
        const letterStats: any[] = [];
        const patterns: any[] = [];

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
            recentActivity: recentActivity.map(activity => ({
                id: activity.id,
                lessonName: activity.lessonName,
                courseName: activity.courseName,
                score: activity.score,
                stars: activity.stars,
                accuracy: activity.accuracy,
                speed: activity.speed,
                completedAt: activity.completedAt?.toISOString()
            })),
            letterStats,
            patterns
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
    }
}

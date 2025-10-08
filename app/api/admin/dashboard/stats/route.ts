
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@server/db';
import {
    classes,
    classInstructors,
    classStudents,
    users,
    lessonProgress,
    lessons,
    classCourses,
} from '@shared/schema';
import { eq, inArray, and, sql, desc } from 'drizzle-orm';

export async function GET() {
    const session = await getSession();

    if (!session || session.role !== 'admin') {
        return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
    }

    try {
        // Get instructor's classes
        const classesData = await db
            .select({ classId: classes.id })
            .from(classes);

        const classIds = classesData.map(c => c.classId);

        if (classIds.length === 0) {
            return NextResponse.json({
                stats: {
                    activeClasses: 0,
                    activeStudents: 0,
                    practicePerStudent: 0,
                    lessonsPerStudent: 0,
                },
                liveActivity: [],
                activeClasses: [],
            });
        }

        // Get active classes count
        const activeClasses = await db
            .select({
                id: classes.id,
                name: classes.name,
            })
            .from(classes)
            .where(inArray(classes.id, classIds));

        // Get all students in these classes
        const studentEnrollments = await db
            .select({ userId: classStudents.userId })
            .from(classStudents)
            .where(inArray(classStudents.classId, classIds));

        const uniqueStudentIds = [...new Set(studentEnrollments.map(e => e.userId))];

        // Get practice sessions count
        const practiceCount = await db
            .select({
                count: sql<number>`COUNT(*)`,
            })
            .from(lessonProgress)
            .where(inArray(lessonProgress.userId, uniqueStudentIds));

        // Get total lessons completed
        const lessonsCompleted = await db
            .select({
                count: sql<number>`COUNT(*)`,
            })
            .from(lessonProgress)
            .where(
                and(
                    inArray(lessonProgress.userId, uniqueStudentIds),
                    eq(lessonProgress.completed, true)
                )
            );

        // Get live activity (recent lesson completions)
        const recentActivity = await db
            .select({
                id: lessonProgress.id,
                userId: lessonProgress.userId,
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
                    inArray(lessonProgress.userId, uniqueStudentIds),
                    eq(lessonProgress.completed, true)
                )
            )
            .orderBy(desc(lessonProgress.completedAt))
            .limit(10);

        // Get user and lesson details for activity feed
        const activityWithDetails = await Promise.all(
            recentActivity.map(async (activity) => {
                const [user] = await db
                    .select({ name: users.name })
                    .from(users)
                    .where(eq(users.id, activity.userId))
                    .limit(1);

                const [lesson] = await db
                    .select({ name: lessons.name })
                    .from(lessons)
                    .where(eq(lessons.id, activity.lessonId))
                    .limit(1);

                return {
                    id: activity.id,
                    studentName: user?.name || 'Unknown',
                    lessonName: lesson?.name || 'Unknown Lesson',
                    score: activity.score,
                    stars: activity.stars,
                    accuracy: activity.accuracy,
                    speed: activity.speed,
                    completedAt: activity.completedAt?.toISOString() || '',
                };
            })
        );

        // Get active classes with student counts
        const classesWithCounts = await Promise.all(
            activeClasses.map(async (classItem) => {
                const students = await db
                    .select({ id: classStudents.userId })
                    .from(classStudents)
                    .where(eq(classStudents.classId, classItem.id));

                const courses = await db
                    .select({ id: classCourses.courseId })
                    .from(classCourses)
                    .where(eq(classCourses.classId, classItem.id));

                return {
                    id: classItem.id,
                    name: classItem.name,
                    studentCount: students.length,
                    courseCount: courses.length,
                };
            })
        );

        const totalPractice = Number(practiceCount[0]?.count || 0);
        const totalLessons = Number(lessonsCompleted[0]?.count || 0);
        const studentCount = uniqueStudentIds.length;

        return NextResponse.json({
            stats: {
                activeClasses: activeClasses.length,
                activeStudents: studentCount,
                practicePerStudent: studentCount > 0 ? Math.round(totalPractice / studentCount) : 0,
                lessonsPerStudent: studentCount > 0 ? Math.round(totalLessons / studentCount) : 0,
            },
            liveActivity: activityWithDetails,
            activeClasses: classesWithCounts,
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
    }
}

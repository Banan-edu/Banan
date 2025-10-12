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
    schoolAdmins,
} from '@shared/schema';
import { eq, inArray, and, desc, sql } from 'drizzle-orm';

export async function GET() {
    const session = await getSession();

    if (!session || session.role !== 'school_admin') {
        return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
    }

    try {
        // 1. Get the schools assigned to this school admin
        const assignedSchools = await db
            .select({ schoolId: schoolAdmins.schoolId })
            .from(schoolAdmins)
            .where(eq(schoolAdmins.userId, session.userId));

        const schoolIds = assignedSchools.map(s => s.schoolId);
        if (schoolIds.length === 0) {
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

        // 2. Get classes only for assigned schools
        const classesData = await db
            .select({ id: classes.id, name: classes.name })
            .from(classes)
            .where(inArray(classes.schoolId, schoolIds));

        const classIds = classesData.map(c => c.id);
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

        // 3. Get students in these classes
        const studentEnrollments = await db
            .select({ userId: classStudents.userId })
            .from(classStudents)
            .where(inArray(classStudents.classId, classIds));

        const uniqueStudentIds = [...new Set(studentEnrollments.map(e => e.userId))];

        // 4. Practice sessions count
        const practiceCount = await db
            .select({ count: sql<number>`COUNT(*)` })
            .from(lessonProgress)
            .where(inArray(lessonProgress.userId, uniqueStudentIds));

        // 5. Lessons completed
        const lessonsCompleted = await db
            .select({ count: sql<number>`COUNT(*)` })
            .from(lessonProgress)
            .where(
                and(
                    inArray(lessonProgress.userId, uniqueStudentIds),
                    eq(lessonProgress.completed, true)
                )
            );

        // 6. Recent activity
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

        // 7. Map activity with user & lesson names
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

        // 8. Active classes with student & course counts
        const classesWithCounts = await Promise.all(
            classesData.map(async (classItem) => {
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
                activeClasses: classesData.length,
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


import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@server/db';
import {
    lessonProgress,
    lessons,
    sections,
    courses,
    users,
    classStudents,
    classInstructors
} from '@shared/schema';
import { eq, inArray, desc, and, gte } from 'drizzle-orm';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getSession();

    if (!session || session.role !== 'admin') {
        return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
    }

    const { id } = await params;
    const classId = parseInt(id);

    if (isNaN(classId)) {
        return NextResponse.json({ error: 'Invalid class ID' }, { status: 400 });
    }

    // Get students in this class
    const students = await db
        .select({ userId: classStudents.userId })
        .from(classStudents)
        .where(eq(classStudents.classId, classId));

    const studentIds = students.map(s => s.userId);

    if (studentIds.length === 0) {
        return NextResponse.json({ activities: [] });
    }

    // Get recent activity from the last 24 hours
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const recentActivities = await db
        .select({
            id: lessonProgress.id,
            studentName: users.name,
            studentId: users.id,
            lessonName: lessons.name,
            courseName: courses.name,
            stars: lessonProgress.stars,
            score: lessonProgress.score,
            accuracy: lessonProgress.accuracy,
            speed: lessonProgress.speed,
            timeSpent: lessonProgress.timeSpent,
            completed: lessonProgress.completed,
            timestamp: lessonProgress.lastAttemptAt,
        })
        .from(lessonProgress)
        .innerJoin(users, eq(lessonProgress.userId, users.id))
        .innerJoin(lessons, eq(lessonProgress.lessonId, lessons.id))
        .innerJoin(sections, eq(lessons.sectionId, sections.id))
        .innerJoin(courses, eq(sections.courseId, courses.id))
        .where(
            and(
                inArray(lessonProgress.userId, studentIds),
                gte(lessonProgress.lastAttemptAt, twentyFourHoursAgo)
            )
        )
        .orderBy(desc(lessonProgress.lastAttemptAt))
        .limit(50);

    return NextResponse.json({
        activities: recentActivities.map(activity => ({
            id: activity.id,
            studentName: activity.studentName,
            studentId: activity.studentId,
            lessonName: activity.lessonName,
            courseName: activity.courseName,
            stars: activity.stars,
            score: activity.score,
            accuracy: activity.accuracy,
            speed: activity.speed,
            timeSpent: activity.timeSpent,
            completed: activity.completed,
            timestamp: activity.timestamp?.toISOString(),
        })),
    });
}

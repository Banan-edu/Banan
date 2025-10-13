

import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@server/db';
import { lessonProgress, classStudents } from '@shared/schema';
import { eq, inArray, gte, sql, and } from 'drizzle-orm';
type RouteContext = {
    params: Promise<{ id: string }>;
};

export async function GET(
    req: NextRequest,
    context: RouteContext
) {
    const session = await getSession();

    if (!session || session.role !== 'admin') {
        return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const classId = parseInt(id);

    // Get all students in this class
    const students = await db
        .select({ userId: classStudents.userId })
        .from(classStudents)
        .where(eq(classStudents.classId, classId));

    const studentIds = students.map(s => s.userId);

    if (studentIds.length === 0) {
        return NextResponse.json({ activityData: [0, 0, 0, 0, 0, 0, 0] });
    }

    // Get activity data for the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const activityByDay = await db
        .select({
            date: sql<string>`DATE(${lessonProgress.lastAttemptAt})`,
            count: sql<number>`COUNT(*)`,
        })
        .from(lessonProgress)
        .where(
            and(
                inArray(lessonProgress.userId, studentIds),
                gte(lessonProgress.lastAttemptAt, sevenDaysAgo)
            )
        )
        .groupBy(sql`DATE(${lessonProgress.lastAttemptAt})`);

    // Create array for last 7 days
    const activityData = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];

        const dayActivity = activityByDay.find(a => a.date === dateStr);
        activityData.push(dayActivity ? Number(dayActivity.count) : 0);
    }

    return NextResponse.json({ activityData });
}

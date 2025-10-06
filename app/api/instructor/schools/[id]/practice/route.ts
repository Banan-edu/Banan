import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@server/db';
import { schools, classes, classInstructors, classStudents, lessonProgress } from '@shared/schema';
import { eq, and, inArray, sql, gte } from 'drizzle-orm';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(
  req: NextRequest,
  context: RouteContext
) {
  const session = await getSession();

  if (!session || session.role !== 'instructor') {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }

  const { id } = await context.params;
  const schoolId = parseInt(id);

  if (isNaN(schoolId)) {
    return NextResponse.json({ error: 'Invalid school ID' }, { status: 400 });
  }

  // Verify instructor teaches at this school
  const instructorClasses = await db
    .select({ classId: classInstructors.classId })
    .from(classInstructors)
    .where(eq(classInstructors.userId, session.userId));

  const classIds = instructorClasses.map(c => c.classId);

  if (classIds.length === 0) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  }

  const classesWithSchools = await db
    .select({ id: classes.id, schoolId: classes.schoolId })
    .from(classes)
    .where(inArray(classes.id, classIds));

  const hasAccessToSchool = classesWithSchools.some(c => c.schoolId === schoolId);

  if (!hasAccessToSchool) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  }

  // Get all students in this school
  const schoolClasses = await db
    .select({ id: classes.id })
    .from(classes)
    .where(eq(classes.schoolId, schoolId));

  const schoolClassIds = schoolClasses.map(c => c.id);

  if (schoolClassIds.length === 0) {
    return NextResponse.json({ dailyActivity: [], hourlyActivity: [] });
  }

  const students = await db
    .select({ userId: classStudents.userId })
    .from(classStudents)
    .where(inArray(classStudents.classId, schoolClassIds));

  const studentIds = [...new Set(students.map(s => s.userId))];

  if (studentIds.length === 0) {
    return NextResponse.json({ dailyActivity: [], hourlyActivity: [] });
  }

  // Get practice data from last 60 days
  const sixtyDaysAgo = new Date();
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

  const practiceData = await db
    .select({
      date: sql<string>`DATE(${lessonProgress.lastAttemptAt})`,
      hour: sql<number>`EXTRACT(HOUR FROM ${lessonProgress.lastAttemptAt})`,
      dayOfWeek: sql<number>`EXTRACT(DOW FROM ${lessonProgress.lastAttemptAt})`,
      count: sql<number>`COUNT(*)`,
      totalTime: sql<number>`SUM(${lessonProgress.timeSpent})`,
    })
    .from(lessonProgress)
    .where(
      and(
        inArray(lessonProgress.userId, studentIds),
        gte(lessonProgress.lastAttemptAt, sixtyDaysAgo)
      )
    )
    .groupBy(
      sql`DATE(${lessonProgress.lastAttemptAt})`,
      sql`EXTRACT(HOUR FROM ${lessonProgress.lastAttemptAt})`,
      sql`EXTRACT(DOW FROM ${lessonProgress.lastAttemptAt})`
    );

  // Format for calendar heatmap (daily)
  const dailyActivity = practiceData.reduce((acc: any[], row) => {
    const existing = acc.find(item => item.date === row.date);
    if (existing) {
      existing.count += Number(row.count);
      existing.totalTime += Number(row.totalTime);
    } else {
      acc.push({
        date: row.date,
        count: Number(row.count),
        totalTime: Number(row.totalTime),
      });
    }
    return acc;
  }, []);

  // Format for punchcard (hourly by day of week)
  const hourlyActivity = practiceData.map(row => ({
    dayOfWeek: Number(row.dayOfWeek),
    hour: Number(row.hour),
    count: Number(row.count),
    totalTime: Number(row.totalTime),
  }));

  return NextResponse.json({ dailyActivity, hourlyActivity });
}

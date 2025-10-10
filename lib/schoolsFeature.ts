
import { db } from '@/server/db';
import { schoolAdmins, schools, users } from '@/shared/schema';
import { eq } from 'drizzle-orm';
import { ActivityLogger } from '@/lib/activityLogger';

export async function getSchoolAdmins(schoolId: number) {
    const admins = await db
        .select({
            id: schoolAdmins.id,
            userId: schoolAdmins.userId,
            assignedAt: schoolAdmins.assignedAt,
            name: users.name,
            email: users.email,
            role: users.role,
            lastLogin: users.lastLogin,
        })
        .from(schoolAdmins)
        .innerJoin(users, eq(schoolAdmins.userId, users.id))
        .where(eq(schoolAdmins.schoolId, schoolId));

    return admins;
}

export async function assignSchoolAdmin(schoolId: number, userId: number, assignedBy: number) {
    // Get school and user details for logging
    const [school] = await db
        .select({ name: schools.name })
        .from(schools)
        .where(eq(schools.id, schoolId))
        .limit(1);

    const [user] = await db
        .select({ name: users.name })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

    const [newAdmin] = await db
        .insert(schoolAdmins)
        .values({
            userId,
            schoolId,
        })
        .returning();

    // Log the activity
    if (school && user) {
        await ActivityLogger.assign(
            assignedBy,
            'school',
            schoolId,
            school.name,
            `admin ${user.name}`
        );
    }

    return newAdmin;
}

export async function unassignSchoolAdmin(adminId: number, schoolId: number, unassignedBy: number) {
    // Get admin and school details for logging
    const [admin] = await db
        .select({
            userId: schoolAdmins.userId,
            userName: users.name,
        })
        .from(schoolAdmins)
        .innerJoin(users, eq(schoolAdmins.userId, users.id))
        .where(eq(schoolAdmins.id, adminId))
        .limit(1);

    const [school] = await db
        .select({ name: schools.name })
        .from(schools)
        .where(eq(schools.id, schoolId))
        .limit(1);

    await db
        .delete(schoolAdmins)
        .where(eq(schoolAdmins.id, adminId));

    // Log the activity
    if (admin && school) {
        await ActivityLogger.unassign(
            unassignedBy,
            'school',
            schoolId,
            school.name,
            `admin ${admin.userName}`
        );
    }
}

export async function getSchoolHistory(schoolId: number) {
    const { activityLog, users, classes, classStudents, classInstructors } = await import('@/shared/schema');
    const { eq, and, desc, inArray, or } = await import('drizzle-orm');

    // Get all classes in this school
    const schoolClasses = await db
        .select({ id: classes.id })
        .from(classes)
        .where(eq(classes.schoolId, schoolId));

    const classIds = schoolClasses.map(c => c.id);

    // Get all students in these classes
    const students = await db
        .select({ userId: classStudents.userId })
        .from(classStudents)
        .where(inArray(classStudents.classId, classIds));

    const studentIds = [...new Set(students.map(s => s.userId))];

    // Get all instructors in these classes
    const instructors = await db
        .select({ userId: classInstructors.userId })
        .from(classInstructors)
        .where(inArray(classInstructors.classId, classIds));

    const instructorIds = [...new Set(instructors.map(i => i.userId))];

    // Build conditions for all school-related activities
    const conditions = [
        // School activities
        and(
            eq(activityLog.entityType, 'school'),
            eq(activityLog.entityId, schoolId)
        ),
        // Class activities
        and(
            eq(activityLog.entityType, 'class'),
            inArray(activityLog.entityId, classIds.length > 0 ? classIds : [-1])
        ),
        // Student activities
        and(
            eq(activityLog.entityType, 'student'),
            inArray(activityLog.entityId, studentIds.length > 0 ? studentIds : [-1])
        ),
        // Instructor activities
        and(
            eq(activityLog.entityType, 'instructor'),
            inArray(activityLog.entityId, instructorIds.length > 0 ? instructorIds : [-1])
        ),
    ];

    // Get activity logs related to this school and all its entities
    const logs = await db
        .select({
            id: activityLog.id,
            action: activityLog.action,
            description: activityLog.description,
            createdAt: activityLog.createdAt,
            entityType: activityLog.entityType,
            entityId: activityLog.entityId,
            userName: users.name,
            userEmail: users.email,
        })
        .from(activityLog)
        .innerJoin(users, eq(activityLog.userId, users.id))
        .where(or(...conditions))
        .orderBy(desc(activityLog.createdAt))
        .limit(100);

    return logs;
}

export async function getSchoolPracticeData(schoolId: number) {
    const { classes, classStudents, lessonProgress } = await import('@/shared/schema');
    const { eq, inArray, sql, gte, and } = await import('drizzle-orm');

    // Get all classes in this school
    const schoolClasses = await db
        .select({ id: classes.id })
        .from(classes)
        .where(eq(classes.schoolId, schoolId));

    const schoolClassIds = schoolClasses.map(c => c.id);

    if (schoolClassIds.length === 0) {
        return { dailyActivity: [], hourlyActivity: [] };
    }

    // Get all students in these classes
    const students = await db
        .select({ userId: classStudents.userId })
        .from(classStudents)
        .where(inArray(classStudents.classId, schoolClassIds));

    const studentIds = [...new Set(students.map(s => s.userId))];

    if (studentIds.length === 0) {
        return { dailyActivity: [], hourlyActivity: [] };
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

    return { dailyActivity, hourlyActivity };
}
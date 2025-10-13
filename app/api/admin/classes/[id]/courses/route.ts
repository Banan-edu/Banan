
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@server/db';
import { classCourses, courses, classStudents, users } from '@shared/schema';
import { eq, and, inArray } from 'drizzle-orm';

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
    console.log(id)
    const classId = parseInt(id);

    // Get assigned courses
    const assignedCourses = await db
        .select({
            courseId: classCourses.courseId,
            hasPrerequisite: classCourses.hasPrerequisite,
            speedAdjustment: classCourses.speedAdjustment,
            accuracyRequirement: classCourses.accuracyRequirement,
            lessonProgressLimit: classCourses.lessonProgressLimit,
            hasPlacementTest: classCourses.hasPlacementTest,
        })
        .from(classCourses)
        .where(eq(classCourses.classId, classId));

    const courseIds = assignedCourses.map(c => c.courseId);

    if (courseIds.length === 0) {
        return NextResponse.json({ courses: [] });
    }

    const coursesData = await db
        .select()
        .from(courses)
        .where(inArray(courses.id, courseIds));

    // Get total students in class
    const classStudentsData = await db
        .select({ userId: classStudents.userId })
        .from(classStudents)
        .where(eq(classStudents.classId, classId));

    const totalStudents = classStudentsData.length;

    // Format courses with stats
    const formattedCourses = await Promise.all(
        coursesData.map(async (course) => {
            const settings = assignedCourses.find(ac => ac.courseId === course.id);

            // Get editor name
            let editorName = 'Unknown';
            if (course.createdBy) {
                const [creator] = await db
                    .select({ name: users.name })
                    .from(users)
                    .where(eq(users.id, course.createdBy))
                    .limit(1);
                editorName = creator?.name || 'Unknown';
            }

            return {
                id: course.id,
                name: course.name,
                description: course.description,
                language: course.language,
                enrolledClasses: 1, // Could be calculated if needed
                editorName,
                lessonsCount: 0, // Will be calculated from sections/lessons
                grade: course.grade || 'N/A',
                progress: 0, // Calculate from lesson progress
                activeStudents: 0, // Calculate from recent activity
                totalStudents,
                settings: {
                    prerequisiteId: settings?.hasPrerequisite ? null : undefined,
                    speedAdjustment: settings?.speedAdjustment || 0,
                    accuracyRequirement: settings?.accuracyRequirement || 0,
                    lessonProgressLimit: settings?.lessonProgressLimit ? 'sequential' : 'all',
                    hasPlacementTest: settings?.hasPlacementTest || false,
                },
            };
        })
    );

    return NextResponse.json({ courses: formattedCourses });
}

export async function POST(
    req: NextRequest,
    context: RouteContext
) {
    const session = await getSession();

    if (!session || session.role !== 'admin') {
        return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const classId = parseInt(id);
    const { courseIds } = await req.json();

    if (!courseIds || !Array.isArray(courseIds)) {
        return NextResponse.json({ error: 'Invalid course IDs' }, { status: 400 });
    }

    // Insert courses
    const values = courseIds.map(courseId => ({
        classId,
        courseId,
    }));

    await db.insert(classCourses).values(values).onConflictDoNothing();

    return NextResponse.json({ success: true });
}

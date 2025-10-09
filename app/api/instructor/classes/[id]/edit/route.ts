
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@server/db';
import { classes, classInstructors, classCourses } from '@shared/schema';
import { eq } from 'drizzle-orm';

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
    const classId = parseInt(id);

    if (isNaN(classId)) {
        return NextResponse.json({ error: 'Invalid class ID' }, { status: 400 });
    }

    try {
        // Get class data
        const [classData] = await db
            .select()
            .from(classes)
            .where(eq(classes.id, classId));

        if (!classData) {
            return NextResponse.json({ error: 'Class not found' }, { status: 404 });
        }

        // Get instructors
        const instructorsList = await db
            .select({ userId: classInstructors.userId })
            .from(classInstructors)
            .where(eq(classInstructors.classId, classId));

        // Get courses
        const coursesList = await db
            .select({ courseId: classCourses.courseId })
            .from(classCourses)
            .where(eq(classCourses.classId, classId));

        return NextResponse.json({
            ...classData,
            instructorIds: instructorsList.map(i => i.userId),
            courseIds: coursesList.map(c => c.courseId),
        });
    } catch (error) {
        console.error('Error fetching class:', error);
        return NextResponse.json({ error: 'Failed to fetch class' }, { status: 500 });
    }
}

export async function PUT(
    req: NextRequest,
    context: RouteContext
) {
    const session = await getSession();

    if (!session || session.role !== 'instructor') {
        return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const classId = parseInt(id);

    if (isNaN(classId)) {
        return NextResponse.json({ error: 'Invalid class ID' }, { status: 400 });
    }

    // Verify instructor has access to this class
    const instructorClass = await db
        .select()
        .from(classInstructors)
        .where(eq(classInstructors.classId, classId))
        .limit(1);

    if (instructorClass.length === 0) {
        return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const body = await req.json();
    const {
        name,
        description,
        grade,
        instructorIds,
        courseIds,
        startOfWeek,
        minStarsToPass,
        dailyGoal,
        weeklyGoal,
        scoreboardVisibility,
        disableBackspace,
        blockOnError,
        lockVirtualKeyboard,
        lockLanguage,
        lockHands,
        soundFx,
        voiceOver,
        showReplayButton,
        allowJumpAhead
    } = body;

    if (!name) {
        return NextResponse.json({ error: 'Class name is required' }, { status: 400 });
    }

    try {
        // Update class
        await db
            .update(classes)
            .set({
                name,
                description: description || null,
                grade: grade || null,
                startOfWeek,
                minStarsToPass,
                dailyGoal,
                weeklyGoal,
                scoreboardVisibility,
                disableBackspace,
                blockOnError,
                lockVirtualKeyboard,
                lockLanguage,
                lockHands,
                soundFx,
                voiceOver,
                showReplayButton,
                allowJumpAhead,
                updatedAt: new Date(),
            })
            .where(eq(classes.id, classId));

        // Update instructors
        if (instructorIds && Array.isArray(instructorIds)) {
            // Remove existing instructors
            await db
                .delete(classInstructors)
                .where(eq(classInstructors.classId, classId));

            // Add new instructors
            if (instructorIds.length > 0) {
                await db.insert(classInstructors).values(
                    instructorIds.map((userId: number) => ({
                        classId,
                        userId,
                    }))
                );
            }
        }

        // Update courses
        if (courseIds && Array.isArray(courseIds)) {
            // Remove existing courses
            await db
                .delete(classCourses)
                .where(eq(classCourses.classId, classId));

            // Add new courses
            if (courseIds.length > 0) {
                await db.insert(classCourses).values(
                    courseIds.map((courseId: number) => ({
                        classId,
                        courseId,
                    }))
                );
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating class:', error);
        return NextResponse.json({ error: 'Failed to update class' }, { status: 500 });
    }
}

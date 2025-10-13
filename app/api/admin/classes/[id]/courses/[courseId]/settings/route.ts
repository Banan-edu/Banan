
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@server/db';
import { classCourses } from '@shared/schema';
import { eq, and } from 'drizzle-orm';
type RouteContext = {
    params: Promise<{ id: string; courseId: string }>;
};

export async function PATCH(
    req: NextRequest,
    context: RouteContext
) {
    const session = await getSession();

    if (!session || session.role !== 'admin') {
        return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
    }

    const { id, courseId } = await context.params;
    const classId = parseInt(id);
    const courseIdInt = parseInt(courseId);

    const {
        prerequisiteId,
        speedAdjustment,
        accuracyRequirement,
        lessonProgressLimit,
        hasPlacementTest,
    } = await req.json();

    await db
        .update(classCourses)
        .set({
            hasPrerequisite: prerequisiteId ? true : false,
            speedAdjustment: speedAdjustment || 0,
            accuracyRequirement: accuracyRequirement || 0,
            lessonProgressLimit: lessonProgressLimit === 'sequential' ? 1 : null,
            hasPlacementTest: hasPlacementTest || false,
        })
        .where(
            and(
                eq(classCourses.classId, classId),
                eq(classCourses.courseId, courseIdInt)
            )
        );

    return NextResponse.json({ success: true });
}

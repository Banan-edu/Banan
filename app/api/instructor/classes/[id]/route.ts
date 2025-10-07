
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@server/db';
import { classes, classInstructors, classStudents, classCourses, courses, users, schools } from '@shared/schema';
import { and, eq, inArray } from 'drizzle-orm';

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

    // Verify instructor has access to this class
    const instructorAccess = await db
        .select()
        .from(classInstructors)
        .where(
            and(
                eq(classInstructors.classId, classId),
                eq(classInstructors.userId, session.userId)
            )
        );

    if (instructorAccess.length === 0) {
        return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    // Get class details
    const [classDetails] = await db
        .select()
        .from(classes)
        .where(eq(classes.id, classId));

    if (!classDetails) {
        return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }

    // Get students count
    const students = await db
        .select({ id: classStudents.userId })
        .from(classStudents)
        .where(eq(classStudents.classId, classId));

    // Get instructors
    const instructorsData = await db
        .select({
            userId: classInstructors.userId,
            name: users.name,
            email: users.email,
        })
        .from(classInstructors)
        .innerJoin(users, eq(classInstructors.userId, users.id))
        .where(eq(classInstructors.classId, classId));

    // Get assigned courses
    const assignedCourses = await db
        .select({
            id: courses.id,
            name: courses.name,
            description: courses.description,
            language: courses.language,
            grade: courses.grade,
        })
        .from(classCourses)
        .innerJoin(courses, eq(classCourses.courseId, courses.id))
        .where(eq(classCourses.classId, classId));

    // Get school info
    let schoolInfo = null;
    if (classDetails.schoolId) {
        const [school] = await db
            .select()
            .from(schools)
            .where(eq(schools.id, classDetails.schoolId));
        schoolInfo = school;
    }

    return NextResponse.json({
        class: {
            ...classDetails,
            studentCount: students.length,
            instructorCount: instructorsData.length,
            courseCount: assignedCourses.length,
            school: schoolInfo,
            instructors: instructorsData,
            courses: assignedCourses,
        },
    });
}

export async function PATCH(
    req: NextRequest,
    context: RouteContext
) {
    const session = await getSession();

    if (!session || session.role !== 'instructor') {
        return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const classId = parseInt(id);
    const updates = await req.json();

    // Verify instructor has access
    const instructorAccess = await db
        .select()
        .from(classInstructors)
        .where(
            and(
                eq(classInstructors.classId, classId),
                eq(classInstructors.userId, session.userId)
            )
        );

    if (instructorAccess.length === 0) {
        return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const [updatedClass] = await db
        .update(classes)
        .set(updates)
        .where(eq(classes.id, classId))
        .returning();

    return NextResponse.json({ class: updatedClass });
}

export async function DELETE(
    req: NextRequest,
    context: RouteContext
) {
    const session = await getSession();

    if (!session || session.role !== 'instructor') {
        return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const classId = parseInt(id);

    // Verify instructor has access to this class
    const instructorAccess = await db
        .select()
        .from(classInstructors)
        .where(
            and(
                eq(classInstructors.classId, classId),
                eq(classInstructors.userId, session.userId)
            )
        );

    if (instructorAccess.length === 0) {
        return NextResponse.json({ error: 'Not authorized to delete this class' }, { status: 403 });
    }

    try {
        // Delete related records first
        await db.delete(classStudents).where(eq(classStudents.classId, classId));
        await db.delete(classCourses).where(eq(classCourses.classId, classId));
        await db.delete(classInstructors).where(eq(classInstructors.classId, classId));

        // Delete the class
        await db.delete(classes).where(eq(classes.id, classId));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting class:', error);
        return NextResponse.json({ error: 'Failed to delete class' }, { status: 500 });
    }
}

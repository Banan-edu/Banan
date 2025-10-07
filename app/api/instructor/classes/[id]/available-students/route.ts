
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@server/db';
import { users, classStudents, classes, classInstructors } from '@shared/schema';
import { eq, and, notInArray } from 'drizzle-orm';

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

    // Get the school ID from the class
    const [classData] = await db
        .select({ schoolId: classes.schoolId })
        .from(classes)
        .where(eq(classes.id, classId))
        .limit(1);

    if (!classData?.schoolId) {
        return NextResponse.json({ students: [] });
    }

    // Get students already in this class
    const enrolledStudents = await db
        .select({ userId: classStudents.userId })
        .from(classStudents)
        .where(eq(classStudents.classId, classId));

    const enrolledIds = enrolledStudents.map(s => s.userId);

    // Get all students from the same school who are not in this class
    const allStudentsInSchool = await db
        .select({
            id: users.id,
            name: users.name,
            email: users.email,
            studentId: users.studentId,
            grade: users.grade,
        })
        .from(users)
        .innerJoin(classStudents, eq(users.id, classStudents.userId))
        .innerJoin(classes, eq(classStudents.classId, classes.id))
        .where(
            and(
                eq(classes.schoolId, classData.schoolId),
                eq(users.role, 'student')
            )
        );

    // Filter out already enrolled students
    const availableStudents = allStudentsInSchool.filter(
        s => !enrolledIds.includes(s.id)
    );

    // Remove duplicates
    const uniqueStudents = Array.from(
        new Map(availableStudents.map(s => [s.id, s])).values()
    );

    return NextResponse.json({ students: uniqueStudents });
}

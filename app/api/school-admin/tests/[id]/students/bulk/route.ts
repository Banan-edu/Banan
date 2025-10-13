
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@server/db';
import { testStudents, classStudents } from '@shared/schema';
import { eq } from 'drizzle-orm';

type RouteContext = {
    params: Promise<{ id: string }>;
};

export async function POST(
    req: NextRequest,
    context: RouteContext
) {
    const session = await getSession();

    if (!session || session.role !== 'school_admin') {
        return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const testId = parseInt(id);
    const { classId } = await req.json();

    try {
        // Get all students from the class
        const students = await db
            .select({ userId: classStudents.userId })
            .from(classStudents)
            .where(eq(classStudents.classId, classId));

        // Add all students to the test
        const insertValues = students.map((student) => ({
            testId,
            userId: student.userId,
        }));

        if (insertValues.length > 0) {
            await db.insert(testStudents).values(insertValues);
        }

        return NextResponse.json({ success: true, count: insertValues.length });
    } catch (error) {
        console.error('Error adding class students to test:', error);
        return NextResponse.json({ error: 'Failed to add students' }, { status: 500 });
    }
}

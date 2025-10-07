
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@server/db';
import { tests, testInstructors, users } from '@shared/schema';
import { and, eq } from 'drizzle-orm';

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
    const testId = parseInt(id);

    try {
        // Get test details
        const [test] = await db
            .select()
            .from(tests)
            .where(eq(tests.id, testId))
            .limit(1);

        if (!test) {
            return NextResponse.json({ error: 'Test not found' }, { status: 404 });
        }

        // Check if instructor has access to this test
        const [hasAccess] = await db
            .select()
            .from(testInstructors)
            .where(
                and(
                    eq(testInstructors.testId, testId),
                    eq(testInstructors.userId, session.userId)
                ))
            .limit(1);

        if (!hasAccess && test.createdBy !== session.userId) {
            return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
        }

        // Get test students (mock data for now)
        const students: any[] = [];

        // Get test instructors
        const instructors = await db
            .select({
                id: users.id,
                name: users.name,
                role: users.role,
                // school: users.schoolId,
            })
            .from(testInstructors)
            .innerJoin(users, eq(testInstructors.userId, users.id))
            .where(eq(testInstructors.testId, testId));

        // Get test results (mock data for now)
        const results: any[] = [];

        return NextResponse.json({
            test,
            students,
            instructors,
            results,
        });
    } catch (error) {
        console.error('Error fetching test details:', error);
        return NextResponse.json({ error: 'Failed to fetch test details' }, { status: 500 });
    }
}

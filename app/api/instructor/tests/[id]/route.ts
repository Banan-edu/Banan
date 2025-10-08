
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@server/db';
import { tests, testInstructors, users, testStudents } from '@shared/schema';
import { and, eq } from 'drizzle-orm';

type RouteContext = {
    params: Promise<{ id: string }>;
};
export async function POST(req: NextRequest) {
    const session = await getSession();

    if (!session || session.role !== 'instructor') {
        return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
    }

    try {
        const body = await req.json();

        const newTest = await db.insert(tests).values({
            name: body.name,
            description: body.description,
            text: body.text,
            altTexts: body.altTexts,
            startDate: new Date(body.startDate),
            endDate: new Date(body.endDate),
            targetAudience: body.targetAudience,
            targetSchools: body.targetSchools,
            targetStudents: body.targetStudents,
            attemptsAllowed: body.attemptsAllowed,
            attemptsCount: body.attemptsCount,
            hasTimeLimit: body.hasTimeLimit,
            timeLimit: body.timeLimit,
            passingCriteria: body.passingCriteria,
            minAccuracy: body.minAccuracy,
            minSpeed: body.minSpeed,
            showScore: body.showScore,
            speedGoal: body.speedGoal,
            maxScore: body.maxScore,
            disableBackspace: body.disableBackspace,
            issueCertificate: body.issueCertificate,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        return NextResponse.json(newTest);
    } catch (error) {
        console.error('Error creating test:', error);
        return NextResponse.json({ error: 'Failed to create test' }, { status: 500 });
    }
}

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
        const students = await db
            .select({
                id: users.id,
                name: users.name,
                role: users.grade,
                dateAdded:testStudents.enrolledAt
            })
            .from(testStudents)
            .innerJoin(users, eq(testStudents.userId, users.id))
            .where(eq(testStudents.testId, testId));

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


export async function PUT(
    req: NextRequest, context: RouteContext
) {
    const session = await getSession();

    if (!session || session.role !== 'instructor') {
        return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const testId = parseInt(id);

    try {
        const body = await req.json();

        await db
            .update(tests)
            .set({
                name: body.name,
                description: body.description,
                text: body.text,
                altTexts: body.altTexts,
                startDate: new Date(body.startDate),
                endDate: new Date(body.endDate),
                targetAudience: body.targetAudience,
                targetSchools: body.targetSchools,
                targetStudents: body.targetStudents,
                attemptsAllowed: body.attemptsAllowed,
                attemptsCount: body.attemptsCount,
                hasTimeLimit: body.hasTimeLimit,
                timeLimit: body.timeLimit,
                passingCriteria: body.passingCriteria,
                minAccuracy: body.minAccuracy,
                minSpeed: body.minSpeed,
                showScore: body.showScore,
                speedGoal: body.speedGoal,
                maxScore: body.maxScore,
                disableBackspace: body.disableBackspace,
                issueCertificate: body.issueCertificate,
                updatedAt: new Date(),
            })
            .where(eq(tests.id, testId));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating test:', error);
        return NextResponse.json({ error: 'Failed to update test' }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest, context: RouteContext
) {
    const session = await getSession();

    if (!session || session.role !== 'instructor') {
        return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const testId = parseInt(id);

    try {
        await db
            .delete(tests)
            .where(eq(tests.id, testId));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting test:', error);
        return NextResponse.json({ error: 'Failed to delete test' }, { status: 500 });
    }
}
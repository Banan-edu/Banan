
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@server/db';
import { tests, testResults, classStudents, classes, testStudents } from '@shared/schema';
import { eq, and, gte, lte } from 'drizzle-orm';

type RouteContext = {
    params: Promise<{ id: string }>;
};

export async function GET(
    req: NextRequest,
    context: RouteContext
) {
    const session = await getSession();

    if (!session || session.role !== 'student') {
        return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
    }
    const { id } = await context.params;
    const testId = parseInt(id);

    const [test] = await db
        .select()
        .from(tests)
        .where(eq(tests.id, testId))
        .limit(1);

    if (!test) {
        return NextResponse.json({ error: 'Test not found' }, { status: 404 });
    }

    const now = new Date();

    // Check if test is within date range
    if (new Date(test.startDate) > now || new Date(test.endDate) < now) {
        return NextResponse.json({ error: 'Test is not available' }, { status: 403 });
    }

    // Get previous attempts
    const attempts = await db
        .select()
        .from(testResults)
        .where(
            and(
                eq(testResults.testId, testId),
                eq(testResults.userId, session.userId)
            )
        );

    // Check if student can attempt
    let canAttempt = true;

    if (test.attemptsAllowed === 'once' && attempts.length > 0) {
        canAttempt = false;
    } else if (test.attemptsAllowed === 'limited' && test.attemptsCount) {
        if (attempts.length >= test.attemptsCount) {
            canAttempt = false;
        }
    }

    return NextResponse.json({
        test,
        attempts: attempts.length,
        canAttempt,
        previousAttempts: attempts,
    });
}

export async function POST(req: NextRequest, context: RouteContext) {
    const session = await getSession();

    if (!session || session.role !== 'student') {
        return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
    }
    const { id } = await context.params;
    const testId = parseInt(id);
    const body = await req.json();

    const speed = Math.max(0, Math.min(200, parseInt(body.speed) || 0));
    const accuracy = Math.max(0, Math.min(100, parseInt(body.accuracy) || 0));
    const completionTime = Math.max(0, Math.min(3600, parseInt(body.completionTime) || 0));
    const score = Math.max(0, Math.min(1000, parseInt(body.score) || 0));
    const passed = Boolean(body.passed);

    // Verify enrollment
    const [enrollment] = await db
        .select()
        .from(testStudents)
        .where(and(
            eq(testStudents.testId, testId),
            eq(testStudents.userId, session.userId)
        ))
        .limit(1);

    if (!enrollment) {
        return NextResponse.json({ error: 'Not enrolled in this test' }, { status: 403 });
    }

    // Get test details for certificate
    const [test] = await db
        .select()
        .from(tests)
        .where(eq(tests.id, testId))
        .limit(1);

    const certificateIssued = test?.issueCertificate && passed;

    // Count existing attempts
    const existingResults = await db
        .select()
        .from(testResults)
        .where(and(
            eq(testResults.testId, testId),
            eq(testResults.userId, session.userId)
        ));

    const attempts = existingResults.length + 1;

    // Insert test result
    const [result] = await db
        .insert(testResults)
        .values({
            testId,
            userId: session.userId,
            score,
            speed,
            accuracy,
            attempts,
            completionTime,
            passed,
            certificateIssued,
            completedAt: new Date(),
        })
        .returning();

    return NextResponse.json({ result });
}

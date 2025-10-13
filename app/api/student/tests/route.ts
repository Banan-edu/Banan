
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@server/db';
import { tests, testStudents, testResults } from '@shared/schema';
import { eq, and, inArray } from 'drizzle-orm';

export async function GET() {
    const session = await getSession();

    if (!session || session.role !== 'student') {
        return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
    }

    try {
        // Get all tests assigned to this student
        const studentTests = await db
            .select({ testId: testStudents.testId })
            .from(testStudents)
            .where(eq(testStudents.userId, session.userId));

        if (studentTests.length === 0) {
            return NextResponse.json({ tests: [] });
        }
        const testIds = studentTests.map(st => st.testId);

        // Get test details
        const testsData = await db
            .select()
            .from(tests)
            .where(inArray(tests.id, testIds));

        // Get test results for this student
        const results = await db
            .select()
            .from(testResults)
            .where(eq(testResults.userId, session.userId));

        const now = new Date();

        const enrichedTests = testsData.map(test => {
            const result = results.find(r => r.testId === test.id);
            const startDate = new Date(test.startDate);
            const endDate = new Date(test.endDate);

            let status: 'not_started' | 'in_progress' | 'completed' | 'timeout' = 'not_started';
            let canAttempt = false;

            // Check if test is within date range
            if (now < startDate) {
                status = 'not_started';
                canAttempt = false;
            } else if (now > endDate) {
                status = 'timeout';
                canAttempt = false;
            } else {
                // Test is active
                if (result) {
                    if (result.completedAt) {
                        status = 'completed';
                    } else {
                        status = 'in_progress';
                    }

                    // Check if can attempt again
                    if (test.attemptsAllowed === 'open') {
                        canAttempt = true;
                    } else if (test.attemptsAllowed === 'once') {
                        canAttempt = !result.completedAt;
                    } else if (test.attemptsCount && (result.attempts || 0) < test.attemptsCount) {
                        canAttempt = true;
                    }
                } else {
                    status = 'not_started';
                    canAttempt = true;
                }
            }

            return {
                test,
                result,
                status,
                canAttempt,
            };
        });

        return NextResponse.json({ tests: enrichedTests });
    } catch (error) {
        console.error('Error fetching tests:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

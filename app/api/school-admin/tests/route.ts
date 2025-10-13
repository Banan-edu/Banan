
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@server/db';
import { tests, users, testResults, testInstructors } from '@shared/schema';
import { eq, or, inArray } from 'drizzle-orm';

export async function GET() {
  const session = await getSession();

  if (!session || session.role !== 'school_admin') {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }

  try {
    const testsData = await db
      .select({
        id: tests.id,
        name: tests.name,
        createdAt: tests.createdAt,
        createdBy: tests.createdBy,
        startDate: tests.startDate,
        endDate: tests.endDate,
      })
      .from(tests);

    // Get creator names and completion counts
    const testsWithDetails = await Promise.all(
      testsData.map(async (test) => {
        const creator = await db
          .select({ name: users.name })
          .from(users)
          .where(eq(users.id, test.createdBy!))
          .limit(1);

        const completions = await db
          .select({ count: testResults.id })
          .from(testResults)
          .where(eq(testResults.testId, test.id));

        const now = new Date();
        const startDate = new Date(test.startDate);
        const endDate = new Date(test.endDate);
        const isActive = now >= startDate && now <= endDate;

        return {
          id: test.id,
          name: test.name,
          createdAt: test.createdAt,
          managedBy: creator[0]?.name || 'Unknown',
          completedBy: completions.length,
          isActive,
          startDate: test.startDate,
          endDate: test.endDate,
        };
      })
    );

    return NextResponse.json({ tests: testsWithDetails });
  } catch (error) {
    console.error('Error fetching tests:', error);
    return NextResponse.json({ error: 'Failed to fetch tests' }, { status: 500 });
  }
}


import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@server/db';
import { letterProgress } from '@shared/schema';
import { eq, sql } from 'drizzle-orm';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getSession();

    if (!session || session.role !== 'instructor') {
        return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
    }

    const { id } = await params;
    const studentId = parseInt(id);

    const letterStats = await db
        .select({
            letter: letterProgress.letter,
            correctCount: sql<number>`SUM(${letterProgress.correctCount})`,
            incorrectCount: sql<number>`SUM(${letterProgress.incorrectCount})`,
            avgTimeMs: sql<number>`AVG(${letterProgress.avgTimeMs})`,
            totalAttempts: sql<number>`COUNT(*)`,
            lastPracticed: sql<Date | null>`MAX(${letterProgress.createdAt})`
        })
        .from(letterProgress)
        .where(eq(letterProgress.userId, studentId))
        .groupBy(letterProgress.letter);

    const formattedStats = letterStats.map(stat => {
        const totalAttempts = Number(stat.correctCount) + Number(stat.incorrectCount);
        const accuracy = totalAttempts > 0
            ? Math.round((Number(stat.correctCount) / totalAttempts) * 100)
            : 0;
        const speed = stat.avgTimeMs && Number(stat.avgTimeMs) > 0
            ? Math.round(60000 / Number(stat.avgTimeMs))
            : 0;

        return {
            letter: stat.letter,
            accuracy,
            speed,
            attempts: Number(stat.totalAttempts),
            lastPracticed: stat.lastPracticed
                ? new Date(stat.lastPracticed).toISOString().split('T')[0]
                : null,
            correctCount: Number(stat.correctCount),
            incorrectCount: Number(stat.incorrectCount)
        };
    });

    return NextResponse.json({ letterStats: formattedStats });
}

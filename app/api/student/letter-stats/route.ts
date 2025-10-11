
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@server/db';
import { letterStatistics, typingPatterns } from '@shared/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET(req: NextRequest) {
    const session = await getSession();

    if (!session || session.role !== 'student') {
        return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
    }

    // Get all letter statistics for the user
    const stats = await db
        .select()
        .from(letterStatistics)
        .where(eq(letterStatistics.userId, session.userId))
        .orderBy(desc(letterStatistics.incorrectCount));

    // Get typing patterns
    const patterns = await db
        .select()
        .from(typingPatterns)
        .where(eq(typingPatterns.userId, session.userId))
        .orderBy(desc(typingPatterns.occurrences))
        .limit(20);

    // Calculate overall accuracy per letter
    const letterStats = stats.map(stat => ({
        letter: stat.letter,
        correctCount: stat.correctCount,
        incorrectCount: stat.incorrectCount,
        totalCount: stat.correctCount + stat.incorrectCount,
        accuracy: stat.correctCount + stat.incorrectCount > 0
            ? Math.round((stat.correctCount / (stat.correctCount + stat.incorrectCount)) * 100)
            : 0,
        avgTimeMs: stat.correctCount > 0
            ? Math.round(stat.totalTimeMs / stat.correctCount)
            : 0,
        commonErrors: stat.commonErrors,
        lastPracticed: stat.lastPracticedAt,
    }));

    return NextResponse.json({
        letterStats,
        patterns: patterns.map(p => ({
            from: p.fromChar,
            to: p.toChar,
            type: p.patternType,
            count: p.occurrences,
            lastOccurrence: p.lastOccurrence,
        })),
    });
}

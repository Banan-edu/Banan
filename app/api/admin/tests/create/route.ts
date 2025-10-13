
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@server/db';
import { tests, testInstructors } from '@shared/schema';

export async function POST(req: NextRequest) {
  const session = await getSession();

  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }

  try {
    const body = await req.json();

    const [test] = await db
      .insert(tests)
      .values({
        name: body.name,
        description: body.description,
        text: body.text,
        altTexts: body.altTexts.filter((text: string) => text.trim() !== ''),
        startDate: new Date(body.startDate),
        endDate: new Date(body.endDate),
        targetAudience: body.targetAudience,
        targetSchools: body.targetSchools,
        targetStudents: body.targetStudents,
        attemptsAllowed: body.attemptsAllowed,
        attemptsCount: body.attemptsAllowed === 'limited' ? body.attemptsCount : null,
        hasTimeLimit: body.hasTimeLimit,
        timeLimit: body.hasTimeLimit ? body.timeLimit : null,
        passingCriteria: body.passingCriteria,
        minAccuracy: body.passingCriteria === 'criteria' ? body.minAccuracy : null,
        minSpeed: body.passingCriteria === 'criteria' ? body.minSpeed : null,
        showScore: body.showScore,
        speedGoal: body.showScore ? body.speedGoal : null,
        maxScore: body.showScore ? body.maxScore : null,
        disableBackspace: body.disableBackspace,
        issueCertificate: body.issueCertificate,
        createdBy: session.userId,
      })
      .returning();

    // Add creator as test instructor
    await db.insert(testInstructors).values({
      testId: test.id,
      userId: session.userId,
    });

    return NextResponse.json({ test });
  } catch (error) {
    console.error('Error creating test:', error);
    return NextResponse.json({ error: 'Failed to create test' }, { status: 500 });
  }
}

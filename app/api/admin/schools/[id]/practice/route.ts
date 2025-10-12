
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getSchoolPracticeData } from '@/lib/schoolsFeature';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(
  req: NextRequest,
  context: RouteContext
) {
  const session = await getSession();

  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }

  const { id } = await context.params;
  const schoolId = parseInt(id);

  if (isNaN(schoolId)) {
    return NextResponse.json({ error: 'Invalid school ID' }, { status: 400 });
  }

  const { dailyActivity, hourlyActivity } = await getSchoolPracticeData(schoolId);
  
  return NextResponse.json({ dailyActivity, hourlyActivity });
}


import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@server/db';
import { badges } from '@shared/schema';

export async function GET(req: NextRequest) {
  const session = await getSession();

  if (!session || session.role !== 'instructor') {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }

  const allBadges = await db.select().from(badges);

  return NextResponse.json({ badges: allBadges });
}

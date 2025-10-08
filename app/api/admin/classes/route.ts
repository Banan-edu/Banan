
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@server/db';
import { classes } from '@shared/schema';

export async function GET(req: NextRequest) {
  const session = await getSession();

  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }

  const allClasses = await db.select().from(classes);

  return NextResponse.json({ classes: allClasses });
}

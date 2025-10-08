
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@server/db';
import { activityLog, users } from '@shared/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();

  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }

  const { id } = await params;
  const instructorId = parseInt(id);

  const logs = await db
    .select({
      id: activityLog.id,
      action: activityLog.action,
      description: activityLog.description,
      createdAt: activityLog.createdAt,
      userName: users.name,
    })
    .from(activityLog)
    .innerJoin(users, eq(activityLog.userId, users.id))
    .where(eq(activityLog.entityId, instructorId))
    .orderBy(desc(activityLog.createdAt))
    .limit(100);

  return NextResponse.json({ logs });
}

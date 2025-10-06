
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@server/db';
import { activityLog, users } from '@shared/schema';
import { eq, desc } from 'drizzle-orm';
type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(
  req: NextRequest,
  context: RouteContext
) {
  const session = await getSession();

  if (!session || session.role !== 'instructor') {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }

  const { id } = await context.params;
  const studentId = parseInt(id);

  const history = await db
    .select({
      id: activityLog.id,
      action: activityLog.action,
      description: activityLog.description,
      createdAt: activityLog.createdAt,
      entityType: activityLog.entityType,
      entityId: activityLog.entityId,
      userName: users.name,
      userEmail: users.email,
    })
    .from(activityLog)
    .leftJoin(users, eq(activityLog.userId, users.id))
    .where(eq(activityLog.entityId, studentId))
    .orderBy(desc(activityLog.createdAt))
    .limit(100);

  return NextResponse.json({ history });
}


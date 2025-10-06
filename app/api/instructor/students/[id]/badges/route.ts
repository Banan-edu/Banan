
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@server/db';
import { userBadges, badges } from '@shared/schema';
import { eq } from 'drizzle-orm';

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

  const earnedBadges = await db
    .select({
      id: userBadges.id,
      badgeId: badges.id,
      name: badges.name,
      description: badges.description,
      icon: badges.icon,
      assignedAt: userBadges.assignedAt,
    })
    .from(userBadges)
    .innerJoin(badges, eq(userBadges.badgeId, badges.id))
    .where(eq(userBadges.userId, studentId));

  return NextResponse.json({ badges: earnedBadges });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();

  if (!session || session.role !== 'instructor') {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }

  const { id } = await params;
  const studentId = parseInt(id);
  const { badgeId } = await req.json();

  await db.insert(userBadges).values({
    userId: studentId,
    badgeId,
    assignedBy: session.userId,
  });

  return NextResponse.json({ success: true });
}

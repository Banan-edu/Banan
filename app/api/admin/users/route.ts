import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@server/db';
import { users, schools } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { hashPassword } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const session = await getSession();

  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const role = searchParams.get('role');

  let query = db.select().from(users);
  
  if (role) {
    query = query.where(eq(users.role, role as any));
  }

  const allUsers = await query;

  return NextResponse.json({ users: allUsers });
}

export async function POST(req: NextRequest) {
  const session = await getSession();

  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }

  const { name, email, password, role, schoolId } = await req.json();

  if (!name || !email || !password || !role) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const hashedPassword = await hashPassword(password);

  const [newUser] = await db
    .insert(users)
    .values({
      name,
      email,
      password: hashedPassword,
      role,
      schoolId: schoolId || null,
    })
    .returning();

  return NextResponse.json({ user: newUser });
}

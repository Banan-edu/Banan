import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@server/db';
import { schools, users } from '@shared/schema';
import { eq } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  const session = await getSession();

  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }

  const allSchools = await db.select().from(schools);

  return NextResponse.json({ schools: allSchools });
}

export async function POST(req: NextRequest) {
  const session = await getSession();

  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }

  const { name, country, address, phone } = await req.json();

  if (!name || !country || !address) {
    return NextResponse.json({ error: 'Name, country and address are required' }, { status: 400 });
  }

  const [newSchool] = await db
    .insert(schools)
    .values({
      name,
      country,
      address,
      phone: phone || null,
    })
    .returning();

  return NextResponse.json({ school: newSchool });
}

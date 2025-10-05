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

  const schoolsWithStats = await Promise.all(
    allSchools.map(async (school) => {
      const instructors = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.schoolId, school.id));

      return {
        ...school,
        instructorCount: instructors.length,
      };
    })
  );

  return NextResponse.json({ schools: schoolsWithStats });
}

export async function POST(req: NextRequest) {
  const session = await getSession();

  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }

  const { name, address, contactEmail, contactPhone } = await req.json();

  if (!name) {
    return NextResponse.json({ error: 'School name is required' }, { status: 400 });
  }

  const [newSchool] = await db
    .insert(schools)
    .values({
      name,
      address: address || null,
      contactEmail: contactEmail || null,
      contactPhone: contactPhone || null,
    })
    .returning();

  return NextResponse.json({ school: newSchool });
}

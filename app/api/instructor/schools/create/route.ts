import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@server/db';
import { schools, schoolAdmins, schoolInstructors, activityLog } from '@shared/schema';

export async function POST(req: NextRequest) {
  const session = await getSession();

  if (!session || session.role !== 'instructor') {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }

  const { name, country, address, phone } = await req.json();

  if (!name || !country || !address || !phone) {
    return NextResponse.json({ error: 'Name, country, address and phone are required' }, { status: 400 });
  }

  try {
    // Create the school
    const [newSchool] = await db
      .insert(schools)
      .values({
        name,
        country,
        address,
        phone,
      })
      .returning();

    // Assign instructor as school admin
    await db.insert(schoolAdmins).values({
      userId: session.userId,
      schoolId: newSchool.id,
    });

    // Assign instructor as school instructor
    await db.insert(schoolInstructors).values({
      userId: session.userId,
      schoolId: newSchool.id,
    });

    // Log the creation activity
    await db.insert(activityLog).values({
      userId: session.userId,
      entityType: 'school',
      entityId: newSchool.id,
      action: 'created',
      description: `Created school: ${name}`,
    });

    return NextResponse.json({ school: newSchool }, { status: 201 });
  } catch (error) {
    console.error('Error creating school:', error);
    return NextResponse.json({ error: 'Failed to create school' }, { status: 500 });
  }
}

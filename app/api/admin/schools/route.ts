import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getAllSchools, createSchool } from '@/lib/schoolService';

export async function GET(req: NextRequest) {
  const session = await getSession();

  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const includeDeleted = searchParams.get('includeDeleted') === 'true';

  const schools = await getAllSchools(includeDeleted);

  return NextResponse.json({ schools });
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

  try {
    const newSchool = await createSchool(
      { name, country, address, phone },
      session.userId,
      false // Don't assign admin as school admin
    );

    return NextResponse.json({ school: newSchool }, { status: 201 });
  } catch (error) {
    console.error('Error creating school:', error);
    return NextResponse.json({ error: 'Failed to create school' }, { status: 500 });
  }
}
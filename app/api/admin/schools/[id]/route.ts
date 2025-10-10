import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import {
  getSchoolById,
  updateSchool,
  softDeleteSchool,
  restoreSchool,
  hardDeleteSchool,
} from '@/lib/schoolService';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(req: Request, context: RouteContext) {
  const session = await getSession();

  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }

  const { id } = await context.params;
  const schoolId = parseInt(id);

  if (isNaN(schoolId)) {
    return NextResponse.json({ error: 'Invalid school ID' }, { status: 400 });
  }

  const result = await getSchoolById(schoolId);

  if (!result) {
    return NextResponse.json({ error: 'School not found' }, { status: 404 });
  }

  return NextResponse.json(result);
}

export async function PUT(req: NextRequest, context: RouteContext) {
  const session = await getSession();

  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  }

  const { id } = await context.params;
  const schoolId = parseInt(id);

  if (isNaN(schoolId)) {
    return NextResponse.json({ error: 'Invalid school ID' }, { status: 400 });
  }

  const { name, country, address, phone } = await req.json();

  if (!name || !country || !address) {
    return NextResponse.json({ error: 'Name, country and address are required' }, { status: 400 });
  }

  try {
    const updatedSchool = await updateSchool(
      schoolId,
      { name, country, address, phone },
      session.userId
    );

    if (!updatedSchool) {
      return NextResponse.json({ error: 'School not found' }, { status: 404 });
    }

    return NextResponse.json({ school: updatedSchool });
  } catch (error) {
    console.error('Error updating school:', error);
    return NextResponse.json({ error: 'Failed to update school' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  const session = await getSession();

  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }

  const { id } = await context.params;
  const schoolId = parseInt(id);

  if (isNaN(schoolId)) {
    return NextResponse.json({ error: 'Invalid school ID' }, { status: 400 });
  }

  const { action } = await req.json();

  try {
    if (action === 'soft_delete') {
      const updatedSchool = await softDeleteSchool(schoolId, session.userId);

      if (!updatedSchool) {
        return NextResponse.json({ error: 'School not found' }, { status: 404 });
      }

      return NextResponse.json({
        message: 'School deactivated successfully',
        school: updatedSchool,
      });
    }

    if (action === 'restore') {
      const restoredSchool = await restoreSchool(schoolId, session.userId);

      if (!restoredSchool) {
        return NextResponse.json({ error: 'School not found' }, { status: 404 });
      }

      return NextResponse.json({
        message: 'School restored successfully',
        school: restoredSchool,
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error modifying school:', error);
    return NextResponse.json({ error: 'Failed to modify school' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  const session = await getSession();

  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }

  const { id } = await context.params;
  const schoolId = parseInt(id);

  if (isNaN(schoolId)) {
    return NextResponse.json({ error: 'Invalid school ID' }, { status: 400 });
  }

  try {
    const deletedSchool = await hardDeleteSchool(schoolId, session.userId);

    if (!deletedSchool) {
      return NextResponse.json({ error: 'School not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'School and all related data permanently deleted',
      deletedSchool,
    });
  } catch (error) {
    console.error('Error deleting school:', error);
    return NextResponse.json({
      error: 'Failed to delete school and related data',
    }, { status: 500 });
  }
}

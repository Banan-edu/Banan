
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@server/db';
import { schoolAdmins } from '@shared/schema';
import { eq, and } from 'drizzle-orm';
import { getSchoolById, updateSchool } from '@/lib/schoolService';

type RouteContext = {
    params: Promise<{ id: string }>;
};

async function verifySchoolAdmin(userId: number, schoolId: number): Promise<boolean> {
    const admin = await db
        .select()
        .from(schoolAdmins)
        .where(and(eq(schoolAdmins.userId, userId), eq(schoolAdmins.schoolId, schoolId)))
        .limit(1);

    return admin.length > 0;
}

export async function GET(req: Request, context: RouteContext) {
    const session = await getSession();

    if (!session || session.role !== 'school_admin') {
        return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const schoolId = parseInt(id);

    if (isNaN(schoolId)) {
        return NextResponse.json({ error: 'Invalid school ID' }, { status: 400 });
    }

    const isAdmin = await verifySchoolAdmin(session.userId, schoolId);

    if (!isAdmin) {
        return NextResponse.json({ error: 'Not authorized for this school' }, { status: 403 });
    }

    const result = await getSchoolById(schoolId);

    if (!result) {
        return NextResponse.json({ error: 'School not found' }, { status: 404 });
    }

    return NextResponse.json(result);
}

export async function PUT(req: NextRequest, context: RouteContext) {
    const session = await getSession();

    if (!session || session.role !== 'school_admin') {
        return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const { id } = await context.params;
    const schoolId = parseInt(id);

    if (isNaN(schoolId)) {
        return NextResponse.json({ error: 'Invalid school ID' }, { status: 400 });
    }

    const isAdmin = await verifySchoolAdmin(session.userId, schoolId);

    if (!isAdmin) {
        return NextResponse.json({ error: 'Not authorized for this school' }, { status: 403 });
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

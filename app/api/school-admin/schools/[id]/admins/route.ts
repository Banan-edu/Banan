
import { getSession } from '@/lib/auth';
import { getSchoolAdmins } from '@/lib/schoolsFeature';
import { db } from '@/server/db';
import { schoolAdmins } from '@/shared/schema';
import { and, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

type RouteContext = {
    params: Promise<{ id: string }>;
};

export async function GET(req: Request, context: RouteContext) {
    const session = await getSession();

    if (!session || !session.userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.role !== 'school_admin') {
        return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const { id } = await context.params;
    const schoolId = parseInt(id);

    if (isNaN(schoolId)) {
        return NextResponse.json({ error: 'Invalid school ID' }, { status: 400 });
    }

    // Verify school admin has access to this school
    const hasAccess = await db
        .select()
        .from(schoolAdmins)
        .where(
            and(
                eq(schoolAdmins.userId, session.userId),
                eq(schoolAdmins.schoolId, schoolId)
            )
        )
        .limit(1);

    if (!hasAccess || hasAccess.length === 0) {
        return NextResponse.json({ error: 'Not authorized for this school' }, { status: 403 });
    }

    const admins = await getSchoolAdmins(schoolId);

    return NextResponse.json({
        admins,
    });
}

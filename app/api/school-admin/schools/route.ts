
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@server/db';
import { schoolAdmins } from '@shared/schema';
import { eq, inArray } from 'drizzle-orm';
import { getAllSchools } from '@/lib/schoolService';

export async function GET(req: NextRequest) {
    const session = await getSession();

    if (!session || session.role !== 'school_admin') {
        return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
    }

    // Get schools where user is admin
    const adminSchools = await db
        .select({ schoolId: schoolAdmins.schoolId })
        .from(schoolAdmins)
        .where(eq(schoolAdmins.userId, session.userId));

    const schoolIds = adminSchools.map(s => s.schoolId);

    if (schoolIds.length === 0) {
        return NextResponse.json({ schools: [] });
    }

    // Get all schools with stats, then filter
    const allSchools = await getAllSchools(false);
    const filteredSchools = allSchools.filter(school => schoolIds.includes(school.id));

    return NextResponse.json({ schools: filteredSchools });
}

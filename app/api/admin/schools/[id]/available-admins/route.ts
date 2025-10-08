
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/server/db';
import { users, schoolAdmins } from '@/shared/schema';
import { eq, and, notInArray, or } from 'drizzle-orm';

type RouteContext = {
    params: Promise<{ id: string }>;
};

export async function GET(req: NextRequest, context: RouteContext) {
    const session = await getSession();

    if (!session || session.role !== 'admin') {
        return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const { id } = await context.params;
    const schoolId = parseInt(id);

    if (isNaN(schoolId)) {
        return NextResponse.json({ error: 'Invalid school ID' }, { status: 400 });
    }

    // Get already assigned admin IDs for this school
    const assignedAdmins = await db
        .select({ userId: schoolAdmins.userId })
        .from(schoolAdmins)
        .where(eq(schoolAdmins.schoolId, schoolId));

    const assignedIds = assignedAdmins.map(a => a.userId);

    // Get all school_admin users not yet assigned to this school
    let availableAdmins;
    if (assignedIds.length > 0) {
        availableAdmins = await db
            .select({
                id: users.id,
                name: users.name,
                email: users.email,
                role: users.role,
            })
            .from(users)
            .where(
                and(
                    or(
                        eq(users.role, 'school_admin'),
                        eq(users.role, 'admin')
                    ),
                    notInArray(users.id, assignedIds)
                )
            );
    } else {
        availableAdmins = await db
            .select({
                id: users.id,
                name: users.name,
                email: users.email,
                role: users.role,
            })
            .from(users)
            .where(and(eq(users.role, 'school_admin'), eq(users.role, 'admin')));
    }

    return NextResponse.json({ admins: availableAdmins });
}

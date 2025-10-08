
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/server/db';
import { schoolAdmins } from '@/shared/schema';
import { eq, and } from 'drizzle-orm';

type RouteContext = {
    params: Promise<{ id: string }>;
};

export async function POST(req: NextRequest, context: RouteContext) {
    const session = await getSession();

    if (!session || session.role !== 'admin') {
        return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const { id } = await context.params;
    const schoolId = parseInt(id);

    if (isNaN(schoolId)) {
        return NextResponse.json({ error: 'Invalid school ID' }, { status: 400 });
    }

    const { adminIds } = await req.json();

    if (!adminIds || !Array.isArray(adminIds) || adminIds.length === 0) {
        return NextResponse.json({ error: 'Invalid admin IDs' }, { status: 400 });
    }

    try {
        // Check for existing assignments
        const existing = await db
            .select()
            .from(schoolAdmins)
            .where(eq(schoolAdmins.schoolId, schoolId));

        const existingUserIds = new Set(existing.map(e => e.userId));

        // Filter out already assigned admins
        const newAdminIds = adminIds.filter(id => !existingUserIds.has(id));

        if (newAdminIds.length === 0) {
            return NextResponse.json({ error: 'All selected admins are already assigned' }, { status: 409 });
        }

        // Insert new assignments
        const assignments = newAdminIds.map(userId => ({
            userId,
            schoolId,
        }));

        await db.insert(schoolAdmins).values(assignments);

        return NextResponse.json({
            message: 'Admins assigned successfully',
            assigned: newAdminIds.length
        });
    } catch (error) {
        console.error('Error assigning admins:', error);
        return NextResponse.json({ error: 'Failed to assign admins' }, { status: 500 });
    }
}

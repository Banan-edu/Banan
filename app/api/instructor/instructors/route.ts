
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@server/db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';

export async function GET(req: NextRequest) {
    const session = await getSession();

    if (!session || session.role !== 'instructor') {
        return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
    }

    const instructorsList = await db
        .select({
            id: users.id,
            name: users.name,
            email: users.email,
        })
        .from(users)
        .where(eq(users.role, 'instructor'));

    return NextResponse.json({ instructors: instructorsList });
}

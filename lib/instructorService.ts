
import { db } from '@/server/db';
import { users, schoolAdmins, classInstructors, classStudents, classes, instructorPermissions } from '@/shared/schema';
import { and, eq, inArray, sql } from 'drizzle-orm';
import { hashPassword } from '@/lib/auth';
import { ActivityLogger } from '@/lib/activityLogger';

export interface CreateInstructorParams {
    name: string;
    email: string;
    studentId?: string;
    password: string;
    role: string;
    schoolIds?: number[];
    permissions?: {
        canCrudStudents?: boolean;
        canRenameDeleteClasses?: boolean;
        canAccessAllStudents?: boolean;
    };
    createdBy: number;
}

export async function createInstructor({
    name,
    email,
    studentId,
    password,
    role,
    schoolIds = [],
    permissions,
    createdBy,
}: CreateInstructorParams) {
    const hashedPassword = await hashPassword(password);

    // Create the user
    const [newUser] = await db
        .insert(users)
        .values({
            name,
            email,
            studentId,
            password: hashedPassword,
            role: role as any,
        })
        .returning();

    // Create instructor permissions if role is instructor
    if (role === 'instructor' && permissions) {
        await db.insert(instructorPermissions).values({
            userId: newUser.id,
            canCrudStudents: permissions.canCrudStudents || false,
            canRenameDeleteClasses: permissions.canRenameDeleteClasses || false,
            canAccessAllStudents: permissions.canAccessAllStudents || false,
        });
    }

    // Assign to schools if schoolIds are provided
    if (schoolIds.length > 0) {
        const schoolAssignments = schoolIds.map(schoolId => ({
            userId: newUser.id,
            schoolId,
        }));
        await db.insert(schoolAdmins).values(schoolAssignments);

        // Log activity for each school assignment
        for (const schoolId of schoolIds) {
            await ActivityLogger.assign(
                createdBy,
                'instructor',
                newUser.id,
                `Assigned ${role} ${name} to school`,
                `${schoolId}`
            );
        }
    }

    // Log user creation
    await ActivityLogger.create(
        createdBy,
        'instructor',
        newUser.id,
        `Created ${role}: ${name} (${email})`
    );

    return newUser;
}

export async function getInstructors() {
    const instructorsData = await db
        .select({
            id: users.id,
            name: users.name,
            email: users.email,
            role: users.role,
            lastLogin: users.lastLogin,
            classCount: sql<number>`count(distinct ${classInstructors.classId})`,
        })
        .from(users)
        .leftJoin(classInstructors, eq(users.id, classInstructors.userId))
        .where(inArray(users.role, ['instructor', 'admin', 'school_admin', 'billing_admin']))
        .groupBy(users.id);

    return instructorsData;
}

export async function getInstructorsClasses(id: number) {
    const instructorClasses = await db
        .select({
            id: classes.id,
            name: classes.name,
            assignedAt: classInstructors.assignedAt,
        })
        .from(classInstructors)
        .innerJoin(classes, eq(classInstructors.classId, classes.id))
        .where(eq(classInstructors.userId, id));

    const classesWithStudentCount = await Promise.all(
        instructorClasses.map(async (cls) => {
            const studentCount = await db
                .select({ count: sql<number>`count(*)` })
                .from(classStudents)
                .where(eq(classStudents.classId, cls.id));

            return {
                ...cls,
                studentCount: Number(studentCount[0]?.count || 0),
            };
        })
    );

    return classesWithStudentCount;
}

export async function getInstructorById(id: number) {
    const [instructor] = await db
        .select()
        .from(users)
        .where(eq(users.id, id));

    const schoolAdminRecords = await db
        .select({ schoolId: schoolAdmins.schoolId })
        .from(schoolAdmins)
        .where(eq(schoolAdmins.userId, id));
    const shcoolsIds = schoolAdminRecords.map(s => s.schoolId);
    const [instructorPermissionsRecords] = await db
        .select()
        .from(instructorPermissions)
        .where(eq(instructorPermissions.userId, id));
    return {
        shcoolsIds,
        permissions: instructorPermissionsRecords,
        ...instructor
    };
}

export async function getInstructorSchoolCountCountById(id: number) {
    const schoolAdminRecords = await db
        .select({ schoolId: schoolAdmins.schoolId })
        .from(schoolAdmins)
        .where(eq(schoolAdmins.userId, id));

    const schoolCount = new Set(schoolAdminRecords.map(s => s.schoolId)).size;

    return schoolCount;
}

export async function getInstructorClassesCountById(id: number) {
    const instructorClasses = await db
        .select({ classId: classInstructors.classId })
        .from(classInstructors)
        .where(eq(classInstructors.userId, id));

    return instructorClasses.length;
}

export async function updateInstructor(
    id: number,
    data: Partial<CreateInstructorParams>,
    updatedBy: number
) {
    const updateData: any = {};

    if (data.name) updateData.name = data.name;
    if (data.email) updateData.email = data.email;
    if (data.studentId) updateData.studentId = data.studentId;
    if (data.role) updateData.role = data.role;
    if (data.password) updateData.password = await hashPassword(data.password);

    const [updatedUser] = await db
        .update(users)
        .set(updateData)
        .where(eq(users.id, id))
        .returning();

    // Update permissions if provided
    if (data.permissions && data.role === 'instructor') {
        await db
            .update(instructorPermissions)
            .set(data.permissions)
            .where(eq(instructorPermissions.userId, id));

        const permissionsDesc = Object.entries(data.permissions)
            .filter(([_, value]) => value === true)
            .map(([key]) => key)
            .join(', ');

        await ActivityLogger.update(
            updatedBy,
            'instructor',
            id,
            `Updated instructor permissions: ${permissionsDesc || 'none'}`
        );
    }

    if (data.schoolIds && data.role === 'school_admin') {
        // Remove existing school admin assignments
        await db
            .delete(schoolAdmins)
            .where(eq(schoolAdmins.userId, id));

        // Add new school admin assignments if schoolIds is provided
        if (data.schoolIds && data.schoolIds.length > 0) {
            const schoolAdminValues = data.schoolIds.map(schoolId => ({
                userId: id,
                schoolId: schoolId,
            }));

            await db
                .insert(schoolAdmins)
                .values(schoolAdminValues);

            // Log school assignments
            await ActivityLogger.update(
                updatedBy,
                'instructor',
                id,
                `Assigned instructor to ${data.schoolIds.length} school(s): ${data.schoolIds.join(', ')}`
            );
        } else {
            // Log removal of school assignments
            await ActivityLogger.update(
                updatedBy,
                'instructor',
                id,
                `Removed all school assignments from instructor`
            );
        }
    }

    // Log the update
    await ActivityLogger.update(
        updatedBy,
        'instructor',
        id,
        `Updated instructor: ${updatedUser.name}`
    );

    return updatedUser;
}

export async function deleteInstructor(id: number, deletedBy: number) {
    const [deletedUser] = await db
        .update(users)
        .set({ deletedAt: new Date() })
        .where(eq(users.id, id))
        .returning();

    // Log the deletion
    await ActivityLogger.delete(
        deletedBy,
        'instructor',
        id,
        `Soft deleted instructor: ${deletedUser.name}`
    );

    return deletedUser;
}

export async function getInstructorLogs(id: number) {
    const { activityLog } = await import('@/shared/schema');
    const { desc } = await import('drizzle-orm');

    const logs = await db
        .select({
            id: activityLog.id,
            action: activityLog.action,
            description: activityLog.description,
            createdAt: activityLog.createdAt,
            userName: users.name,
        })
        .from(activityLog)
        .innerJoin(users, eq(activityLog.userId, users.id))
        .where(eq(activityLog.entityId, id))
        .orderBy(desc(activityLog.createdAt))
        .limit(100);

    return logs;
}

export async function assignInstructorToClasses(
    instructorId: number,
    classIds: number[],
    assignedBy: number
) {
    for (const classId of classIds) {
        await db.insert(classInstructors).values({
            userId: instructorId,
            classId,
        });

        // Log the assignment
        await ActivityLogger.assign(
            assignedBy,
            'instructor',
            instructorId,
            `Assigned instructor to class`,
            `${classId}`
        );
    }

    return { success: true };
}
export async function unassignInstructorToClasses(
    instructorId: number,
    classId: number,
    unassignedBy: number
) {
    await db
        .delete(classInstructors)
        .where(
            and(
                eq(classInstructors.userId, instructorId),
                eq(classInstructors.classId, classId)
            )
        );

    // Log the assignment
    await ActivityLogger.unassign(
        unassignedBy,
        'instructor',
        instructorId,
        `Unassigned instructor to class`,
        `${classId}`
    );

    return { success: true };
}
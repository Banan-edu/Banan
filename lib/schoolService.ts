
import { db } from '@server/db';
import { schools, classes, schoolAdmins, classInstructors, classStudents } from '@shared/schema';
import { eq, sql, inArray } from 'drizzle-orm';
import { ActivityLogger } from '@/lib/activityLogger';

export interface CreateSchoolData {
  name: string;
  country: string;
  address: string;
  phone?: string | null;
}

export interface UpdateSchoolData {
  name?: string;
  country?: string;
  address?: string;
  phone?: string | null;
}

export interface SchoolWithStats {
  id: number;
  name: string;
  country: string;
  address: string;
  phone: string | null;
  isActive: boolean;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  classCount: number;
  adminCount: number;
  instructorCount: number;
  studentCount: number;
}

/**
 * Get all schools with statistics
 */
export async function getAllSchools(includeDeleted: boolean = false): Promise<SchoolWithStats[]> {
  const allSchools = await db
    .select()
    .from(schools)
    .where(includeDeleted ? undefined : eq(schools.isActive, true));

  const schoolsWithStats = await Promise.all(
    allSchools.map(async (school) => {
      const classCount = await db
        .select({ count: sql<number>`count(*)` })
        .from(classes)
        .where(eq(classes.schoolId, school.id));

      const adminCount = await db
        .select({ count: sql<number>`count(*)` })
        .from(schoolAdmins)
        .where(eq(schoolAdmins.schoolId, school.id));

      const schoolClasses = await db
        .select({ id: classes.id })
        .from(classes)
        .where(eq(classes.schoolId, school.id));

      const classIds = schoolClasses.map(c => c.id);

      let instructorCount = 0;
      let studentCount = 0;

      if (classIds.length > 0) {
        const instructors = await db
          .select({ userId: classInstructors.userId })
          .from(classInstructors)
          .where(inArray(classInstructors.classId, classIds));

        const uniqueInstructors = new Set(instructors.map(i => i.userId));
        instructorCount = uniqueInstructors.size;

        const students = await db
          .select({ userId: classStudents.userId })
          .from(classStudents)
          .where(inArray(classStudents.classId, classIds));

        const uniqueStudents = new Set(students.map(s => s.userId));
        studentCount = uniqueStudents.size;
      }

      return {
        ...school,
        classCount: Number(classCount[0]?.count || 0),
        adminCount: Number(adminCount[0]?.count || 0),
        instructorCount,
        studentCount,
      };
    })
  );

  return schoolsWithStats;
}

/**
 * Get a single school by ID with statistics
 */
export async function getSchoolById(schoolId: number) {
  const school = await db
    .select()
    .from(schools)
    .where(eq(schools.id, schoolId))
    .limit(1);

  if (!school.length) {
    return null;
  }

  const classCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(classes)
    .where(eq(classes.schoolId, schoolId));

  const adminCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(schoolAdmins)
    .where(eq(schoolAdmins.schoolId, schoolId));

  const schoolClasses = await db
    .select({ id: classes.id })
    .from(classes)
    .where(eq(classes.schoolId, schoolId));

  const classIds = schoolClasses.map(c => c.id);

  let instructorCount = 0;
  let studentCount = 0;

  if (classIds.length > 0) {
    const instructors = await db
      .select({ userId: classInstructors.userId })
      .from(classInstructors)
      .where(inArray(classInstructors.classId, classIds));

    const uniqueInstructors = new Set(instructors.map(i => i.userId));
    instructorCount = uniqueInstructors.size;

    const students = await db
      .select({ userId: classStudents.userId })
      .from(classStudents)
      .where(inArray(classStudents.classId, classIds));

    const uniqueStudents = new Set(students.map(s => s.userId));
    studentCount = uniqueStudents.size;
  }

  return {
    school: school[0],
    stats: {
      classCount: Number(classCount[0]?.count || 0),
      adminCount: Number(adminCount[0]?.count || 0),
      instructorCount,
      studentCount,
    },
  };
}

/**
 * Create a new school
 */
export async function createSchool(
  data: CreateSchoolData,
  userId: number,
  assignAsAdmin: boolean = false
) {
  const [newSchool] = await db
    .insert(schools)
    .values({
      name: data.name,
      country: data.country,
      address: data.address,
      phone: data.phone || null,
      isActive: true,
      deletedAt: null,
    })
    .returning();

  // Optionally assign creator as school admin
  if (assignAsAdmin) {
    await db.insert(schoolAdmins).values({
      userId: userId,
      schoolId: newSchool.id,
    });
  }

  // Log the creation activity
  await ActivityLogger.create(userId, 'school', newSchool.id, newSchool.name);

  return newSchool;
}

/**
 * Update a school
 */
export async function updateSchool(
  schoolId: number,
  data: UpdateSchoolData,
  userId: number
) {
  const [updatedSchool] = await db
    .update(schools)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(schools.id, schoolId))
    .returning();

  if (!updatedSchool) {
    return null;
  }

  // Log the update activity
  await ActivityLogger.update(userId, 'school', schoolId, updatedSchool.name);

  return updatedSchool;
}

/**
 * Soft delete a school (mark as inactive)
 */
export async function softDeleteSchool(schoolId: number, userId: number) {
  const [school] = await db
    .select()
    .from(schools)
    .where(eq(schools.id, schoolId))
    .limit(1);

  if (!school) {
    return null;
  }

  const [updatedSchool] = await db
    .update(schools)
    .set({
      isActive: false,
      deletedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(schools.id, schoolId))
    .returning();

  // Log the soft delete activity
  await ActivityLogger.delete(userId, 'school', schoolId, school.name);

  return updatedSchool;
}

/**
 * Restore a soft deleted school
 */
export async function restoreSchool(schoolId: number, userId: number) {
  const [restoredSchool] = await db
    .update(schools)
    .set({
      isActive: true,
      deletedAt: null,
      updatedAt: new Date(),
    })
    .where(eq(schools.id, schoolId))
    .returning();

  if (!restoredSchool) {
    return null;
  }

  // Log the restore activity
  await ActivityLogger.create(userId, 'school', schoolId, `Restored school: ${restoredSchool.name}`);

  return restoredSchool;
}

/**
 * Hard delete a school (permanently remove from database)
 */
export async function hardDeleteSchool(schoolId: number, userId: number) {
  const [school] = await db
    .select()
    .from(schools)
    .where(eq(schools.id, schoolId))
    .limit(1);

  if (!school) {
    return null;
  }

  // Get all classes for this school
  const schoolClasses = await db
    .select({ id: classes.id })
    .from(classes)
    .where(eq(classes.schoolId, schoolId));

  const classIds = schoolClasses.map(c => c.id);

  // Delete in correct order to avoid foreign key constraints
  if (classIds.length > 0) {
    await db.delete(classStudents).where(inArray(classStudents.classId, classIds));
    await db.delete(classInstructors).where(inArray(classInstructors.classId, classIds));
    await db.delete(classes).where(inArray(classes.id, classIds));
  }

  await db.delete(schoolAdmins).where(eq(schoolAdmins.schoolId, schoolId));

  const [deletedSchool] = await db
    .delete(schools)
    .where(eq(schools.id, schoolId))
    .returning();

  // Log the hard delete activity (using a special action)
  await ActivityLogger.delete(userId, 'school', schoolId, `Permanently deleted school: ${school.name}`);

  return deletedSchool;
}

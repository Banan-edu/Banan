
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@server/db';
import { users, classes, classStudents, lessonProgress, schools, schoolStudents } from '@shared/schema';
import { and, eq, inArray, isNull, sql } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  const session = await getSession();

  if (!session || session.role !== 'school_admin') {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }

  // Get all students
  const studentsData = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      studentId: users.studentId,
      grade: users.grade,
      createdAt: users.createdAt,
      lastLogin: users.lastLogin,
      lastActivity: users.lastActivity,
    })
    .from(users)
    .where(and(eq(users.role, 'student'), isNull(users.deletedAt)));

  if (studentsData.length === 0) {
    return NextResponse.json({ students: [] });
  }

  const studentIds = studentsData.map(s => s.id);

  // Get school assignments for students
  const studentSchools = await db
    .select({
      userId: schoolStudents.userId,
      schoolId: schoolStudents.schoolId,
    })
    .from(schoolStudents)
    .where(inArray(schoolStudents.userId, studentIds));

  // Get all student enrollments
  const studentEnrollments = await db
    .select({
      userId: classStudents.userId,
      classId: classStudents.classId,
      enrolledAt: classStudents.enrolledAt,
    })
    .from(classStudents)
    .where(inArray(classStudents.userId, studentIds));

  // Get all classes
  const classIds = [...new Set(studentEnrollments.map(e => e.classId))];
  const classesData = classIds.length > 0 ? await db
    .select({
      id: classes.id,
      name: classes.name,
    })
    .from(classes)
    .where(inArray(classes.id, classIds)) : [];

  // Get all schools
  const schoolIds = [...new Set(studentSchools.map(s => s.schoolId))];
  const schoolsData = schoolIds.length > 0 ? await db
    .select({
      id: schools.id,
      name: schools.name,
    })
    .from(schools)
    .where(inArray(schools.id, schoolIds)) : [];

  // Calculate progress statistics for each student
  const studentsWithStats = await Promise.all(
    studentsData.map(async (student) => {
      // Get all classes this student is enrolled in
      const studentClasses = studentEnrollments
        .filter(e => e.userId === student.id)
        .map(e => {
          const classInfo = classesData.find(c => c.id === e.classId);
          return {
            id: e.classId,
            name: classInfo?.name || 'Unknown',
            enrolledAt: e.enrolledAt,
          };
        });

      // Get school name from schoolStudents junction table
      const studentSchool = studentSchools.find(s => s.userId === student.id);
      const school = studentSchool ? schoolsData.find(s => s.id === studentSchool.schoolId) : null;

      // Get lesson progress stats
      const progressStats = await db
        .select({
          totalLessons: sql<number>`count(*)`,
          completedLessons: sql<number>`count(*) filter (where ${lessonProgress.completed} = true)`,
          avgAccuracy: sql<number>`avg(${lessonProgress.accuracy})`,
          avgWpm: sql<number>`avg(${lessonProgress.speed})`,
        })
        .from(lessonProgress)
        .where(eq(lessonProgress.userId, student.id));

      const stats = progressStats[0] || {
        totalLessons: 0,
        completedLessons: 0,
        avgAccuracy: 0,
        avgWpm: 0,
      };

      return {
        ...student,
        schoolId: studentSchool?.schoolId || null,
        schoolName: school?.name || 'N/A',
        classes: studentClasses,
        stats: {
          totalLessons: Number(stats.totalLessons) || 0,
          completedLessons: Number(stats.completedLessons) || 0,
          avgAccuracy: Math.round(Number(stats.avgAccuracy) || 0),
          avgWpm: Math.round(Number(stats.avgWpm) || 0),
        },
      };
    })
  );

  return NextResponse.json({ students: studentsWithStats });
}

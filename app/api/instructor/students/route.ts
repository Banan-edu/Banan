
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@server/db';
import { users, classes, classInstructors, classStudents, lessonProgress } from '@shared/schema';
import { eq, inArray, sql } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  const session = await getSession();

  if (!session || session.role !== 'instructor') {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }

  // Get all classes where this instructor teaches
  const instructorClasses = await db
    .select({ classId: classInstructors.classId })
    .from(classInstructors)
    .where(eq(classInstructors.userId, session.userId));

  const classIds = instructorClasses.map(c => c.classId);

  if (classIds.length === 0) {
    return NextResponse.json({ students: [] });
  }

  // Get all students enrolled in those classes
  const studentEnrollments = await db
    .select({
      userId: classStudents.userId,
      classId: classStudents.classId,
      enrolledAt: classStudents.enrolledAt,
    })
    .from(classStudents)
    .where(inArray(classStudents.classId, classIds));

  // Get unique student IDs
  const studentIds = [...new Set(studentEnrollments.map(e => e.userId))];

  if (studentIds.length === 0) {
    return NextResponse.json({ students: [] });
  }

  // Get student details
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
    .where(inArray(users.id, studentIds));

  // Get class names for each student
  const classesData = await db
    .select({
      id: classes.id,
      name: classes.name,
    })
    .from(classes)
    .where(inArray(classes.id, classIds));

  // Calculate progress statistics for each student
  const studentsWithStats = await Promise.all(
    studentsData.map(async (student) => {
      // Get all classes this student is enrolled in (that this instructor teaches)
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

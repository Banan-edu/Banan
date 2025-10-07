
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@server/db';
import { users, classStudents, activityLog } from '@shared/schema';
import { hashPassword } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const session = await getSession();

  if (!session || session.role !== 'instructor') {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }

  const { students } = await req.json();

  try {
    const createdStudents = [];

    for (const student of students) {
      const { name, email, password, studentId, grade, classId } = student;

      if (!name || !email || !password) {
        continue;
      }

      const hashedPassword = await hashPassword(password);

      const [newStudent] = await db
        .insert(users)
        .values({
          name,
          email,
          password: hashedPassword,
          studentId: studentId || null,
          grade: grade || null,
          role: 'student',
        })
        .returning();

      if (classId && classId !== 'none') {
        await db.insert(classStudents).values({
          classId: parseInt(classId),
          userId: newStudent.id,
        });
      }

      createdStudents.push(newStudent);
    }

    await db.insert(activityLog).values({
      userId: session.userId,
      entityType: 'user',
      entityId: session.userId,
      action: 'imported',
      description: `Imported ${createdStudents.length} students`,
    });

    return NextResponse.json({ 
      success: true, 
      count: createdStudents.length 
    });
  } catch (error) {
    console.error('Error importing students:', error);
    return NextResponse.json({ error: 'Failed to import students' }, { status: 500 });
  }
}

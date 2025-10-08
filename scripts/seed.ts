// import { db } from '../server/db';
// import { users, schools, courses, sections, lessons, classes, classStudents, classCourses, classInstructors } from '../shared/schema';
// import { hashPassword } from '../lib/auth';

// async function seed() {
//   console.log('🌱 Seeding database...');

//   const hashedPassword = await hashPassword('password123');

//   const [admin] = await db.insert(users).values({
//     name: 'Admin User',
//     email: 'admin@banan.com',
//     password: hashedPassword,
//     role: 'admin',
//   }).returning();
//   console.log('✓ Created admin user');

//   const [instructor] = await db.insert(users).values({
//     name: 'John Instructor',
//     email: 'instructor@banan.com',
//     password: hashedPassword,
//     role: 'instructor',
//   }).returning();
//   console.log('✓ Created instructor user');

//   const [student] = await db.insert(users).values({
//     name: 'Sara Student',
//     email: 'student@banan.com',
//     password: hashedPassword,
//     role: 'student',
//     grade: 'Grade 5',
//   }).returning();
//   console.log('✓ Created student user');

//   const [school] = await db.insert(schools).values({
//     name: 'Banan Academy',
//     country: 'Saudi Arabia',
//     address: 'Riyadh, Kingdom of Saudi Arabia',
//     phone: '+966-11-234-5678',
//   }).returning();
//   console.log('✓ Created school');

//   const [englishCourse] = await db.insert(courses).values({
//     name: 'Touch Typing Basics - English',
//     description: 'Learn touch typing fundamentals with English keyboard',
//     type: 'typing',
//     language: 'en',
//     grade: 'Grade 3',
//     createdBy: instructor.id,
//   }).returning();
//   console.log('✓ Created English typing course');

//   const [arabicCourse] = await db.insert(courses).values({
//     name: 'الكتابة باللمس - العربية',
//     description: 'تعلم الكتابة باللمس باللغة العربية',
//     type: 'typing',
//     language: 'ar',
//     grade: 'Grade 8',
//     createdBy: instructor.id,
//   }).returning();
//   console.log('✓ Created Arabic typing course');

//   const [codingCourse] = await db.insert(courses).values({
//     name: 'Code Typing - JavaScript',
//     description: 'Practice typing JavaScript code with syntax highlighting',
//     type: 'coding',
//     language: 'en',
//     grade: 'Grade 12',
//     createdBy: instructor.id,
//   }).returning();
//   console.log('✓ Created coding course');

//   const [englishSection] = await db.insert(sections).values({
//     courseId: englishCourse.id,
//     name: 'Home Row Keys',
//     order: 1,
//   }).returning();

//   await db.insert(lessons).values([
//     {
//       sectionId: englishSection.id,
//       name: 'Lesson 1: A S D F',
//       type: 'text',
//       order: 1,
//       text: 'asdf asdf fdsa fdsa asdf fdsa asdf fdsa',
//       typingMode: 'duals_to_words',
//       targetScore: 100,
//       minAccuracy: 80,
//       minSpeed: 20,
//     },
//     {
//       sectionId: englishSection.id,
//       name: 'Lesson 2: J K L ;',
//       type: 'text',
//       order: 2,
//       text: 'jkl; jkl; ;lkj ;lkj jkl; ;lkj jkl; ;lkj',
//       typingMode: 'duals_to_words',
//       targetScore: 100,
//       minAccuracy: 80,
//       minSpeed: 20,
//     },
//     {
//       sectionId: englishSection.id,
//       name: 'Lesson 3: Combined Practice',
//       type: 'text',
//       order: 3,
//       text: 'The quick brown fox jumps over the lazy dog. Practice makes perfect!',
//       typingMode: 'sentences',
//       targetScore: 150,
//       minAccuracy: 85,
//       minSpeed: 25,
//     },
//   ]);
//   console.log('✓ Created English lessons');

//   const [arabicSection] = await db.insert(sections).values({
//     courseId: arabicCourse.id,
//     name: 'الصف الأساسي',
//     order: 1,
//   }).returning();

//   await db.insert(lessons).values([
//     {
//       sectionId: arabicSection.id,
//       name: 'الدرس الأول: أ ب ت ث',
//       type: 'text',
//       order: 1,
//       text: 'أبت أبت تبأ تبأ أبت تبأ أبت تبأ',
//       typingMode: 'duals_to_words',
//       targetScore: 100,
//       minAccuracy: 80,
//       minSpeed: 20,
//     },
//     {
//       sectionId: arabicSection.id,
//       name: 'الدرس الثاني: الكلمات',
//       type: 'text',
//       order: 2,
//       text: 'مرحبا بكم في منصة بنان لتعلم الكتابة باللمس',
//       typingMode: 'words_only',
//       targetScore: 120,
//       minAccuracy: 85,
//       minSpeed: 22,
//     },
//   ]);
//   console.log('✓ Created Arabic lessons');

//   const [codingSection] = await db.insert(sections).values({
//     courseId: codingCourse.id,
//     name: 'JavaScript Basics',
//     order: 1,
//   }).returning();

//   await db.insert(lessons).values([
//     {
//       sectionId: codingSection.id,
//       name: 'Variables and Functions',
//       type: 'coding',
//       order: 1,
//       text: 'const greeting = "Hello World";\nfunction sayHello(name) {\n  return `Hello ${name}!`;\n}\nconsole.log(sayHello("Student"));',
//       codeLanguage: 'javascript',
//       typingMode: 'sentences',
//       targetScore: 150,
//       minAccuracy: 90,
//       minSpeed: 30,
//     },
//     {
//       sectionId: codingSection.id,
//       name: 'Arrays and Loops',
//       type: 'coding',
//       order: 2,
//       text: 'const numbers = [1, 2, 3, 4, 5];\nfor (let i = 0; i < numbers.length; i++) {\n  console.log(numbers[i] * 2);\n}',
//       codeLanguage: 'javascript',
//       typingMode: 'sentences',
//       targetScore: 180,
//       minAccuracy: 92,
//       minSpeed: 35,
//     },
//   ]);
//   console.log('✓ Created coding lessons');

//   const [class1] = await db.insert(classes).values({
//     name: 'Grade 5 - Section A',
//     description: 'Touch typing for Grade 5 students',
//     grade: 'Grade 5',
//     code: 'G5A-2024',
//     schoolId: school.id,
//   }).returning();
//   console.log('✓ Created class');

//   await db.insert(classInstructors).values({
//     classId: class1.id,
//     userId: instructor.id,
//   });

//   await db.insert(classStudents).values({
//     classId: class1.id,
//     userId: student.id,
//   });
//   console.log('✓ Assigned instructor and student to class');

//   await db.insert(classCourses).values([
//     { classId: class1.id, courseId: englishCourse.id },
//     { classId: class1.id, courseId: arabicCourse.id },
//     { classId: class1.id, courseId: codingCourse.id },
//   ]);
//   console.log('✓ Assigned courses to class');

//   console.log('\n✅ Seeding complete!');
//   console.log('\nTest accounts:');
//   console.log('Admin: admin@banan.com / password123');
//   console.log('Instructor: instructor@banan.com / password123');
//   console.log('Student: student@banan.com / password123');
// }

// seed().catch(console.error).finally(() => process.exit());


/** @format */
import { db } from '../server/db';
import {
  users,
  schools,
  schoolAdmins,
  courses,
  sections,
  lessons,
  classes,
  classStudents,
  classCourses,
  classInstructors,
  instructorPermissions,
  tests,
  testStudents,
  testInstructors,
  testResults,
  badges,
  userBadges,
} from '../shared/schema';
import { hashPassword } from '../lib/auth';

async function seed() {
  console.log('🌱 Seeding database...');

  const hashedPassword = await hashPassword('password123');

  // ===== USERS =====
  const [admin] = await db
    .insert(users)
    .values({
      name: 'Admin User',
      email: 'admin@banan.com',
      password: hashedPassword,
      role: 'admin',
    })
    .returning();
  const [billingAdmin] = await db
    .insert(users)
    .values({
      name: 'Billing Manager',
      email: 'billing@banan.com',
      password: hashedPassword,
      role: 'billing_admin',
    })
    .returning();
  const [instructor] = await db
    .insert(users)
    .values({
      name: 'John Instructor',
      email: 'instructor@banan.com',
      password: hashedPassword,
      role: 'instructor',
    })
    .returning();
  const [student1] = await db
    .insert(users)
    .values({
      name: 'Sara Student',
      email: 'student1@banan.com',
      password: hashedPassword,
      role: 'student',
      grade: 'Grade 5',
    })
    .returning();
  const [student2] = await db
    .insert(users)
    .values({
      name: 'Ali Student',
      email: 'student2@banan.com',
      password: hashedPassword,
      role: 'student',
      grade: 'Grade 6',
    })
    .returning();

  console.log('✓ Created users');

  // ===== SCHOOL =====
  const [school] = await db
    .insert(schools)
    .values({
      name: 'Banan Academy',
      country: 'Saudi Arabia',
      address: 'Riyadh, Kingdom of Saudi Arabia',
      phone: '+966-11-234-5678',
    })
    .returning();
  console.log('✓ Created school');

  // Assign school admin
  await db.insert(schoolAdmins).values({
    userId: admin.id,
    schoolId: school.id,
  });
  console.log('✓ Linked admin to school');

  // ===== INSTRUCTOR PERMISSIONS =====
  await db.insert(instructorPermissions).values({
    userId: instructor.id,
    canCrudStudents: true,
    canRenameDeleteClasses: true,
    canAccessAllStudents: true,
  });
  console.log('✓ Set instructor permissions');

  // ===== COURSES =====
  const [englishCourse] = await db
    .insert(courses)
    .values({
      name: 'Touch Typing Basics - English',
      description: 'Learn touch typing fundamentals with English keyboard',
      type: 'typing',
      language: 'en',
      grade: 'Grade 3',
      createdBy: instructor.id,
    })
    .returning();

  const [arabicCourse] = await db
    .insert(courses)
    .values({
      name: 'الكتابة باللمس - العربية',
      description: 'تعلم الكتابة باللمس باللغة العربية',
      type: 'typing',
      language: 'ar',
      grade: 'Grade 8',
      createdBy: instructor.id,
    })
    .returning();

  const [codingCourse] = await db
    .insert(courses)
    .values({
      name: 'Code Typing - JavaScript',
      description: 'Practice typing JavaScript code with syntax highlighting',
      type: 'coding',
      language: 'en',
      grade: 'Grade 12',
      createdBy: instructor.id,
    })
    .returning();

  console.log('✓ Created courses');

  // ===== SECTIONS & LESSONS =====
  const [englishSection] = await db
    .insert(sections)
    .values({
      courseId: englishCourse.id,
      name: 'Home Row Keys',
      order: 1,
    })
    .returning();

  await db.insert(lessons).values([
    {
      sectionId: englishSection.id,
      name: 'Lesson 1: A S D F',
      type: 'text',
      order: 1,
      text: 'asdf asdf fdsa fdsa asdf fdsa asdf fdsa',
      typingMode: 'duals_to_words',
      targetScore: 100,
      minAccuracy: 80,
      minSpeed: 20,
    },
    {
      sectionId: englishSection.id,
      name: 'Lesson 2: J K L ;',
      type: 'text',
      order: 2,
      text: 'jkl; jkl; ;lkj ;lkj jkl; ;lkj jkl; ;lkj',
      typingMode: 'duals_to_words',
      targetScore: 100,
      minAccuracy: 80,
      minSpeed: 20,
    },
  ]);

  const [arabicSection] = await db
    .insert(sections)
    .values({
      courseId: arabicCourse.id,
      name: 'الصف الأساسي',
      order: 1,
    })
    .returning();

  await db.insert(lessons).values([
    {
      sectionId: arabicSection.id,
      name: 'الدرس الأول: أ ب ت ث',
      type: 'text',
      order: 1,
      text: 'أبت أبت تبأ تبأ أبت تبأ أبت تبأ',
      typingMode: 'duals_to_words',
      targetScore: 100,
      minAccuracy: 80,
      minSpeed: 20,
    },
  ]);

  const [codingSection] = await db
    .insert(sections)
    .values({
      courseId: codingCourse.id,
      name: 'JavaScript Basics',
      order: 1,
    })
    .returning();

  await db.insert(lessons).values([
    {
      sectionId: codingSection.id,
      name: 'Variables and Functions',
      type: 'coding',
      order: 1,
      text: 'const greeting = "Hello World";\nfunction sayHello(name) {\n  return `Hello ${name}!`;\n}\nconsole.log(sayHello("Student"));',
      codeLanguage: 'javascript',
      typingMode: 'sentences',
      targetScore: 150,
      minAccuracy: 90,
      minSpeed: 30,
    },
  ]);

  console.log('✓ Created sections and lessons');

  // ===== CLASSES =====
  const [class1] = await db
    .insert(classes)
    .values({
      name: 'Grade 5 - Section A',
      description: 'Touch typing for Grade 5 students',
      grade: 'Grade 5',
      code: 'G5A-2025',
      schoolId: school.id,
    })
    .returning();

  const [class2] = await db
    .insert(classes)
    .values({
      name: 'Grade 6 - Section B',
      description: 'Intermediate typing practice',
      grade: 'Grade 6',
      code: 'G6B-2025',
      schoolId: school.id,
    })
    .returning();

  await db.insert(classInstructors).values([
    { classId: class1.id, userId: instructor.id },
    { classId: class2.id, userId: instructor.id },
  ]);

  await db.insert(classStudents).values([
    { classId: class1.id, userId: student1.id },
    { classId: class2.id, userId: student2.id },
  ]);

  await db.insert(classCourses).values([
    { classId: class1.id, courseId: englishCourse.id },
    { classId: class1.id, courseId: arabicCourse.id },
    { classId: class2.id, courseId: codingCourse.id },
  ]);

  console.log('✓ Linked instructors, students, and courses to classes');

  // ===== TESTS =====
  const [typingTest] = await db
    .insert(tests)
    .values({
      name: 'Typing Speed Evaluation',
      description: 'End of term typing speed and accuracy test',
      text: 'The quick brown fox jumps over the lazy dog.',
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      targetAudience: 'students',
      minAccuracy: 80,
      minSpeed: 30,
      createdBy: instructor.id,
    })
    .returning();

  await db.insert(testInstructors).values({
    testId: typingTest.id,
    userId: instructor.id,
  });

  await db.insert(testStudents).values([
    { testId: typingTest.id, userId: student1.id },
    { testId: typingTest.id, userId: student2.id },
  ]);

  await db.insert(testResults).values([
    {
      testId: typingTest.id,
      userId: student1.id,
      score: 95,
      speed: 32,
      accuracy: 85,
      passed: true,
    },
    {
      testId: typingTest.id,
      userId: student2.id,
      score: 80,
      speed: 28,
      accuracy: 78,
      passed: false,
    },
  ]);

  console.log('✓ Created test, assigned students, and recorded results');

  // ===== BADGES =====
  const [badge1] = await db
    .insert(badges)
    .values({
      name: 'Speed Star',
      description: 'Awarded for reaching 40 WPM typing speed',
      icon: '⭐',
    })
    .returning();

  await db.insert(userBadges).values({
    userId: student1.id,
    badgeId: badge1.id,
    assignedBy: instructor.id,
  });

  console.log('✓ Created badges and assigned to users');

  console.log('\n✅ Seeding complete!');
  console.log('\nTest accounts:');
  console.log('Admin: admin@banan.com / password123');
  console.log('Instructor: instructor@banan.com / password123');
  console.log('Student 1: student1@banan.com / password123');
  console.log('Student 2: student2@banan.com / password123');
}

seed()
  .catch(console.error)
  .finally(() => process.exit());

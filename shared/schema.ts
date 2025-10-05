import { pgTable, text, serial, integer, boolean, timestamp, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const userRoleEnum = pgEnum('user_role', ['admin', 'school_admin', 'billing_admin', 'instructor', 'student']);
export const lessonTypeEnum = pgEnum('lesson_type', ['text', 'coding']);
export const typingModeEnum = pgEnum('typing_mode', ['duals_to_words', 'duals_and_words', 'words_only', 'sentences']);
export const courseTypeEnum = pgEnum('course_type', ['typing', 'coding', 'game']);
export const languageEnum = pgEnum('language', ['ar', 'en']);
export const scoreboardVisibilityEnum = pgEnum('scoreboard_visibility', ['public', 'private', 'leaderboard']);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").unique().notNull(),
  studentId: text("student_id").unique(),
  password: text("password").notNull(),
  role: userRoleEnum("role").notNull().default('student'),
  grade: text("grade"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastLogin: timestamp("last_login"),
  lastActivity: timestamp("last_activity"),
});

export const instructorPermissions = pgTable("instructor_permissions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  canCrudStudents: boolean("can_crud_students").default(false),
  canRenameDeleteClasses: boolean("can_rename_delete_classes").default(false),
  canAccessAllStudents: boolean("can_access_all_students").default(false),
});

export const schools = pgTable("schools", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  country: text("country").notNull(),
  address: text("address").notNull(),
  phone: text("phone"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const schoolAdmins = pgTable("school_admins", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  schoolId: integer("school_id").notNull().references(() => schools.id, { onDelete: 'cascade' }),
  assignedAt: timestamp("assigned_at").defaultNow().notNull(),
});

export const classes = pgTable("classes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  grade: text("grade"),
  code: text("code").unique(),
  schoolId: integer("school_id").references(() => schools.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  
  startOfWeek: text("start_of_week").default('sunday'),
  minStarsToPass: integer("min_stars_to_pass").default(3),
  dailyGoal: integer("daily_goal").default(10),
  weeklyGoal: integer("weekly_goal").default(50),
  scoreboardVisibility: scoreboardVisibilityEnum("scoreboard_visibility").default('public'),
  
  disableBackspace: boolean("disable_backspace").default(false),
  blockOnError: boolean("block_on_error").default(false),
  lockVirtualKeyboard: boolean("lock_virtual_keyboard").default(false),
  lockLanguage: boolean("lock_language").default(false),
  lockHands: boolean("lock_hands").default(false),
  soundFx: boolean("sound_fx").default(true),
  voiceOver: boolean("voice_over").default(false),
  
  theme: text("theme").default('default'),
  font: text("font").default('default'),
  showReplayButton: boolean("show_replay_button").default(true),
  showLowercaseLetters: boolean("show_lowercase_letters").default(false),
});

export const classInstructors = pgTable("class_instructors", {
  id: serial("id").primaryKey(),
  classId: integer("class_id").notNull().references(() => classes.id, { onDelete: 'cascade' }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  assignedAt: timestamp("assigned_at").defaultNow().notNull(),
});

export const classStudents = pgTable("class_students", {
  id: serial("id").primaryKey(),
  classId: integer("class_id").notNull().references(() => classes.id, { onDelete: 'cascade' }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  enrolledAt: timestamp("enrolled_at").defaultNow().notNull(),
});

export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  type: courseTypeEnum("type").notNull().default('typing'),
  language: languageEnum("language").notNull().default('en'),
  gradeFrom: text("grade_from"),
  gradeTo: text("grade_to"),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const courseEditors = pgTable("course_editors", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id").notNull().references(() => courses.id, { onDelete: 'cascade' }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
});

export const classCourses = pgTable("class_courses", {
  id: serial("id").primaryKey(),
  classId: integer("class_id").notNull().references(() => classes.id, { onDelete: 'cascade' }),
  courseId: integer("course_id").notNull().references(() => courses.id, { onDelete: 'cascade' }),
  assignedAt: timestamp("assigned_at").defaultNow().notNull(),
  
  hasPrerequisite: boolean("has_prerequisite").default(false),
  speedAdjustment: integer("speed_adjustment").default(0),
  accuracyRequirement: integer("accuracy_requirement").default(0),
  lessonProgressLimit: integer("lesson_progress_limit"),
  hasPlacementTest: boolean("has_placement_test").default(false),
});

export const sections = pgTable("sections", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id").notNull().references(() => courses.id, { onDelete: 'cascade' }),
  name: text("name").notNull(),
  order: integer("order").notNull(),
});

export const lessons = pgTable("lessons", {
  id: serial("id").primaryKey(),
  sectionId: integer("section_id").notNull().references(() => sections.id, { onDelete: 'cascade' }),
  name: text("name").notNull(),
  type: lessonTypeEnum("type").notNull().default('text'),
  order: integer("order").notNull(),
  
  text: text("text").notNull(),
  altTexts: jsonb("alt_texts"),
  typingMode: typingModeEnum("typing_mode").default('sentences'),
  
  codeLanguage: text("code_language"),
  
  targetScore: integer("target_score"),
  timeLimit: integer("time_limit"),
  goalSpeed: integer("goal_speed"),
  minSpeed: integer("min_speed"),
  minAccuracy: integer("min_accuracy"),
  
  disableBackspace: boolean("disable_backspace").default(false),
  blockOnError: boolean("block_on_error").default(false),
  useMeaningfulWords: boolean("use_meaningful_words").default(true),
  isPlacementTest: boolean("is_placement_test").default(false),
  
  instructions: jsonb("instructions"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const lessonProgress = pgTable("lesson_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  lessonId: integer("lesson_id").notNull().references(() => lessons.id, { onDelete: 'cascade' }),
  
  completed: boolean("completed").default(false),
  score: integer("score").default(0),
  stars: integer("stars").default(0),
  speed: integer("speed").default(0),
  accuracy: integer("accuracy").default(0),
  timeSpent: integer("time_spent").default(0),
  attempts: integer("attempts").default(0),
  
  lastAttemptAt: timestamp("last_attempt_at"),
  completedAt: timestamp("completed_at"),
});

export const tests = pgTable("tests", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  text: text("text").notNull(),
  altTexts: jsonb("alt_texts"),
  
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  
  targetAudience: text("target_audience").notNull(),
  targetSchools: jsonb("target_schools"),
  targetStudents: jsonb("target_students"),
  
  attemptsAllowed: text("attempts_allowed").default('open'),
  attemptsCount: integer("attempts_count"),
  hasTimeLimit: boolean("has_time_limit").default(false),
  timeLimit: integer("time_limit"),
  
  passingCriteria: text("passing_criteria").default('everyone'),
  minAccuracy: integer("min_accuracy"),
  minSpeed: integer("min_speed"),
  
  showScore: boolean("show_score").default(true),
  speedGoal: integer("speed_goal"),
  maxScore: integer("max_score"),
  
  disableBackspace: boolean("disable_backspace").default(false),
  issueCertificate: boolean("issue_certificate").default(false),
  
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const testInstructors = pgTable("test_instructors", {
  id: serial("id").primaryKey(),
  testId: integer("test_id").notNull().references(() => tests.id, { onDelete: 'cascade' }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
});

export const testResults = pgTable("test_results", {
  id: serial("id").primaryKey(),
  testId: integer("test_id").notNull().references(() => tests.id, { onDelete: 'cascade' }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  score: integer("score").default(0),
  speed: integer("speed").default(0),
  accuracy: integer("accuracy").default(0),
  attempts: integer("attempts").default(0),
  completionTime: integer("completion_time"),
  passed: boolean("passed").default(false),
  certificateIssued: boolean("certificate_issued").default(false),
  
  completedAt: timestamp("completed_at"),
});

export const activityLog = pgTable("activity_log", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  entityType: text("entity_type").notNull(),
  entityId: integer("entity_id").notNull(),
  action: text("action").notNull(),
  description: text("description").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const badges = pgTable("badges", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  icon: text("icon"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userBadges = pgTable("user_badges", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  badgeId: integer("badge_id").notNull().references(() => badges.id, { onDelete: 'cascade' }),
  assignedBy: integer("assigned_by").references(() => users.id),
  assignedAt: timestamp("assigned_at").defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many, one }) => ({
  instructorPermissions: one(instructorPermissions),
  schoolAdmins: many(schoolAdmins),
  classInstructors: many(classInstructors),
  classStudents: many(classStudents),
  createdCourses: many(courses),
  courseEditors: many(courseEditors),
  lessonProgress: many(lessonProgress),
  createdTests: many(tests),
  testInstructors: many(testInstructors),
  testResults: many(testResults),
  activityLog: many(activityLog),
  userBadges: many(userBadges),
}));

export const schoolsRelations = relations(schools, ({ many }) => ({
  schoolAdmins: many(schoolAdmins),
  classes: many(classes),
}));

export const classesRelations = relations(classes, ({ one, many }) => ({
  school: one(schools, {
    fields: [classes.schoolId],
    references: [schools.id],
  }),
  classInstructors: many(classInstructors),
  classStudents: many(classStudents),
  classCourses: many(classCourses),
}));

export const coursesRelations = relations(courses, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [courses.createdBy],
    references: [users.id],
  }),
  courseEditors: many(courseEditors),
  classCourses: many(classCourses),
  sections: many(sections),
}));

export const sectionsRelations = relations(sections, ({ one, many }) => ({
  course: one(courses, {
    fields: [sections.courseId],
    references: [courses.id],
  }),
  lessons: many(lessons),
}));

export const lessonsRelations = relations(lessons, ({ one, many }) => ({
  section: one(sections, {
    fields: [lessons.sectionId],
    references: [sections.id],
  }),
  lessonProgress: many(lessonProgress),
}));

export const testsRelations = relations(tests, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [tests.createdBy],
    references: [users.id],
  }),
  testInstructors: many(testInstructors),
  testResults: many(testResults),
}));

export const genderEnum = pgEnum('gender', ['male', 'female']);

export const registrations = pgTable("registrations", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  gender: genderEnum("gender").notNull(),
  dateOfBirth: text("date_of_birth").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  currentTypingSpeed: integer("current_typing_speed"),
  desiredTypingSpeed: integer("desired_typing_speed"),
  additionalInfo: text("additional_info"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const contactMessages = pgTable("contact_messages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type School = typeof schools.$inferSelect;
export type InsertSchool = typeof schools.$inferInsert;
export type Class = typeof classes.$inferSelect;
export type InsertClass = typeof classes.$inferInsert;
export type Course = typeof courses.$inferSelect;
export type InsertCourse = typeof courses.$inferInsert;
export type Section = typeof sections.$inferSelect;
export type InsertSection = typeof sections.$inferInsert;
export type Lesson = typeof lessons.$inferSelect;
export type InsertLesson = typeof lessons.$inferInsert;
export type LessonProgress = typeof lessonProgress.$inferSelect;
export type InsertLessonProgress = typeof lessonProgress.$inferInsert;
export type Test = typeof tests.$inferSelect;
export type InsertTest = typeof tests.$inferInsert;
export type TestResult = typeof testResults.$inferSelect;
export type InsertTestResult = typeof testResults.$inferInsert;
export type Registration = typeof registrations.$inferSelect;
export type InsertRegistration = typeof registrations.$inferInsert;
export type ContactMessage = typeof contactMessages.$inferSelect;
export type InsertContactMessage = typeof contactMessages.$inferInsert;

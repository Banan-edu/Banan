# بَنان (Banan) - Multilingual Touch Typing Learning Platform

A comprehensive educational platform for teaching touch typing in multiple languages with real-time performance tracking.

## Overview

Banan is a Next.js-based educational platform that supports:
- **Multilingual typing practice** (Arabic & English)
- **Coding lessons** with syntax highlighting
- **Real-time performance tracking** (WPM, accuracy, time)
- **Zigzag course map** for progressive learning
- **Role-based access** (Admin, Instructor, Student)
- **PostgreSQL database** with Drizzle ORM

## Tech Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS 3
- **Backend**: Next.js API Routes, PostgreSQL
- **Authentication**: JWT with HTTP-only cookies
- **Database**: PostgreSQL with Drizzle ORM
- **Syntax Highlighting**: Prism.js
- **Icons**: Lucide React
- **Real-time**: Socket.IO (planned)

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── auth/         # Authentication endpoints
│   │   ├── student/      # Student-specific endpoints
│   │   ├── instructor/   # Instructor management APIs
│   │   │   ├── classes/  # Class CRUD operations
│   │   │   └── courses/  # Course and lesson management
│   │   └── admin/        # Admin management APIs
│   │       ├── schools/  # School management
│   │       └── users/    # User management (instructors/students)
│   ├── login/            # Login page
│   ├── student/          # Student portal
│   │   ├── course/[id]   # Course map with zigzag layout
│   │   └── lesson/[id]   # Typing practice component
│   ├── instructor/       # Instructor portal
│   │   ├── classes/      # Class management dashboard
│   │   └── courses/      # Course and lesson editor
│   └── admin/            # Admin portal
│       ├── schools/      # School management interface
│       ├── instructors/  # Instructor management
│       └── students/     # Student management
├── server/                # Server utilities
│   └── db.ts             # Database connection
├── shared/               # Shared types and schemas
│   └── schema.ts         # Drizzle database schema
├── lib/                  # Utilities
│   └── auth.ts           # Authentication helpers
└── scripts/              # Utility scripts
    └── seed.ts           # Database seeding

```

## Database Schema

The platform includes comprehensive tables for:
- **Users** with role-based permissions (admin, instructor, student)
- **Schools** and school administrators
- **Classes** with settings (goals, typing restrictions, UI preferences)
- **Courses** with multilingual support
- **Sections** and **Lessons** (text and coding types)
- **Lesson Progress** tracking
- **Tests** with scheduling and automated grading
- **Activity Logs** for tracking user actions

## Features Implemented

### Authentication & Authorization
- JWT-based authentication with HTTP-only cookies
- Role-based access control (5 user roles)
- Protected routes for different user types

### Student Features
- Course listing with assigned courses
- Zigzag lesson map (alternating left-right layout)
- Real-time typing practice with:
  - Live WPM calculation
  - Accuracy percentage
  - Character-by-character feedback
  - Green (correct) / Red (incorrect) highlighting
- Lesson progress tracking with stars and scores
- Support for text and coding lessons
- Syntax highlighting for coding practice

### Instructor Features
- **Class Management Dashboard** (`/instructor/classes`)
  - View all assigned classes with student counts
  - Create new classes with name and description
  - View assigned courses per class
  - Multi-class support with proper join table (classInstructors)

- **Course Management** (`/instructor/courses`)
  - View all created and editable courses
  - Create new courses with title, description, and language
  - Course statistics: sections and lessons count
  - Multi-course support with courseEditors join table

- **Course Detail & Lesson Editor** (`/instructor/courses/[id]`)
  - Organize courses into sections
  - Create text and coding lessons
  - Specify programming language for coding lessons
  - Lesson content editor with proper formatting
  - Authorization: only creators and editors can access

### Admin Features
- **School Management** (`/admin/schools`)
  - View all schools in the platform
  - Create new schools with name, country, address, phone
  - View instructor count per school
  - Full CRUD operations

- **Instructor Management** (`/admin/instructors`)
  - View all instructors
  - Create new instructor accounts
  - Assign instructors to schools
  - Monitor instructor activity

- **Student Management** (`/admin/students`)
  - View all students
  - Create new student accounts
  - Full user management capabilities

## Test Accounts

```
Admin:
Email: admin@banan.com
Password: password123

Instructor:
Email: instructor@banan.com
Password: password123

Student:
Email: student@banan.com
Password: password123
```

## Development

### Running the App
```bash
npm run dev
```

### Database Commands
```bash
# Push schema changes
npm run db:push

# Open Drizzle Studio
npm run db:studio

# Seed database with test data
npm run seed
```

## Course Types

### Text Lessons
- Progressive typing modes: duals-to-words, words-only, sentences
- Customizable speed and accuracy goals
- Performance tracking

### Coding Lessons
- Syntax highlighting for multiple languages
- Real code snippets for practice
- Language-specific formatting

## Next Phase Features

1. **Analytics Dashboard**
   - Practice trends and activity calendars
   - Performance history charts
   - Punchcard activity visualization

2. **Badge System**
   - Achievement tracking
   - Badge assignment by instructors

3. **Billing Module**
   - Role-based billing access
   - Instructor payments
   - School subscriptions

4. **Test System Enhancement**
   - Certificate generation
   - Advanced test scheduling
   - Automated result processing

5. **Real-time Features**
   - Socket.IO integration for live activity feeds
   - Class leaderboards
   - Real-time performance updates

6. **Language Support**
   - Complete Arabic RTL layout
   - Language switcher
   - Multilingual UI

## Recent Changes (October 2025)

### Public Landing Page Complete ✅ (October 5, 2025)
- Built complete bilingual landing page (Arabic/English)
- Implemented LanguageProvider with RTL/LTR support
- Created all required components:
  - Header with navigation and language toggle
  - HeroSection with CTA buttons and stats
  - FeaturesSection with 6 feature cards
  - LearningJourney with 4-step path
  - TypingDemo with animated preview
  - CoursesSection with course cards
  - PricingSection with first cohort offer (500 SAR / 50% off)
  - ContactSection with contact form
  - Footer with social links
  - EarlyBirdPopup (appears after 3 seconds)
  - RegistrationForm modal
- Added registrations and contactMessages database tables
- Created /api/register and /api/contact endpoints
- Fixed LanguageProvider context with client wrapper (providers.tsx)

### Instructor Portal Complete ✅
- Built complete class management with multi-class support
- Built course creation and editing system
- Built section and lesson management
- Fixed authorization bugs: using inArray() for multi-item queries
- Added course ownership verification (creator + editor support)

### Admin Portal Complete ✅
- Built school management with proper schema fields
- Built instructor management with school assignment
- Built student management interface
- All CRUD operations functional and secure

### Bug Fixes & Security
- Fixed WebSocket configuration (bufferUtil error) with conditional loading
- Fixed Drizzle ORM queries to use proper join tables
- Fixed authorization: verify enrollment/ownership before access
- Fixed class/course listings to return ALL items (not just first)
- All routes properly validate user roles and permissions

### Earlier Changes
- Initial platform setup with Next.js and PostgreSQL
- Comprehensive database schema with all entities
- Authentication system with JWT and cookies
- Student course map with zigzag layout
- Typing practice component with real-time tracking
- Syntax highlighting for coding lessons
- Seed data for immediate testing

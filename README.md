
# بَنان (Banan) - Multilingual Touch Typing Learning Platform

<div align="center">

![Banan Logo](public/assets/logo.svg)

A comprehensive educational platform for teaching touch typing in Arabic and English with AI-powered learning paths, real-time performance tracking, and role-based management.

[Features](#features) • [Tech Stack](#tech-stack) • [Getting Started](#getting-started) • [Project Structure](#project-structure) • [API Reference](#api-reference)

</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Setup](#environment-setup)
  - [Database Setup](#database-setup)
  - [Running Locally](#running-locally)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [Authentication](#authentication)
- [User Roles & Permissions](#user-roles--permissions)
- [API Routes](#api-routes)
- [Test Accounts](#test-accounts)
- [Development Workflow](#development-workflow)
- [Deployment](#deployment)

---

## 🎯 Overview

Banan is a Next.js-based educational platform designed for teaching touch typing skills in both Arabic and English languages. The platform features:

- **Multilingual Support**: Full Arabic RTL and English LTR support
- **Role-Based Access**: Admin, Instructor, and Student portals
- **Real-Time Tracking**: Live WPM, accuracy, and progress monitoring
- **Adaptive Learning**: AI-powered lesson progression
- **Institutional Management**: School, class, and course management
- **Interactive Practice**: Text and coding typing lessons with syntax highlighting

---

## ✨ Features

### 🎓 Student Features
- Course enrollment and progress tracking
- Zigzag lesson map with visual progression
- Real-time typing practice with:
  - Live WPM (Words Per Minute) calculation
  - Accuracy percentage tracking
  - Character-by-character feedback
  - Color-coded error highlighting
- Support for text and coding lessons
- Syntax highlighting for programming practice
- Star-based achievement system

### 👨‍🏫 Instructor Features
- **Class Management**
  - Create and manage multiple classes
  - View student enrollment and progress
  - Assign courses to classes
- **Course Creation**
  - Design courses with sections and lessons
  - Create text and coding lessons
  - Set learning goals and difficulty levels
  - Multi-language content support
- **Performance Monitoring**
  - Track student progress
  - View class statistics
  - Generate performance reports

### 🔧 Admin Features
- **School Management**
  - Create and manage schools
  - Assign school administrators
  - View institutional statistics
- **User Management**
  - Create instructor and student accounts
  - Assign users to schools
  - Monitor platform activity
- **System Configuration**
  - Platform-wide settings
  - Content moderation
  - Access control

### 🌍 Landing Page Features
- Bilingual interface (Arabic/English)
- Interactive typing demo
- Course information
- Registration system
- Contact form
- Institutional pricing

---

## 🛠 Tech Stack

### Frontend
- **Framework**: Next.js 15 with React 19
- **Styling**: Tailwind CSS 3
- **UI Components**: Custom component library
- **Icons**: Lucide React
- **Syntax Highlighting**: Prism.js
- **State Management**: React Context API

### Backend
- **Runtime**: Node.js 20
- **API**: Next.js API Routes
- **Database**: PostgreSQL with Neon serverless
- **ORM**: Drizzle ORM
- **Authentication**: JWT with HTTP-only cookies
- **Password Hashing**: bcryptjs

### Development Tools
- **Language**: TypeScript
- **Package Manager**: npm
- **Database Tools**: Drizzle Kit
- **Linting**: ESLint

---

## 🚀 Getting Started

### Prerequisites

Before running this project locally, ensure you have:

- Node.js 20 or higher
- PostgreSQL database (local or hosted)
- npm or yarn package manager

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd banan-platform
```

2. **Install dependencies**
```bash
npm install
```

### Environment Setup

Create a `.env.local` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require"

# JWT Secret (generate a secure random string)
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
```

**Important**: Replace the `DATABASE_URL` with your actual PostgreSQL connection string.

### Database Setup

1. **Push the schema to your database**
```bash
npm run db:push
```

2. **Seed the database with test data**
```bash
npm run seed
```

This will create:
- Admin, Instructor, and Student test accounts
- Sample school
- Sample courses (English, Arabic, and Coding)
- Sample lessons and sections
- Test class with enrollments

3. **Optional: Open Drizzle Studio** (database management UI)
```bash
npm run db:studio
```

### Running Locally

Start the development server:

```bash
npm run dev
```

The application will be available at:
- **Local**: `http://localhost:5000`
- **Network**: `http://<your-ip>:5000`

---

## 📁 Project Structure

```
banan-platform/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── auth/                 # Authentication endpoints
│   │   │   ├── login/           # Login endpoint
│   │   │   ├── logout/          # Logout endpoint
│   │   │   └── me/              # Current user endpoint
│   │   ├── student/             # Student-specific APIs
│   │   │   ├── courses/         # Get enrolled courses
│   │   │   ├── course/[id]/     # Course details
│   │   │   └── lesson/[id]/     # Lesson practice & progress
│   │   ├── instructor/          # Instructor APIs
│   │   │   ├── classes/         # Class CRUD operations
│   │   │   ├── courses/         # Course management
│   │   │   └── schools/         # School management
│   │   ├── admin/               # Admin APIs
│   │   │   ├── schools/         # School administration
│   │   │   └── users/           # User management
│   │   ├── register/            # Public registration
│   │   └── contact/             # Contact form
│   ├── login/                   # Login page
│   ├── student/                 # Student portal
│   │   ├── course/[id]/        # Course map view
│   │   └── lesson/[id]/        # Typing practice
│   ├── instructor/              # Instructor portal
│   │   ├── classes/            # Class management
│   │   ├── courses/            # Course editor
│   │   └── school/             # School management
│   ├── admin/                   # Admin portal
│   │   ├── schools/            # School management
│   │   ├── instructors/        # Instructor management
│   │   └── students/           # Student management
│   ├── contexts/               # React Contexts
│   │   └── LanguageContext.tsx # i18n & RTL/LTR
│   ├── globals.css             # Global styles
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Landing page
│   └── providers.tsx           # Context providers
├── components/                  # Reusable components
│   ├── schools/                # School components
│   ├── ui/                     # UI primitives
│   ├── Header.tsx              # Navigation header
│   ├── Footer.tsx              # Footer
│   ├── Sidebar.tsx             # Dashboard sidebar
│   └── [LandingComponents].tsx # Landing page sections
├── lib/                         # Utilities
│   ├── auth.ts                 # Auth helpers (JWT, cookies)
│   ├── queryClient.ts          # API client
│   └── useToast.ts            # Toast notifications
├── hooks/                       # Custom React hooks
│   └── use-toast.ts
├── server/                      # Server utilities
│   └── db.ts                   # Database connection
├── shared/                      # Shared code
│   └── schema.ts               # Drizzle ORM schema
├── scripts/                     # Utility scripts
│   └── seed.ts                 # Database seeding
├── public/                      # Static assets
│   ├── assets/                 # SVG assets
│   └── images/                 # Images
├── drizzle.config.ts           # Drizzle configuration
├── next.config.js              # Next.js configuration
├── tailwind.config.ts          # Tailwind configuration
└── tsconfig.json               # TypeScript configuration
```

---

## 🗄 Database Schema

### Core Entities

#### Users
- **Role-based**: admin, school_admin, instructor, student, parent
- Fields: name, email, password (hashed), role, grade, lastLogin
- Relationships: classes, courses, schools

#### Schools
- Fields: name, country, address, phone, createdAt
- Relationships: admins, instructors, students, classes

#### Courses
- Fields: name, description, type (typing/coding), language (ar/en)
- Relationships: sections, lessons, classes, creator, editors

#### Classes
- Fields: name, description, grade, code, settings
- Relationships: school, instructors, students, courses

#### Lessons
- Fields: name, type (text/coding), order, content, metrics
- Relationships: section, progress records

#### Progress Tracking
- Tables: lessonProgress, activityLog
- Metrics: WPM, accuracy, time, stars, score

### Join Tables
- classStudents (many-to-many: classes ↔ students)
- classInstructors (many-to-many: classes ↔ instructors)
- classCourses (many-to-many: classes ↔ courses)
- courseEditors (many-to-many: courses ↔ instructors)

---

## 🔐 Authentication

### JWT Authentication Flow

1. **Login** (`POST /api/auth/login`)
   - Validates email/password
   - Generates JWT token
   - Sets HTTP-only cookie (`auth_token`)
   - Returns user data

2. **Token Verification**
   - Middleware reads `auth_token` cookie
   - Verifies JWT signature
   - Extracts user information

3. **Logout** (`POST /api/auth/logout`)
   - Clears `auth_token` cookie
   - Redirects to login

### Protected Routes
```typescript
// Example: Verify user in API route
import { verifyAuth } from '@/lib/auth';

const user = await verifyAuth(request);
if (!user) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

---

## 👥 User Roles & Permissions

| Role | Permissions |
|------|------------|
| **Admin** | Full system access, manage schools, users, platform settings |
| **School Admin** | Manage school, instructors, students within their school |
| **Instructor** | Create courses, manage classes, view student progress |
| **Student** | Access assigned courses, practice lessons, view progress |
| **Parent** | View child's progress (planned feature) |

---

## 🔌 API Routes

### Authentication
```
POST   /api/auth/login          # User login
POST   /api/auth/logout         # User logout
GET    /api/auth/me             # Get current user
```

### Student APIs
```
GET    /api/student/courses                    # Get enrolled courses
GET    /api/student/course/[id]                # Get course details
GET    /api/student/lesson/[id]                # Get lesson content
POST   /api/student/lesson/[id]                # Submit lesson progress
```

### Instructor APIs
```
GET    /api/instructor/classes                 # List instructor's classes
POST   /api/instructor/classes                 # Create new class
GET    /api/instructor/courses                 # List courses
POST   /api/instructor/courses                 # Create course
GET    /api/instructor/courses/[id]            # Get course details
POST   /api/instructor/courses/[id]/sections   # Add section
POST   /api/instructor/courses/[id]/lessons    # Add lesson
GET    /api/instructor/schools                 # List schools
POST   /api/instructor/schools/create          # Create school
```

### Admin APIs
```
GET    /api/admin/schools                      # List all schools
POST   /api/admin/schools                      # Create school
GET    /api/admin/users                        # List users
POST   /api/admin/users                        # Create user
```

### Public APIs
```
POST   /api/register                           # Student registration
POST   /api/contact                            # Contact form submission
```

---

## 🧪 Test Accounts

After running the seed script, you can log in with:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@banan.com | password123 |
| Instructor | instructor@banan.com | password123 |
| Student | student@banan.com | password123 |

---

## 💻 Development Workflow

### Available Scripts

```bash
# Development
npm run dev              # Start dev server on port 5000
npm run build           # Build for production
npm start               # Start production server

# Database
npm run db:push         # Push schema changes to database
npm run db:studio       # Open Drizzle Studio (database UI)
npm run seed            # Seed database with test data

# Code Quality
npm run lint            # Run ESLint
```

### Adding New Features

1. **Database Changes**
   - Update `shared/schema.ts`
   - Run `npm run db:push`

2. **API Endpoints**
   - Create route in `app/api/`
   - Add authentication checks
   - Implement business logic

3. **UI Components**
   - Create in `components/`
   - Use Tailwind CSS for styling
   - Integrate with LanguageContext for i18n

4. **Testing**
   - Test with provided test accounts
   - Verify role-based access
   - Check responsive design

---

## 🚀 Deployment

### Deploying on Replit

1. **Ensure environment variables are set**
   - Use Replit Secrets for `DATABASE_URL` and `JWT_SECRET`

2. **The platform is pre-configured to run on Replit**
   - Port 5000 is automatically forwarded
   - Server starts with `npm run dev`

3. **Database Setup**
   - Run `npm run db:push` in Replit Shell
   - Run `npm run seed` to create test data

4. **Access Your App**
   - Click the webview or use the provided URL
   - Your app is live!

### Production Considerations

- Use strong `JWT_SECRET` (32+ characters)
- Enable HTTPS (handled by Replit)
- Set up proper database backups
- Configure CORS for API endpoints
- Implement rate limiting
- Add monitoring and error tracking

---

## 🌐 Internationalization

The platform supports:
- **Arabic (RTL)**: Full right-to-left layout
- **English (LTR)**: Standard left-to-right layout

Language switching:
```typescript
import { useLanguage } from '@/app/contexts/LanguageContext';

const { language, setLanguage, t, isRTL } = useLanguage();

// Get translated text
const title = t('nav-home');

// Toggle language
setLanguage(language === 'ar' ? 'en' : 'ar');
```

---

## 📝 License

All Rights Reserved © 2025 Banan - Educational Platform

---

## 🤝 Contributing

This is a proprietary educational platform. For inquiries about contributing or licensing, please contact the development team.

---

## 📞 Support

For technical support or questions:
- Email: support@banan.com
- Website: [Coming Soon]

---

**Built with ❤️ for Arabic and English learners**

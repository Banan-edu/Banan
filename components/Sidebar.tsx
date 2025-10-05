'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { 
  Home, 
  BookOpen, 
  BarChart3, 
  Users, 
  Award, 
  Settings,
  GraduationCap,
  Target,
  Calendar
} from 'lucide-react';

export type SidebarLink = {
  href: string;
  labelAr: string;
  labelEn: string;
  icon: React.ReactNode;
};

type SidebarProps = {
  links: SidebarLink[];
  userRole: 'student' | 'instructor' | 'admin';
};

export function Sidebar({ links, userRole }: SidebarProps) {
  const pathname = usePathname();
  const { isRTL } = useLanguage();

  return (
    <aside className={`w-64 bg-white border-gray-200 ${isRTL ? 'border-l' : 'border-r'} h-screen sticky top-0 flex flex-col`}>
      <div className="p-6 border-b border-gray-200">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl font-bold text-blue-600">بنان</span>
        </Link>
        <p className={`text-sm text-gray-600 mt-2 ${isRTL ? 'text-right' : 'text-left'}`}>
          {userRole === 'student' && (isRTL ? 'طالب' : 'Student')}
          {userRole === 'instructor' && (isRTL ? 'معلم' : 'Instructor')}
          {userRole === 'admin' && (isRTL ? 'مدير' : 'Admin')}
        </p>
      </div>

      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-2">
          {links.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 font-semibold'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                  } ${isRTL ? 'flex-row-reverse' : ''}`}
                >
                  <span className="flex-shrink-0">{link.icon}</span>
                  <span className={isRTL ? 'font-arabic' : ''}>
                    {isRTL ? link.labelAr : link.labelEn}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-200">
        <Link
          href="/login"
          className={`flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors ${
            isRTL ? 'flex-row-reverse' : ''
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span className={isRTL ? 'font-arabic' : ''}>
            {isRTL ? 'تسجيل الخروج' : 'Logout'}
          </span>
        </Link>
      </div>
    </aside>
  );
}

export const studentLinks: SidebarLink[] = [
  {
    href: '/student',
    labelAr: 'الرئيسية',
    labelEn: 'Home',
    icon: <Home className="w-5 h-5" />
  },
  {
    href: '/student/courses',
    labelAr: 'الدورات',
    labelEn: 'Courses',
    icon: <BookOpen className="w-5 h-5" />
  },
  {
    href: '/student/analytics',
    labelAr: 'التحليلات',
    labelEn: 'Analytics',
    icon: <BarChart3 className="w-5 h-5" />
  },
  {
    href: '/student/goals',
    labelAr: 'الأهداف',
    labelEn: 'Goals',
    icon: <Target className="w-5 h-5" />
  },
  {
    href: '/student/badges',
    labelAr: 'الشارات',
    labelEn: 'Badges',
    icon: <Award className="w-5 h-5" />
  },
  {
    href: '/student/settings',
    labelAr: 'الإعدادات',
    labelEn: 'Settings',
    icon: <Settings className="w-5 h-5" />
  }
];

export const instructorLinks: SidebarLink[] = [
  {
    href: '/instructor',
    labelAr: 'الرئيسية',
    labelEn: 'Home',
    icon: <Home className="w-5 h-5" />
  },
  {
    href: '/instructor/classes',
    labelAr: 'الصفوف',
    labelEn: 'Classes',
    icon: <Users className="w-5 h-5" />
  },
  {
    href: '/instructor/courses',
    labelAr: 'الدورات',
    labelEn: 'Courses',
    icon: <BookOpen className="w-5 h-5" />
  },
  {
    href: '/instructor/analytics',
    labelAr: 'التحليلات',
    labelEn: 'Analytics',
    icon: <BarChart3 className="w-5 h-5" />
  },
  {
    href: '/instructor/students',
    labelAr: 'الطلاب',
    labelEn: 'Students',
    icon: <GraduationCap className="w-5 h-5" />
  },
  {
    href: '/instructor/schedule',
    labelAr: 'الجدول',
    labelEn: 'Schedule',
    icon: <Calendar className="w-5 h-5" />
  },
  {
    href: '/instructor/settings',
    labelAr: 'الإعدادات',
    labelEn: 'Settings',
    icon: <Settings className="w-5 h-5" />
  }
];

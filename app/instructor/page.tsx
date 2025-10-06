'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar, instructorLinks } from '@/components/Sidebar';
import { useLanguage } from '@/app/contexts/LanguageContext';

export default function InstructorDashboard() {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({ classes: 0, students: 0, courses: 0 });
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { isRTL } = useLanguage();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) {
          router.push('/login');
          return;
        }
        const data = await res.json();
        setUser(data.user);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className={`flex min-h-screen bg-gray-50`}>
      <Sidebar links={instructorLinks} userRole="instructor" />

      <main className="flex-1 px-8 py-8">
        <h2 className={`text-3xl font-bold text-gray-900 mb-8 ${isRTL ? 'text-right font-arabic' : ''}`}>
          {isRTL ? 'لوحة التحكم' : 'Dashboard'}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className={`text-gray-500 text-sm mb-2 ${isRTL ? 'text-right font-arabic' : ''}`}>
              {isRTL ? 'إجمالي الصفوف' : 'Total Classes'}
            </div>
            <div className={`text-3xl font-bold text-blue-600 ${isRTL ? 'text-right' : ''}`}>
              {stats.classes}
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className={`text-gray-500 text-sm mb-2 ${isRTL ? 'text-right font-arabic' : ''}`}>
              {isRTL ? 'إجمالي الطلاب' : 'Total Students'}
            </div>
            <div className={`text-3xl font-bold text-green-600 ${isRTL ? 'text-right' : ''}`}>
              {stats.students}
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className={`text-gray-500 text-sm mb-2 ${isRTL ? 'text-right font-arabic' : ''}`}>
              {isRTL ? 'إجمالي الدورات' : 'Total Courses'}
            </div>
            <div className={`text-3xl font-bold text-purple-600 ${isRTL ? 'text-right' : ''}`}>
              {stats.courses}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button
            onClick={() => router.push('/instructor/classes')}
            className={`bg-white rounded-xl shadow-md p-8 hover:shadow-xl transition-shadow ${isRTL ? 'text-right' : 'text-left'}`}
          >
            <h3 className={`text-xl font-semibold text-gray-900 mb-2 ${isRTL ? 'font-arabic' : ''}`}>
              {isRTL ? 'إدارة الصفوف' : 'Manage Classes'}
            </h3>
            <p className={`text-gray-600 ${isRTL ? 'font-arabic' : ''}`}>
              {isRTL ? 'إنشاء وإدارة الصفوف الخاصة بك' : 'Create and manage your classes'}
            </p>
          </button>
          
          <button
            onClick={() => router.push('/instructor/courses')}
            className={`bg-white rounded-xl shadow-md p-8 hover:shadow-xl transition-shadow ${isRTL ? 'text-right' : 'text-left'}`}
          >
            <h3 className={`text-xl font-semibold text-gray-900 mb-2 ${isRTL ? 'font-arabic' : ''}`}>
              {isRTL ? 'إدارة الدورات' : 'Manage Courses'}
            </h3>
            <p className={`text-gray-600 ${isRTL ? 'font-arabic' : ''}`}>
              {isRTL ? 'إنشاء وتحرير الدورات والدروس' : 'Create and edit courses and lessons'}
            </p>
          </button>
        </div>
      </main>
    </div>
  );
}

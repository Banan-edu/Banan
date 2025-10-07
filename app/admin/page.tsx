'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar, adminLinks } from '@/components/Sidebar';
import { useLanguage } from '@/app/contexts/LanguageContext';

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null);
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
    <div className={`flex daysH min-h-screen bg-gray-50`}>
      <Sidebar links={adminLinks} userRole="admin" />

      <main className="flex-1 px-8 py-8">
        <h2 className={`text-3xl font-bold text-gray-900 mb-8 ${isRTL ? 'text-right font-arabic' : ''}`}>
          {isRTL ? 'لوحة تحكم المدير' : 'Admin Dashboard'}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <button 
            onClick={() => router.push('/admin/schools')}
            className={`bg-white rounded-xl shadow-md p-8 hover:shadow-xl transition-shadow ${isRTL ? 'text-right' : 'text-left'}`}
          >
            <h3 className={`text-xl font-semibold text-gray-900 mb-2 ${isRTL ? 'font-arabic' : ''}`}>
              {isRTL ? 'المدارس' : 'Schools'}
            </h3>
            <p className={`text-gray-600 ${isRTL ? 'font-arabic' : ''}`}>
              {isRTL ? 'إدارة المدارس والمسؤولين' : 'Manage schools and administrators'}
            </p>
          </button>
          
          <button 
            onClick={() => router.push('/admin/instructors')}
            className={`bg-white rounded-xl shadow-md p-8 hover:shadow-xl transition-shadow ${isRTL ? 'text-right' : 'text-left'}`}
          >
            <h3 className={`text-xl font-semibold text-gray-900 mb-2 ${isRTL ? 'font-arabic' : ''}`}>
              {isRTL ? 'المعلمون' : 'Instructors'}
            </h3>
            <p className={`text-gray-600 ${isRTL ? 'font-arabic' : ''}`}>
              {isRTL ? 'إدارة حسابات المعلمين والصلاحيات' : 'Manage instructor accounts and permissions'}
            </p>
          </button>
          
          <button 
            onClick={() => router.push('/admin/students')}
            className={`bg-white rounded-xl shadow-md p-8 hover:shadow-xl transition-shadow ${isRTL ? 'text-right' : 'text-left'}`}
          >
            <h3 className={`text-xl font-semibold text-gray-900 mb-2 ${isRTL ? 'font-arabic' : ''}`}>
              {isRTL ? 'الطلاب' : 'Students'}
            </h3>
            <p className={`text-gray-600 ${isRTL ? 'font-arabic' : ''}`}>
              {isRTL ? 'إدارة حسابات الطلاب والتقدم' : 'Manage student accounts and progress'}
            </p>
          </button>
        </div>
      </main>
    </div>
  );
}

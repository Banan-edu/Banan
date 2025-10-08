'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar, adminLinks } from '@/components/Sidebar';
import { useLanguage } from '@/app/contexts/LanguageContext';
import SchoolsTable from '@/components/schools/SchoolsTable';

export default function SchoolsPage() {
  const [loading, setLoading] = useState(true);
  const [Role, setRole] = useState('school_admin');
  const router = useRouter();
  const { isRTL } = useLanguage();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) {
          router.push('/login');
          return;
        }
        const data = await res.json();
        setRole(data.user.role)
        if (data.user.role !== 'admin' && data.user.role !== 'school_admin') {
          router.push('/');
          return;
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
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
        <div className={`mb-8 ${isRTL ? 'text-right' : 'text-left'}`}>
          <h1 className={`text-3xl font-bold text-gray-900 ${isRTL ? 'font-arabic' : ''}`}>
            {isRTL ? 'إدارة المدارس' : 'Schools Management'}
          </h1>
          <p className={`text-gray-600 mt-2 ${isRTL ? 'font-arabic' : ''}`}>
            {isRTL ? 'إدارة المدارس والمسؤولين والإحصائيات' : 'Manage schools, administrators, and statistics'}
          </p>
        </div>

        <SchoolsTable showDelete={Role === 'admin' ? true:false} />
      </main>
    </div>
  );
}

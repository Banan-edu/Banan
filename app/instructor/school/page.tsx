'use client';

import { useRouter } from 'next/navigation';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { Sidebar, instructorLinks } from '@/components/Sidebar';
import SchoolsTable from '@/components/schools/SchoolsTable';
import { Plus } from 'lucide-react';

export default function InstructorSchoolsPage() {
  const { isRTL } = useLanguage();
  const router = useRouter();

  const handleSchoolClick = (schoolId: number) => {
    router.push(`/instructor/schools/${schoolId}`);
  };

  return (
    <div className={`flex ${isRTL ? 'flex-row-reverse' : ''} min-h-screen bg-gray-50`}>
      <Sidebar links={instructorLinks} userRole="instructor" />

      <main className="flex-1 px-8 py-8">
        <div className={`mb-8 flex items-start justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className={isRTL ? 'text-right' : 'text-left'}>
            <h1 className={`text-3xl font-bold text-gray-900 ${isRTL ? 'font-arabic' : ''}`}>
              {isRTL ? 'المدارس' : 'Schools'}
            </h1>
            <p className={`text-gray-600 mt-2 ${isRTL ? 'font-arabic' : ''}`}>
              {isRTL ? 'إدارة المدارس التي تدرّس فيها' : 'Manage schools where you teach'}
            </p>
          </div>
          
          <button
            onClick={() => router.push('/instructor/school/add')}
            className={`bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 ${isRTL ? 'flex-row-reverse font-arabic' : ''}`}
          >
            <Plus className="w-5 h-5" />
            {isRTL ? 'إضافة مدرسة' : 'Add School'}
          </button>
        </div>

        <SchoolsTable 
          apiEndpoint="/api/instructor/schools"
          hideAddButton={true}
          onRowClick={handleSchoolClick}
        />
      </main>
    </div>
  );
}

'use client';

import { useRouter } from 'next/navigation';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { Sidebar, instructorLinks } from '@/components/Sidebar';
import { Plus } from 'lucide-react';
import StudentsTable from '@/components/students/StudentsTable';

export default function InstructorStudentsPage() {
    const { isRTL } = useLanguage();
    const router = useRouter();

    const handleStudentClick = (studentId: number) => {
        router.push(`/instructor/students/${studentId}`);
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar links={instructorLinks} userRole="instructor" />

            <main className="flex-1 px-8 py-8">
                <div className="mb-8 flex items-start justify-between">
                    <div className={isRTL ? 'text-right' : 'text-left'}>
                        <h1 className={`text-3xl font-bold text-gray-900 schools`}>
                            {isRTL ? 'الطلاب' : 'Students'}
                        </h1>
                        <p className={`text-gray-600 mt-2 schools`}>
                            {isRTL
                                ? 'إدارة الطلاب المسجلين في مدارسك'
                                : 'Manage students enrolled in your schools'}
                        </p>
                    </div>

                    <button
                        onClick={() => router.push('/instructor/students/add')}
                        className={`bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 ${isRTL ? 'flex-row-reverse font-arabic' : ''}`}
                    >
                        <Plus className="w-5 h-5" />
                        {isRTL ? 'إضافة طالب' : 'Add Student'}
                    </button>
                </div>

                <StudentsTable
                    apiEndpoint="/api/instructor/students"
                    hideAddButton={true}
                    onRowClick={handleStudentClick}
                />
            </main>
        </div>
    );
}

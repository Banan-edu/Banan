'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { Sidebar, instructorLinks } from '@/components/Sidebar';
import { Plus, ChevronDown, UserPlus, Upload } from 'lucide-react';
import StudentsTable from '@/components/students/StudentsTable';

export default function InstructorStudentsPage() {
    const { isRTL } = useLanguage();
    const router = useRouter();
    const [showAddMenu, setShowAddMenu] = useState(false);

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

                    <div className="relative">
                        <button
                            onClick={() => setShowAddMenu(!showAddMenu)}
                            className={`bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 ${isRTL ? 'flex-row-reverse font-arabic' : ''}`}
                        >
                            <Plus className="w-5 h-5" />
                            {isRTL ? 'إضافة طالب' : 'Add Student'}
                            <ChevronDown className="w-4 h-4" />
                        </button>

                        {showAddMenu && (
                            <div className={`absolute ${isRTL ? 'left-0' : 'right-0'} mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-10`}>
                                <button
                                    onClick={() => {
                                        setShowAddMenu(false);
                                        router.push('/instructor/students/add');
                                    }}
                                    className={`w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 border-b border-gray-100 ${isRTL ? 'flex-row-reverse text-right font-arabic' : ''}`}
                                >
                                    <UserPlus className="w-5 h-5 text-blue-600" />
                                    <div>
                                        <div className="font-medium text-gray-900">
                                            {isRTL ? 'إضافة طالب واحد' : 'Add One Student'}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {isRTL ? 'إضافة طالب يدوياً' : 'Add student manually'}
                                        </div>
                                    </div>
                                </button>
                                <button
                                    onClick={() => {
                                        setShowAddMenu(false);
                                        router.push('/instructor/students/import');
                                    }}
                                    className={`w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 ${isRTL ? 'flex-row-reverse text-right font-arabic' : ''}`}
                                >
                                    <Upload className="w-5 h-5 text-green-600" />
                                    <div>
                                        <div className="font-medium text-gray-900">
                                            {isRTL ? 'استيراد طلاب' : 'Import Students'}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {isRTL ? 'رفع ملف Excel أو CSV' : 'Upload Excel or CSV file'}
                                        </div>
                                    </div>
                                </button>
                            </div>
                        )}
                    </div>
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

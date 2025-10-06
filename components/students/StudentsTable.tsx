'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AddStudentModal from './AddStudentModal';

interface Student {
    id: number;
    name: string;
    email: string;
    grade: string | null;
    studentId: string | null;
    lastLogin: string | null;
    lastActivity: string | null;
}

interface StudentsTableProps {
    apiEndpoint?: string;
    hideAddButton?: boolean;
    onRowClick?: (studentId: number) => void;
}

export default function StudentsTable({
    apiEndpoint = '/api/instructor/students',
    hideAddButton = false,
    onRowClick,
}: StudentsTableProps) {
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const { isRTL } = useLanguage();
    const router = useRouter();

    const fetchStudents = async () => {
        try {
            const res = await fetch(apiEndpoint);
            if (res.ok) {
                const data = await res.json();
                setStudents(data.students || []);
            }
        } catch (error) {
            console.error('Error fetching students:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, []);

    const filteredStudents = students.filter((student) =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (student.studentId?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );

    const handleStudentAdded = () => {
        fetchStudents();
        setIsAddModalOpen(false);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className={`text-gray-600 ${isRTL ? 'font-arabic' : ''}`}>
                    {isRTL ? 'جاري التحميل...' : 'Loading...'}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* 🔍 Search and Add */}
            <div
                className={`flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between ${isRTL ? 'flex-row-reverse' : ''
                    }`}
            >
                <div className="relative flex-1 max-w-md">
                    <Search
                        className={`absolute top-3 ${isRTL ? 'right-3' : 'left-3'
                            } text-gray-400 w-5 h-5`}
                    />
                    <input
                        type="text"
                        placeholder={isRTL ? 'ابحث عن الطلاب...' : 'Search students...'}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={`w-full ${isRTL ? 'pr-10 text-right font-arabic' : 'pl-10'
                            } py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    />
                </div>
                {!hideAddButton && (
                    <Button
                        onClick={() => setIsAddModalOpen(true)}
                        className={`bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 ${isRTL ? 'flex-row-reverse font-arabic' : ''
                            }`}
                    >
                        <Plus className="w-5 h-5" />
                        {isRTL ? 'إضافة طالب جديد' : 'Add New Student'}
                    </Button>
                )}
            </div>

            {/* 🧍 Students Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th
                                    className={`px-6 py-3 text-sm font-semibold text-gray-700 ${isRTL ? 'text-right font-arabic' : 'text-left'
                                        }`}
                                >
                                    {isRTL ? 'اسم الطالب' : 'Student Name'}
                                </th>
                                <th
                                    className={`px-6 py-3 text-sm font-semibold text-gray-700 ${isRTL ? 'text-right font-arabic' : 'text-left'
                                        }`}
                                >
                                    {isRTL ? 'البريد الإلكتروني' : 'Email'}
                                </th>
                                <th
                                    className={`px-6 py-3 text-sm font-semibold text-gray-700 ${isRTL ? 'text-right font-arabic' : 'text-left'
                                        }`}
                                >
                                    {isRTL ? 'الصف الدراسي' : 'Grade'}
                                </th>
                                <th
                                    className={`px-6 py-3 text-sm font-semibold text-gray-700 ${isRTL ? 'text-right font-arabic' : 'text-left'
                                        }`}
                                >
                                    {isRTL ? 'رقم الطالب' : 'Student ID'}
                                </th>
                                <th
                                    className={`px-6 py-3 text-sm font-semibold text-gray-700 ${isRTL ? 'text-right font-arabic' : 'text-left'
                                        }`}
                                >
                                    {isRTL ? 'آخر تسجيل دخول' : 'Last Login'}
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredStudents.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className={`px-6 py-8 text-center text-gray-500 ${isRTL ? 'font-arabic' : ''
                                            }`}
                                    >
                                        {isRTL ? 'لا يوجد طلاب' : 'No students found'}
                                    </td>
                                </tr>
                            ) : (
                                filteredStudents.map((student) => (
                                    <tr
                                        key={student.id}
                                        className="hover:bg-gray-50 cursor-pointer transition-colors"
                                        onClick={() =>
                                            onRowClick
                                                ? onRowClick(student.id)
                                                : router.push(`/instructor/students/${student.id}`)
                                        }
                                    >
                                        <td
                                            className={`px-6 py-4 ${isRTL ? 'text-right font-arabic' : 'text-left'
                                                }`}
                                        >
                                            <div className="font-medium text-blue-600 hover:text-blue-800">
                                                {student.name}
                                            </div>
                                        </td>
                                        <td
                                            className={`px-6 py-4 text-sm text-gray-700 ${isRTL ? 'text-right font-arabic' : 'text-left'
                                                }`}
                                        >
                                            {student.email}
                                        </td>
                                        <td
                                            className={`px-6 py-4 text-sm text-gray-700 ${isRTL ? 'text-right' : 'text-left'
                                                }`}
                                        >
                                            {student.grade || '-'}
                                        </td>
                                        <td
                                            className={`px-6 py-4 text-sm text-gray-700 ${isRTL ? 'text-right' : 'text-left'
                                                }`}
                                        >
                                            {student.studentId || '-'}
                                        </td>
                                        <td
                                            className={`px-6 py-4 text-sm text-gray-700 ${isRTL ? 'text-right' : 'text-left'
                                                }`}
                                        >
                                            {student.lastLogin
                                                ? new Date(student.lastLogin).toLocaleString()
                                                : '-'}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {!hideAddButton && (
                <AddStudentModal
                    isOpen={isAddModalOpen}
                    onClose={() => setIsAddModalOpen(false)}
                    onStudentAdded={handleStudentAdded}
                />
            )}
        </div>
    );
}

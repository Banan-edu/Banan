
'use client';

import { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { Checkbox } from '@/components/ui/checkbox';

type Student = {
    id: number;
    name: string;
    grade: string | null;
    dateAdded: string;
    completed: boolean;
};

type Class = {
    id: number;
    name: string;
    studentCount: number;
};

type StudentTestProps = {
    testId: number;
    students: Student[];
    api: string;
    onRefresh: () => void;
};

export default function StudentTest({ testId, students, api = 'instructor', onRefresh }: StudentTestProps) {
    const { isRTL } = useLanguage();
    const [showAddModal, setShowAddModal] = useState(false);
    const [addMode, setAddMode] = useState<'individual' | 'class'>('individual');
    const [availableStudents, setAvailableStudents] = useState<any[]>([]);
    const [availableClasses, setAvailableClasses] = useState<Class[]>([]);
    const [selectedStudentIds, setSelectedStudentIds] = useState<number[]>([]);
    const [selectedClassIds, setSelectedClassIds] = useState<number[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (showAddModal) {
            fetchAvailableData();
        }
    }, [showAddModal, addMode]);

    const fetchAvailableData = async () => {
        setLoading(true);
        try {
            if (addMode === 'individual') {
                const res = await fetch(`/api/${api}/students`);
                if (res.ok) {
                    const data = await res.json();
                    setAvailableStudents(data.students || []);
                }
            } else {
                const res = await fetch(`/api/${api}/classes`);
                if (res.ok) {
                    const data = await res.json();
                    setAvailableClasses(data.classes || []);
                }
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStudentCheckbox = (studentId: number, checked: boolean) => {
        if (checked) {
            setSelectedStudentIds([...selectedStudentIds, studentId]);
        } else {
            setSelectedStudentIds(selectedStudentIds.filter(id => id !== studentId));
        }
    };

    const handleClassCheckbox = (classId: number, checked: boolean) => {
        if (checked) {
            setSelectedClassIds([...selectedClassIds, classId]);
        } else {
            setSelectedClassIds(selectedClassIds.filter(id => id !== classId));
        }
    };

    const handleSelectAllStudents = (checked: boolean) => {
        if (checked) {
            setSelectedStudentIds(availableStudents.map(s => s.id));
        } else {
            setSelectedStudentIds([]);
        }
    };

    const handleSelectAllClasses = (checked: boolean) => {
        if (checked) {
            setSelectedClassIds(availableClasses.map(c => c.id));
        } else {
            setSelectedClassIds([]);
        }
    };

    const handleAddSelectedStudents = async () => {
        if (selectedStudentIds.length === 0) return;

        try {
            const res = await fetch(`/api/${api}/tests/${testId}/students/bulk`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ studentIds: selectedStudentIds }),
            });

            if (res.ok) {
                onRefresh();
                setShowAddModal(false);
                setSelectedStudentIds([]);
            }
        } catch (error) {
            console.error('Error adding students:', error);
        }
    };

    const handleAddSelectedClasses = async () => {
        if (selectedClassIds.length === 0) return;

        try {
            const res = await fetch(`/api/${api}/tests/${testId}/students/bulk`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ classIds: selectedClassIds }),
            });

            if (res.ok) {
                onRefresh();
                setShowAddModal(false);
                setSelectedClassIds([]);
            }
        } catch (error) {
            console.error('Error adding class students:', error);
        }
    };

    const handleRemoveStudent = async (studentId: number) => {
        if (!confirm(isRTL ? 'هل أنت متأكد من إزالة هذا الطالب؟' : 'Are you sure you want to remove this student?')) {
            return;
        }

        try {
            const res = await fetch(`/api/${api}/tests/${testId}/students/${studentId}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                onRefresh();
            }
        } catch (error) {
            console.error('Error removing student:', error);
        }
    };

    return (
        <div>
            <div className={`flex justify-between items-center mb-6`}>
                <h3 className={`text-xl font-bold text-gray-900 ${isRTL ? 'font-arabic' : ''}`}>
                    {isRTL ? 'طلاب الاختبار' : 'Test Students'}
                </h3>
                <button
                    onClick={() => setShowAddModal(true)}
                    className={`bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2`}
                >
                    <Plus className="w-5 h-5" />
                    {isRTL ? 'إضافة طلاب' : 'Add Students'}
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                {isRTL ? 'الاسم' : 'Name'}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                {isRTL ? 'الصف' : 'Grade'}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                {isRTL ? 'تاريخ الإضافة' : 'Date Added'}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                {isRTL ? 'الحالة' : 'Status'}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                {isRTL ? 'الإجراءات' : 'Actions'}
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {students.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                                    {isRTL ? 'لا يوجد طلاب' : 'No students added'}
                                </td>
                            </tr>
                        ) : (
                            students.map((student) => (
                                <tr key={student.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">{student.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{student.grade || 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {new Date(student.dateAdded).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span
                                            className={`px-2 py-1 text-xs rounded ${student.completed
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-yellow-100 text-yellow-800'
                                                }`}
                                        >
                                            {student.completed
                                                ? isRTL
                                                    ? 'مكتمل'
                                                    : 'Completed'
                                                : isRTL
                                                    ? 'غير مكتمل'
                                                    : 'Not Completed'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <button
                                            onClick={() => handleRemoveStudent(student.id)}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Add Students Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold">{isRTL ? 'إضافة طلاب' : 'Add Students'}</h3>
                            <button onClick={() => {
                                setShowAddModal(false);
                                setSelectedStudentIds([]);
                                setSelectedClassIds([]);
                            }} className="text-gray-500 hover:text-gray-700">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Mode Selection */}
                        <div className="flex gap-2 mb-4">
                            <button
                                onClick={() => {
                                    setAddMode('individual');
                                    setSelectedStudentIds([]);
                                    setSelectedClassIds([]);
                                }}
                                className={`px-4 py-2 rounded-lg ${addMode === 'individual'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-200 text-gray-700'
                                    }`}
                            >
                                {isRTL ? 'طلاب فرديين' : 'Individual Students'}
                            </button>
                            <button
                                onClick={() => {
                                    setAddMode('class');
                                    setSelectedStudentIds([]);
                                    setSelectedClassIds([]);
                                }}
                                className={`px-4 py-2 rounded-lg ${addMode === 'class' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
                                    }`}
                            >
                                {isRTL ? 'فصول كاملة' : 'Entire Classes'}
                            </button>
                        </div>

                        {loading ? (
                            <div className="text-center py-8">{isRTL ? 'جاري التحميل...' : 'Loading...'}</div>
                        ) : (
                            <>
                                {addMode === 'individual' ? (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="font-semibold">
                                                {isRTL ? 'اختر الطلاب' : 'Select Students'}
                                            </h4>
                                            <label className="flex items-center gap-2 text-sm">
                                                <Checkbox
                                                    checked={selectedStudentIds.length === availableStudents.length && availableStudents.length > 0}
                                                    onCheckedChange={handleSelectAllStudents}
                                                />
                                                <span>{isRTL ? 'تحديد الكل' : 'Select All'}</span>
                                            </label>
                                        </div>
                                        <div className="space-y-2 max-h-96 overflow-y-auto">
                                            {availableStudents.map((student) => (
                                                <label
                                                    key={student.id}
                                                    className="flex items-center gap-3 px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                                                >
                                                    <Checkbox
                                                        checked={selectedStudentIds.includes(student.id)}
                                                        onCheckedChange={(checked) => handleStudentCheckbox(student.id, checked)}
                                                    />
                                                    <div className="flex-1">
                                                        <div className="font-semibold">{student.name}</div>
                                                        <div className="text-sm text-gray-600">
                                                            {student.email} {student.grade && `• ${student.grade}`}
                                                        </div>
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                        <button
                                            onClick={handleAddSelectedStudents}
                                            disabled={selectedStudentIds.length === 0}
                                            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                                        >
                                            {isRTL ? `إضافة ${selectedStudentIds.length} طالب` : `Add ${selectedStudentIds.length} Student(s)`}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="font-semibold">
                                                {isRTL ? 'اختر الفصول' : 'Select Classes'}
                                            </h4>
                                            <label className="flex items-center gap-2 text-sm">
                                                <Checkbox
                                                    checked={selectedClassIds.length === availableClasses.length && availableClasses.length > 0}
                                                    onCheckedChange={handleSelectAllClasses}
                                                />
                                                <span>{isRTL ? 'تحديد الكل' : 'Select All'}</span>
                                            </label>
                                        </div>
                                        <div className="space-y-2 max-h-96 overflow-y-auto">
                                            {availableClasses.map((cls) => (
                                                <label
                                                    key={cls.id}
                                                    className="flex items-center gap-3 px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                                                >
                                                    <Checkbox
                                                        checked={selectedClassIds.includes(cls.id)}
                                                        onCheckedChange={(checked) => handleClassCheckbox(cls.id, checked)}
                                                    />
                                                    <div className="flex-1">
                                                        <div className="font-semibold">{cls.name}</div>
                                                        <div className="text-sm text-gray-600">
                                                            {cls.studentCount} {isRTL ? 'طلاب' : 'students'}
                                                        </div>
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                        <button
                                            onClick={handleAddSelectedClasses}
                                            disabled={selectedClassIds.length === 0}
                                            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                                        >
                                            {isRTL ? `إضافة ${selectedClassIds.length} فصل` : `Add ${selectedClassIds.length} Class(es)`}
                                        </button>
                                    </div>
                                )}
                            </>
                        )}

                        <button
                            onClick={() => {
                                setShowAddModal(false);
                                setSelectedStudentIds([]);
                                setSelectedClassIds([]);
                            }}
                            className="mt-4 w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                            {isRTL ? 'إلغاء' : 'Cancel'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}


'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import {
    Plus, UserPlus, Upload, List,X, Trash2, ArrowRight 
} from 'lucide-react';

interface Student {
    id: number;
    name: string;
    email: string;
    grade: string | null;
    lastActivity: string | null;
}

interface ClassStudentsManagerProps {
    classId: any;
    onStudentUpdate?: () => void;
}

export default function ClassStudentsManager({ classId, onStudentUpdate }: ClassStudentsManagerProps) {
    const { isRTL } = useLanguage();
    const [students, setStudents] = useState<Student[]>([]);
    const [availableClasses, setAvailableClasses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [modalAction, setModalAction] = useState<'disassign' | 'move'>('disassign');
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [targetClassId, setTargetClassId] = useState<string>('');
    const [showStudentModal, setShowStudentModal] = useState(false);
    const [availableStudents, setAvailableStudents] = useState<any[]>([]);
    const [showAssignForm, setShowAssignForm] = useState(false);

    const router = useRouter();
    useEffect(() => {
        fetchData();
    }, [classId]);

    const fetchData = async () => {
        try {
            const [studentsRes, classesRes] = await Promise.all([
                fetch(`/api/instructor/classes/${classId}/students`),
                fetch('/api/instructor/classes'),
            ]);

            if (studentsRes.ok) {
                const data = await studentsRes.json();
                setStudents(data.students || []);
            }

            if (classesRes.ok) {
                const data = await classesRes.json();
                // Filter out current class
                const otherClasses = (data.classes || []).filter((c: any) => c.id.toString() !== classId);
                setAvailableClasses(otherClasses);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const openDisassignModal = (student: Student) => {
        setSelectedStudent(student);
        setModalAction('disassign');
        setShowModal(true);
    };

    const openMoveModal = (student: Student) => {
        setSelectedStudent(student);
        setModalAction('move');
        setTargetClassId('');
        setShowModal(true);
    };

    const handleConfirm = async () => {
        if (!selectedStudent) return;

        try {
            if (modalAction === 'disassign') {
                const res = await fetch(`/api/instructor/classes/${classId}/students/${selectedStudent.id}`, {
                    method: 'DELETE',
                });

                if (res.ok) {
                    setStudents(students.filter(s => s.id !== selectedStudent.id));
                    onStudentUpdate?.();
                }
            } else if (modalAction === 'move' && targetClassId) {
                const res = await fetch(`/api/instructor/classes/${classId}/students/${selectedStudent.id}/move`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ targetClassId }),
                });

                if (res.ok) {
                    setStudents(students.filter(s => s.id !== selectedStudent.id));
                    onStudentUpdate?.();
                }
            }
        } catch (error) {
            console.error('Error updating student:', error);
        } finally {
            setShowModal(false);
            setSelectedStudent(null);
            setTargetClassId('');
        }
    };
    const fetchAvailableStudents = async () => {
        try {
            const res = await fetch('/api/instructor/students');
            if (res.ok) {
                const data = await res.json();
                // Filter students not already in this class
                const filtered = data.students.filter((student: any) =>
                    !student.classes.some((cls: any) => cls.id === parseInt(classId as string))
                );
                setAvailableStudents(filtered);
            }
        } catch (error) {
            console.error('Error fetching available students:', error);
        }
    };

    const openStudentModal = () => {
        setShowStudentModal(true);
        fetchAvailableStudents();
    };

    const closeAllForms = () => {
        setShowStudentModal(false);
        setShowAssignForm(false);
    };

    const handleAssignStudent = async (studentId: number) => {
        try {
            const res = await fetch(`/api/instructor/students/${studentId}/classes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ classId: parseInt(classId as string) }),
            });

            if (res.ok) {
                onStudentUpdate?.();
                fetchData();
                fetchAvailableStudents();
            }
        } catch (error) {
            console.error('Error assigning student:', error);
        }
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
        <div className="bg-white rounded-lg shadow-md p-6">
            <div className={`flex justify-between items-center mb-4 `}>
                <h2 className={`text-xl font-semibold ${isRTL ? 'font-arabic' : ''}`}>
                    {isRTL ? 'الطلاب' : 'Students'}
                </h2>
                <button
                    onClick={openStudentModal}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    <Plus className="w-4 h-4" />
                    {isRTL ? 'إضافة طلاب' : 'Add Students'}
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className={`px-4 py-3 text-sm font-semibold ${isRTL ? 'text-right font-arabic' : 'text-left'}`}>
                                {isRTL ? 'الاسم' : 'Name'}
                            </th>
                            <th className={`px-4 py-3 text-sm font-semibold ${isRTL ? 'text-right font-arabic' : 'text-left'}`}>
                                {isRTL ? 'البريد' : 'Email'}
                            </th>
                            <th className={`px-4 py-3 text-sm font-semibold ${isRTL ? 'text-right font-arabic' : 'text-left'}`}>
                                {isRTL ? 'الصف' : 'Grade'}
                            </th>
                            <th className={`px-4 py-3 text-sm font-semibold ${isRTL ? 'text-right font-arabic' : 'text-left'}`}>
                                {isRTL ? 'آخر نشاط' : 'Last Activity'}
                            </th>
                            <th className={`px-4 py-3 text-sm font-semibold ${isRTL ? 'text-right font-arabic' : 'text-left'}`}>
                                {isRTL ? 'الإجراءات' : 'Actions'}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.length > 0 ? (
                            students.map((student) => (
                                <tr key={student.id} className="border-t hover:bg-gray-50">
                                    <td className="px-4 py-3">{student.name}</td>
                                    <td className="px-4 py-3">{student.email}</td>
                                    <td className="px-4 py-3">{student.grade || '-'}</td>
                                    <td className="px-4 py-3">
                                        {student.lastActivity ? new Date(student.lastActivity).toLocaleString() : 'Never'}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className={`flex gap-2 `}>
                                            <button
                                                onClick={() => openMoveModal(student)}
                                                className="text-blue-600 hover:text-blue-800 p-1"
                                                title={isRTL ? 'نقل إلى فصل آخر' : 'Move to another class'}
                                            >
                                                <ArrowRight className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => openDisassignModal(student)}
                                                className="text-red-600 hover:text-red-800 p-1"
                                                title={isRTL ? 'إزالة من الفصل' : 'Remove from class'}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr className="border-t">
                                <td className={`px-4 py-3 text-gray-500 ${isRTL ? 'text-right font-arabic' : ''}`} colSpan={5}>
                                    {isRTL ? 'لا يوجد طلاب مسجلون' : 'No students enrolled'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Confirmation Modal */}
            {showModal && selectedStudent && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                        <div className={`flex items-center justify-between p-6 border-b `}>
                            <h3 className={`text-xl font-bold ${isRTL ? 'font-arabic' : ''}`}>
                                {modalAction === 'disassign'
                                    ? isRTL ? 'تأكيد الإزالة' : 'Confirm Removal'
                                    : isRTL ? 'نقل الطالب' : 'Move Student'}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className={`p-6 ${isRTL ? 'text-right' : ''}`}>
                            {modalAction === 'disassign' ? (
                                <p className={`text-gray-700 mb-4 ${isRTL ? 'font-arabic' : ''}`}>
                                    {isRTL
                                        ? `هل أنت متأكد من إزالة "${selectedStudent.name}" من هذا الفصل؟`
                                        : `Are you sure you want to remove "${selectedStudent.name}" from this class?`}
                                </p>
                            ) : (
                                <div className="space-y-4">
                                    <p className={`text-gray-700 ${isRTL ? 'font-arabic' : ''}`}>
                                        {isRTL
                                            ? `نقل "${selectedStudent.name}" إلى:`
                                            : `Move "${selectedStudent.name}" to:`}
                                    </p>
                                    <select
                                        value={targetClassId}
                                        onChange={(e) => setTargetClassId(e.target.value)}
                                        className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 ${isRTL ? 'text-right font-arabic' : ''
                                            }`}
                                    >
                                        <option value="">
                                            {isRTL ? 'اختر فصلاً' : 'Select a class'}
                                        </option>
                                        {availableClasses.map((cls) => (
                                            <option key={cls.id} value={cls.id}>
                                                {cls.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>

                        <div className={`flex gap-3 p-6 border-t `}>
                            <Button
                                onClick={handleConfirm}
                                disabled={modalAction === 'move' && !targetClassId}
                                className={`flex-1 ${modalAction === 'disassign'
                                    ? 'bg-red-600 hover:bg-red-700'
                                    : 'bg-blue-600 hover:bg-blue-700'
                                    } text-white`}
                            >
                                {modalAction === 'disassign'
                                    ? isRTL ? 'إزالة' : 'Remove'
                                    : isRTL ? 'نقل' : 'Move'}
                            </Button>
                            <Button
                                onClick={() => setShowModal(false)}
                                variant="outline"
                                className="flex-1"
                            >
                                {isRTL ? 'إلغاء' : 'Cancel'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Student Modal - Choice Selection */}
            {showStudentModal && !showAssignForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <h3 className="text-xl font-bold mb-4">{isRTL ? 'إضافة طلاب' : 'Add Students'}</h3>
                        <p className="text-gray-600 mb-6">{isRTL ? 'اختر طريقة الإضافة' : 'Choose how to add students'}</p>

                        <div className="space-y-3">
                            <button
                                // onClick={() => { setShowAddStudentForm(true); }}
                                onClick={() => router.push(`/instructor/students/add?classId=${classId}`)}
                                className="w-full flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                            >
                                <UserPlus className="w-6 h-6 text-blue-600" />
                                <div className="text-left">
                                    <p className="font-semibold">{isRTL ? 'إضافة طالب واحد' : 'Add Student'}</p>
                                    <p className="text-sm text-gray-600">{isRTL ? 'إنشاء طالب جديد وتعيينه للصف' : 'Create a new student and assign to class'}</p>
                                </div>
                            </button>

                            <button
                                // onClick={() => { setShowImportForm(true); }}
                                onClick={() => router.push(`/instructor/students/import?classId=${classId}`)}
                                className="w-full flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                            >
                                <Upload className="w-6 h-6 text-blue-600" />
                                <div className="text-left">
                                    <p className="font-semibold">{isRTL ? 'استيراد طلاب' : 'Import Students'}</p>
                                    <p className="text-sm text-gray-600">{isRTL ? 'استيراد عدة طلاب دفعة واحدة' : 'Create multiple students at once'}</p>
                                </div>
                            </button>

                            <button
                                onClick={() => { setShowAssignForm(true); }}
                                className="w-full flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                            >
                                <List className="w-6 h-6 text-blue-600" />
                                <div className="text-left">
                                    <p className="font-semibold">{isRTL ? 'تعيين من القائمة' : 'Assign Existing'}</p>
                                    <p className="text-sm text-gray-600">{isRTL ? 'تعيين طلاب موجودين في المدرسة' : 'Assign students from your school'}</p>
                                </div>
                            </button>
                        </div>

                        <button
                            onClick={closeAllForms}
                            className="mt-6 w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                            {isRTL ? 'إلغاء' : 'Cancel'}
                        </button>
                    </div>
                </div>
            )}

            {/* Assign Existing Students */}
            {showAssignForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <h3 className="text-xl font-bold mb-4">{isRTL ? 'تعيين طلاب موجودين' : 'Assign Existing Students'}</h3>
                        {availableStudents.length === 0 ? (
                            <p className="text-gray-500 py-8 text-center">{isRTL ? 'لا يوجد طلاب متاحين' : 'No available students'}</p>
                        ) : (
                            <div className="space-y-2">
                                {availableStudents.map((student) => (
                                    <div key={student.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                                        <div>
                                            <p className="font-medium">{student.name}</p>
                                            <p className="text-sm text-gray-600">{student.email} • {student.grade}</p>
                                        </div>
                                        <button
                                            onClick={() => handleAssignStudent(student.id)}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                        >
                                            {isRTL ? 'تعيين' : 'Assign'}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                        <button
                            onClick={closeAllForms}
                            className="mt-6 w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                            {isRTL ? 'إغلاق' : 'Close'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

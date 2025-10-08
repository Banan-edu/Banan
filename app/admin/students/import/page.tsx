
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { Sidebar, adminLinks } from '@/components/Sidebar';
import { ArrowLeft, Upload, X, Check } from 'lucide-react';

interface StudentRow {
    name: string;
    email: string;
    studentId: string;
    password: string;
    grade?: string;
}

export default function ImportStudentsPage() {
    const { isRTL } = useLanguage();
    const router = useRouter();
    const [step, setStep] = useState<'upload' | 'review'>('upload');
    const [students, setStudents] = useState<StudentRow[]>([]);
    const [file, setFile] = useState<File | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
        }
    };

    const parseCSV = (text: string): StudentRow[] => {
        const lines = text.split('\n').filter(line => line.trim());
        const headers = lines[0].split(',').map(h => h.trim());

        return lines.slice(1).map(line => {
            const values = line.split(',').map(v => v.trim());
            const row: any = {};
            headers.forEach((header, index) => {
                row[header] = values[index] || '';
            });
            return {
                name: row.name || row['اسم الطالب'] || '',
                email: row.email || row['البريد الإلكتروني'] || '',
                studentId: row.studentId || row['رقم الطالب'] || '',
                password: row.password || row['كلمة المرور'] || '',
                grade: row.grade || row['الصف الدراسي'] || '',
            };
        });
    };

    const handleNext = async () => {
        if (step === 'upload' && file) {
            const text = await file.text();
            const parsedStudents = parseCSV(text);
            setStudents(parsedStudents);
            setStep('review');
        } else if (step === 'review') {
            // Save students
            try {
                const res = await fetch('/api/ admin/students/import', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ students }),
                });

                if (res.ok) {
                    router.push('/ admin/students');
                }
            } catch (error) {
                console.error('Error importing students:', error);
            }
        }
    };

    const removeStudent = (index: number) => {
        setStudents(students.filter((_, i) => i !== index));
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar links={adminLinks} userRole="admin" />

            <main className="flex-1 px-8 py-8">
                <button
                    onClick={() => router.push('/ admin/students')}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
                >
                    <ArrowLeft className="w-4 h-4" />
                    {isRTL ? 'العودة للطلاب' : 'Back to Students'}
                </button>

                <h1 className={`text-3xl font-bold text-gray-900 mb-8 ${isRTL ? 'font-arabic' : ''}`}>
                    {isRTL ? 'استيراد الطلاب' : 'Import Students'}
                </h1>

                {step === 'upload' && (
                    <div className="bg-white rounded-lg shadow-md p-6 ">
                        <h2 className={`text-xl font-semibold mb-4 ${isRTL ? 'font-arabic' : ''}`}>
                            {isRTL ? 'تحميل ملف الطلاب' : 'Upload Students File'}
                        </h2>

                        <div className="mb-6">
                            <p className={`text-gray-600 mb-4 ${isRTL ? 'font-arabic' : ''}`}>
                                {isRTL
                                    ? 'يرجى تحميل ملف CSV أو Excel يحتوي على بيانات الطلاب بالتنسيق التالي:'
                                    : 'Please upload a CSV or Excel file containing student data in the following format:'}
                            </p>

                            <div className="bg-gray-50 rounded-lg p-4 overflow-y-auto border border-gray-200">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-gray-300">
                                            <th className={`py-2 px-3 ${isRTL ? 'text-right font-arabic' : 'text-left'}`}>
                                                {isRTL ? 'اسم الطالب' : 'name'}
                                            </th>
                                            <th className={`py-2 px-3 ${isRTL ? 'text-right font-arabic' : 'text-left'}`}>
                                                {isRTL ? 'البريد الإلكتروني' : 'email'}
                                            </th>
                                            <th className={`py-2 px-3 ${isRTL ? 'text-right font-arabic' : 'text-left'}`}>
                                                {isRTL ? 'رقم الطالب' : 'studentId'}
                                            </th>
                                            <th className={`py-2 px-3 ${isRTL ? 'text-right font-arabic' : 'text-left'}`}>
                                                {isRTL ? 'كلمة المرور' : 'password'}
                                            </th>
                                            <th className={`py-2 px-3 ${isRTL ? 'text-right font-arabic' : 'text-left'}`}>
                                                {isRTL ? 'الصف الدراسي (اختياري)' : 'grade (optional)'}
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr className="border-b border-gray-200">
                                            <td className="py-2 px-3 text-gray-500">أحمد محمد</td>
                                            <td className="py-2 px-3 text-gray-500">ahmad@example.com</td>
                                            <td className="py-2 px-3 text-gray-500">S001</td>
                                            <td className="py-2 px-3 text-gray-500">pass123</td>
                                            <td className="py-2 px-3 text-gray-500">Grade 5</td>
                                        </tr>
                                        <tr>
                                            <td className="py-2 px-3 text-gray-500">فاطمة علي</td>
                                            <td className="py-2 px-3 text-gray-500">fatima@example.com</td>
                                            <td className="py-2 px-3 text-gray-500">S002</td>
                                            <td className="py-2 px-3 text-gray-500">pass456</td>
                                            <td className="py-2 px-3 text-gray-500">Grade 6</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="mb-6">
                            <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'font-arabic' : ''}`}>
                                {isRTL ? 'اختر ملف (CSV أو Excel)' : 'Choose File (CSV or Excel)'}
                            </label>
                            <input
                                type="file"
                                accept=".csv,.xlsx,.xls"
                                onChange={handleFileChange}
                                className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
                            />
                        </div>

                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => router.push('/ admin/students')}
                                className={`px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 ${isRTL ? 'font-arabic' : ''}`}
                            >
                                {isRTL ? 'إلغاء' : 'Cancel'}
                            </button>
                            <button
                                onClick={handleNext}
                                disabled={!file}
                                className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed ${isRTL ? 'font-arabic' : ''}`}
                            >
                                {isRTL ? 'التالي' : 'Next'}
                            </button>
                        </div>
                    </div>
                )}

                {step === 'review' && (
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className={`text-xl font-semibold mb-4 ${isRTL ? 'font-arabic' : ''}`}>
                            {isRTL ? 'مراجعة الطلاب' : 'Review Students'}
                        </h2>

                        <p className={`text-gray-600 mb-4 ${isRTL ? 'font-arabic' : ''}`}>
                            {isRTL
                                ? `تم العثور على ${students.length} طالب. يرجى المراجعة وإزالة أي طالب غير مرغوب فيه.`
                                : `Found ${students.length} students. Please review and remove any unwanted students.`}
                        </p>

                        <div className="overflow-x-auto max-h-[500px] overflow-y-auto border border-gray-200 rounded-lg mb-6">
                            <table className="w-full">
                                <thead className="bg-gray-50 sticky top-0">
                                    <tr>
                                        <th className={`py-3 px-4 text-sm font-semibold ${isRTL ? 'text-right font-arabic' : 'text-left'}`}>
                                            {isRTL ? 'اسم الطالب' : 'Name'}
                                        </th>
                                        <th className={`py-3 px-4 text-sm font-semibold ${isRTL ? 'text-right font-arabic' : 'text-left'}`}>
                                            {isRTL ? 'البريد الإلكتروني' : 'Email'}
                                        </th>
                                        <th className={`py-3 px-4 text-sm font-semibold ${isRTL ? 'text-right font-arabic' : 'text-left'}`}>
                                            {isRTL ? 'رقم الطالب' : 'Student ID'}
                                        </th>
                                        <th className={`py-3 px-4 text-sm font-semibold ${isRTL ? 'text-right font-arabic' : 'text-left'}`}>
                                            {isRTL ? 'كلمة المرور' : 'Password'}
                                        </th>
                                        <th className={`py-3 px-4 text-sm font-semibold ${isRTL ? 'text-right font-arabic' : 'text-left'}`}>
                                            {isRTL ? 'الصف الدراسي' : 'Grade'}
                                        </th>
                                        <th className={`py-3 px-4 text-sm font-semibold ${isRTL ? 'text-right font-arabic' : 'text-left'}`}>
                                            {isRTL ? 'إجراء' : 'Action'}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {students.map((student, index) => (
                                        <tr key={index} className="hover:bg-gray-50">
                                            <td className="py-3 px-4">{student.name}</td>
                                            <td className="py-3 px-4">{student.email}</td>
                                            <td className="py-3 px-4">{student.studentId}</td>
                                            <td className="py-3 px-4">{student.password}</td>
                                            <td className="py-3 px-4">{student.grade || '-'}</td>
                                            <td className="py-3 px-4">
                                                <button
                                                    onClick={() => removeStudent(index)}
                                                    className="text-red-600 hover:text-red-800"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setStep('upload')}
                                className={`px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 ${isRTL ? 'font-arabic' : ''}`}
                            >
                                {isRTL ? 'رجوع' : 'Back'}
                            </button>
                            <button
                                onClick={handleNext}
                                className={`px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 ${isRTL ? 'font-arabic flex-row-reverse' : ''}`}
                            >
                                <Check className="w-4 h-4" />
                                {isRTL ? 'حفظ الطلاب' : 'Save Students'}
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

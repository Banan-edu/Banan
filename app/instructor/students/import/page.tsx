
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { Sidebar, instructorLinks } from '@/components/Sidebar';
import { Upload, Download, ArrowLeft } from 'lucide-react';

export default function ImportStudentsPage() {
    const { isRTL } = useLanguage();
    const router = useRouter();
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [fileType, setFileType] = useState<'excel' | 'csv'>('excel');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleUpload = () => {
        if (!selectedFile) {
            alert(isRTL ? 'الرجاء اختيار ملف' : 'Please select a file');
            return;
        }
        // TODO: Implement file upload logic
        alert(isRTL ? 'سيتم تنفيذ رفع الملف قريباً' : 'File upload will be implemented soon');
    };

    const exampleData = [
        {
            name: 'أحمد محمد',
            email: 'ahmed@example.com',
            studentId: 'STD001',
            password: 'pass123',
            grade: 'الصف الخامس'
        },
        {
            name: 'فاطمة علي',
            email: 'fatima@example.com',
            studentId: 'STD002',
            password: 'pass456',
            grade: 'الصف السادس'
        },
        {
            name: 'محمود حسن',
            email: 'mahmoud@example.com',
            studentId: 'STD003',
            password: 'pass789',
            grade: ''
        }
    ];

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar links={instructorLinks} userRole="instructor" />

            <main className="flex-1 px-8 py-8">
                <button
                    onClick={() => router.back()}
                    className={`mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 ${isRTL ? 'flex-row-reverse font-arabic' : ''}`}
                >
                    <ArrowLeft className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
                    {isRTL ? 'رجوع' : 'Back'}
                </button>

                <div className={isRTL ? 'text-right' : 'text-left'}>
                    <h1 className={`text-3xl font-bold text-gray-900 mb-2 ${isRTL ? 'font-arabic' : ''}`}>
                        {isRTL ? 'استيراد الطلاب' : 'Import Students'}
                    </h1>
                    <p className={`text-gray-600 mb-8 ${isRTL ? 'font-arabic' : ''}`}>
                        {isRTL ? 'رفع ملف يحتوي على بيانات الطلاب' : 'Upload a file containing student data'}
                    </p>
                </div>

                <div className="bg-white rounded-lg shadow p-6 mb-8">
                    <h2 className={`text-xl font-semibold text-gray-900 mb-4 ${isRTL ? 'font-arabic text-right' : ''}`}>
                        {isRTL ? 'اختر نوع الملف' : 'Select File Type'}
                    </h2>
                    
                    <div className={`flex gap-4 mb-6 `}>
                        <label className={`flex items-center gap-2 cursor-pointer ${isRTL ? 'flex-row-reverse font-arabic' : ''}`}>
                            <input
                                type="radio"
                                name="fileType"
                                value="excel"
                                checked={fileType === 'excel'}
                                onChange={(e) => setFileType(e.target.value as 'excel' | 'csv')}
                                className="w-4 h-4"
                            />
                            <span>{isRTL ? 'اكسل (Excel)' : 'Excel'}</span>
                        </label>
                        <label className={`flex items-center gap-2 cursor-pointer ${isRTL ? 'flex-row-reverse font-arabic' : ''}`}>
                            <input
                                type="radio"
                                name="fileType"
                                value="csv"
                                checked={fileType === 'csv'}
                                onChange={(e) => setFileType(e.target.value as 'excel' | 'csv')}
                                className="w-4 h-4"
                            />
                            <span>{isRTL ? 'سي إس في (CSV)' : 'CSV'}</span>
                        </label>
                    </div>

                    <div className="mb-6">
                        <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'font-arabic text-right' : ''}`}>
                            {isRTL ? 'اختر الملف' : 'Choose File'}
                        </label>
                        <input
                            type="file"
                            accept={fileType === 'excel' ? '.xlsx,.xls' : '.csv'}
                            onChange={handleFileChange}
                            className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
                        />
                        {selectedFile && (
                            <p className={`mt-2 text-sm text-gray-600 ${isRTL ? 'font-arabic text-right' : ''}`}>
                                {isRTL ? 'الملف المختار: ' : 'Selected: '}{selectedFile.name}
                            </p>
                        )}
                    </div>

                    <div className={`flex gap-4 `}>
                        <button
                            onClick={handleUpload}
                            className={`bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 ${isRTL ? 'flex-row-reverse font-arabic' : ''}`}
                        >
                            <Upload className="w-5 h-5" />
                            {isRTL ? 'رفع الملف' : 'Upload File'}
                        </button>
                        <button
                            className={`border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 ${isRTL ? 'flex-row-reverse font-arabic' : ''}`}
                        >
                            <Download className="w-5 h-5" />
                            {isRTL ? 'تحميل نموذج' : 'Download Template'}
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className={`text-xl font-semibold text-gray-900 ${isRTL ? 'font-arabic text-right' : ''}`}>
                            {isRTL ? 'هيكل البيانات المطلوب' : 'Required Data Structure'}
                        </h2>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className={`px-6 py-3 text-sm font-semibold text-gray-700 ${isRTL ? 'text-right font-arabic' : 'text-left'}`}>
                                        {isRTL ? 'اسم الطالب' : 'name'}
                                    </th>
                                    <th className={`px-6 py-3 text-sm font-semibold text-gray-700 ${isRTL ? 'text-right font-arabic' : 'text-left'}`}>
                                        {isRTL ? 'البريد الإلكتروني' : 'email'}
                                    </th>
                                    <th className={`px-6 py-3 text-sm font-semibold text-gray-700 ${isRTL ? 'text-right font-arabic' : 'text-left'}`}>
                                        {isRTL ? 'رقم الطالب' : 'studentId'}
                                    </th>
                                    <th className={`px-6 py-3 text-sm font-semibold text-gray-700 ${isRTL ? 'text-right font-arabic' : 'text-left'}`}>
                                        {isRTL ? 'كلمة المرور' : 'password'}
                                    </th>
                                    <th className={`px-6 py-3 text-sm font-semibold text-gray-700 ${isRTL ? 'text-right font-arabic' : 'text-left'}`}>
                                        {isRTL ? 'الصف الدراسي (اختياري)' : 'grade (optional)'}
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {exampleData.map((student, index) => (
                                    <tr key={index} className="hover:bg-gray-50">
                                        <td className={`px-6 py-4 text-sm text-gray-900 ${isRTL ? 'text-right font-arabic' : 'text-left'}`}>
                                            {student.name}
                                        </td>
                                        <td className={`px-6 py-4 text-sm text-gray-700 ${isRTL ? 'text-right' : 'text-left'}`}>
                                            {student.email}
                                        </td>
                                        <td className={`px-6 py-4 text-sm text-gray-700 ${isRTL ? 'text-right' : 'text-left'}`}>
                                            {student.studentId}
                                        </td>
                                        <td className={`px-6 py-4 text-sm text-gray-700 ${isRTL ? 'text-right' : 'text-left'}`}>
                                            {student.password}
                                        </td>
                                        <td className={`px-6 py-4 text-sm text-gray-700 ${isRTL ? 'text-right font-arabic' : 'text-left'}`}>
                                            {student.grade || '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
}

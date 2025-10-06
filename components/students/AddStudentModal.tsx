'use client';

import { useState } from 'react';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AddStudentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onStudentAdded: () => void;
}

export default function AddStudentModal({ isOpen, onClose, onStudentAdded }: AddStudentModalProps) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [grade, setGrade] = useState('');
    const [studentId, setStudentId] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { isRTL } = useLanguage();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/instructor/students', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, grade, studentId, password }),
            });

            if (res.ok) {
                setName('');
                setEmail('');
                setGrade('');
                setStudentId('');
                setPassword('');
                onStudentAdded();
            } else {
                const data = await res.json();
                setError(data.error || (isRTL ? 'حدث خطأ' : 'An error occurred'));
            }
        } catch (err) {
            setError(isRTL ? 'حدث خطأ في الاتصال' : 'Connection error');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                {/* Header */}
                <div className={`flex items-center justify-between p-6 border-b border-gray-200 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <h2 className={`text-xl font-bold text-gray-900 ${isRTL ? 'font-arabic' : ''}`}>
                        {isRTL ? 'إضافة طالب جديد' : 'Add New Student'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className={`p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm ${isRTL ? 'text-right font-arabic' : ''}`}>
                            {error}
                        </div>
                    )}

                    {/* Student Name */}
                    <div>
                        <label className={`block text-sm font-medium text-gray-700 mb-1 ${isRTL ? 'text-right font-arabic' : ''}`}>
                            {isRTL ? 'اسم الطالب' : 'Student Name'} *
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isRTL ? 'text-right font-arabic' : ''}`}
                            placeholder={isRTL ? 'أدخل اسم الطالب' : 'Enter student name'}
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <label className={`block text-sm font-medium text-gray-700 mb-1 ${isRTL ? 'text-right font-arabic' : ''}`}>
                            {isRTL ? 'البريد الإلكتروني' : 'Email'} *
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isRTL ? 'text-right font-arabic' : ''}`}
                            placeholder={isRTL ? 'أدخل البريد الإلكتروني' : 'Enter email address'}
                        />
                    </div>

                    {/* Grade */}
                    <div>
                        <label className={`block text-sm font-medium text-gray-700 mb-1 ${isRTL ? 'text-right font-arabic' : ''}`}>
                            {isRTL ? 'الصف الدراسي' : 'Grade'}
                        </label>
                        <input
                            type="text"
                            value={grade}
                            onChange={(e) => setGrade(e.target.value)}
                            className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isRTL ? 'text-right' : ''}`}
                            placeholder={isRTL ? 'أدخل الصف الدراسي' : 'Enter grade'}
                        />
                    </div>

                    {/* Student ID */}
                    <div>
                        <label className={`block text-sm font-medium text-gray-700 mb-1 ${isRTL ? 'text-right font-arabic' : ''}`}>
                            {isRTL ? 'رقم الطالب' : 'Student ID'}
                        </label>
                        <input
                            type="text"
                            value={studentId}
                            onChange={(e) => setStudentId(e.target.value)}
                            className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isRTL ? 'text-right' : ''}`}
                            placeholder={isRTL ? 'أدخل رقم الطالب' : 'Enter student ID'}
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <label className={`block text-sm font-medium text-gray-700 mb-1 ${isRTL ? 'text-right font-arabic' : ''}`}>
                            {isRTL ? 'كلمة المرور' : 'Password'} *
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isRTL ? 'text-right' : ''}`}
                            placeholder={isRTL ? 'أدخل كلمة المرور' : 'Enter password'}
                        />
                    </div>

                    {/* Buttons */}
                    <div className={`flex gap-3 pt-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                            {loading ? (isRTL ? 'جاري الحفظ...' : 'Saving...') : (isRTL ? 'حفظ' : 'Save')}
                        </Button>
                        <Button
                            type="button"
                            onClick={onClose}
                            variant="outline"
                            className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            {isRTL ? 'إلغاء' : 'Cancel'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

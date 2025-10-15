
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { ArrowLeft } from 'lucide-react';
import { adminLinks, Sidebar } from '@/components/Sidebar';

export default function AddStudentPage() {
    const router = useRouter();
    const { isRTL } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [schools, setSchools] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        studentId: '',
        password: '',
        grade: '',
        schoolId: '',
        accessibility: [] as string[],
    });

    // Fetch schools
    useEffect(() => {
        const fetchSchools = async () => {
            try {
                const res = await fetch('/api/admin/schools');
                if (res.ok) {
                    const data = await res.json();
                    setSchools(data.schools || []);
                } else {
                    console.error('Failed to fetch schools');
                }
            } catch (error) {
                console.error('Error fetching schools:', error);
            }
        };

        fetchSchools();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/admin/students/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                router.push('/admin/students');
            } else {
                const data = await res.json();
                setError(data.error || 'Failed to add student');
            }
        } catch (error) {
            console.error('Error creating student:', error);
            setError('Failed to add student');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value, type } = e.target;

        if (type === 'checkbox' && name === 'accessibility') {
            const checkbox = e.target as HTMLInputElement;
            const updatedAccessibility = checkbox.checked
                ? [...formData.accessibility, value]
                : formData.accessibility.filter(item => item !== value);

            setFormData({
                ...formData,
                accessibility: updatedAccessibility,
            });
        } else {
            setFormData({
                ...formData,
                [name]: value,
            });
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar links={adminLinks} userRole="admin" />

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className={`mb-8 ${isRTL ? 'text-right' : 'text-left'}`}>
                    <button
                        onClick={() => router.push('/admin/students')}
                        className={`flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4 ${isRTL ? 'flex-row-reverse' : ''
                            }`}
                    >
                        <ArrowLeft className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
                        <span className={isRTL ? 'font-arabic' : ''}>
                            {isRTL ? 'العودة للطلاب' : 'Back to Students'}
                        </span>
                    </button>

                    <h1
                        className={`text-3xl font-bold text-gray-900 ${isRTL ? 'font-arabic' : ''
                            }`}
                    >
                        {isRTL ? 'إضافة طالب جديد' : 'Add New Student'}
                    </h1>
                    <p
                        className={`text-gray-600 mt-2 ${isRTL ? 'font-arabic' : ''
                            }`}
                    >
                        {isRTL
                            ? 'أدخل معلومات الطالب الجديد'
                            : 'Enter the new student information'}
                    </p>
                </div>

                {/* Form */}
                <div className="bg-white rounded-lg shadow p-8">
                    {error && (
                        <div
                            className={`mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 ${isRTL ? 'text-right font-arabic' : ''
                                }`}
                        >
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Name */}
                        <div>
                            <label
                                className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'text-right font-arabic' : ''
                                    }`}
                            >
                                {isRTL ? 'اسم الطالب' : 'Student Name'}{' '}
                                <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isRTL ? 'text-right font-arabic' : ''
                                    }`}
                                placeholder={isRTL ? 'أدخل اسم الطالب' : 'Enter student name'}
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label
                                className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'text-right font-arabic' : ''
                                    }`}
                            >
                                {isRTL ? 'البريد الإلكتروني' : 'Email Address'}{' '}
                                <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isRTL ? 'text-right font-arabic' : ''
                                    }`}
                                placeholder={isRTL ? 'أدخل البريد الإلكتروني' : 'Enter email'}
                            />
                        </div>

                        {/* Student ID */}
                        <div>
                            <label
                                className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'text-right font-arabic' : ''
                                    }`}
                            >
                                {isRTL ? 'رقم الطالب' : 'Student ID'}{' '}
                                <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="studentId"
                                value={formData.studentId}
                                onChange={handleChange}
                                required
                                className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isRTL ? 'text-right font-arabic' : ''
                                    }`}
                                placeholder={isRTL ? 'أدخل رقم الطالب' : 'Enter student ID'}
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label
                                className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'text-right font-arabic' : ''
                                    }`}
                            >
                                {isRTL ? 'كلمة المرور' : 'Password'}{' '}
                                <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isRTL ? 'text-right font-arabic' : ''
                                    }`}
                                placeholder={isRTL ? 'أدخل كلمة المرور' : 'Enter password'}
                            />
                        </div>

                        {/* Grade */}
                        <div>
                            <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'text-right font-arabic' : ''}`}>
                                {isRTL ? 'الصف *' : 'Grade *'}
                            </label>
                            <input
                                type="text"
                                name="grade"
                                value={formData.grade}
                                onChange={handleChange}
                                className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isRTL ? 'text-right' : ''}`}
                            />
                        </div>

                        {/* School Selection */}
                        <div>
                            <label
                                className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'text-right font-arabic' : ''
                                    }`}
                            >
                                {isRTL ? 'المدرسة' : 'School'}
                            </label>
                            <select
                                name="schoolId"
                                value={formData.schoolId}
                                onChange={handleChange}
                                className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isRTL ? 'text-right font-arabic' : ''
                                    }`}
                            >
                                <option value="">
                                    {isRTL ? 'بدون مدرسة' : 'No School'}
                                </option>
                                {schools.map((school) => (
                                    <option key={school.id} value={school.id}>
                                        {school.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Accessibility Options */}
                        <div className="pt-4 border-t border-gray-200">
                            <h3 className={`text-lg font-semibold text-gray-900 mb-4 ${isRTL ? 'text-right font-arabic' : ''
                                }`}>
                                {isRTL ? 'إمكانية الوصول' : 'Accessibility'}
                            </h3>

                            <div className="space-y-3">
                                {/* Blind */}
                                <label className={`flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer ${isRTL ? 'flex-row-reverse' : ''
                                    }`}>
                                    <input
                                        type="checkbox"
                                        name="accessibility"
                                        value="blind"
                                        onChange={handleChange}
                                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                    />
                                    <div className={`flex-1 ${isRTL ? 'text-right' : ''}`}>
                                        <div className={`font-medium text-gray-900 ${isRTL ? 'font-arabic' : ''}`}>
                                            {isRTL ? 'كفيف' : 'Blind'}
                                        </div>
                                        <div className={`text-sm text-gray-600 ${isRTL ? 'font-arabic' : ''}`}>
                                            {isRTL
                                                ? 'يفعل: تباين عالي، خط كبير جداً، إرشاد صوتي كامل، منع عند الخطأ، مسافة للخلف'
                                                : 'Activates: high contrast, extra-large font, fully guided voice-over, block-on-error, backspace'}
                                        </div>
                                        <div className={`text-sm text-gray-500 mt-1 ${isRTL ? 'font-arabic' : ''}`}>
                                            {isRTL ? 'يعطل: الألعاب، الدروس الإرشادية' : 'Deactivates: games, anchoring lessons'}
                                        </div>
                                    </div>
                                </label>

                                {/* Low Vision */}
                                <label className={`flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer ${isRTL ? 'flex-row-reverse' : ''
                                    }`}>
                                    <input
                                        type="checkbox"
                                        name="accessibility"
                                        value="low_vision"
                                        onChange={handleChange}
                                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                    />
                                    <div className={`flex-1 ${isRTL ? 'text-right' : ''}`}>
                                        <div className={`font-medium text-gray-900 ${isRTL ? 'font-arabic' : ''}`}>
                                            {isRTL ? 'ضعف البصر' : 'Low Vision'}
                                        </div>
                                        <div className={`text-sm text-gray-600 ${isRTL ? 'font-arabic' : ''}`}>
                                            {isRTL
                                                ? 'يفعل: خلفية افتراضية، خط كبير، إرشاد صوتي كامل'
                                                : 'Activates: default background, large font, fully guided voice-over'}
                                        </div>
                                        <div className={`text-sm text-gray-500 mt-1 ${isRTL ? 'font-arabic' : ''}`}>
                                            {isRTL ? 'يعطل: الألعاب' : 'Deactivates: games'}
                                        </div>
                                    </div>
                                </label>

                                {/* Dyslexic */}
                                <label className={`flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer ${isRTL ? 'flex-row-reverse' : ''
                                    }`}>
                                    <input
                                        type="checkbox"
                                        name="accessibility"
                                        value="dyslexic"
                                        onChange={handleChange}
                                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                    />
                                    <div className={`flex-1 ${isRTL ? 'text-right' : ''}`}>
                                        <div className={`font-medium text-gray-900 ${isRTL ? 'font-arabic' : ''}`}>
                                            {isRTL ? 'عسر القراءة' : 'Dyslexic'}
                                        </div>
                                        <div className={`text-sm text-gray-600 ${isRTL ? 'font-arabic' : ''}`}>
                                            {isRTL
                                                ? 'يفعل: خط كبير مصمم خصيصاً لمن يعانون من عسر القراءة'
                                                : 'Activates: large font designed specifically for dyslexic users'}
                                        </div>
                                    </div>
                                </label>

                                {/* Right Hand Only */}
                                <label className={`flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer ${isRTL ? 'flex-row-reverse' : ''
                                    }`}>
                                    <input
                                        type="checkbox"
                                        name="accessibility"
                                        value="right_hand_only"
                                        onChange={handleChange}
                                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                    />
                                    <div className={`flex-1 ${isRTL ? 'text-right' : ''}`}>
                                        <div className={`font-medium text-gray-900 ${isRTL ? 'font-arabic' : ''}`}>
                                            {isRTL ? 'اليد اليمنى فقط' : 'Right Hand Only'}
                                        </div>
                                        <div className={`text-sm text-gray-600 ${isRTL ? 'font-arabic' : ''}`}>
                                            {isRTL
                                                ? 'يفعل: دليل افتراضي لليد اليمنى'
                                                : 'Activates: right-hand virtual guide'}
                                        </div>
                                        <div className={`text-sm text-gray-500 mt-1 ${isRTL ? 'font-arabic' : ''}`}>
                                            {isRTL ? 'يعطل: الدروس الإرشادية' : 'Deactivates: anchoring lessons'}
                                        </div>
                                    </div>
                                </label>

                                {/* Left Hand Only */}
                                <label className={`flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer ${isRTL ? 'flex-row-reverse' : ''
                                    }`}>
                                    <input
                                        type="checkbox"
                                        name="accessibility"
                                        value="left_hand_only"
                                        onChange={handleChange}
                                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                    />
                                    <div className={`flex-1 ${isRTL ? 'text-right' : ''}`}>
                                        <div className={`font-medium text-gray-900 ${isRTL ? 'font-arabic' : ''}`}>
                                            {isRTL ? 'اليد اليسرى فقط' : 'Left Hand Only'}
                                        </div>
                                        <div className={`text-sm text-gray-600 ${isRTL ? 'font-arabic' : ''}`}>
                                            {isRTL
                                                ? 'يفعل: دليل افتراضي لليد اليسرى'
                                                : 'Activates: left-hand virtual guide'}
                                        </div>
                                        <div className={`text-sm text-gray-500 mt-1 ${isRTL ? 'font-arabic' : ''}`}>
                                            {isRTL ? 'يعطل: الدروس الإرشادية' : 'Deactivates: anchoring lessons'}
                                        </div>
                                    </div>
                                </label>

                                {/* Hard of Hearing */}
                                <label className={`flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer ${isRTL ? 'flex-row-reverse' : ''
                                    }`}>
                                    <input
                                        type="checkbox"
                                        name="accessibility"
                                        value="hard_of_hearing"
                                        onChange={handleChange}
                                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                    />
                                    <div className={`flex-1 ${isRTL ? 'text-right' : ''}`}>
                                        <div className={`font-medium text-gray-900 ${isRTL ? 'font-arabic' : ''}`}>
                                            {isRTL ? 'ضعف السمع' : 'Hard of Hearing'}
                                        </div>
                                        <div className={`text-sm text-gray-600 ${isRTL ? 'font-arabic' : ''}`}>
                                            {isRTL
                                                ? 'يفعل: ترجمة للفيديوهات'
                                                : 'Activates: closed captioning for videos'}
                                        </div>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* Submit Buttons */}
                        <div className="flex gap-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className={`px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed ${isRTL ? 'font-arabic' : ''
                                    }`}
                            >
                                {loading
                                    ? isRTL
                                        ? 'جاري الإضافة...'
                                        : 'Adding...'
                                    : isRTL
                                        ? 'إضافة الطالب'
                                        : 'Add Student'}
                            </button>
                            <button
                                type="button"
                                onClick={() => router.push('/admin/students')}
                                className={`px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors ${isRTL ? 'font-arabic' : ''
                                    }`}
                            >
                                {isRTL ? 'إلغاء' : 'Cancel'}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}

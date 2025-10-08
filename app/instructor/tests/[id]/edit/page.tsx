
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { Sidebar, instructorLinks } from '@/components/Sidebar';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';

export default function EditTestPage() {
    const router = useRouter();
    const params = useParams();
    const { isRTL } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        startDate: '',
        endDate: '',
        text: '',
        altTexts: [''],
        targetAudience: 'subscription',
        targetStudents: [],
        targetSchools: [],
        attemptsAllowed: 'open',
        attemptsCount: 1,
        hasTimeLimit: false,
        timeLimit: 30,
        passingCriteria: 'everyone',
        minAccuracy: 80,
        minSpeed: 40,
        showScore: true,
        speedGoal: 60,
        maxScore: 100,
        disableBackspace: false,
        issueCertificate: false,
    });

    useEffect(() => {
        fetchTestData();
    }, [params.id]);

    const fetchTestData = async () => {
        try {
            const res = await fetch(`/api/instructor/tests/${params.id}`);
            if (res.ok) {
                const data = await res.json();
                const test = data.test;

                // Convert date strings to YYYY-MM-DD format
                const startDate = new Date(test.startDate).toISOString().split('T')[0];
                const endDate = new Date(test.endDate).toISOString().split('T')[0];

                setFormData({
                    name: test.name,
                    description: test.description || '',
                    startDate,
                    endDate,
                    text: test.text,
                    altTexts: test.altTexts && test.altTexts.length > 0 ? test.altTexts : [''],
                    targetAudience: test.targetAudience,
                    targetStudents: test.targetStudents || [],
                    targetSchools: test.targetSchools || [],
                    attemptsAllowed: test.attemptsAllowed,
                    attemptsCount: test.attemptsCount || 1,
                    hasTimeLimit: test.hasTimeLimit,
                    timeLimit: test.timeLimit || 30,
                    passingCriteria: test.passingCriteria,
                    minAccuracy: test.minAccuracy || 80,
                    minSpeed: test.minSpeed || 40,
                    showScore: test.showScore,
                    speedGoal: test.speedGoal || 60,
                    maxScore: test.maxScore || 100,
                    disableBackspace: test.disableBackspace,
                    issueCertificate: test.issueCertificate,
                });
            }
        } catch (error) {
            console.error('Error fetching test:', error);
            setError('Failed to load test data');
        } finally {
            setFetchLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch(`/api/instructor/tests/${params.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                router.push(`/instructor/tests/${params.id}`);
            } else {
                const data = await res.json();
                setError(data.error || 'Failed to update test');
            }
        } catch (error) {
            console.error('Error updating test:', error);
            setError('Failed to update test');
        } finally {
            setLoading(false);
        }
    };

    const addAltText = () => {
        setFormData({
            ...formData,
            altTexts: [...formData.altTexts, ''],
        });
    };

    const removeAltText = (index: number) => {
        setFormData({
            ...formData,
            altTexts: formData.altTexts.filter((_, i) => i !== index),
        });
    };

    const updateAltText = (index: number, value: string) => {
        const newAltTexts = [...formData.altTexts];
        newAltTexts[index] = value;
        setFormData({ ...formData, altTexts: newAltTexts });
    };

    if (fetchLoading) {
        return (
            <div className="flex min-h-screen bg-gray-50">
                <Sidebar links={instructorLinks} userRole="instructor" />
                <main className="flex-1 px-8 py-8">
                    <p className="text-gray-600">{isRTL ? 'جاري التحميل...' : 'Loading...'}</p>
                </main>
            </div>
        );
    }

    return (
        <div className={`flex min-h-screen bg-gray-50`}>
            <Sidebar links={instructorLinks} userRole="instructor" />

            <main className="flex-1 px-8 py-8">
                <div className={`mb-8 ${isRTL ? 'text-right' : 'text-left'}`}>
                    <button
                        onClick={() => router.push(`/instructor/tests/${params.id}`)}
                        className={`flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}
                    >
                        <ArrowLeft className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
                        <span className={isRTL ? 'font-arabic' : ''}>
                            {isRTL ? 'العودة لتفاصيل الاختبار' : 'Back to Test Details'}
                        </span>
                    </button>

                    <h1 className={`text-3xl font-bold text-gray-900 ${isRTL ? 'font-arabic' : ''}`}>
                        {isRTL ? 'تحرير الاختبار' : 'Edit Test'}
                    </h1>
                </div>

                {error && (
                    <div className={`mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 ${isRTL ? 'text-right font-arabic' : ''}`}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Basic Info */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className={`text-xl font-semibold mb-4 ${isRTL ? 'font-arabic' : ''}`}>
                            {isRTL ? 'المعلومات الأساسية' : 'Basic Info'}
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'text-right font-arabic' : ''}`}>
                                    {isRTL ? 'الاسم' : 'Name'} <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isRTL ? 'text-right font-arabic' : ''}`}
                                />
                            </div>

                            <div>
                                <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'text-right font-arabic' : ''}`}>
                                    {isRTL ? 'الوصف' : 'Description'}
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={3}
                                    className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isRTL ? 'text-right font-arabic' : ''}`}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'text-right font-arabic' : ''}`}>
                                        {isRTL ? 'تاريخ البدء' : 'Start Date'} <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.startDate}
                                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'text-right font-arabic' : ''}`}>
                                        {isRTL ? 'تاريخ الانتهاء' : 'End Date'} <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.endDate}
                                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Test Content */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className={`text-xl font-semibold mb-4 ${isRTL ? 'font-arabic' : ''}`}>
                            {isRTL ? 'محتوى الاختبار' : 'Test Content'}
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'text-right font-arabic' : ''}`}>
                                    {isRTL ? 'النص' : 'Text'} <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={formData.text}
                                    onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                                    required
                                    rows={4}
                                    className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isRTL ? 'text-right font-arabic' : ''}`}
                                />
                            </div>

                            <div>
                                <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'text-right font-arabic' : ''}`}>
                                    {isRTL ? 'نصوص بديلة' : 'Alternative Texts'}
                                </label>
                                {formData.altTexts.map((altText, index) => (
                                    <div key={index} className="flex gap-2 mb-2">
                                        <textarea
                                            value={altText}
                                            onChange={(e) => updateAltText(index, e.target.value)}
                                            rows={2}
                                            className={`flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isRTL ? 'text-right font-arabic' : ''}`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeAltText(index)}
                                            className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={addAltText}
                                    className={`flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 ${isRTL ? 'flex-row-reverse' : ''}`}
                                >
                                    <Plus className="w-4 h-4" />
                                    <span className={isRTL ? 'font-arabic' : ''}>
                                        {isRTL ? 'إضافة نص بديل' : 'Add Alternative Text'}
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Target Audience */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className={`text-xl font-semibold mb-4 ${isRTL ? 'font-arabic' : ''}`}>
                            {isRTL ? 'الجمهور المستهدف' : 'Target Audience'}
                        </h2>

                        <div className="space-y-3">
                            <label className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    value="students"
                                    checked={formData.targetAudience === 'students'}
                                    onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                                    className="w-4 h-4"
                                />
                                <span className={isRTL ? 'font-arabic' : ''}>
                                    {isRTL ? 'طلاب محددون فقط' : 'Only selected students'}
                                </span>
                            </label>

                            <label className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    value="schools"
                                    checked={formData.targetAudience === 'schools'}
                                    onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                                    className="w-4 h-4"
                                />
                                <span className={isRTL ? 'font-arabic' : ''}>
                                    {isRTL ? 'أي طالب من مدارس محددة' : 'Any student from selected schools'}
                                </span>
                            </label>

                            <label className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    value="subscription"
                                    checked={formData.targetAudience === 'subscription'}
                                    onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                                    className="w-4 h-4"
                                />
                                <span className={isRTL ? 'font-arabic' : ''}>
                                    {isRTL ? 'أي طالب في اشتراكي' : 'Any student in my subscription'}
                                </span>
                            </label>
                        </div>
                    </div>

                    {/* Attempts */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className={`text-xl font-semibold mb-4 ${isRTL ? 'font-arabic' : ''}`}>
                            {isRTL ? 'المحاولات' : 'Attempts'}
                        </h2>

                        <div className="space-y-3">
                            <label className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    value="open"
                                    checked={formData.attemptsAllowed === 'open'}
                                    onChange={(e) => setFormData({ ...formData, attemptsAllowed: e.target.value })}
                                    className="w-4 h-4"
                                />
                                <span className={isRTL ? 'font-arabic' : ''}>
                                    {isRTL ? 'مفتوح (غير محدود)' : 'Open (unlimited)'}
                                </span>
                            </label>

                            <label className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    value="once"
                                    checked={formData.attemptsAllowed === 'once'}
                                    onChange={(e) => setFormData({ ...formData, attemptsAllowed: e.target.value })}
                                    className="w-4 h-4"
                                />
                                <span className={isRTL ? 'font-arabic' : ''}>
                                    {isRTL ? 'مرة واحدة' : 'Once'}
                                </span>
                            </label>

                            <label className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    value="limited"
                                    checked={formData.attemptsAllowed === 'limited'}
                                    onChange={(e) => setFormData({ ...formData, attemptsAllowed: e.target.value })}
                                    className="w-4 h-4"
                                />
                                <span className={isRTL ? 'font-arabic' : ''}>
                                    {isRTL ? 'عدد محدد من المرات' : 'Specific number of times'}
                                </span>
                            </label>

                            {formData.attemptsAllowed === 'limited' && (
                                <input
                                    type="number"
                                    value={formData.attemptsCount}
                                    onChange={(e) => setFormData({ ...formData, attemptsCount: parseInt(e.target.value) })}
                                    min="1"
                                    className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ml-6"
                                />
                            )}
                        </div>
                    </div>

                    {/* Time Limit */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className={`text-xl font-semibold mb-4 ${isRTL ? 'font-arabic' : ''}`}>
                            {isRTL ? 'الحد الزمني' : 'Time Limit'}
                        </h2>

                        <div className="space-y-3">
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={formData.hasTimeLimit}
                                    onChange={(e) => setFormData({ ...formData, hasTimeLimit: e.target.checked })}
                                    className="w-4 h-4"
                                />
                                <span className={isRTL ? 'font-arabic' : ''}>
                                    {isRTL ? 'تحديد الوقت' : 'Limit time'}
                                </span>
                            </label>

                            {formData.hasTimeLimit && (
                                <div className="ml-6">
                                    <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'text-right font-arabic' : ''}`}>
                                        {isRTL ? 'عدد الدقائق' : 'Number of minutes'}
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.timeLimit}
                                        onChange={(e) => setFormData({ ...formData, timeLimit: parseInt(e.target.value) })}
                                        min="1"
                                        className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Passing Requirements */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className={`text-xl font-semibold mb-4 ${isRTL ? 'font-arabic' : ''}`}>
                            {isRTL ? 'متطلبات النجاح' : 'Passing Requirements'}
                        </h2>

                        <div className="space-y-3">
                            <label className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    value="everyone"
                                    checked={formData.passingCriteria === 'everyone'}
                                    onChange={(e) => setFormData({ ...formData, passingCriteria: e.target.value })}
                                    className="w-4 h-4"
                                />
                                <span className={isRTL ? 'font-arabic' : ''}>
                                    {isRTL ? 'الجميع ينجح بعد محاولة واحدة' : 'Everyone passes after one attempt'}
                                </span>
                            </label>

                            <label className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    value="criteria"
                                    checked={formData.passingCriteria === 'criteria'}
                                    onChange={(e) => setFormData({ ...formData, passingCriteria: e.target.value })}
                                    className="w-4 h-4"
                                />
                                <span className={isRTL ? 'font-arabic' : ''}>
                                    {isRTL ? 'فقط من يستوفي معايير الأداء' : 'Only those who meet performance criteria'}
                                </span>
                            </label>

                            {formData.passingCriteria === 'criteria' && (
                                <div className="ml-6 space-y-3">
                                    <div>
                                        <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'text-right font-arabic' : ''}`}>
                                            {isRTL ? 'الحد الأدنى للدقة (%)' : 'Minimum Accuracy (%)'}
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.minAccuracy}
                                            onChange={(e) => setFormData({ ...formData, minAccuracy: parseInt(e.target.value) })}
                                            min="0"
                                            max="100"
                                            className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'text-right font-arabic' : ''}`}>
                                            {isRTL ? 'الحد الأدنى للسرعة (WPM)' : 'Minimum Speed (WPM)'}
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.minSpeed}
                                            onChange={(e) => setFormData({ ...formData, minSpeed: parseInt(e.target.value) })}
                                            min="0"
                                            className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Student Feedback */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className={`text-xl font-semibold mb-4 ${isRTL ? 'font-arabic' : ''}`}>
                            {isRTL ? 'ملاحظات الطالب' : 'Student Feedback'}
                        </h2>

                        <div className="space-y-3">
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={formData.showScore}
                                    onChange={(e) => setFormData({ ...formData, showScore: e.target.checked })}
                                    className="w-4 h-4"
                                />
                                <span className={isRTL ? 'font-arabic' : ''}>
                                    {isRTL ? 'إظهار النتيجة للطالب' : 'Show score to student'}
                                </span>
                            </label>

                            {formData.showScore && (
                                <div className="ml-6 space-y-3">
                                    <div>
                                        <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'text-right font-arabic' : ''}`}>
                                            {isRTL ? 'هدف السرعة (WPM)' : 'Speed Goal (WPM)'}
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.speedGoal}
                                            onChange={(e) => setFormData({ ...formData, speedGoal: parseInt(e.target.value) })}
                                            min="0"
                                            className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'text-right font-arabic' : ''}`}>
                                            {isRTL ? 'الحد الأقصى للنقاط' : 'Max Score (points)'}
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.maxScore}
                                            onChange={(e) => setFormData({ ...formData, maxScore: parseInt(e.target.value) })}
                                            min="0"
                                            className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Test Options */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className={`text-xl font-semibold mb-4 ${isRTL ? 'font-arabic' : ''}`}>
                            {isRTL ? 'خيارات الاختبار' : 'Test Options'}
                        </h2>

                        <div className="space-y-3">
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={formData.disableBackspace}
                                    onChange={(e) => setFormData({ ...formData, disableBackspace: e.target.checked })}
                                    className="w-4 h-4"
                                />
                                <span className={isRTL ? 'font-arabic' : ''}>
                                    {isRTL ? 'تعطيل زر المسافة للخلف' : 'Disable Backspace'}
                                </span>
                            </label>

                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={formData.issueCertificate}
                                    onChange={(e) => setFormData({ ...formData, issueCertificate: e.target.checked })}
                                    className="w-4 h-4"
                                />
                                <span className={isRTL ? 'font-arabic' : ''}>
                                    {isRTL ? 'إصدار شهادة للطلاب الناجحين' : 'Issue Certificate to students who pass'}
                                </span>
                            </label>
                        </div>
                    </div>

                    {/* Submit Buttons */}
                    <div className={`flex gap-4`}>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed ${isRTL ? 'font-arabic' : ''}`}
                        >
                            {loading
                                ? isRTL ? 'جاري التحديث...' : 'Updating...'
                                : isRTL ? 'تحديث الاختبار' : 'Update Test'}
                        </button>
                        <button
                            type="button"
                            onClick={() => router.push(`/instructor/tests/${params.id}`)}
                            className={`px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors ${isRTL ? 'font-arabic' : ''}`}
                        >
                            {isRTL ? 'إلغاء' : 'Cancel'}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
}

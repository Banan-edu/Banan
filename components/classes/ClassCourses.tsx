
'use client';

import { useState, useEffect } from 'react';
import { Plus, Settings, BarChart3, RotateCcw, BookOpen, Users, Globe, GraduationCap } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';

interface Course {
    id: number;
    name: string;
    description: string;
    language: string;
    enrolledClasses: number;
    editorName: string;
    lessonsCount: number;
    grade: string;
    progress?: number;
    activeStudents?: number;
    totalStudents?: number;
    settings?: {
        prerequisiteId?: number;
        speedAdjustment?: number;
        accuracyRequirement?: number;
        lessonProgressLimit?: string;
        hasPlacementTest?: boolean;
    };
}

interface ClassCoursesProps {
    isRTL: boolean;
}

export default function ClassCourses({ isRTL }: ClassCoursesProps) {
    const router = useRouter();
    const [courses, setCourses] = useState<Course[]>([]);
    const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showOptionsModal, setShowOptionsModal] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [selectedCourseIds, setSelectedCourseIds] = useState<number[]>([]);

    // Options state
    const [prerequisiteId, setPrerequisiteId] = useState<number | null>(null);
    const [speedAdjustment, setSpeedAdjustment] = useState(0);
    const [accuracyRequirement, setAccuracyRequirement] = useState(0);
    const [lessonProgressLimit, setLessonProgressLimit] = useState('all');
    const [hasPlacementTest, setHasPlacementTest] = useState(false);
    const params = useParams();
    const classId = params.id;
    useEffect(() => {
        fetchCourses();
    }, [classId]);

    const fetchCourses = async () => {
        try {
            const res = await fetch(`/api/instructor/classes/${classId}/courses`);
            if (res.ok) {
                const data = await res.json();
                setCourses(data.courses || []);
            }
        } catch (error) {
            console.error('Error fetching courses:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAvailableCourses = async () => {
        try {
            const res = await fetch('/api/instructor/courses');
            if (res.ok) {
                const data = await res.json();
                setAvailableCourses(data.courses || []);
            }
        } catch (error) {
            console.error('Error fetching available courses:', error);
        }
    };

    const handleAddCourses = async () => {
        try {
            const res = await fetch(`/api/instructor/classes/${classId}/courses`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ courseIds: selectedCourseIds }),
            });

            if (res.ok) {
                setShowAddModal(false);
                setSelectedCourseIds([]);
                fetchCourses();
            }
        } catch (error) {
            console.error('Error adding courses:', error);
        }
    };

    const handleClearProgress = async (courseId: number) => {
        if (!confirm(isRTL ? 'هل أنت متأكد من مسح التقدم؟' : 'Are you sure you want to clear progress?')) return;

        try {
            const res = await fetch(`/api/instructor/classes/${classId}/courses/${courseId}/progress`, {
                method: 'DELETE',
            });
            if (res.ok) {
                fetchCourses();
            }
        } catch (error) {
            console.error('Error clearing progress:', error);
        }
    };

    const handleSaveOptions = async () => {
        if (!selectedCourse) return;

        try {
            const res = await fetch(`/api/instructor/classes/${classId}/courses/${selectedCourse.id}/settings`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prerequisiteId,
                    speedAdjustment,
                    accuracyRequirement,
                    lessonProgressLimit,
                    hasPlacementTest,
                }),
            });

            if (res.ok) {
                setShowOptionsModal(false);
                fetchCourses();
            }
        } catch (error) {
            console.error('Error saving options:', error);
        }
    };

    const openOptionsModal = (course: Course) => {
        setSelectedCourse(course);
        setPrerequisiteId(course.settings?.prerequisiteId || null);
        setSpeedAdjustment(course.settings?.speedAdjustment || 0);
        setAccuracyRequirement(course.settings?.accuracyRequirement || 0);
        setLessonProgressLimit(course.settings?.lessonProgressLimit || 'all');
        setHasPlacementTest(course.settings?.hasPlacementTest || false);
        setShowOptionsModal(true);
    };

    const renderProgressChart = (course: Course) => {
        const lessons = Array.from({ length: course.lessonsCount }, (_, i) => i);
        const completedLessons = Math.floor((course.progress || 0) / 100 * course.lessonsCount);

        return (
            <div className="flex items-center gap-1 overflow-x-auto py-2">
                {lessons.map((_, index) => (
                    <div
                        key={index}
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${index < completedLessons
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-200 text-gray-600'
                            }`}
                    >
                        {index + 1}
                    </div>
                ))}
            </div>
        );
    };

    const renderDoughnutChart = (course: Course) => {
        const active = course.activeStudents || 0;
        const total = course.totalStudents || 0;
        const percentage = total > 0 ? (active / total) * 100 : 0;

        return (
            <div className="flex items-center gap-4">
                <div className="relative w-20 h-20">
                    <svg className="transform -rotate-90 w-20 h-20">
                        <circle
                            cx="40"
                            cy="40"
                            r="32"
                            stroke="#e5e7eb"
                            strokeWidth="8"
                            fill="none"
                        />
                        <circle
                            cx="40"
                            cy="40"
                            r="32"
                            stroke="#3b82f6"
                            strokeWidth="8"
                            fill="none"
                            strokeDasharray={`${percentage * 2.01} 201`}
                        />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-sm font-bold">{active}/{total}</span>
                    </div>
                </div>
                <div className="text-sm text-gray-600">
                    {isRTL ? 'طلاب نشطين' : 'Active Students'}
                </div>
            </div>
        );
    };

    if (loading) {
        return <div className="text-center py-8">{isRTL ? 'جاري التحميل...' : 'Loading...'}</div>;
    }

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className={`text-xl font-semibold ${isRTL ? 'font-arabic' : ''}`}>
                    {isRTL ? 'الدورات المعينة' : 'Assigned Courses'}
                </h2>
                <button
                    onClick={() => {
                        fetchAvailableCourses();
                        setShowAddModal(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    <Plus className="w-4 h-4" />
                    {isRTL ? 'إضافة دورة' : 'Add Course'}
                </button>
            </div>

            {courses.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                    {isRTL ? 'لا توجد دورات معينة' : 'No courses assigned yet'}
                </p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {courses.map((course) => (
                        <div key={course.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex-1">
                                    <h3
                                        className="text-lg font-semibold text-blue-600 hover:underline cursor-pointer"
                                        onClick={() => router.push(`/instructor/courses/${course.id}`)}
                                    >
                                        {course.name}
                                    </h3>
                                    <p className="text-sm text-gray-600 mt-1">{course.description}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                                <div className="flex items-center gap-2">
                                    <Users className="w-4 h-4 text-gray-400" />
                                    <span>{course.enrolledClasses} {isRTL ? 'فصول' : 'classes'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <BookOpen className="w-4 h-4 text-gray-400" />
                                    <span>{course.lessonsCount} {isRTL ? 'دروس' : 'lessons'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Globe className="w-4 h-4 text-gray-400" />
                                    <span>{course.language === 'ar' ? 'عربي' : 'English'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <GraduationCap className="w-4 h-4 text-gray-400" />
                                    <span>{course.grade || 'N/A'}</span>
                                </div>
                            </div>

                            <div className="mb-4">
                                <p className="text-xs text-gray-500 mb-2">{isRTL ? 'تقدم الدروس' : 'Lesson Progress'}</p>
                                {renderProgressChart(course)}
                            </div>

                            <div className="mb-4">
                                {renderDoughnutChart(course)}
                            </div>

                            <div className="flex gap-2 flex-wrap">
                                <button
                                    onClick={() => handleClearProgress(course.id)}
                                    className="flex items-center gap-1 px-3 py-1.5 text-sm bg-red-50 text-red-600 rounded hover:bg-red-100"
                                >
                                    <RotateCcw className="w-3.5 h-3.5" />
                                    {isRTL ? 'مسح التقدم' : 'Clear Progress'}
                                </button>
                                <button
                                    // onClick={() => router.push(`/instructor/courses/${course.id}/stats?classId=${classId}`)}
                                    className="flex items-center gap-1 px-3 py-1.5 text-sm bg-green-50 text-green-600 rounded hover:bg-green-100"
                                >
                                    <BarChart3 className="w-3.5 h-3.5" />
                                    {isRTL ? 'إحصائيات' : 'View Stats'}
                                </button>
                                <button
                                    onClick={() => openOptionsModal(course)}
                                    className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                                >
                                    <Settings className="w-3.5 h-3.5" />
                                    {isRTL ? 'خيارات' : 'Options'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Courses Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                        <h3 className="text-xl font-bold mb-4">{isRTL ? 'إضافة دورات' : 'Add Courses'}</h3>

                        <div className="space-y-2 mb-4">
                            {availableCourses.map((course) => (
                                <label key={course.id} className="flex items-center gap-3 p-3 border rounded hover:bg-gray-50 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={selectedCourseIds.includes(course.id)}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setSelectedCourseIds([...selectedCourseIds, course.id]);
                                            } else {
                                                setSelectedCourseIds(selectedCourseIds.filter(id => id !== course.id));
                                            }
                                        }}
                                        className="w-4 h-4"
                                    />
                                    <div className="flex-1">
                                        <p className="font-medium">{course.name}</p>
                                        <p className="text-sm text-gray-600">{course.lessonsCount} lessons • {course.language === 'ar' ? 'Arabic' : 'English'}</p>
                                    </div>
                                </label>
                            ))}
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                {isRTL ? 'إلغاء' : 'Cancel'}
                            </button>
                            <button
                                onClick={handleAddCourses}
                                disabled={selectedCourseIds.length === 0}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                            >
                                {isRTL ? 'إضافة' : 'Add Selected'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Options Modal */}
            {showOptionsModal && selectedCourse && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <h3 className="text-xl font-bold mb-4">{isRTL ? 'خيارات الدورة' : 'Course Options'}</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    {isRTL ? 'المتطلبات السابقة' : 'Prerequisites'}
                                </label>
                                <select
                                    value={prerequisiteId || 'none'}
                                    onChange={(e) => setPrerequisiteId(e.target.value === 'none' ? null : parseInt(e.target.value))}
                                    className="w-full px-3 py-2 border rounded-lg"
                                >
                                    <option value="none">{isRTL ? 'لا يوجد' : 'None'}</option>
                                    {courses.filter(c => c.id !== selectedCourse.id).map((c) => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    {isRTL ? 'تعديل السرعة (كلمة/دقيقة)' : 'Speed Adjustment (WPM)'}
                                </label>
                                <input
                                    type="number"
                                    value={speedAdjustment}
                                    onChange={(e) => setSpeedAdjustment(parseInt(e.target.value) || 0)}
                                    className="w-full px-3 py-2 border rounded-lg"
                                    placeholder="e.g., +2 or -2"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    {isRTL ? 'الحد الأدنى للدقة (%)' : 'Minimum Accuracy (%)'}
                                </label>
                                <input
                                    type="number"
                                    value={accuracyRequirement}
                                    onChange={(e) => setAccuracyRequirement(parseInt(e.target.value) || 0)}
                                    className="w-full px-3 py-2 border rounded-lg"
                                    min="0"
                                    max="100"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    {isRTL ? 'حد تقدم الدرس' : 'Lesson Progress Limit'}
                                </label>
                                <select
                                    value={lessonProgressLimit}
                                    onChange={(e) => setLessonProgressLimit(e.target.value)}
                                    className="w-full px-3 py-2 border rounded-lg"
                                >
                                    <option value="all">{isRTL ? 'جميع الدروس' : 'All Lessons'}</option>
                                    <option value="sequential">{isRTL ? 'مستوى بمستوى' : 'Level by Level'}</option>
                                </select>
                            </div>

                            <div>
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={hasPlacementTest}
                                        onChange={(e) => setHasPlacementTest(e.target.checked)}
                                        className="w-4 h-4"
                                    />
                                    <span className="text-sm font-medium">
                                        {isRTL ? 'تفعيل اختبار تحديد المستوى' : 'Enable Placement Test'}
                                    </span>
                                </label>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowOptionsModal(false)}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                {isRTL ? 'إلغاء' : 'Cancel'}
                            </button>
                            <button
                                onClick={handleSaveOptions}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                {isRTL ? 'حفظ' : 'Save'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}


'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar, studentLinks } from '@/components/Sidebar';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { CheckCircle2 } from 'lucide-react';

interface Course {
    id: number;
    name: string;
    description: string;
    language: string;
    lessonsCount: number;
    completedLessons: number;
    progress: number;
    isCompleted: boolean;
}

export default function StudentDashboard() {
    const [user, setUser] = useState<any>(null);
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const { isRTL } = useLanguage();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('/api/auth/me');
                if (!res.ok) {
                    router.push('/login');
                    return;
                }
                const data = await res.json();
                setUser(data.user);

                const coursesRes = await fetch('/api/student/courses');
                if (coursesRes.ok) {
                    const coursesData = await coursesRes.json();
                    setCourses(coursesData.courses || []);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-xl">Loading...</div>
            </div>
        );
    }

    const inProgressCourses = courses.filter(c => !c.isCompleted);
    const completedCourses = courses.filter(c => c.isCompleted);

    const CourseCard = ({ course }: { course: Course }) => (
        <div
            onClick={() => router.push(`/student/courses/${course.id}`)}
            className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow cursor-pointer p-6"
        >
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">{course.name}</h3>
                <div className="flex items-center gap-2">
                    {course.isCompleted && (
                        <CheckCircle2 className="w-6 h-6 text-green-600" />
                    )}
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        {course.language === 'ar' ? 'Arabic' : 'English'}
                    </span>
                </div>
            </div>
            
            <p className="text-gray-600 mb-4">{course.description || 'No description'}</p>
            
            {/* Progress Bar */}
            <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">
                        {course.completedLessons} / {course.lessonsCount} {isRTL ? 'دروس' : 'lessons'}
                    </span>
                    <span className="text-sm font-semibold text-blue-600">
                        {course.progress}%
                    </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                        className={`h-2.5 rounded-full transition-all duration-300 ${
                            course.isCompleted ? 'bg-green-600' : 'bg-blue-600'
                        }`}
                        style={{ width: `${course.progress}%` }}
                    ></div>
                </div>
            </div>

            <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">
                    {course.lessonsCount || 0} {isRTL ? 'دروس' : 'lessons'}
                </span>
                <span className={`font-medium ${course.isCompleted ? 'text-green-600' : 'text-blue-600'}`}>
                    {course.isCompleted ? (isRTL ? 'مكتمل' : 'Completed') : (isRTL ? 'ابدأ' : 'Continue')} →
                </span>
            </div>
        </div>
    );

    return (
        <div className={`flex min-h-screen bg-gray-50`}>
            <Sidebar links={studentLinks} userRole="student" />

            <main className="flex-1 px-8 py-8">
                <div className={`mb-8 ${isRTL ? 'text-right' : 'text-left'}`}>
                    <h2 className={`text-3xl font-bold text-gray-900 mb-2 ${isRTL ? 'font-arabic' : ''}`}>
                        {isRTL ? 'دوراتي' : 'My Courses'}
                    </h2>
                    <p className={`text-gray-600 ${isRTL ? 'font-arabic' : ''}`}>
                        {isRTL ? 'اختر دورة لبدء الممارسة' : 'Select a course to start practicing'}
                    </p>
                </div>

                {courses.length === 0 ? (
                    <div className={`text-center py-12 ${isRTL ? 'font-arabic' : ''}`}>
                        <p className="text-gray-500 text-lg">
                            {isRTL ? 'لم يتم تعيين أي دورات بعد' : 'No courses assigned yet'}
                        </p>
                        <p className="text-gray-400 mt-2">
                            {isRTL ? 'اتصل بمعلمك للبدء' : 'Contact your instructor to get started'}
                        </p>
                    </div>
                ) : (
                    <>
                        {/* In Progress Courses */}
                        {inProgressCourses.length > 0 && (
                            <div className="mb-8">
                                <h3 className={`text-xl font-semibold text-gray-900 mb-4 ${isRTL ? 'font-arabic text-right' : ''}`}>
                                    {isRTL ? 'الدورات الجارية' : 'Courses'}
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {inProgressCourses.map((course) => (
                                        <CourseCard key={course.id} course={course} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Completed Courses */}
                        {completedCourses.length > 0 && (
                            <div>
                                <h3 className={`text-xl font-semibold text-gray-900 mb-4 ${isRTL ? 'font-arabic text-right' : ''}`}>
                                    {isRTL ? 'الدورات المكتملة' : 'Completed'}
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {completedCourses.map((course) => (
                                        <CourseCard key={course.id} course={course} />
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
}

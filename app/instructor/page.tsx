
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar, instructorLinks } from '@/components/Sidebar';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { Users, GraduationCap, BarChart3, BookOpen, Clock, Star } from 'lucide-react';

interface DashboardStats {
  activeClasses: number;
  activeStudents: number;
  practicePerStudent: number;
  lessonsPerStudent: number;
}

interface LiveActivity {
  id: number;
  studentName: string;
  lessonName: string;
  score: number;
  stars: number;
  accuracy: number;
  speed: number;
  completedAt: string;
}

interface ActiveClass {
  id: number;
  name: string;
  studentCount: number;
  courseCount: number;
}

export default function InstructorDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    activeClasses: 0,
    activeStudents: 0,
    practicePerStudent: 0,
    lessonsPerStudent: 0,
  });
  const [liveActivity, setLiveActivity] = useState<LiveActivity[]>([]);
  const [activeClasses, setActiveClasses] = useState<ActiveClass[]>([]);
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

        const statsRes = await fetch('/api/instructor/dashboard/stats');
        if (statsRes.ok) {
          const data = await statsRes.json();
          setStats(data.stats);
          setLiveActivity(data.liveActivity);
          setActiveClasses(data.activeClasses);
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

  const statCards = [
    {
      title: isRTL ? 'الصفوف النشطة' : 'Active Classes',
      value: stats.activeClasses,
      icon: Users,
      color: 'blue',
    },
    {
      title: isRTL ? 'الطلاب النشطون' : 'Active Students',
      value: stats.activeStudents,
      icon: GraduationCap,
      color: 'green',
    },
    {
      title: isRTL ? 'تمرين لكل طالب' : 'Practice per Student',
      value: stats.practicePerStudent,
      icon: BarChart3,
      color: 'purple',
    },
    {
      title: isRTL ? 'دروس لكل طالب' : 'Lessons per Student',
      value: stats.lessonsPerStudent,
      icon: BookOpen,
      color: 'orange',
    },
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-50 text-blue-600 border-blue-200',
      green: 'bg-green-50 text-green-600 border-green-200',
      purple: 'bg-purple-50 text-purple-600 border-purple-200',
      orange: 'bg-orange-50 text-orange-600 border-orange-200',
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className={`flex min-h-screen bg-gray-50`}>
      <Sidebar links={instructorLinks} userRole="instructor" />

      <main className="flex-1 px-8 py-8">
        <h2 className={`text-3xl font-bold text-gray-900 mb-8 ${isRTL ? 'text-right font-arabic' : ''}`}>
          {isRTL ? 'لوحة التحكم' : 'Dashboard'}
        </h2>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className={`bg-white rounded-xl shadow-md p-6 border-l-4 ${getColorClasses(stat.color)}`}
              >
                <div className="flex items-center justify-between">
                  <div className={isRTL ? 'text-right' : ''}>
                    <div className={`text-gray-500 text-sm mb-2 ${isRTL ? 'font-arabic' : ''}`}>
                      {stat.title}
                    </div>
                    <div className={`text-3xl font-bold ${isRTL ? 'text-right' : ''}`}>
                      {stat.value}
                    </div>
                  </div>
                  <Icon className="w-10 h-10 opacity-50" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Tables Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Live Activity Feed */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className={`text-xl font-semibold text-gray-900 mb-4 ${isRTL ? 'text-right font-arabic' : ''}`}>
              {isRTL ? 'النشاط المباشر' : 'Live Activity Feed'}
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className={`pb-3 text-sm font-medium text-gray-600 ${isRTL ? 'text-right font-arabic' : 'text-left'}`}>
                      {isRTL ? 'الطالب' : 'Student'}
                    </th>
                    <th className={`pb-3 text-sm font-medium text-gray-600 ${isRTL ? 'text-right font-arabic' : 'text-left'}`}>
                      {isRTL ? 'الدرس' : 'Lesson'}
                    </th>
                    <th className={`pb-3 text-sm font-medium text-gray-600 ${isRTL ? 'text-right font-arabic' : 'text-left'}`}>
                      {isRTL ? 'النتيجة' : 'Score'}
                    </th>
                    <th className={`pb-3 text-sm font-medium text-gray-600 ${isRTL ? 'text-right font-arabic' : 'text-left'}`}>
                      {isRTL ? 'الوقت' : 'Time'}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {liveActivity.length === 0 ? (
                    <tr>
                      <td colSpan={4} className={`py-8 text-center text-gray-500 ${isRTL ? 'font-arabic' : ''}`}>
                        {isRTL ? 'لا يوجد نشاط حديث' : 'No recent activity'}
                      </td>
                    </tr>
                  ) : (
                    liveActivity.map((activity) => (
                      <tr key={activity.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className={`py-3 text-sm text-gray-900 ${isRTL ? 'text-right' : 'text-left'}`}>
                          {activity.studentName}
                        </td>
                        <td className={`py-3 text-sm text-gray-600 ${isRTL ? 'text-right' : 'text-left'}`}>
                          {activity.lessonName}
                        </td>
                        <td className={`py-3 ${isRTL ? 'text-right' : 'text-left'}`}>
                          <div className="flex items-center gap-1">
                            <span className="text-sm font-medium text-gray-900">{activity.score}</span>
                            <div className="flex">
                              {[...Array(activity.stars)].map((_, i) => (
                                <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                              ))}
                            </div>
                          </div>
                        </td>
                        <td className={`py-3 text-xs text-gray-500 ${isRTL ? 'text-right' : 'text-left'}`}>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(activity.completedAt).toLocaleTimeString(isRTL ? 'ar' : 'en', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Active Classes */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className={`text-xl font-semibold text-gray-900 mb-4 ${isRTL ? 'text-right font-arabic' : ''}`}>
              {isRTL ? 'الصفوف النشطة' : 'Active Classes'}
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className={`pb-3 text-sm font-medium text-gray-600 ${isRTL ? 'text-right font-arabic' : 'text-left'}`}>
                      {isRTL ? 'اسم الصف' : 'Class Name'}
                    </th>
                    <th className={`pb-3 text-sm font-medium text-gray-600 ${isRTL ? 'text-right font-arabic' : 'text-left'}`}>
                      {isRTL ? 'الطلاب' : 'Students'}
                    </th>
                    <th className={`pb-3 text-sm font-medium text-gray-600 ${isRTL ? 'text-right font-arabic' : 'text-left'}`}>
                      {isRTL ? 'الدورات' : 'Courses'}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {activeClasses.length === 0 ? (
                    <tr>
                      <td colSpan={3} className={`py-8 text-center text-gray-500 ${isRTL ? 'font-arabic' : ''}`}>
                        {isRTL ? 'لا توجد صفوف نشطة' : 'No active classes'}
                      </td>
                    </tr>
                  ) : (
                    activeClasses.map((classItem) => (
                      <tr
                        key={classItem.id}
                        className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                        onClick={() => router.push(`/instructor/classes`)}
                      >
                        <td className={`py-3 text-sm font-medium text-gray-900 ${isRTL ? 'text-right' : 'text-left'}`}>
                          {classItem.name}
                        </td>
                        <td className={`py-3 text-sm text-gray-600 ${isRTL ? 'text-right' : 'text-left'}`}>
                          <div className="flex items-center gap-1">
                            <GraduationCap className="w-4 h-4" />
                            <span>{classItem.studentCount}</span>
                          </div>
                        </td>
                        <td className={`py-3 text-sm text-gray-600 ${isRTL ? 'text-right' : 'text-left'}`}>
                          <div className="flex items-center gap-1">
                            <BookOpen className="w-4 h-4" />
                            <span>{classItem.courseCount}</span>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}

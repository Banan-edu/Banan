'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar, studentLinks } from '@/components/Sidebar';
import { useLanguage } from '@/app/contexts/LanguageContext';
import {
  BookOpen,
  Trophy,
  Clock,
  Target,
  TrendingUp,
  TrendingDown,
  Calendar,
  Award,
  BarChart3
} from 'lucide-react';

interface DashboardStats {
  totalCourses: number;
  completedLessons: number;
  totalLessons: number;
  totalStars: number;
  totalScore: number;
  averageAccuracy: number;
  averageSpeed: number;
  totalTimeSpent: number;
  streak: number;
}

interface RecentActivity {
  id: number;
  lessonName: string;
  courseName: string;
  score: number;
  stars: number;
  accuracy: number;
  speed: number;
  completedAt: string;
}

interface LetterStat {
  letter: string;
  totalCount: number;
  correctCount: number;
  accuracy: number;
  avgTimeMs: number;
  commonErrors: Record<string, number>;
}

interface TypingPattern {
  from: string;
  to: string;
  count: number;
  type: string;
}

export default function StudentDashboard() {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [letterStats, setLetterStats] = useState<LetterStat[]>([]);
  const [patterns, setPatterns] = useState<TypingPattern[]>([]);
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

        // Fetch dashboard stats
        const statsRes = await fetch('/api/student/dashboard/stats');
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData.stats);
          setRecentActivity(statsData.recentActivity || []);
        }

        // Fetch letter statistics
        const letterRes = await fetch('/api/student/letter-stats');
        if (letterRes.ok) {
          const letterData = await letterRes.json();
          setLetterStats(letterData.letterStats || []);
          setPatterns(letterData.patterns || []);
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

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) return `${hours}h ${minutes}m ${secs}s`;
    if (minutes > 0) return `${minutes}m ${secs}s`;
    return `${secs}s`;
  };

  const progressPercentage = stats && stats.totalLessons > 0
    ? Math.round((stats.completedLessons / stats.totalLessons) * 100)
    : 0;

  const weakestLetters = [...letterStats]
    .filter(l => l.totalCount >= 5)
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, 5);

  const strongestLetters = [...letterStats]
    .filter(l => l.totalCount >= 5)
    .sort((a, b) => b.accuracy - a.accuracy)
    .slice(0, 5);

  return (
    <div className={`flex min-h-screen bg-gray-50`}>
      <Sidebar links={studentLinks} userRole="student" />

      <main className="flex-1 px-8 py-8">
        {/* Header */}
        <div className={`mb-8 ${isRTL ? 'text-right' : 'text-left'}`}>
          <h2 className={`text-3xl font-bold text-gray-900 mb-2 ${isRTL ? 'font-arabic' : ''}`}>
            {isRTL ? 'مرحباً' : 'Welcome'}, {user?.name || 'Student'}!
          </h2>
          <p className={`text-gray-600 ${isRTL ? 'font-arabic' : ''}`}>
            {isRTL ? 'إليك ملخص تقدمك' : "Here's your learning progress"}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Courses */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">
                {stats?.totalCourses || 0}
              </span>
            </div>
            <h3 className={`text-gray-600 ${isRTL ? 'font-arabic' : ''}`}>
              {isRTL ? 'الدورات' : 'Courses'}
            </h3>
          </div>

          {/* Completed Lessons */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Target className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">
                {stats?.completedLessons || 0}/{stats?.totalLessons || 0}
              </span>
            </div>
            <h3 className={`text-gray-600 ${isRTL ? 'font-arabic' : ''}`}>
              {isRTL ? 'الدروس المكتملة' : 'Lessons Completed'}
            </h3>
          </div>

          {/* Total Stars */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Trophy className="w-6 h-6 text-yellow-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">
                {stats?.totalStars || 0}
              </span>
            </div>
            <h3 className={`text-gray-600 ${isRTL ? 'font-arabic' : ''}`}>
              {isRTL ? 'النجوم' : 'Total Stars'}
            </h3>
          </div>

          {/* Total Time */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">
                {formatTime(stats?.totalTimeSpent || 0)}
              </span>
            </div>
            <h3 className={`text-gray-600 ${isRTL ? 'font-arabic' : ''}`}>
              {isRTL ? 'وقت التدريب' : 'Practice Time'}
            </h3>
          </div>
        </div>

        {/* Performance Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Overall Progress */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className={`text-xl font-semibold text-gray-900 mb-4 ${isRTL ? 'font-arabic text-right' : ''}`}>
              {isRTL ? 'التقدم العام' : 'Overall Progress'}
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-gray-600 ${isRTL ? 'font-arabic' : ''}`}>
                    {isRTL ? 'إكمال الدروس' : 'Lesson Completion'}
                  </span>
                  <span className="font-semibold text-gray-900">{progressPercentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {stats?.averageSpeed || 0}
                  </div>
                  <div className={`text-sm text-gray-600 ${isRTL ? 'font-arabic' : ''}`}>
                    {isRTL ? 'متوسط السرعة' : 'Avg Speed'} (WPM)
                  </div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {stats?.averageAccuracy || 0}%
                  </div>
                  <div className={`text-sm text-gray-600 ${isRTL ? 'font-arabic' : ''}`}>
                    {isRTL ? 'متوسط الدقة' : 'Avg Accuracy'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className={`text-xl font-semibold text-gray-900 mb-4 ${isRTL ? 'font-arabic text-right' : ''}`}>
              {isRTL ? 'إجراءات سريعة' : 'Quick Actions'}
            </h3>
            <div className="space-y-3">
              <button
                onClick={() => router.push('/student/courses')}
                className={`w-full flex items-center gap-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors ${isRTL ? 'flex-row-reverse' : ''}`}
              >
                <BookOpen className="w-5 h-5 text-blue-600" />
                <span className={`text-blue-900 font-medium ${isRTL ? 'font-arabic' : ''}`}>
                  {isRTL ? 'تصفح الدورات' : 'Browse Courses'}
                </span>
              </button>

              <button
                // onClick={() => router.push('/student/analysis')}
                className={`w-full flex items-center gap-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors ${isRTL ? 'flex-row-reverse' : ''}`}
              >
                <BarChart3 className="w-5 h-5 text-purple-600" />
                <span className={`text-purple-900 font-medium ${isRTL ? 'font-arabic' : ''}`}>
                  {isRTL ? 'عرض التحليلات' : 'View Analytics'}
                </span>
              </button>

              <button
                // onClick={() => router.push('/student/badge')}
                className={`w-full flex items-center gap-3 p-4 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors ${isRTL ? 'flex-row-reverse' : ''}`}
              >
                <Award className="w-5 h-5 text-yellow-600" />
                <span className={`text-yellow-900 font-medium ${isRTL ? 'font-arabic' : ''}`}>
                  {isRTL ? 'الشارات' : 'My Badges'}
                </span>
              </button>

              <button
                // onClick={() => router.push('/student/scoreboard')}
                className={`w-full flex items-center gap-3 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors ${isRTL ? 'flex-row-reverse' : ''}`}
              >
                <Trophy className="w-5 h-5 text-green-600" />
                <span className={`text-green-900 font-medium ${isRTL ? 'font-arabic' : ''}`}>
                  {isRTL ? 'لوحة المتصدرين' : 'Leaderboard'}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Letter Statistics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Weakest Letters */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className={`flex items-center gap-2 mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <TrendingDown className="w-5 h-5 text-red-600" />
              <h3 className={`text-xl font-semibold text-gray-900 ${isRTL ? 'font-arabic' : ''}`}>
                {isRTL ? 'حروف للتدريب' : 'Letters to Practice'}
              </h3>
            </div>
            <div className="space-y-3">
              {weakestLetters.length === 0 ? (
                <p className={`text-gray-500 ${isRTL ? 'font-arabic text-right' : ''}`}>
                  {isRTL ? 'لا توجد بيانات بعد. استمر في التدريب!' : 'No data yet. Keep practicing!'}
                </p>
              ) : (
                weakestLetters.map((stat) => (
                  <div key={stat.letter} className={`flex items-center justify-between p-3 bg-gray-50 rounded-lg ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center font-mono font-bold text-red-600">
                        {stat.letter}
                      </div>
                      <div className={isRTL ? 'text-right' : ''}>
                        <div className={`text-sm font-medium ${isRTL ? 'font-arabic' : ''}`}>
                          {stat.accuracy}% {isRTL ? 'دقة' : 'accuracy'}
                        </div>
                        <div className={`text-xs text-gray-500 ${isRTL ? 'font-arabic' : ''}`}>
                          {stat.totalCount} {isRTL ? 'محاولة' : 'attempts'}
                        </div>
                      </div>
                    </div>
                    <div className={isRTL ? 'text-left' : 'text-right'}>
                      {stat.commonErrors && Object.keys(stat.commonErrors).length > 0 && (
                        <div className={`text-xs text-gray-500 ${isRTL ? 'font-arabic' : ''}`}>
                          {isRTL ? 'غالباً ما يُكتب' : 'Often typed'}: {Object.keys(stat.commonErrors)[0]}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Strongest Letters */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className={`flex items-center gap-2 mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <TrendingUp className="w-5 h-5 text-green-600" />
              <h3 className={`text-xl font-semibold text-gray-900 ${isRTL ? 'font-arabic' : ''}`}>
                {isRTL ? 'نقاط قوتك' : 'Your Strengths'}
              </h3>
            </div>
            <div className="space-y-3">
              {strongestLetters.length === 0 ? (
                <p className={`text-gray-500 ${isRTL ? 'font-arabic text-right' : ''}`}>
                  {isRTL ? 'لا توجد بيانات بعد. استمر في التدريب!' : 'No data yet. Keep practicing!'}
                </p>
              ) : (
                strongestLetters.map((stat) => (
                  <div key={stat.letter} className={`flex items-center justify-between p-3 bg-gray-50 rounded-lg ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center font-mono font-bold text-green-600">
                        {stat.letter}
                      </div>
                      <div className={isRTL ? 'text-right' : ''}>
                        <div className={`text-sm font-medium ${isRTL ? 'font-arabic' : ''}`}>
                          {stat.accuracy}% {isRTL ? 'دقة' : 'accuracy'}
                        </div>
                        <div className={`text-xs text-gray-500 ${isRTL ? 'font-arabic' : ''}`}>
                          {stat.totalCount} {isRTL ? 'محاولة' : 'attempts'}
                        </div>
                      </div>
                    </div>
                    <div className={isRTL ? 'text-left' : 'text-right'}>
                      <div className={`flex items-center gap-1 text-xs text-gray-500 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <Clock className="w-3 h-3" />
                        {stat.avgTimeMs}ms {isRTL ? 'معدل' : 'avg'}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Common Error Patterns */}
        {patterns.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <div className={`flex items-center gap-2 mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Target className="w-5 h-5 text-orange-600" />
              <h3 className={`text-xl font-semibold text-gray-900 ${isRTL ? 'font-arabic' : ''}`}>
                {isRTL ? 'أنماط الكتابة الشائعة' : 'Common Typing Patterns'}
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {patterns.slice(0, 6).map((pattern, index) => (
                <div key={index} className="p-4 bg-orange-50 rounded-lg">
                  <div className={`flex items-center gap-2 mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <span className="font-mono font-bold text-lg">{pattern.from}</span>
                    <span className="text-gray-400">→</span>
                    <span className="font-mono font-bold text-lg text-orange-600">{pattern.to}</span>
                  </div>
                  <div className={`text-sm text-gray-600 ${isRTL ? 'font-arabic text-right' : ''}`}>
                    {isRTL ? `حدث ${pattern.count} مرات` : `Occurred ${pattern.count} times`}
                  </div>
                  <div className={`text-xs text-gray-500 mt-1 ${isRTL ? 'font-arabic text-right' : ''}`}>
                    {isRTL ? 'النوع' : 'Type'}: {pattern.type}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className={`text-xl font-semibold text-gray-900 mb-4 ${isRTL ? 'font-arabic text-right' : ''}`}>
            {isRTL ? 'النشاط الأخير' : 'Recent Activity'}
          </h3>

          {recentActivity.length === 0 ? (
            <div className={`text-center py-8 text-gray-500 ${isRTL ? 'font-arabic' : ''}`}>
              {isRTL ? 'لا يوجد نشاط حديث' : 'No recent activity'}
            </div>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className={`flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors ${isRTL ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`flex-1 ${isRTL ? 'text-right' : ''}`}>
                    <h4 className="font-semibold text-gray-900">{activity.lessonName}</h4>
                    <p className="text-sm text-gray-600">{activity.courseName}</p>
                  </div>
                  <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div className="text-center">
                      <div className="text-yellow-600 font-semibold">★ {activity.stars}</div>
                      <div className={`text-xs text-gray-500 ${isRTL ? 'font-arabic' : ''}`}>
                        {isRTL ? 'نجوم' : 'Stars'}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-blue-600 font-semibold">{activity.speed}</div>
                      <div className="text-xs text-gray-500">WPM</div>
                    </div>
                    <div className="text-center">
                      <div className="text-green-600 font-semibold">{activity.accuracy}%</div>
                      <div className={`text-xs text-gray-500 ${isRTL ? 'font-arabic' : ''}`}>
                        {isRTL ? 'دقة' : 'Accuracy'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

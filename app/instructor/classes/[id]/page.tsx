
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Sidebar, instructorLinks } from '@/components/Sidebar';
import { useLanguage } from '@/app/contexts/LanguageContext';
import {
  ArrowLeft, Users, BookOpen, School, Calendar, Settings,
  TrendingUp, FileText, Activity, Trophy, Video, GraduationCap,
  Award,
  Target,
  Eye,
  Keyboard,
  SkipForward,
  Monitor,
  Globe,
  Hand,
  Volume2,
  Mic,
  AlertCircle,
  Palette,
  Type,
  RotateCcw
} from 'lucide-react';
import ClassStudentsManager from '@/components/classes/ClassesStudentManager';
import ClassCourses from '@/components/classes/ClassCourses';

type Tab = 'overview' | 'students' | 'instructors' | 'courses' | 'scoreboard' | 'live';

export default function ClassDetailsPage() {
  const [classData, setClassData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  const { isRTL } = useLanguage();
  const router = useRouter();
  const params = useParams();
  const classId = params.id;

  useEffect(() => {
    fetchClassData();
  }, [classId]);

  const fetchClassData = async () => {
    try {
      const res = await fetch(`/api/instructor/classes/${classId}`);
      if (!res.ok) {
        router.push('/instructor/classes');
        return;
      }
      const data = await res.json();
      setClassData(data.class);
    } catch (error) {
      console.error('Error fetching class:', error);
    } finally {
      setLoading(false);
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!classData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Class not found</div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview' as Tab, label: isRTL ? 'نظرة عامة' : 'Overview', icon: TrendingUp },
    { id: 'students' as Tab, label: isRTL ? 'الطلاب' : 'Students', icon: GraduationCap },
    { id: 'instructors' as Tab, label: isRTL ? 'المعلمون' : 'Instructors', icon: Users },
    { id: 'courses' as Tab, label: isRTL ? 'الدورات' : 'Courses', icon: BookOpen },
    { id: 'scoreboard' as Tab, label: isRTL ? 'لوحة النتائج' : 'Scoreboard', icon: Trophy },
    { id: 'live' as Tab, label: isRTL ? 'نشاط مباشر' : 'Live Activity', icon: Video },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar links={instructorLinks} userRole="instructor" />

      <main className="flex-1 px-8 py-8">
        <div className="mb-6">
          <button
            onClick={() => router.push('/instructor/classes')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            {isRTL ? 'العودة للصفوف' : 'Back to Classes'}
          </button>
          <div className='flex  justify-between items-center'>
            <div>

              <h1 className="text-3xl font-bold text-gray-900">{classData.name}</h1>
              {classData.description && (
                <p className="text-gray-600 mt-2">{classData.description}</p>
              )}
            </div>

            <button
              onClick={() => router.push(`/instructor/classes/${classData.id}/edit`)}
              className="flex-1 md:flex-none px-6 py-3 border border-gray-500 text-gray rounded-lg hover:bg-gray-400 flex items-center gap-2 justify-center"
            >
              <Settings className="w-5 h-5" />
              {isRTL ? 'تعديل المعلومات' : 'Edit Info'}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <div className="flex gap-4 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'overview' && (
            <>
              {/* Overview Stats */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">{isRTL ? 'نظرة عامة' : 'Overview'}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2 text-blue-600 mb-2">
                      <Users className="w-5 h-5" />
                      <span className="font-medium">{isRTL ? 'الطلاب' : 'Students'}</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{classData.studentCount}</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2 text-green-600 mb-2">
                      <Users className="w-5 h-5" />
                      <span className="font-medium">{isRTL ? 'المعلمون' : 'Instructors'}</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{classData.instructorCount}</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <div className="flex items-center gap-2 text-purple-600 mb-2">
                      <School className="w-5 h-5" />
                      <span className="font-medium">{isRTL ? 'المدرسة' : 'School'}</span>
                    </div>
                    <p className="text-lg font-bold text-gray-900">{classData.school?.name || 'N/A'}</p>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-lg">
                    <div className="flex items-center gap-2 text-orange-600 mb-2">
                      <Calendar className="w-5 h-5" />
                      <span className="font-medium">{isRTL ? 'تاريخ الإنشاء' : 'Created'}</span>
                    </div>
                    <p className="text-sm font-bold text-gray-900">
                      {new Date(classData.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Settings */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Settings className="w-6 h-6 text-blue-600" />
                  <h2 className="text-2xl font-bold text-gray-900">{isRTL ? 'الإعدادات' : 'Settings'}</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Schedule Settings */}
                  <div className="flex items-start gap-3 p-4 rounded-lg border">
                    <Calendar className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">Week Start</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {classData.startOfWeek.charAt(0).toUpperCase() + classData.startOfWeek.slice(1)}
                      </p>
                    </div>
                  </div>

                  {/* Stars to Pass */}
                  <div className="flex items-start gap-3 p-4 rounded-lg">
                    <Award className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">Stars to Pass</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {classData.minStarsToPass} {classData.minStarsToPass === 1 ? 'star' : 'stars'} required
                      </p>
                    </div>
                  </div>

                  {/* Daily Goal */}
                  {classData.dailyGoal > 0 && <div className="flex items-start gap-3 p-4 rounded-lg">
                    <Target className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">Daily Goal</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {classData.dailyGoal} min
                      </p>
                    </div>
                  </div>}

                  {/* Weekly Goal */}
                  {classData.weeklyGoal > 0 && <div className="flex items-start gap-3 p-4 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">Weekly Goal</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {classData.weeklyGoal} min
                      </p>
                    </div>
                  </div>}

                  {/* Scoreboard Visibility */}
                  <div className="flex items-start gap-3 p-4 rounded-lg">
                    <Eye className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">Scoreboard</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {classData.scoreboardVisibility === 'public' && "view each other's scores"}
                        {classData.scoreboardVisibility === 'private' && "private"}
                        {classData.scoreboardVisibility === 'leaderboard' && "leaderboard"}
                      </p>
                    </div>
                  </div>

                  {/* Backspace Behavior */}
                  {classData.disableBackspace && <div className="flex items-start gap-3 p-4">
                    <Keyboard className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">Backspace</p>
                      <p className="text-sm text-gray-600 mt-1">
                        Disabled for this class
                      </p>
                    </div>
                  </div>}

                  {/* Jump Ahead */}
                  {!classData.allowJumpAhead && <div className="flex items-start gap-3 p-4">
                    <SkipForward className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">Jump Ahead</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {classData.allowJumpAhead ? 'allowed' : 'not allowed'} to jump ahead
                      </p>
                    </div>
                  </div>}

                  {/* Virtual Keyboard */}
                  {classData.lockVirtualKeyboard && <div className="flex items-start gap-3 p-4">
                    <Monitor className="w-5 h-5 text-pink-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">Virtual Keyboard</p>
                      <p className="text-sm text-gray-600 mt-1">
                        Locked
                      </p>
                    </div>
                  </div>}

                  {/* Keyboard Language */}
                  {classData.lockLanguage &&
                    <div className="flex items-start gap-3 p-4">
                      <Globe className="w-5 h-5 text-teal-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-gray-900">Keyboard Language</p>
                        <p className="text-sm text-gray-600 mt-1">
                          {classData.lockLanguage ? 'Locked' : 'Unlocked'}
                        </p>
                      </div>
                    </div>}

                  {/* Virtual Hands */}
                  {classData.lockHands && <div className="flex items-start gap-3 p-4">
                    <Hand className="w-5 h-5 text-cyan-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">Virtual Hands</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {classData.lockHands ? 'Locked' : 'Unlocked'}
                      </p>
                    </div>
                  </div>}

                  {/* Sound Effects */}
                  {classData.soundFx && <div className="flex items-start gap-3 p-4">
                    <Volume2 className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">Sound Effects</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {classData.soundFx ? 'Enabled' : 'Disabled'}
                      </p>
                    </div>
                  </div>}

                  {/* Voice-over */}
                  {classData.voiceOver && <div className="flex items-start gap-3 p-4">
                    <Mic className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">Voice-over</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {classData.voiceOver ? 'Enabled' : 'Disabled'}
                      </p>
                    </div>
                  </div>}

                  {/* Block on Errors */}
                  {classData.blockOnError && <div className="flex items-start gap-3 p-4">
                    <AlertCircle className="w-5 h-5 text-rose-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">Block on Errors</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {classData.blockOnError ? 'Enabled' : 'Disabled'}
                      </p>
                    </div>
                  </div>}

                  {/* Replay Button */}
                  {!classData.showReplayButton && <div className="flex items-start gap-3 p-4 ">
                    <RotateCcw className="w-5 h-5 text-sky-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">Replay Button</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {classData.showReplayButton ? 'Hidden' : 'Visible'}
                      </p>
                    </div>
                  </div>}
                </div>
              </div>

              {/* Performance */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-gray-600" />
                  <h2 className="text-xl font-semibold">{isRTL ? 'أداء الكتابة' : 'Performance'}</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">{isRTL ? 'السرعة' : 'Speed'}</p>
                    <p className="text-2xl font-bold">-- WPM</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">{isRTL ? 'الدقة' : 'Accuracy'}</p>
                    <p className="text-2xl font-bold">-- %</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">{isRTL ? 'الوقت' : 'Time'}</p>
                    <p className="text-2xl font-bold">--:--:--</p>
                  </div>
                </div>
                <div className="h-64 border rounded-lg flex items-center justify-center text-gray-400 mt-4">
                  Performance Chart Placeholder
                </div>
              </div>

              {/* Record History */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="w-5 h-5 text-gray-600" />
                  <h2 className="text-xl font-semibold">{isRTL ? 'سجل الأحداث' : 'Record History'}</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left">{isRTL ? 'الوقت' : 'Time'}</th>
                        <th className="px-4 py-3 text-left">{isRTL ? 'الوصف' : 'Description'}</th>
                        <th className="px-4 py-3 text-left">{isRTL ? 'بواسطة' : 'By'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-t">
                        <td className="px-4 py-3 text-gray-500" colSpan={3}>No activity yet</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Activity */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Activity className="w-5 h-5 text-gray-600" />
                  <h2 className="text-xl font-semibold">{isRTL ? 'نشاط الصف' : 'Activity'}</h2>
                </div>
                <div className="h-96 border rounded-lg flex items-center justify-center text-gray-400">
                  Punchcard Visualization Placeholder
                </div>
              </div>
            </>
          )}

          {activeTab === 'students' && (
            <ClassStudentsManager
              classId={classId}
              onStudentUpdate={fetchClassData}
            />
          )}

          {activeTab === 'instructors' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">{isRTL ? 'المعلمون' : 'Instructors'}</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3">{isRTL ? 'الاسم' : 'Name'}</th>
                      <th className="px-4 py-3">{isRTL ? 'البريد' : 'Email'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {classData.instructors?.map((instructor: any) => (
                      <tr key={instructor.userId} className="border-t">
                        <td className="px-4 py-3">{instructor.name}</td>
                        <td className="px-4 py-3">{instructor.email}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'courses' && (
            <ClassCourses
              isRTL
            />
          )}
          {/* {activeTab === 'courses' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">{isRTL ? 'الدورات' : 'Courses'}</h2>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  {isRTL ? 'تعيين دورات' : 'Assign Courses'}
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {classData.courses.length === 0 ? (
                  <p className="text-gray-500 col-span-2">No courses assigned</p>
                ) : (
                  classData.courses.map((course: any) => (
                    <div key={course.id} className="border rounded-lg p-4">
                      <h3 className="font-semibold text-lg mb-2">{course.name}</h3>
                      {course.description && <p className="text-sm text-gray-600 mb-3">{course.description}</p>}
                      <div className="flex gap-2 mt-3">
                        <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">View Stats</button>
                        <button className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300">Options</button>
                        <button className="px-3 py-1 bg-red-100 text-red-700 text-sm rounded hover:bg-red-200">Clear Progress</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )} */}

          {activeTab === 'scoreboard' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">{isRTL ? 'لوحة النتائج' : 'Scoreboard'}</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left">{isRTL ? 'الاسم' : 'Name'}</th>
                      <th className="px-4 py-3 text-left">{isRTL ? 'النجوم' : 'Stars'}</th>
                      <th className="px-4 py-3 text-left">{isRTL ? 'النتيجة' : 'Score'}</th>
                      <th className="px-4 py-3 text-left">{isRTL ? 'المدة' : 'Duration'}</th>
                      <th className="px-4 py-3 text-left">{isRTL ? 'السرعة' : 'Avg Speed'}</th>
                      <th className="px-4 py-3 text-left">{isRTL ? 'الدقة' : 'Avg Accuracy'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t">
                      <td className="px-4 py-3 text-gray-500" colSpan={6}>No data available</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'live' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">{isRTL ? 'النشاط المباشر' : 'Live Activity Feed'}</h2>
              <div className="space-y-3">
                <div className="border rounded-lg p-4 text-gray-500 text-center">
                  No live activity at the moment
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

    </div>
  );
}

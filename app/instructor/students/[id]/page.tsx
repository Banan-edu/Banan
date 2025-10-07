
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { Sidebar, instructorLinks } from '@/components/Sidebar';
import {
  User,
  School,
  Mail,
  Clock,
  Activity,
  Award,
  Calendar,
  BookOpen,
  TrendingUp,
  Video,
  Plus,
  Trash2,
  BarChart3,
  Settings,
  ArrowLeft,
} from 'lucide-react';
import {StudentPerformanceTab} from '@/components/students/StudentPerformanceTab';
import { StudentProgressTab } from '@/components/students/StudentProgressTab';

type TabType = 'overview' | 'performance' | 'history' | 'badges' | 'practice' | 'classes' | 'progress' | 'activity';

export default function StudentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isRTL } = useLanguage();
  const studentId = params.id as string;

  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudentData();
  }, [studentId]);

  const fetchStudentData = async () => {
    try {
      const res = await fetch(`/api/instructor/students/${studentId}`);
      if (!res.ok) {
        router.push('/instructor/students');
        return;
      }
      const data = await res.json();
      setStudent(data);
    } catch (error) {
      console.error('Error fetching student:', error);
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

  if (!student) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Student not found</div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: isRTL ? 'نظرة عامة' : 'Overview', icon: User },
    { id: 'performance', label: isRTL ? 'الأداء' : 'Performance', icon: TrendingUp },
    { id: 'history', label: isRTL ? 'السجل' : 'History', icon: Clock },
    { id: 'badges', label: isRTL ? 'الشارات' : 'Badges', icon: Award },
    { id: 'practice', label: isRTL ? 'التمرين' : 'Practice', icon: Calendar },
    { id: 'classes', label: isRTL ? 'الفصول' : 'Classes', icon: School },
    { id: 'progress', label: isRTL ? 'التقدم' : 'Progress', icon: BookOpen },
    { id: 'activity', label: isRTL ? 'النشاط المباشر' : 'Live Activity', icon: Video },
  ];

  return (
    <div className={`flex  min-h-screen bg-gray-50`}>
      <Sidebar links={instructorLinks} userRole="instructor" />

      <main className="flex-1 px-8 py-8">
        <div className="mb-6">
          <button
            onClick={() => router.push('/instructor/students')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            {isRTL ? 'العودة للطلاب' : 'Back to Students'}
          </button>
          <h1 className="text-3xl font-bold text-gray-900">{student.user.name}</h1>
          <p className="text-gray-600">{student.user.email}</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200 overflow-x-auto">
            <nav className="flex space-x-4 px-6" aria-label="Tabs">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as TabType)}
                    className={`py-4 px-3 border-b-2 font-medium text-sm whitespace-nowrap flex items-center gap-2 ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && <OverviewTab student={student} isRTL={isRTL} />}
            {activeTab === 'performance' && <StudentPerformanceTab studentId={studentId} isRTL={isRTL} />}
            {activeTab === 'history' && <HistoryTab studentId={studentId} isRTL={isRTL} />}
            {activeTab === 'badges' && <BadgesTab studentId={studentId} isRTL={isRTL} />}
            {activeTab === 'practice' && <PracticeTab studentId={studentId} isRTL={isRTL} />}
            {activeTab === 'classes' && <ClassesTab studentId={studentId} isRTL={isRTL} fetchStudentData={fetchStudentData} />}
            {activeTab === 'progress' && <StudentProgressTab studentId={studentId} isRTL={isRTL} />}
            {activeTab === 'activity' && <ActivityTab studentId={studentId} isRTL={isRTL} />}
          </div>
        </div>
      </main>
    </div>
  );
}

function OverviewTab({ student, isRTL }: { student: any; isRTL: boolean }) {
  const router = useRouter();

  const handleLoginAsStudent = async () => {
    try {
      const res = await fetch(`/api/instructor/students/${student.user.id}/login-as`, {
        method: 'POST',
      });
      if (res.ok) {
        router.push('/student');
      }
    } catch (error) {
      console.error('Error logging in as student:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 text-gray-600 mb-2">
            <User className="w-4 h-4" />
            <span className="text-sm font-medium">{isRTL ? 'الاسم' : 'Name'}</span>
          </div>
          <p className="text-lg font-semibold">{student.user.name}</p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 text-gray-600 mb-2">
            <Mail className="w-4 h-4" />
            <span className="text-sm font-medium">{isRTL ? 'البريد الإلكتروني' : 'Email'}</span>
          </div>
          <p className="text-lg font-semibold">{student.user.email}</p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 text-gray-600 mb-2">
            <School className="w-4 h-4" />
            <span className="text-sm font-medium">{isRTL ? 'عدد الفصول' : 'Number of Classes'}</span>
          </div>
          <p className="text-lg font-semibold">{student.classCount || 0}</p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 text-gray-600 mb-2">
            <School className="w-4 h-4" />
            <span className="text-sm font-medium">{isRTL ? 'المدرسة' : 'School Name'}</span>
          </div>
          <p className="text-lg font-semibold">{student.schoolName || 'N/A'}</p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 text-gray-600 mb-2">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-medium">{isRTL ? 'آخر تسجيل دخول' : 'Last Login'}</span>
          </div>
          <p className="text-lg font-semibold">
            {student.user.lastLogin ? new Date(student.user.lastLogin).toLocaleString() : 'Never'}
          </p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 text-gray-600 mb-2">
            <Activity className="w-4 h-4" />
            <span className="text-sm font-medium">{isRTL ? 'آخر نشاط' : 'Last Activity'}</span>
          </div>
          <p className="text-lg font-semibold">
            {student.user.lastActivity ? new Date(student.user.lastActivity).toLocaleString() : 'Never'}
          </p>
        </div>
      </div>

      <button
        onClick={handleLoginAsStudent}
        className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 justify-center"
      >
        <User className="w-5 h-5" />
        {isRTL ? 'تسجيل الدخول كطالب' : 'Log in as Student'}
      </button>
    </div>
  );
}

// function PerformanceTab({ studentId, isRTL }: { studentId: string; isRTL: boolean }) {
//   const [performance, setPerformance] = useState<any>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetchPerformance();
//   }, [studentId]);

//   const fetchPerformance = async () => {
//     try {
//       const res = await fetch(`/api/instructor/students/${studentId}/performance`);
//       if (res.ok) {
//         const data = await res.json();
//         setPerformance(data);
//       }
//     } catch (error) {
//       console.error('Error fetching performance:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loading) return <div>Loading...</div>;

//   return (
//     <div className="space-y-6">
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//         <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg">
//           <div className="text-sm text-blue-600 font-medium mb-2">{isRTL ? 'السرعة' : 'Speed'}</div>
//           <div className="text-3xl font-bold text-blue-900">{performance?.avgSpeed || 0} WPM</div>
//         </div>

//         <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg">
//           <div className="text-sm text-green-600 font-medium mb-2">{isRTL ? 'الدقة' : 'Accuracy'}</div>
//           <div className="text-3xl font-bold text-green-900">{performance?.avgAccuracy || 0}%</div>
//         </div>

//         <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg">
//           <div className="text-sm text-purple-600 font-medium mb-2">{isRTL ? 'الوقت الإجمالي' : 'Total Time'}</div>
//           <div className="text-3xl font-bold text-purple-900">
//             {formatTime(performance?.totalTime || 0)}
//           </div>
//         </div>
//       </div>

//       <div className="bg-white border border-gray-200 rounded-lg p-6">
//         <h3 className="text-lg font-semibold mb-4">{isRTL ? 'تفاصيل الأداء' : 'Performance Details'}</h3>
//         <div className="h-64 flex items-center justify-center text-gray-500">
//           {isRTL ? 'الرسم البياني سيتم إضافته قريباً' : 'Chart will be added soon'}
//         </div>
//       </div>
//     </div>
//   );
// }

function HistoryTab({ studentId, isRTL }: { studentId: string; isRTL: boolean }) {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, [studentId]);

  const fetchHistory = async () => {
    try {
      const res = await fetch(`/api/instructor/students/${studentId}/history`);
      if (res.ok) {
        const data = await res.json();
        setHistory(data.history || []);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              {isRTL ? 'الوقت' : 'Time'}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              {isRTL ? 'الوصف' : 'Description'}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              {isRTL ? 'بواسطة' : 'By'}
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {history.length === 0 ? (
            <tr>
              <td colSpan={3} className="px-6 py-4 text-center text-gray-500">
                {isRTL ? 'لا يوجد سجل' : 'No history'}
              </td>
            </tr>
          ) : (
            history.map((record) => (
              <tr key={record.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(record.createdAt).toLocaleString()}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">{record.description}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.userName}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function BadgesTab({ studentId, isRTL }: { studentId: string; isRTL: boolean }) {
  const [badges, setBadges] = useState<any[]>([]);
  const [availableBadges, setAvailableBadges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBadges();
  }, [studentId]);

  const fetchBadges = async () => {
    try {
      const [earnedRes, availableRes] = await Promise.all([
        fetch(`/api/instructor/students/${studentId}/badges`),
        fetch(`/api/instructor/badges`),
      ]);
      if (earnedRes.ok) {
        const data = await earnedRes.json();
        setBadges(data.badges || []);
      }
      if (availableRes.ok) {
        const data = await availableRes.json();
        setAvailableBadges(data.badges || []);
      }
    } catch (error) {
      console.error('Error fetching badges:', error);
    } finally {
      setLoading(false);
    }
  };

  const assignBadge = async (badgeId: number) => {
    try {
      const res = await fetch(`/api/instructor/students/${studentId}/badges`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ badgeId }),
      });
      if (res.ok) {
        fetchBadges();
      }
    } catch (error) {
      console.error('Error assigning badge:', error);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">{isRTL ? 'الشارات المكتسبة' : 'Earned Badges'}</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {badges.length === 0 ? (
            <p className="text-gray-500 col-span-full">{isRTL ? 'لا توجد شارات' : 'No badges earned yet'}</p>
          ) : (
            badges.map((badge) => (
              <div key={badge.id} className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                <Award className="w-12 h-12 mx-auto text-yellow-500 mb-2" />
                <p className="font-semibold">{badge.name}</p>
                <p className="text-sm text-gray-600">{badge.description}</p>
              </div>
            ))
          )}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">{isRTL ? 'منح شارة' : 'Assign Badge'}</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {availableBadges.map((badge) => (
            <button
              key={badge.id}
              onClick={() => assignBadge(badge.id)}
              className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center hover:bg-gray-100 transition"
            >
              <Award className="w-12 h-12 mx-auto text-gray-400 mb-2" />
              <p className="font-semibold">{badge.name}</p>
              <p className="text-sm text-gray-600">{badge.description}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function PracticeTab({ studentId, isRTL }: { studentId: string; isRTL: boolean }) {
  const [practiceData, setPracticeData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPracticeData();
  }, [studentId]);

  const fetchPracticeData = async () => {
    try {
      const res = await fetch(`/api/instructor/students/${studentId}/practice`);
      if (res.ok) {
        const data = await res.json();
        setPracticeData(data);
      }
    } catch (error) {
      console.error('Error fetching practice data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">{isRTL ? 'تحليلات التمرين' : 'Practice Analytics'}</h3>
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="h-96 flex items-center justify-center text-gray-500">
          {isRTL ? 'الرسم البياني التقويمي سيتم إضافته قريباً' : 'Calendar heatmap will be added soon'}
        </div>
      </div>
    </div>
  );
}

function ClassesTab({ studentId, isRTL, fetchStudentData }: { studentId: string; isRTL: boolean; fetchStudentData: () => void }) {
  const [classes, setClasses] = useState<any[]>([]);
  const [availableClasses, setAvailableClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchClasses();
  }, [studentId]);

  const fetchClasses = async () => {
    try {
      const [enrolledRes, availableRes] = await Promise.all([
        fetch(`/api/instructor/students/${studentId}/classes`),
        fetch(`/api/instructor/classes`),
      ]);
      if (enrolledRes.ok) {
        const data = await enrolledRes.json();
        setClasses(data.classes || []);
      }
      if (availableRes.ok) {
        const data = await availableRes.json();
        setAvailableClasses(data.classes || []);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const disenrollClass = async (classId: number) => {
    try {
      const res = await fetch(`/api/instructor/students/${studentId}/classes/${classId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchClasses();
        fetchStudentData();
      }
    } catch (error) {
      console.error('Error disenrolling:', error);
    }
  };

  const enrollClass = async (classId: number) => {
    try {
      const res = await fetch(`/api/instructor/students/${studentId}/classes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ classId }),
      });
      if (res.ok) {
        fetchClasses();
        fetchStudentData();
        setShowAddModal(false);
      }
    } catch (error) {
      console.error('Error enrolling:', error);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">{isRTL ? 'الفصول المسجلة' : 'Enrolled Classes'}</h3>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          {isRTL ? 'إضافة فصل' : 'Add Class'}
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                {isRTL ? 'اسم الفصل' : 'Class Name'}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                {isRTL ? 'عدد الطلاب' : 'Students'}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                {isRTL ? 'تاريخ التسجيل' : 'Enrollment Date'}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                {isRTL ? 'الإجراءات' : 'Actions'}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {classes.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                  {isRTL ? 'غير مسجل في أي فصول' : 'Not enrolled in any classes'}
                </td>
              </tr>
            ) : (
              classes.map((cls) => (
                <tr key={cls.id}>
                  <td className="px-6 py-4 whitespace-nowrap font-medium">{cls.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{cls.studentCount || 0}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(cls.enrolledAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => disenrollClass(cls.id)}
                      className="text-red-600 hover:text-red-900 flex items-center gap-1"
                    >
                      <Trash2 className="w-4 h-4" />
                      {isRTL ? 'إلغاء التسجيل' : 'Disenroll'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">{isRTL ? 'إضافة فصل' : 'Add Class'}</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {availableClasses.map((cls) => (
                <button
                  key={cls.id}
                  onClick={() => enrollClass(cls.id)}
                  className="w-full text-left px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="font-semibold">{cls.name}</div>
                  <div className="text-sm text-gray-600">{cls.description}</div>
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowAddModal(false)}
              className="mt-4 w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              {isRTL ? 'إلغاء' : 'Cancel'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// function ProgressTab({ studentId, isRTL }: { studentId: string; isRTL: boolean }) {
//   const [courses, setCourses] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetchProgress();
//   }, [studentId]);

//   const fetchProgress = async () => {
//     try {
//       const res = await fetch(`/api/instructor/students/${studentId}/progress`);
//       if (res.ok) {
//         const data = await res.json();
//         setCourses(data.courses || []);
//       }
//     } catch (error) {
//       console.error('Error fetching progress:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const clearProgress = async (courseId: number) => {
//     if (!confirm(isRTL ? 'هل أنت متأكد من مسح التقدم؟' : 'Are you sure you want to clear progress?')) return;
//     try {
//       const res = await fetch(`/api/instructor/students/${studentId}/progress/${courseId}`, {
//         method: 'DELETE',
//       });
//       if (res.ok) {
//         fetchProgress();
//       }
//     } catch (error) {
//       console.error('Error clearing progress:', error);
//     }
//   };

//   if (loading) return <div>Loading...</div>;

//   return (
//     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//       {courses.length === 0 ? (
//         <p className="text-gray-500 col-span-full">{isRTL ? 'لا توجد دورات' : 'No enrolled courses'}</p>
//       ) : (
//         courses.map((course) => (
//           <div key={course.id} className="bg-white border border-gray-200 rounded-lg p-6">
//             <h3 className="text-lg font-semibold mb-4">{course.name}</h3>
            
//             <div className="space-y-2 mb-4 text-sm">
//               <div className="flex justify-between">
//                 <span className="text-gray-600">{isRTL ? 'النقاط' : 'Score'}:</span>
//                 <span className="font-semibold">{course.totalScore || 0}</span>
//               </div>
//               <div className="flex justify-between">
//                 <span className="text-gray-600">{isRTL ? 'النجوم' : 'Stars'}:</span>
//                 <span className="font-semibold">{course.totalStars || 0}</span>
//               </div>
//               <div className="flex justify-between">
//                 <span className="text-gray-600">{isRTL ? 'الوقت' : 'Time'}:</span>
//                 <span className="font-semibold">{formatTime(course.totalTime || 0)}</span>
//               </div>
//               <div className="flex justify-between">
//                 <span className="text-gray-600">{isRTL ? 'المحاولات' : 'Attempts'}:</span>
//                 <span className="font-semibold">{course.totalAttempts || 0}</span>
//               </div>
//             </div>

//             <div className="h-32 flex items-center justify-center bg-gray-50 rounded-lg mb-4">
//               <div className="text-center">
//                 <div className="text-3xl font-bold text-blue-600">{course.progress || 0}%</div>
//                 <div className="text-sm text-gray-600">{isRTL ? 'التقدم' : 'Progress'}</div>
//               </div>
//             </div>

            // <div className="space-y-2">
            //   <button
            //     onClick={() => clearProgress(course.id)}
            //     className="w-full px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
            //   >
            //     {isRTL ? 'مسح التقدم' : 'Clear Progress'}
            //   </button>
            //   <button className="w-full px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100">
            //     {isRTL ? 'عرض التفاصيل' : 'View Per Lesson'}
            //   </button>
            //   <button className="w-full px-4 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 flex items-center justify-center gap-2">
            //     <Settings className="w-4 h-4" />
            //     {isRTL ? 'ضبط الصعوبة' : 'Adjust Difficulty'}
            //   </button>
            // </div>
//           </div>
//         ))
//       )}
//     </div>
//   );
// }

function ActivityTab({ studentId, isRTL }: { studentId: string; isRTL: boolean }) {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivity();
    const interval = setInterval(fetchActivity, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, [studentId]);

  const fetchActivity = async () => {
    try {
      const res = await fetch(`/api/instructor/students/${studentId}/activity`);
      if (res.ok) {
        const data = await res.json();
        setActivities(data.activities || []);
      }
    } catch (error) {
      console.error('Error fetching activity:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{isRTL ? 'النشاط المباشر' : 'Live Activity Feed'}</h3>
        <div className="flex items-center gap-2 text-green-600">
          <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
          <span className="text-sm">{isRTL ? 'مباشر' : 'Live'}</span>
        </div>
      </div>

      <div className="space-y-3">
        {activities.length === 0 ? (
          <p className="text-gray-500 text-center py-8">{isRTL ? 'لا يوجد نشاط حديث' : 'No recent activity'}</p>
        ) : (
          activities.map((activity) => (
            <div key={activity.id} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Video className="w-4 h-4 text-blue-600" />
                    <span className="font-semibold">{activity.lessonName}</span>
                    <span className="text-sm text-gray-500">
                      {new Date(activity.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">{isRTL ? 'النجوم' : 'Stars'}:</span>
                      <span className="ml-1 font-semibold">{activity.stars}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">{isRTL ? 'النقاط' : 'Score'}:</span>
                      <span className="ml-1 font-semibold">{activity.score}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">{isRTL ? 'المدة' : 'Duration'}:</span>
                      <span className="ml-1 font-semibold">{formatTime(activity.duration)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

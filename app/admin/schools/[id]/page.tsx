'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { Sidebar, adminLinks } from '@/components/Sidebar';
import { ArrowLeft, Calendar, Clock, Edit, FileText, Home, Plus } from 'lucide-react';
import AssignAdminModal from '@/components/schools/AssignSchoolAdmin';

interface School {
  id: number;
  name: string;
  country: string;
  address: string;
  phone: string | null;
}
interface SchoolStats {
  classCount: number;
  adminCount: number;
  instructorCount: number;
  studentCount: number;
}

interface Admin {
  id: number;
  userId: number;
  name: string;
  email: string;
  lastLogin: string | null;
  assignedAt: string;
  schoolName: string;
}

interface ActivityLog {
  id: number;
  action: string;
  description: string;
  createdAt: string;
  entityType: string;
  entityId: number;
  userName: string;
  userEmail: string;
}

interface DailyActivity {
  date: string;
  count: number;
  totalTime: number;
}

interface HourlyActivity {
  dayOfWeek: number;
  hour: number;
  count: number;
  totalTime: number;
}

type Tab = 'overview' | 'history' | 'calendar' | 'punchcard';

export default function SchoolDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isRTL } = useLanguage();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [school, setSchool] = useState<School | null>(null);
  const [schoolStats, setSchoolStats] = useState<SchoolStats | null>(null);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [dailyActivity, setDailyActivity] = useState<DailyActivity[]>([]);
  const [hourlyActivity, setHourlyActivity] = useState<HourlyActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  useEffect(() => {
    fetchSchoolData();
  }, [params.id]);

  useEffect(() => {
    if (activeTab === 'overview' && admins?.length === 0) {
      fetchAdmins();
    } else if (activeTab === 'history' && logs?.length === 0) {
      fetchHistory();
    } else if ((activeTab === 'calendar' || activeTab === 'punchcard') && dailyActivity.length === 0) {
      fetchPracticeData();
    }
  }, [activeTab]);

  const fetchSchoolData = async () => {
    try {
      const res = await fetch(`/api/admin/schools/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setSchool(data.school);
        setSchoolStats(data.stats)
      } else {
        router.push('/admin/schools');
      }
    } catch (error) {
      console.error('Error fetching school:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAdmins = async () => {
    try {
      const res = await fetch(`/api/admin/schools/${params.id}/admins`);
      if (res.ok) {
        const data = await res.json();
        setAdmins(data.admins);
      }
    } catch (error) {
      console.error('Error fetching admins:', error);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await fetch(`/api/admin/schools/${params.id}/history`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  const fetchPracticeData = async () => {
    try {
      const res = await fetch(`/api/admin/schools/${params.id}/practice`);
      if (res.ok) {
        const data = await res.json();
        setDailyActivity(data.dailyActivity);
        setHourlyActivity(data.hourlyActivity);
      }
    } catch (error) {
      console.error('Error fetching practice data:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">{isRTL ? 'جاري التحميل...' : 'Loading...'}</div>
      </div>
    );
  }

  if (!school) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">{isRTL ? 'المدرسة غير موجودة' : 'School not found'}</div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview' as Tab, labelAr: 'نظرة عامة', labelEn: 'Overview', icon: <Home className="w-5 h-5" /> },
    { id: 'history' as Tab, labelAr: 'سجل الأحداث', labelEn: 'Record History', icon: <FileText className="w-5 h-5" /> },
  ];

  return (
    <div className={`flex min-h-screen bg-gray-50`}>
      <Sidebar links={adminLinks} userRole="admin" />

      <main className="flex-1 px-8 py-8">
        {/* Header with back button */}
        <div className={`mb-8 `}>
          <button
            onClick={() => router.push('/admin/schools')}
            className={`flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4 `}
          >
            <ArrowLeft className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
            <span className={isRTL ? 'font-arabic' : ''}>{isRTL ? 'العودة للمدارس' : 'Back to Schools'}</span>
          </button>
          <div className='flex justify-between item-center'>
            <h1 className={`text-3xl font-bold text-gray-900 ${isRTL ? 'font-arabic' : ''}`}>
              {school.name}
            </h1>
            <button
              onClick={() => router.push(`/admin/schools/${params.id}/edit`)}
              className={`bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 ${isRTL ? 'flex-row-reverse font-arabic' : ''}`}
            >
              <Edit className="w-5 h-5" />
              {isRTL ? 'تعديل' : 'Edit'}
            </button>
          </div>
          <p className={`text-gray-600 mt-2 ${isRTL ? 'font-arabic' : ''}`}>
            {school.address}, {school.country}
          </p>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className={`text-sm text-gray-600 mb-2 ${isRTL ? 'text-right font-arabic' : ''}`}>
              {isRTL ? 'الصفوف' : 'Classes'}
            </div>
            <div className="text-3xl font-bold text-blue-600">{schoolStats?.classCount}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className={`text-sm text-gray-600 mb-2 ${isRTL ? 'text-right font-arabic' : ''}`}>
              {isRTL ? 'المعلمون' : 'Instructors'}
            </div>
            <div className="text-3xl font-bold text-green-600">{schoolStats?.instructorCount}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className={`text-sm text-gray-600 mb-2 ${isRTL ? 'text-right font-arabic' : ''}`}>
              {isRTL ? 'الطلاب' : 'Students'}
            </div>
            <div className="text-3xl font-bold text-purple-600">{schoolStats?.studentCount}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className={`text-sm text-gray-600 mb-2 ${isRTL ? 'text-right font-arabic' : ''}`}>
              {isRTL ? 'المسؤولون' : 'Admins'}
            </div>
            <div className="text-3xl font-bold text-orange-600">{schoolStats?.adminCount}</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className={`border-b border-gray-200 flex`}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 flex items-center gap-2 border-b-2 font-medium transition-colors ${activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
              >
                {tab.icon}
                <span className={isRTL ? 'font-arabic' : ''}>{isRTL ? tab.labelAr : tab.labelEn}</span>
              </button>
            ))}
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <OverviewTab
                isAssignModalOpen={isAssignModalOpen}
                setIsAssignModalOpen={setIsAssignModalOpen}
                admins={admins}
                isRTL={isRTL}
                dailyActivity={dailyActivity}
                hourlyActivity={hourlyActivity}
                id={school.id}
                fetchAdmins={fetchAdmins}
              />
            )}
            {activeTab === 'history' && (
              <HistoryTab logs={logs} isRTL={isRTL} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

// Overview Tab Component
function OverviewTab({ id, admins, isRTL, dailyActivity, hourlyActivity, isAssignModalOpen, setIsAssignModalOpen, fetchAdmins }: {
  id: string | number;
  admins: Admin[];
  isRTL: boolean;
  hourlyActivity: HourlyActivity[];
  dailyActivity: DailyActivity[],
  setIsAssignModalOpen: (open: boolean) => void,
  isAssignModalOpen: boolean,
  fetchAdmins: () => void;
}) {
  const days = [];
  for (let i = 59; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    days.push(date.toISOString().split('T')[0]);
  }

  const maxCount = Math.max(...dailyActivity.map(d => d.count), 1);

  const getIntensity = (count: number) => {
    if (count === 0) return 'bg-gray-100';
    const intensity = count / maxCount;
    if (intensity < 0.25) return 'bg-green-200';
    if (intensity < 0.5) return 'bg-green-400';
    if (intensity < 0.75) return 'bg-green-600';
    return 'bg-green-800';
  };


  const daysH = [
    { label: isRTL ? 'الأحد' : 'Sun', value: 0 },
    { label: isRTL ? 'الإثنين' : 'Mon', value: 1 },
    { label: isRTL ? 'الثلاثاء' : 'Tue', value: 2 },
    { label: isRTL ? 'الأربعاء' : 'Wed', value: 3 },
    { label: isRTL ? 'الخميس' : 'Thu', value: 4 },
    { label: isRTL ? 'الجمعة' : 'Fri', value: 5 },
    { label: isRTL ? 'السبت' : 'Sat', value: 6 },
  ];

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const maxCountH = Math.max(...hourlyActivity.map(a => a.count), 1);

  const getSize = (count: number) => {
    if (count === 0) return 'w-2 h-2';
    const ratio = count / maxCountH;
    if (ratio < 0.25) return 'w-4 h-4';
    if (ratio < 0.5) return 'w-6 h-6';
    if (ratio < 0.75) return 'w-8 h-8';
    return 'w-10 h-10';
  };
  return (
    <>
      <div>
        <div className='flex justify-between center'>
          <h2 className={`text-xl font-bold text-gray-900 mb-4 ${isRTL ? 'text-right font-arabic' : ''}`}>
            {isRTL ? 'مسؤولو المدرسة' : 'School Admins'}
          </h2>

          <button
            onClick={() => setIsAssignModalOpen(true)}
            className={`flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${isRTL ? 'flex-row-reverse font-arabic' : ''}`}
          >
            <Plus className="w-5 h-5" />
            {isRTL ? 'إضافة مسؤول' : 'Add Admin'}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className={`px-6 py-3 text-sm font-semibold text-gray-700 ${isRTL ? 'text-right font-arabic' : 'text-left'}`}>
                  {isRTL ? 'الاسم' : 'Name'}
                </th>
                <th className={`px-6 py-3 text-sm font-semibold text-gray-700 ${isRTL ? 'text-right font-arabic' : 'text-left'}`}>
                  {isRTL ? 'المدرسة' : 'School'}
                </th>
                <th className={`px-6 py-3 text-sm font-semibold text-gray-700 ${isRTL ? 'text-right font-arabic' : 'text-left'}`}>
                  {isRTL ? 'آخر تسجيل دخول' : 'Last Login'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {admins.length === 0 ? (
                <tr>
                  <td colSpan={3} className={`px-6 py-8 text-center text-gray-500 ${isRTL ? 'font-arabic' : ''}`}>
                    {isRTL ? 'لا يوجد مسؤولون' : 'No admins found'}
                  </td>
                </tr>
              ) : (
                admins.map((admin) => (
                  <tr key={admin.id} className="hover:bg-gray-50">
                    <td className={`px-6 py-4 ${isRTL ? 'text-right font-arabic' : 'text-left'}`}>
                      <div className="font-medium text-gray-900">{admin.name}</div>
                      <div className="text-sm text-gray-500">{admin.email}</div>
                    </td>
                    <td className={`px-6 py-4 text-sm text-gray-700 ${isRTL ? 'text-right font-arabic' : 'text-left'}`}>
                      {admin.schoolName}
                    </td>
                    <td className={`px-6 py-4 text-sm text-gray-700 ${isRTL ? 'text-right' : 'text-left'}`}>
                      {admin.lastLogin ? new Date(admin.lastLogin).toLocaleDateString() : (isRTL ? 'أبداً' : 'Never')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <hr />
        <div>
          <h2 className={`text-xl font-bold text-gray-900 mb-4 ${isRTL ? 'text-right font-arabic' : ''}`}>
            {isRTL ? 'نشاط التدريب اليومي' : 'Daily Practice Activity'}
          </h2>

          <div className="grid grid-cols-10 gap-2">
            {days.map((day) => {
              const activity = dailyActivity.find(a => a.date === day);
              const count = activity?.count || 0;

              return (
                <div
                  key={day}
                  className={`h-12 rounded ${getIntensity(count)} border border-gray-200 flex items-center justify-center text-xs font-medium text-gray-700`}
                  title={`${day}: ${count} ${isRTL ? 'نشاط' : 'activities'}`}
                >
                  {count > 0 && count}
                </div>
              );
            })}
          </div>

          <div className={`mt-6 flex items-center gap-4 ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
            <span className={`text-sm text-gray-600 ${isRTL ? 'font-arabic' : ''}`}>
              {isRTL ? 'أقل' : 'Less'}
            </span>
            <div className="flex gap-1">
              <div className="w-4 h-4 bg-gray-100 border border-gray-200 rounded"></div>
              <div className="w-4 h-4 bg-green-200 border border-gray-200 rounded"></div>
              <div className="w-4 h-4 bg-green-400 border border-gray-200 rounded"></div>
              <div className="w-4 h-4 bg-green-600 border border-gray-200 rounded"></div>
              <div className="w-4 h-4 bg-green-800 border border-gray-200 rounded"></div>
            </div>
            <span className={`text-sm text-gray-600 ${isRTL ? 'font-arabic' : ''}`}>
              {isRTL ? 'أكثر' : 'More'}
            </span>
          </div>
        </div>
        <hr />
        <div>
          <h2 className={`text-xl font-bold text-gray-900 mb-4 ${isRTL ? 'text-right font-arabic' : ''}`}>
            {isRTL ? 'بطاقة الأوقات الأسبوعية' : 'Weekly Activity Punchcard'}
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="p-2"></th>
                  {hours.map((hour) => (
                    <th key={hour} className="p-2 text-xs text-gray-600">
                      {hour}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {daysH.map((day) => (
                  <tr key={day.value}>
                    <td className={`p-2 text-sm font-medium text-gray-700 ${isRTL ? 'text-right font-arabic' : 'text-left'}`}>
                      {day.label}
                    </td>
                    {hours.map((hour) => {
                      const activity = hourlyActivity.find(
                        a => a.dayOfWeek === day.value && a.hour === hour
                      );
                      const count = activity?.count || 0;

                      return (
                        <td key={hour} className="p-2 text-center">
                          <div className="flex items-center justify-center">
                            {count > 0 && (
                              <div
                                className={`${getSize(count)} bg-blue-600 rounded-full`}
                                title={`${day.label} ${hour}:00 - ${count} ${isRTL ? 'نشاط' : 'activities'}`}
                              />
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className={`mt-6 ${isRTL ? 'text-right font-arabic' : 'text-left'}`}>
            <p className="text-sm text-gray-600">
              {isRTL
                ? 'حجم الدائرة يمثل عدد الأنشطة في ذلك الوقت'
                : 'Circle size represents the number of activities at that time'}
            </p>
          </div>
        </div>
      </div>
      <AssignAdminModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        schoolId={parseInt(id as string)}
        onAdminsAssigned={fetchAdmins}
      />
    </>
  );
}

// History Tab Component
function HistoryTab({ logs, isRTL }: { logs: ActivityLog[]; isRTL: boolean }) {

  return (
    <div>
      <h2 className={`text-xl font-bold text-gray-900 mb-4 ${isRTL ? 'text-right font-arabic' : ''}`}>
        {isRTL ? 'سجل الأحداث' : 'Activity History'}
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className={`px-6 py-3 text-sm font-semibold text-gray-700 ${isRTL ? 'text-right font-arabic' : 'text-left'}`}>
                {isRTL ? 'الوقت' : 'Time'}
              </th>
              <th className={`px-6 py-3 text-sm font-semibold text-gray-700 ${isRTL ? 'text-right font-arabic' : 'text-left'}`}>
                {isRTL ? 'الوصف' : 'Description'}
              </th>
              <th className={`px-6 py-3 text-sm font-semibold text-gray-700 ${isRTL ? 'text-right font-arabic' : 'text-left'}`}>
                {isRTL ? 'بواسطة' : 'By'}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {logs.length === 0 ? (
              <tr>
                <td colSpan={3} className={`px-6 py-8 text-center text-gray-500 ${isRTL ? 'font-arabic' : ''}`}>
                  {isRTL ? 'لا توجد أحداث' : 'No activity history'}
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className={`px-6 py-4 text-sm text-gray-700 ${isRTL ? 'text-right' : 'text-left'}`}>
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className={`px-6 py-4 ${isRTL ? 'text-right font-arabic' : 'text-left'}`}>
                    <div className="font-medium text-gray-900">{log.action}</div>
                    <div className="text-sm text-gray-500">{log.description}</div>
                  </td>
                  <td className={`px-6 py-4 text-sm text-gray-700 ${isRTL ? 'text-right font-arabic' : 'text-left'}`}>
                    {log.userName}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>


    </div>
  );
}

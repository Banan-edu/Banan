
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { Sidebar, instructorLinks } from '@/components/Sidebar';
import { ArrowLeft, FileText, Users, GraduationCap, BarChart3, Plus, X, Settings } from 'lucide-react';
import StudentTest from '@/components/tests/StudentTest';

type Tab = 'overview' | 'students' | 'instructors' | 'results';

type Test = {
  id: number;
  name: string;
  description: string | null;
  text: string;
  altTexts: any;
  startDate: string;
  endDate: string;
  targetAudience: string;
  targetSchools: any;
  targetStudents: any;
  attemptsAllowed: string;
  attemptsCount: number | null;
  hasTimeLimit: boolean;
  timeLimit: number | null;
  passingCriteria: string;
  minAccuracy: number | null;
  minSpeed: number | null;
  showScore: boolean;
  speedGoal: number | null;
  maxScore: number | null;
  disableBackspace: boolean;
  issueCertificate: boolean;
  createdAt: string;
  updatedAt: string;
};

type TestStudent = {
  id: number;
  name: string;
  grade: string | null;
  dateAdded: string;
  completed: boolean;
};

type TestInstructor = {
  id: number;
  name: string;
  role: string;
  school: string | null;
};

type TestResult = {
  studentId: number;
  studentName: string;
  score: number;
  speed: number;
  accuracy: number;
  attempts: number;
  completionTime: string | null;
  certificateIssued: boolean;
};

export default function TestDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { isRTL } = useLanguage();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [loading, setLoading] = useState(true);
  const [test, setTest] = useState<Test | null>(null);
  const [testStudents, setTestStudents] = useState<TestStudent[]>([]);
  const [testInstructors, setTestInstructors] = useState<TestInstructor[]>([]);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [showAddStudents, setShowAddStudents] = useState(false);
  const [showAddInstructors, setShowAddInstructors] = useState(false);

  useEffect(() => {
    fetchTestDetails();
  }, [params.id]);

  const fetchTestDetails = async () => {
    try {
      const res = await fetch(`/api/instructor/tests/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setTest(data.test);
        setTestStudents(data.students || []);
        setTestInstructors(data.instructors || []);
        setTestResults(data.results || []);
      }
    } catch (error) {
      console.error('Error fetching test details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar links={instructorLinks} userRole="instructor" />
        <main className="flex-1 px-8 py-8">
          <p className="text-gray-600">{isRTL ? 'جاري التحميل...' : 'Loading...'}</p>
        </main>
      </div>
    );
  }

  if (!test) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar links={instructorLinks} userRole="instructor" />
        <main className="flex-1 px-8 py-8">
          <p className="text-red-600">{isRTL ? 'الاختبار غير موجود' : 'Test not found'}</p>
        </main>
      </div>
    );
  }

  const tabs = [
    { id: 'overview' as Tab, labelAr: 'نظرة عامة', labelEn: 'Overview', icon: <FileText className="w-5 h-5" /> },
    { id: 'students' as Tab, labelAr: 'الطلاب', labelEn: 'Test Students', icon: <GraduationCap className="w-5 h-5" /> },
    { id: 'instructors' as Tab, labelAr: 'المعلمون', labelEn: 'Test Instructors', icon: <Users className="w-5 h-5" /> },
    { id: 'results' as Tab, labelAr: 'النتائج', labelEn: 'Test Results', icon: <BarChart3 className="w-5 h-5" /> },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar links={instructorLinks} userRole="instructor" />

      <main className="flex-1 px-8 py-8">
        {/* Header */}
        <div className={`mb-8 ${isRTL ? 'text-right' : 'text-left'}`}>
          <button
            onClick={() => router.push('/instructor/tests')}
            className={`flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4 `}
          >
            <ArrowLeft className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
            <span className={isRTL ? 'font-arabic' : ''}>{isRTL ? 'العودة للاختبارات' : 'Back to Tests'}</span>
          </button>

          <div className='flex  justify-between items-center'>
            <h1 className={`text-3xl font-bold text-gray-900 ${isRTL ? 'font-arabic' : ''}`}>
              {test.name}
            </h1>
            <button
              onClick={() => router.push(`/instructor/tests/${test.id}/edit`)}
              className="flex-1 md:flex-none px-6 py-3 border border-gray-500 text-gray rounded-lg hover:bg-gray-400 flex items-center gap-2 justify-center"
            >
              <Settings className="w-5 h-5" />
              {isRTL ? 'تعديل المعلومات' : 'Edit Info'}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className={`flex gap-8 `}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 pb-4 border-b-2 transition-colors ${activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
                  } `}
              >
                {tab.icon}
                <span className={isRTL ? 'font-arabic' : ''}>{isRTL ? tab.labelAr : tab.labelEn}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow p-6">
          {activeTab === 'overview' && (
            <div className={`space-y-6 ${isRTL ? 'text-right' : 'text-left'}`}>
              <div>
                <h3 className={`text-lg font-semibold text-gray-900 mb-2 ${isRTL ? 'font-arabic' : ''}`}>
                  {isRTL ? 'الاسم' : 'Name'}
                </h3>
                <p className="text-gray-700">{test.name}</p>
              </div>

              <div>
                <h3 className={`text-lg font-semibold text-gray-900 mb-2 ${isRTL ? 'font-arabic' : ''}`}>
                  {isRTL ? 'الوصف' : 'Description'}
                </h3>
                <p className="text-gray-700">{test.description || (isRTL ? 'لا يوجد' : 'N/A')}</p>
              </div>

              <div>
                <h3 className={`text-lg font-semibold text-gray-900 mb-2 ${isRTL ? 'font-arabic' : ''}`}>
                  {isRTL ? 'الفترة النشطة' : 'Active Date Range'}
                </h3>
                <p className="text-gray-700">
                  {new Date(test.startDate).toLocaleDateString()} → {new Date(test.endDate).toLocaleDateString()}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className={`text-lg font-semibold text-gray-900 mb-2 ${isRTL ? 'font-arabic' : ''}`}>
                    {isRTL ? 'تم الإنشاء في' : 'Created On'}
                  </h3>
                  <p className="text-gray-700">{new Date(test.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <h3 className={`text-lg font-semibold text-gray-900 mb-2 ${isRTL ? 'font-arabic' : ''}`}>
                    {isRTL ? 'تم التعديل في' : 'Modified On'}
                  </h3>
                  <p className="text-gray-700">{new Date(test.updatedAt).toLocaleString()}</p>
                </div>
              </div>

              <div>
                <h3 className={`text-lg font-semibold text-gray-900 mb-2 ${isRTL ? 'font-arabic' : ''}`}>
                  {isRTL ? 'نص الاختبار' : 'Test Text'}
                </h3>
                <p className="text-gray-700 bg-gray-50 p-4 rounded">{test.text}</p>
              </div>

              <div>
                <h3 className={`text-lg font-semibold text-gray-900 mb-4 ${isRTL ? 'font-arabic' : ''}`}>
                  {isRTL ? 'ملخص الإعدادات' : 'Settings Summary'}
                </h3>
                <div className="space-y-2 text-gray-700">
                  <p><strong>{isRTL ? 'الجمهور المستهدف:' : 'Target Audience:'}</strong> {test.targetAudience}</p>
                  <p><strong>{isRTL ? 'المحاولات المسموحة:' : 'Attempts Allowed:'}</strong> {test.attemptsAllowed === 'open' ? (isRTL ? 'غير محدود' : 'Unlimited') : test.attemptsCount}</p>
                  <p><strong>{isRTL ? 'حد الوقت:' : 'Time Limit:'}</strong> {test.hasTimeLimit ? `${test.timeLimit} ${isRTL ? 'دقيقة' : 'minutes'}` : (isRTL ? 'لا يوجد' : 'None')}</p>
                  <p><strong>{isRTL ? 'معايير النجاح:' : 'Passing Criteria:'}</strong> {test.passingCriteria}</p>
                  {test.minAccuracy && <p><strong>{isRTL ? 'الحد الأدنى للدقة:' : 'Min Accuracy:'}</strong> {test.minAccuracy}%</p>}
                  {test.minSpeed && <p><strong>{isRTL ? 'الحد الأدنى للسرعة:' : 'Min Speed:'}</strong> {test.minSpeed} WPM</p>}
                  <p><strong>{isRTL ? 'إظهار النتيجة:' : 'Show Score:'}</strong> {test.showScore ? (isRTL ? 'نعم' : 'Yes') : (isRTL ? 'لا' : 'No')}</p>
                  <p><strong>{isRTL ? 'تعطيل المسافة للخلف:' : 'Disable Backspace:'}</strong> {test.disableBackspace ? (isRTL ? 'نعم' : 'Yes') : (isRTL ? 'لا' : 'No')}</p>
                  <p><strong>{isRTL ? 'إصدار شهادة:' : 'Issue Certificate:'}</strong> {test.issueCertificate ? (isRTL ? 'نعم' : 'Yes') : (isRTL ? 'لا' : 'No')}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'students' && (
            // <div>
            //   <div className={`flex justify-between items-center mb-6 `}>
            //     <h3 className={`text-xl font-bold text-gray-900 ${isRTL ? 'font-arabic' : ''}`}>
            //       {isRTL ? 'طلاب الاختبار' : 'Test Students'}
            //     </h3>
            //     <button
            //       onClick={() => setShowAddStudents(true)}
            //       className={`bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 `}
            //     >
            //       <Plus className="w-5 h-5" />
            //       {isRTL ? 'إضافة طلاب' : 'Add Students'}
            //     </button>
            //   </div>

            //   <div className="overflow-x-auto">
            //     <table className="min-w-full divide-y divide-gray-200">
            //       <thead className="bg-gray-50">
            //         <tr>
            //           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{isRTL ? 'الاسم' : 'Name'}</th>
            //           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{isRTL ? 'الصف' : 'Grade'}</th>
            //           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{isRTL ? 'تاريخ الإضافة' : 'Date Added'}</th>
            //           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{isRTL ? 'الحالة' : 'Status'}</th>
            //         </tr>
            //       </thead>
            //       <tbody className="bg-white divide-y divide-gray-200">
            //         {testStudents.map((student) => (
            //           <tr key={student.id}>
            //             <td className="px-6 py-4 whitespace-nowrap">{student.name}</td>
            //             <td className="px-6 py-4 whitespace-nowrap">{student.grade || 'N/A'}</td>
            //             <td className="px-6 py-4 whitespace-nowrap">{new Date(student.dateAdded).toLocaleDateString()}</td>
            //             <td className="px-6 py-4 whitespace-nowrap">
            //               <span className={`px-2 py-1 text-xs rounded ${student.completed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
            //                 {student.completed ? (isRTL ? 'مكتمل' : 'Completed') : (isRTL ? 'غير مكتمل' : 'Not Completed')}
            //               </span>
            //             </td>
            //           </tr>
            //         ))}
            //       </tbody>
            //     </table>
            //   </div>
            // </div>
            <StudentTest
              testId={parseInt(params.id as string)}
              students={testStudents}
              onRefresh={fetchTestDetails}
            />
          )}

          {activeTab === 'instructors' && (
            <div>
              <div className={`flex justify-between items-center mb-6 `}>
                <h3 className={`text-xl font-bold text-gray-900 ${isRTL ? 'font-arabic' : ''}`}>
                  {isRTL ? 'معلمو الاختبار' : 'Test Instructors'}
                </h3>
                {/* <button
                  onClick={() => setShowAddInstructors(true)}
                  className={`bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 `}
                >
                  <Plus className="w-5 h-5" />
                  {isRTL ? 'إضافة معلمين' : 'Add Instructors'}
                </button> */}
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{isRTL ? 'الاسم' : 'Name'}</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{isRTL ? 'الدور' : 'Role'}</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{isRTL ? 'المدرسة' : 'School'}</th>
                      {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{isRTL ? 'الإجراء' : 'Action'}</th> */}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {testInstructors.map((instructor) => (
                      <tr key={instructor.id}>
                        <td className="px-6 py-4 whitespace-nowrap">{instructor.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{instructor.role}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{instructor.school || 'N/A'}</td>
                        {/* <td className="px-6 py-4 whitespace-nowrap">
                          <button className="text-red-600 hover:text-red-800">
                            <X className="w-5 h-5" />
                          </button>
                        </td> */}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'results' && (
            <div>
              <h3 className={`text-xl font-bold text-gray-900 mb-6 ${isRTL ? 'font-arabic text-right' : 'text-left'}`}>
                {isRTL ? 'نتائج الاختبار' : 'Test Results'}
              </h3>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{isRTL ? 'الاسم' : 'Name'}</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{isRTL ? 'النتيجة' : 'Score'}</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{isRTL ? 'السرعة' : 'Speed'}</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{isRTL ? 'الدقة' : 'Accuracy'}</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{isRTL ? 'المحاولات' : 'Attempts'}</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{isRTL ? 'وقت الإنجاز' : 'Completion Time'}</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{isRTL ? 'الشهادة' : 'Certificate'}</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {testResults.map((result) => (
                      <tr key={result.studentId}>
                        <td className="px-6 py-4 whitespace-nowrap">{result.studentName}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{result.score}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{result.speed} WPM</td>
                        <td className="px-6 py-4 whitespace-nowrap">{result.accuracy}%</td>
                        <td className="px-6 py-4 whitespace-nowrap">{result.attempts}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {result.completionTime ? new Date(result.completionTime).toLocaleString() : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded ${result.certificateIssued ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {result.certificateIssued ? (isRTL ? 'نعم' : 'Yes') : (isRTL ? 'لا' : 'No')}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

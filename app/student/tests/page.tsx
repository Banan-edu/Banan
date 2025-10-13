
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar, studentLinks } from '@/components/Sidebar';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { 
  Clock, 
  Calendar, 
  Target,
  CheckCircle,
  XCircle,
  AlertCircle,
  Trophy
} from 'lucide-react';

interface Test {
  id: number;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  attemptsAllowed: string;
  attemptsCount: number | null;
  hasTimeLimit: boolean;
  timeLimit: number | null;
  showScore: boolean;
  speedGoal: number | null;
  maxScore: number | null;
  minAccuracy: number | null;
  minSpeed: number | null;
  issueCertificate: boolean;
}

interface TestResult {
  attempts: number;
  score: number;
  speed: number;
  accuracy: number;
  passed: boolean;
  completedAt: string | null;
}

interface StudentTest {
  test: Test;
  result: TestResult | null;
  status: 'not_started' | 'in_progress' | 'completed' | 'timeout';
  canAttempt: boolean;
}

export default function StudentTests() {
  const [tests, setTests] = useState<StudentTest[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { isRTL } = useLanguage();

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      const res = await fetch('/api/student/tests');
      if (res.ok) {
        const data = await res.json();
        setTests(data.tests || []);
      }
    } catch (error) {
      console.error('Error fetching tests:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <span className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
            <CheckCircle className="w-4 h-4" />
            {isRTL ? 'مكتمل' : 'Completed'}
          </span>
        );
      case 'in_progress':
        return (
          <span className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
            <Target className="w-4 h-4" />
            {isRTL ? 'قيد التنفيذ' : 'In Progress'}
          </span>
        );
      case 'timeout':
        return (
          <span className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">
            <XCircle className="w-4 h-4" />
            {isRTL ? 'انتهى الوقت' : 'Timeout'}
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
            <AlertCircle className="w-4 h-4" />
            {isRTL ? 'لم يبدأ' : 'Not Started'}
          </span>
        );
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className={`flex min-h-screen bg-gray-50`}>
      <Sidebar links={studentLinks} userRole="student" />

      <main className="flex-1 px-8 py-8">
        <div className={`mb-8 ${isRTL ? 'text-right' : 'text-left'}`}>
          <h2 className={`text-3xl font-bold text-gray-900 mb-2 ${isRTL ? 'font-arabic' : ''}`}>
            {isRTL ? 'الاختبارات' : 'Tests'}
          </h2>
          <p className={`text-gray-600 ${isRTL ? 'font-arabic' : ''}`}>
            {isRTL ? 'اختباراتك المتاحة' : 'Your available tests'}
          </p>
        </div>

        {tests.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className={`text-xl font-semibold text-gray-900 mb-2 ${isRTL ? 'font-arabic' : ''}`}>
              {isRTL ? 'لا توجد اختبارات' : 'No Tests Available'}
            </h3>
            <p className={`text-gray-600 ${isRTL ? 'font-arabic' : ''}`}>
              {isRTL ? 'لا توجد اختبارات متاحة لك حاليًا' : 'You have no tests available at the moment'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {tests.map((studentTest) => (
              <div
                key={studentTest.test.id}
                className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className={`flex items-start justify-between mb-4`}>
                  <div className={`flex-1 ${isRTL ? 'text-right' : ''}`}>
                    <h3 className={`text-xl font-bold text-gray-900 mb-2 ${isRTL ? 'font-arabic' : ''}`}>
                      {studentTest.test.name}
                    </h3>
                    {studentTest.test.description && (
                      <p className={`text-gray-600 mb-3 ${isRTL ? 'font-arabic' : ''}`}>
                        {studentTest.test.description}
                      </p>
                    )}
                  </div>
                  {getStatusBadge(studentTest.status)}
                </div>

                <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4`}>
                  <div className={`flex items-center gap-2`}>
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <div className={isRTL ? 'text-right' : ''}>
                      <p className="text-xs text-gray-500">{isRTL ? 'يبدأ' : 'Starts'}</p>
                      <p className="text-sm font-medium">{formatDate(studentTest.test.startDate)}</p>
                    </div>
                  </div>

                  <div className={`flex items-center gap-2`}>
                    <Calendar className="w-5 h-5 text-red-600" />
                    <div className={isRTL ? 'text-right' : ''}>
                      <p className="text-xs text-gray-500">{isRTL ? 'ينتهي' : 'Ends'}</p>
                      <p className="text-sm font-medium">{formatDate(studentTest.test.endDate)}</p>
                    </div>
                  </div>

                  {studentTest.test.hasTimeLimit && (
                    <div className={`flex items-center gap-2`}>
                      <Clock className="w-5 h-5 text-purple-600" />
                      <div className={isRTL ? 'text-right' : ''}>
                        <p className="text-xs text-gray-500">{isRTL ? 'الوقت المحدد' : 'Time Limit'}</p>
                        <p className="text-sm font-medium">{studentTest.test.timeLimit} {isRTL ? 'دقيقة' : 'min'}</p>
                      </div>
                    </div>
                  )}

                  <div className={`flex items-center gap-2`}>
                    <Target className="w-5 h-5 text-green-600" />
                    <div className={isRTL ? 'text-right' : ''}>
                      <p className="text-xs text-gray-500">{isRTL ? 'المحاولات' : 'Attempts'}</p>
                      <p className="text-sm font-medium">
                        {studentTest.test.attemptsAllowed === 'open'
                          ? (isRTL ? 'غير محدود' : 'Unlimited')
                          : studentTest.test.attemptsAllowed === 'once'
                          ? (isRTL ? 'مرة واحدة' : 'Once')
                          : studentTest.test.attemptsCount}
                      </p>
                    </div>
                  </div>
                </div>

                {studentTest.result && (
                  <div className={`bg-gray-50 rounded-lg p-4 mb-4`}>
                    <h4 className={`text-sm font-semibold text-gray-900 mb-3 ${isRTL ? 'font-arabic text-right' : ''}`}>
                      {isRTL ? 'نتائجك' : 'Your Results'}
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className={isRTL ? 'text-right' : ''}>
                        <p className="text-xs text-gray-500">{isRTL ? 'المحاولات' : 'Attempts'}</p>
                        <p className="text-lg font-bold text-gray-900">{studentTest.result.attempts}</p>
                      </div>
                      {studentTest.test.showScore && (
                        <div className={isRTL ? 'text-right' : ''}>
                          <p className="text-xs text-gray-500">{isRTL ? 'النتيجة' : 'Score'}</p>
                          <p className="text-lg font-bold text-blue-600">{studentTest.result.score}</p>
                        </div>
                      )}
                      <div className={isRTL ? 'text-right' : ''}>
                        <p className="text-xs text-gray-500">{isRTL ? 'السرعة' : 'Speed'}</p>
                        <p className="text-lg font-bold text-purple-600">{studentTest.result.speed} WPM</p>
                      </div>
                      <div className={isRTL ? 'text-right' : ''}>
                        <p className="text-xs text-gray-500">{isRTL ? 'الدقة' : 'Accuracy'}</p>
                        <p className="text-lg font-bold text-green-600">{studentTest.result.accuracy}%</p>
                      </div>
                    </div>
                    {studentTest.result.passed && studentTest.test.issueCertificate && (
                      <div className={`mt-3 flex items-center gap-2 text-yellow-700`}>
                        <Trophy className="w-5 h-5" />
                        <span className={`text-sm font-medium ${isRTL ? 'font-arabic' : ''}`}>
                          {isRTL ? 'مؤهل للشهادة' : 'Certificate Eligible'}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                <div className={`flex gap-3`}>
                  {studentTest.canAttempt && (
                    <button
                      onClick={() => router.push(`/student/tests/${studentTest.test.id}`)}
                      className="flex-1 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      {studentTest.status === 'not_started'
                        ? (isRTL ? 'ابدأ الاختبار' : 'Start Test')
                        : (isRTL ? 'حاول مرة أخرى' : 'Try Again')}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

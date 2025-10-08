
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { Sidebar, instructorLinks } from '@/components/Sidebar';
import { ArrowLeft } from 'lucide-react';

const GRADES = [
  'unassigned',
  'Grade 1',
  'Grade 2',
  'Grade 3',
  'Grade 4',
  'Grade 5',
  'Grade 6',
  'Grade 7',
  'Grade 8',
  'Grade 9',
  'Grade 10',
  'Grade 11',
  'Grade 12',
];

export default function EditStudentPage() {
  const params = useParams();
  const router = useRouter();
  const { isRTL } = useLanguage();
  const studentId = params.id as string;

  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState('');
  const [classes, setClasses] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    studentId: '',
    password: '',
    grade: GRADES[0],
    classId: 'none',
    accessibility: [] as string[],
  });

  // Fetch student data and classes
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studentRes, classesRes] = await Promise.all([
          fetch(`/api/instructor/students/${studentId}`),
          fetch('/api/instructor/classes'),
        ]);

        if (!studentRes.ok) {
          router.push('/instructor/students');
          return;
        }

        const studentData = await studentRes.json();
        const classesData = classesRes.ok ? await classesRes.json() : { classes: [] };

        setClasses(classesData.classes || []);
        setFormData({
          name: studentData.user.name || '',
          email: studentData.user.email || '',
          studentId: studentData.user.studentId || '',
          password: '',
          grade: studentData.user.grade || GRADES[0],
          classId: 'none',
          accessibility: studentData.user.accessibility || [],
        });
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load student data');
      } finally {
        setFetchLoading(false);
      }
    };

    fetchData();
  }, [studentId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/instructor/students/${studentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        router.push(`/instructor/students/${studentId}`);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to update student');
      }
    } catch (error) {
      console.error('Error updating student:', error);
      setError('Failed to update student');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox' && name === 'accessibility') {
      const checkbox = e.target as HTMLInputElement;
      const updatedAccessibility = checkbox.checked
        ? [...formData.accessibility, value]
        : formData.accessibility.filter(item => item !== value);
      
      setFormData({
        ...formData,
        accessibility: updatedAccessibility,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  if (fetchLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar links={instructorLinks} userRole="instructor" />

      <main className="flex-1 px-8 py-8">
        {/* Header */}
        <div className={`mb-8 ${isRTL ? 'text-right' : 'text-left'}`}>
          <button
            onClick={() => router.push(`/instructor/students/${studentId}`)}
            className={`flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4 ${
              isRTL ? 'flex-row-reverse' : ''
            }`}
          >
            <ArrowLeft className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
            <span className={isRTL ? 'font-arabic' : ''}>
              {isRTL ? 'العودة لتفاصيل الطالب' : 'Back to Student Details'}
            </span>
          </button>

          <h1 className={`text-3xl font-bold text-gray-900 ${isRTL ? 'font-arabic' : ''}`}>
            {isRTL ? 'تعديل معلومات الطالب' : 'Edit Student Information'}
          </h1>
          <p className={`text-gray-600 mt-2 ${isRTL ? 'font-arabic' : ''}`}>
            {isRTL ? 'قم بتحديث معلومات الطالب' : 'Update the student information'}
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow p-8 max-w-2xl">
          {error && (
            <div className={`mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 ${
              isRTL ? 'text-right font-arabic' : ''
            }`}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label className={`block text-sm font-medium text-gray-700 mb-2 ${
                isRTL ? 'text-right font-arabic' : ''
              }`}>
                {isRTL ? 'اسم الطالب' : 'Student Name'}{' '}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  isRTL ? 'text-right font-arabic' : ''
                }`}
                placeholder={isRTL ? 'أدخل اسم الطالب' : 'Enter student name'}
              />
            </div>

            {/* Email */}
            <div>
              <label className={`block text-sm font-medium text-gray-700 mb-2 ${
                isRTL ? 'text-right font-arabic' : ''
              }`}>
                {isRTL ? 'البريد الإلكتروني' : 'Email Address'}{' '}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  isRTL ? 'text-right font-arabic' : ''
                }`}
                placeholder={isRTL ? 'أدخل البريد الإلكتروني' : 'Enter email'}
              />
            </div>

            {/* Student ID */}
            <div>
              <label className={`block text-sm font-medium text-gray-700 mb-2 ${
                isRTL ? 'text-right font-arabic' : ''
              }`}>
                {isRTL ? 'رقم الطالب' : 'Student ID'}{' '}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="studentId"
                value={formData.studentId}
                onChange={handleChange}
                required
                className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  isRTL ? 'text-right font-arabic' : ''
                }`}
                placeholder={isRTL ? 'أدخل رقم الطالب' : 'Enter student ID'}
              />
            </div>

            {/* Password */}
            <div>
              <label className={`block text-sm font-medium text-gray-700 mb-2 ${
                isRTL ? 'text-right font-arabic' : ''
              }`}>
                {isRTL ? 'كلمة المرور الجديدة' : 'New Password'}
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  isRTL ? 'text-right font-arabic' : ''
                }`}
                placeholder={isRTL ? 'اترك فارغاً للإبقاء على كلمة المرور الحالية' : 'Leave blank to keep current password'}
              />
              <p className={`text-sm text-gray-500 mt-1 ${isRTL ? 'text-right font-arabic' : ''}`}>
                {isRTL ? 'اترك هذا الحقل فارغاً إذا كنت لا تريد تغيير كلمة المرور' : 'Leave this field empty if you don\'t want to change the password'}
              </p>
            </div>

            {/* Grade */}
            <div>
              <label className={`block text-sm font-medium text-gray-700 mb-2 ${
                isRTL ? 'text-right font-arabic' : ''
              }`}>
                {isRTL ? 'الصف الدراسي' : 'Grade'}{' '}
                <span className="text-red-500">*</span>
              </label>
              <select
                name="grade"
                value={formData.grade}
                onChange={handleChange}
                required
                className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  isRTL ? 'text-right font-arabic' : ''
                }`}
              >
                {GRADES.map((grade) => (
                  <option key={grade} value={grade}>
                    {grade}
                  </option>
                ))}
              </select>
            </div>

            {/* Class Selection */}
            <div>
              <label className={`block text-sm font-medium text-gray-700 mb-2 ${
                isRTL ? 'text-right font-arabic' : ''
              }`}>
                {isRTL ? 'الفصل الدراسي' : 'Class'}
              </label>
              <select
                name="classId"
                value={formData.classId}
                onChange={handleChange}
                className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  isRTL ? 'text-right font-arabic' : ''
                }`}
              >
                <option value="none">
                  {isRTL ? 'بدون فصل' : 'No Class'}
                </option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Accessibility Options */}
            <div className="pt-4 border-t border-gray-200">
              <h3 className={`text-lg font-semibold text-gray-900 mb-4 ${isRTL ? 'text-right font-arabic' : ''}`}>
                {isRTL ? 'إمكانية الوصول' : 'Accessibility'}
              </h3>
              
              <div className="space-y-3">
                {/* Blind */}
                <label className={`flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer ${
                  isRTL ? 'flex-row-reverse' : ''
                }`}>
                  <input
                    type="checkbox"
                    name="accessibility"
                    value="blind"
                    checked={formData.accessibility.includes('blind')}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <div className={`flex-1 ${isRTL ? 'text-right' : ''}`}>
                    <div className={`font-medium text-gray-900 ${isRTL ? 'font-arabic' : ''}`}>
                      {isRTL ? 'كفيف' : 'Blind'}
                    </div>
                    <div className={`text-sm text-gray-600 ${isRTL ? 'font-arabic' : ''}`}>
                      {isRTL 
                        ? 'يفعل: تباين عالي، خط كبير جداً، إرشاد صوتي كامل، منع عند الخطأ، مسافة للخلف'
                        : 'Activates: high contrast, extra-large font, fully guided voice-over, block-on-error, backspace'}
                    </div>
                  </div>
                </label>

                {/* Low Vision */}
                <label className={`flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer ${
                  isRTL ? 'flex-row-reverse' : ''
                }`}>
                  <input
                    type="checkbox"
                    name="accessibility"
                    value="lowVision"
                    checked={formData.accessibility.includes('lowVision')}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <div className={`flex-1 ${isRTL ? 'text-right' : ''}`}>
                    <div className={`font-medium text-gray-900 ${isRTL ? 'font-arabic' : ''}`}>
                      {isRTL ? 'ضعف البصر' : 'Low Vision'}
                    </div>
                    <div className={`text-sm text-gray-600 ${isRTL ? 'font-arabic' : ''}`}>
                      {isRTL 
                        ? 'يفعل: خلفية افتراضية، خط كبير، إرشاد صوتي كامل'
                        : 'Activates: default background, large font, fully guided voice-over'}
                    </div>
                  </div>
                </label>

                {/* Dyslexic */}
                <label className={`flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer ${
                  isRTL ? 'flex-row-reverse' : ''
                }`}>
                  <input
                    type="checkbox"
                    name="accessibility"
                    value="dyslexic"
                    checked={formData.accessibility.includes('dyslexic')}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <div className={`flex-1 ${isRTL ? 'text-right' : ''}`}>
                    <div className={`font-medium text-gray-900 ${isRTL ? 'font-arabic' : ''}`}>
                      {isRTL ? 'عسر القراءة' : 'Dyslexic'}
                    </div>
                    <div className={`text-sm text-gray-600 ${isRTL ? 'font-arabic' : ''}`}>
                      {isRTL 
                        ? 'يفعل: خط كبير مصمم خصيصاً لمن يعانون من عسر القراءة'
                        : 'Activates: large font designed specifically for dyslexic users'}
                    </div>
                  </div>
                </label>

                {/* Right Hand Only */}
                <label className={`flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer ${
                  isRTL ? 'flex-row-reverse' : ''
                }`}>
                  <input
                    type="checkbox"
                    name="accessibility"
                    value="rightHandOnly"
                    checked={formData.accessibility.includes('rightHandOnly')}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <div className={`flex-1 ${isRTL ? 'text-right' : ''}`}>
                    <div className={`font-medium text-gray-900 ${isRTL ? 'font-arabic' : ''}`}>
                      {isRTL ? 'اليد اليمنى فقط' : 'Right Hand Only'}
                    </div>
                    <div className={`text-sm text-gray-600 ${isRTL ? 'font-arabic' : ''}`}>
                      {isRTL 
                        ? 'يفعل: دليل افتراضي لليد اليمنى'
                        : 'Activates: right-hand virtual guide'}
                    </div>
                  </div>
                </label>

                {/* Left Hand Only */}
                <label className={`flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer ${
                  isRTL ? 'flex-row-reverse' : ''
                }`}>
                  <input
                    type="checkbox"
                    name="accessibility"
                    value="leftHandOnly"
                    checked={formData.accessibility.includes('leftHandOnly')}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <div className={`flex-1 ${isRTL ? 'text-right' : ''}`}>
                    <div className={`font-medium text-gray-900 ${isRTL ? 'font-arabic' : ''}`}>
                      {isRTL ? 'اليد اليسرى فقط' : 'Left Hand Only'}
                    </div>
                    <div className={`text-sm text-gray-600 ${isRTL ? 'font-arabic' : ''}`}>
                      {isRTL 
                        ? 'يفعل: دليل افتراضي لليد اليسرى'
                        : 'Activates: left-hand virtual guide'}
                    </div>
                  </div>
                </label>

                {/* Hard of Hearing */}
                <label className={`flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer ${
                  isRTL ? 'flex-row-reverse' : ''
                }`}>
                  <input
                    type="checkbox"
                    name="accessibility"
                    value="hardOfHearing"
                    checked={formData.accessibility.includes('hardOfHearing')}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <div className={`flex-1 ${isRTL ? 'text-right' : ''}`}>
                    <div className={`font-medium text-gray-900 ${isRTL ? 'font-arabic' : ''}`}>
                      {isRTL ? 'ضعف السمع' : 'Hard of Hearing'}
                    </div>
                    <div className={`text-sm text-gray-600 ${isRTL ? 'font-arabic' : ''}`}>
                      {isRTL 
                        ? 'يفعل: ترجمة للفيديوهات'
                        : 'Activates: closed captioning for videos'}
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className={`px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed ${
                  isRTL ? 'font-arabic' : ''
                }`}
              >
                {loading
                  ? isRTL
                    ? 'جاري الحفظ...'
                    : 'Saving...'
                  : isRTL
                  ? 'حفظ التغييرات'
                  : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={() => router.push(`/instructor/students/${studentId}`)}
                className={`px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors ${
                  isRTL ? 'font-arabic' : ''
                }`}
              >
                {isRTL ? 'إلغاء' : 'Cancel'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

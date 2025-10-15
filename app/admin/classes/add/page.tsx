
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { Sidebar, adminLinks } from '@/components/Sidebar';

const GRADES = [
  'Unassigned',
  '1st Grade',
  '2nd Grade',
  '3rd Grade',
  '4th Grade',
  '5th Grade',
  '6th Grade',
  '7th Grade',
  '8th Grade',
  '9th Grade',
  '10th Grade',
  '11th Grade',
  '12th Grade',
];

export default function AddClassPage() {
  const router = useRouter();
  const { isRTL } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [instructors, setInstructors] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    grade: '',
    instructorIds: [] as number[],
    courseIds: [] as number[],
  });

  useEffect(() => {
    fetchInstructorsAndCourses();
  }, []);

  const fetchInstructorsAndCourses = async () => {
    try {
      const [instructorsRes, coursesRes] = await Promise.all([
        fetch('/api/admin/instructors?role=instructor'),
        fetch('/api/admin/courses'),
      ]);

      if (instructorsRes.ok) {
        const data = await instructorsRes.json();
        setInstructors(data.instructors || []);
      }

      if (coursesRes.ok) {
        const data = await coursesRes.json();
        setCourses(data.courses || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/admin/classes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        router.push('/admin/classes');
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to create class');
      }
    } catch (error) {
      console.error('Error creating class:', error);
      setError('Failed to create class');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleMultiSelectChange = (field: 'instructorIds' | 'courseIds', id: number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].includes(id)
        ? prev[field].filter((i) => i !== id)
        : [...prev[field], id],
    }));
  };

  return (
    <div className={`flex min-h-screen bg-gray-50`}>
      <Sidebar links={adminLinks} userRole="admin" />

      <main className="flex-1 px-8 py-8">
        <div className={`mb-8 ${isRTL ? 'text-right' : 'text-left'}`}>
          <button
            onClick={() => router.push('/admin/classes')}
            className={`flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4 `}
          >
            <ArrowLeft className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
            <span className={isRTL ? 'font-arabic' : ''}>
              {isRTL ? 'العودة للفصول' : 'Back to Classes'}
            </span>
          </button>
          <h1 className={`text-3xl font-bold text-gray-900 ${isRTL ? 'font-arabic' : ''}`}>
            {isRTL ? 'إضافة فصل جديد' : 'Add New Class'}
          </h1>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 max-w-3xl">
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className={`block text-sm font-medium text-gray-700 mb-2 `}>
                {isRTL ? 'اسم الفصل *' : 'Class Name *'}
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isRTL ? 'text-right' : ''}`}
                required
                />
            </div>

            <div>
              <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'text-right font-arabic' : ''}`}>
                {isRTL ? 'الوصف' : 'Description'}
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isRTL ? 'text-right' : ''}`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'text-right font-arabic' : ''}`}>
              {isRTL ? 'الصف *' : 'Grade *'}
              </label>
              <input
                type="text"
                name="grade"
                value={formData.grade}
                onChange={handleChange}
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isRTL ? 'text-right' : ''}`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'text-right font-arabic' : ''}`}>
                {isRTL ? 'المعلمون' : 'Instructor(s)'}
              </label>
              <div className="border border-gray-300 rounded-lg p-3 max-h-48 overflow-y-auto">
                {instructors.length === 0 ? (
                  <p className="text-gray-500 text-sm">No instructors available</p>
                ) : (
                  instructors.map((instructor) => (
                    <label
                      key={instructor.id}
                      className={`flex items-center gap-2 py-2 hover:bg-gray-50 cursor-pointer `}
                    >
                      <input
                        type="checkbox"
                        checked={formData.instructorIds.includes(instructor.id)}
                        onChange={() => handleMultiSelectChange('instructorIds', instructor.id)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className={isRTL ? 'font-arabic' : ''}>{instructor.name}</span>
                    </label>
                  ))
                )}
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'text-right font-arabic' : ''}`}>
                {isRTL ? 'الدورات' : 'Courses'}
              </label>
              <div className="border border-gray-300 rounded-lg p-3 max-h-48 overflow-y-auto">
                {courses.length === 0 ? (
                  <p className="text-gray-500 text-sm">No courses available</p>
                ) : (
                  courses.map((course) => (
                    <label
                      key={course.id}
                      className={`flex items-center gap-2 py-2 hover:bg-gray-50 cursor-pointer `}
                    >
                      <input
                        type="checkbox"
                        checked={formData.courseIds.includes(course.id)}
                        onChange={() => handleMultiSelectChange('courseIds', course.id)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className={isRTL ? 'font-arabic' : ''}>{course.name}</span>
                    </label>
                  ))
                )}
              </div>
            </div>

            <div className={`flex gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <button
                type="button"
                onClick={() => router.push('/admin/classes')}
                className={`flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 ${isRTL ? 'font-arabic' : ''}`}
              >
                {isRTL ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 ${isRTL ? 'font-arabic' : ''}`}
              >
                {loading ? (isRTL ? 'جاري الإنشاء...' : 'Creating...') : (isRTL ? 'إنشاء فصل' : 'Create Class')}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

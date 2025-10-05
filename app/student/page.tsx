'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Course {
  id: number;
  name: string;
  description: string;
  language: string;
  lessonsCount: number;
}

export default function StudentDashboard() {
  const [user, setUser] = useState<any>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

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

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-blue-600">بَنان</h1>
              <span className="text-gray-600">Student Portal</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">{user?.name}</span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">My Courses</h2>
          <p className="text-gray-600">Select a course to start practicing</p>
        </div>

        {courses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No courses assigned yet</p>
            <p className="text-gray-400 mt-2">Contact your instructor to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div
                key={course.id}
                onClick={() => router.push(`/student/course/${course.id}`)}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow cursor-pointer p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">{course.name}</h3>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    {course.language === 'ar' ? 'Arabic' : 'English'}
                  </span>
                </div>
                <p className="text-gray-600 mb-4">{course.description || 'No description'}</p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{course.lessonsCount || 0} lessons</span>
                  <span className="text-blue-600 font-medium">Start →</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

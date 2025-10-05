'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function InstructorDashboard() {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({ classes: 0, students: 0, courses: 0 });
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
              <span className="text-gray-600">Instructor Portal</span>
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
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="text-gray-500 text-sm mb-2">Total Classes</div>
            <div className="text-3xl font-bold text-blue-600">{stats.classes}</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="text-gray-500 text-sm mb-2">Total Students</div>
            <div className="text-3xl font-bold text-green-600">{stats.students}</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="text-gray-500 text-sm mb-2">Total Courses</div>
            <div className="text-3xl font-bold text-purple-600">{stats.courses}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button
            onClick={() => router.push('/instructor/classes')}
            className="bg-white rounded-xl shadow-md p-8 hover:shadow-xl transition-shadow text-left"
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Manage Classes</h3>
            <p className="text-gray-600">Create and manage your classes</p>
          </button>
          
          <button
            onClick={() => router.push('/instructor/courses')}
            className="bg-white rounded-xl shadow-md p-8 hover:shadow-xl transition-shadow text-left"
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Manage Courses</h3>
            <p className="text-gray-600">Create and edit courses and lessons</p>
          </button>
        </div>
      </main>
    </div>
  );
}

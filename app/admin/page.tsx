'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null);
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
              <span className="text-gray-600">Admin Portal</span>
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
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <button 
            onClick={() => router.push('/admin/schools')}
            className="bg-white rounded-xl shadow-md p-8 hover:shadow-xl transition-shadow text-left"
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Schools</h3>
            <p className="text-gray-600">Manage schools and administrators</p>
          </button>
          
          <button 
            onClick={() => router.push('/admin/instructors')}
            className="bg-white rounded-xl shadow-md p-8 hover:shadow-xl transition-shadow text-left"
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Instructors</h3>
            <p className="text-gray-600">Manage instructor accounts and permissions</p>
          </button>
          
          <button 
            onClick={() => router.push('/admin/students')}
            className="bg-white rounded-xl shadow-md p-8 hover:shadow-xl transition-shadow text-left"
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Students</h3>
            <p className="text-gray-600">Manage student accounts and progress</p>
          </button>
        </div>
      </main>
    </div>
  );
}

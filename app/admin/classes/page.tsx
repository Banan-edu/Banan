
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Plus, Trash2 } from 'lucide-react';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { Sidebar, adminLinks } from '@/components/Sidebar';

export default function InstructorClassesPage() {
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [classToDelete, setClassToDelete] = useState<any>(null);
  const router = useRouter();
  const { isRTL } = useLanguage();

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const res = await fetch('/api/admin/classes');
      if (!res.ok) {
        router.push('/login');
        return;
      }
      const data = await res.json();

      // Fetch activity data for each class
      const classesWithActivity = await Promise.all(
        data.classes.map(async (classItem: any) => {
          try {
            const activityRes = await fetch(`/api/admin/classes/${classItem.id}/activity`);
            if (activityRes.ok) {
              const activityData = await activityRes.json();
              return { ...classItem, activityData: activityData.activityData };
            }
          } catch (error) {
            console.error(`Error fetching activity for class ${classItem.id}:`, error);
          }
          return { ...classItem, activityData: [0, 0, 0, 0, 0, 0, 0] };
        })
      );

      setClasses(classesWithActivity);
    } catch (error) {
      console.error('Error fetching classes:', error);
    } finally {
      setLoading(false);
    }
  };


  const handleDeleteClick = (classItem: any) => {
    setClassToDelete(classItem);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!classToDelete) return;

    try {
      const res = await fetch(`/api/admin/classes/${classToDelete.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setShowDeleteModal(false);
        setClassToDelete(null);
        fetchClasses();
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to delete class');
      }
    } catch (error) {
      console.error('Error deleting class:', error);
      alert('Failed to delete class');
    }
  };

  const ActivitySparkline = ({ data }: { data: number[] }) => {
    const max = Math.max(...data, 1);
    return (
      <div className="flex items-end gap-0.5 h-8 w-20">
        {data.map((value, index) => (
          <div
            key={index}
            className="flex-1 bg-blue-500 rounded-sm"
            style={{ height: `${(value / max) * 100}%` }}
          />
        ))}
      </div>
    );
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
      <Sidebar links={adminLinks} userRole="admin" />

      <main className="flex-1 px-8 py-8">
        <div className={`flex justify-between items-center mb-8`}>
          <h2 className={`text-3xl font-bold text-gray-900 ${isRTL ? 'font-arabic' : ''}`}>
            {isRTL ? 'الفصول الدراسية' : 'My Classes'}
          </h2>
          <button
            onClick={() => router.push('/admin/classes/add')}
            className={`flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 ${isRTL ? 'flex-row-reverse font-arabic' : ''}`}
          >
            <Plus className="w-5 h-5" />
            {isRTL ? 'إضافة فصل' : 'Add Class'}
          </button>
        </div>

        {classes.length === 0 ? (
          <div className="text-center py-12">
            <p className={`text-gray-500 text-lg ${isRTL ? 'font-arabic' : ''}`}>
              {isRTL ? 'لا توجد فصول حتى الآن. قم بإنشاء أول فصل للبدء!' : 'No classes yet. Create your first class to get started!'}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${isRTL ? 'text-right' : ''}`}>
                    {isRTL ? 'اسم الفصل' : 'Class Name'}
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${isRTL ? 'text-right' : ''}`}>
                    {isRTL ? 'النشاط' : 'Activity'}
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${isRTL ? 'text-right' : ''}`}>
                    {isRTL ? 'عدد الطلاب' : 'Students Count'}
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${isRTL ? 'text-right' : ''}`}>
                    {isRTL ? 'المعلمون' : 'Instructor(s)'}
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${isRTL ? 'text-right' : ''}`}>
                    {isRTL ? 'تاريخ الإنشاء' : 'Creation Date'}
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${isRTL ? 'text-right' : ''}`}>
                    {isRTL ? 'الصف' : 'Grade'}
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${isRTL ? 'text-right' : ''}`}>
                    {isRTL ? 'الإجراءات' : 'Actions'}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {classes.map((classItem) => (
                  <tr key={classItem.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => router.push(`/admin/classes/${classItem.id}`)}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        {classItem.name}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <ActivitySparkline data={classItem.activityData || [0, 0, 0, 0, 0, 0, 0]} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4 text-gray-500" />
                        <span>{classItem.studentCount || 0}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-gray-900">
                        {classItem.instructorCount || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      {new Date(classItem.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                        {classItem.grade || 'Unassigned'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleDeleteClick(classItem)}
                        className={`text-red-600 hover:text-red-800 flex items-center gap-1 ${isRTL ? 'font-arabic' : ''}`}
                      >
                        <Trash2 className="w-4 h-4" />
                        {isRTL ? 'حذف' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {showDeleteModal && classToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className={`bg-white rounded-lg p-6 max-w-md w-full ${isRTL ? 'font-arabic' : ''}`}>
              <h3 className={`text-xl font-bold mb-4 text-gray-900 ${isRTL ? 'text-right' : ''}`}>
                {isRTL ? 'تأكيد الحذف' : 'Confirm Delete'}
              </h3>
              <p className={`text-gray-600 mb-6 ${isRTL ? 'text-right' : ''}`}>
                {isRTL
                  ? `هل أنت متأكد من حذف الفصل "${classToDelete.name}"؟ سيتم حذف جميع البيانات المرتبطة بهذا الفصل.`
                  : `Are you sure you want to delete the class "${classToDelete.name}"? All associated data will be removed.`
                }
              </p>
              <div className={`flex gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setClassToDelete(null);
                  }}
                  className={`flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 ${isRTL ? 'font-arabic' : ''}`}
                >
                  {isRTL ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={handleDeleteConfirm}
                  className={`flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 ${isRTL ? 'font-arabic' : ''}`}
                >
                  {isRTL ? 'حذف' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

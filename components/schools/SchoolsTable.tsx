'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { Plus, Search, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AddSchoolModal from './AddSchoolModal';
import ConfirmDeleteModal from '../modals/ConfirmDelete';
import { stringify } from 'querystring';

interface School {
  id: number;
  name: string;
  country: string;
  address: string;
  phone: string | null;
  classCount: number;
  adminCount: number;
  instructorCount: number;
  studentCount: number;
}

interface SchoolsTableProps {
  apiEndpoint?: string;
  hideAddButton?: boolean;
  showDelete?: boolean;
  onRowClick?: (schoolId: number) => void;
  role?: string;
}

export default function SchoolsTable({
  apiEndpoint = '/api/admin/schools',
  hideAddButton = false,
  showDelete = false,
  onRowClick,
  role = 'admin'
}: SchoolsTableProps) {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [DeleteLoading, setDeleteLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedInstructorId, setSelectedInstructorId] = useState<number | null>(null);
  const { isRTL } = useLanguage();

  const router = useRouter();

  const fetchSchools = async () => {
    try {
      const res = await fetch(apiEndpoint);
      if (res.ok) {
        const data = await res.json();
        setSchools(data.schools);
      }
    } catch (error) {
      console.error('Error fetching schools:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchools();
  }, []);

  const filteredSchools = schools.filter(school =>
    school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    school.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSchoolAdded = () => {
    fetchSchools();
    setIsAddModalOpen(false);
  };

  const handleDelete = async (schoolId: number) => {
    setDeleteLoading(true)
    try {
      const res = await fetch(`${apiEndpoint}/${schoolId}`, {
        method: 'PATCH',
        body: JSON.stringify({ action: 'soft_delete' })
      });
      if (res.ok) {
        fetchSchools();
        setDeleteLoading(false)
        setShowDeleteModal(false)
      }
    } catch (error) {
      console.error('Error deleting student:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className={`text-gray-600 ${isRTL ? 'font-arabic' : ''}`}>
          {isRTL ? 'جاري التحميل...' : 'Loading...'}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className={`flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
        <div className="relative flex-1 max-w-md">
          <Search className={`absolute top-3 ${isRTL ? 'right-3' : 'left-3'} text-gray-400 w-5 h-5`} />
          <input
            type="text"
            placeholder={isRTL ? 'ابحث عن المدارس...' : 'Search schools...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full ${isRTL ? 'pr-10 text-right font-arabic' : 'pl-10'} py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
          />
        </div>
        {!hideAddButton && (
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className={`bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 ${isRTL ? 'flex-row-reverse font-arabic' : ''}`}
          >
            <Plus className="w-5 h-5" />
            {isRTL ? 'إضافة مدرسة جديدة' : 'Add New School'}
          </Button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className={`px-6 py-3 text-sm font-semibold text-gray-700 ${isRTL ? 'text-right font-arabic' : 'text-left'}`}>
                  {isRTL ? 'اسم المدرسة' : 'School Name'}
                </th>
                <th className={`px-6 py-3 text-sm font-semibold text-gray-700 ${isRTL ? 'text-right font-arabic' : 'text-left'}`}>
                  {isRTL ? 'العنوان' : 'Address'}
                </th>
                <th className={`px-6 py-3 text-sm font-semibold text-gray-700 ${isRTL ? 'text-right font-arabic' : 'text-left'}`}>
                  {isRTL ? 'الصفوف' : 'Classes'}
                </th>
                <th className={`px-6 py-3 text-sm font-semibold text-gray-700 ${isRTL ? 'text-right font-arabic' : 'text-left'}`}>
                  {isRTL ? 'المسؤولون' : 'Admins'}
                </th>
                <th className={`px-6 py-3 text-sm font-semibold text-gray-700 ${isRTL ? 'text-right font-arabic' : 'text-left'}`}>
                  {isRTL ? 'المعلمون' : 'Instructors'}
                </th>
                <th className={`px-6 py-3 text-sm font-semibold text-gray-700 ${isRTL ? 'text-right font-arabic' : 'text-left'}`}>
                  {isRTL ? 'الطلاب' : 'Students'}
                </th>
                {showDelete && (
                  <th className={`px-6 py-3 text-sm font-semibold text-gray-700 ${isRTL ? 'text-right font-arabic' : 'text-left'}`}>
                    {isRTL ? 'الإجراءات' : 'Actions'}
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredSchools.length === 0 ? (
                <tr>
                  <td colSpan={6} className={`px-6 py-8 text-center text-gray-500 ${isRTL ? 'font-arabic' : ''}`}>
                    {isRTL ? 'لا توجد مدارس' : 'No schools found'}
                  </td>
                </tr>
              ) : (
                filteredSchools.map((school) => (
                  <tr
                    key={school.id}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <td
                      onClick={() => onRowClick ? onRowClick(school.id) : router.push(`/${role}/schools/${school.id}`)}
                      className={`px-6 py-4 ${isRTL ? 'text-right font-arabic' : 'text-left'}`}>
                      <div className="font-medium text-blue-600 hover:text-blue-800">
                        {school.name}
                      </div>
                      <div className={`text-sm text-gray-500 ${isRTL ? 'font-arabic' : ''}`}>
                        {school.country}
                      </div>
                    </td>
                    <td className={`px-6 py-4 text-sm text-gray-700 ${isRTL ? 'text-right font-arabic' : 'text-left'}`}>
                      {school.address}
                    </td>
                    <td className={`px-6 py-4 text-sm text-gray-700 ${isRTL ? 'text-right' : 'text-left'}`}>
                      {school.classCount}
                    </td>
                    <td className={`px-6 py-4 text-sm text-gray-700 ${isRTL ? 'text-right' : 'text-left'}`}>
                      {school.adminCount}
                    </td>
                    <td className={`px-6 py-4 text-sm text-gray-700 ${isRTL ? 'text-right' : 'text-left'}`}>
                      {school.instructorCount}
                    </td>
                    <td className={`px-6 py-4 text-sm text-gray-700 ${isRTL ? 'text-right' : 'text-left'}`}>
                      {school.studentCount}
                    </td>
                    {showDelete && (
                      <td className={`px-6 py-4 ${isRTL ? 'text-right' : 'text-left'}`}>
                        <button
                          onClick={() => {
                            setSelectedInstructorId(school.id);
                            setShowDeleteModal(true);
                          }}
                          className="text-red-600 hover:text-red-900 flex items-center gap-1 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          {isRTL ? 'حذف' : 'Delete'}
                        </button>

                        <ConfirmDeleteModal
                          isOpen={showDeleteModal}
                          onClose={() => setShowDeleteModal(false)}
                          onConfirm={() => {
                            if (selectedInstructorId !== null) handleDelete(selectedInstructorId);
                          }}
                          itemName={isRTL ? "المدرسة" : "School"}
                          loading={DeleteLoading}
                        />
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {!hideAddButton && (
        <AddSchoolModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSchoolAdded={handleSchoolAdded}
        />
      )}
    </div>
  );
}

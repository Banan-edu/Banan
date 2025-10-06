'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AddSchoolModal from './AddSchoolModal';

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

export default function SchoolsTable() {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { isRTL } = useLanguage();
  const router = useRouter();

  const fetchSchools = async () => {
    try {
      const res = await fetch('/api/admin/schools');
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
        <Button
          onClick={() => setIsAddModalOpen(true)}
          className={`bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 ${isRTL ? 'flex-row-reverse font-arabic' : ''}`}
        >
          <Plus className="w-5 h-5" />
          {isRTL ? 'إضافة مدرسة جديدة' : 'Add New School'}
        </Button>
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
                    onClick={() => router.push(`/admin/school/${school.id}`)}
                  >
                    <td className={`px-6 py-4 ${isRTL ? 'text-right font-arabic' : 'text-left'}`}>
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
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AddSchoolModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSchoolAdded={handleSchoolAdded}
      />
    </div>
  );
}

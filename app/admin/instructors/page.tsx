'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, UserCheck, X } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Sidebar, adminLinks } from '@/components/Sidebar';
import { useLanguage } from '@/app/contexts/LanguageContext';

export default function AdminInstructorsPage() {
  const [instructors, setInstructors] = useState<any[]>([]);
  const [schools, setSchools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    studentId: '',
    password: '',
    role: 'instructor',
    schoolIds: [] as number[],
    permissions: {
      accessAllStudents: false,
      canRenameDeleteClasses: false,
      canCrudStudents: false,
    }
  });
  const router = useRouter();
  const { isRTL } = useLanguage();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [instructorsRes, schoolsRes] = await Promise.all([
        fetch('/api/admin/instructors'),
        fetch('/api/admin/schools'),
      ]);

      if (!instructorsRes.ok) {
        router.push('/login');
        return;
      }

      const instructorsData = await instructorsRes.json();
      const schoolsData = await schoolsRes.json();

      setInstructors(instructorsData.instructors || []);
      setSchools(schoolsData.schools || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/instructors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, role: formData.role }),
      });
      if (res.ok) {
        setShowCreateModal(false);
        setFormData({
          name: '',
          email: '',
          studentId: '',
          password: '',
          role: 'instructor',
          schoolIds: [],
          permissions: {
            accessAllStudents: false,
            canRenameDeleteClasses: false,
            canCrudStudents: false,
          }
        });
        fetchData();
      }
    } catch (error) {
      console.error('Error creating instructor:', error);
    }
  };

  const handleSchoolToggle = (schoolId: number) => {
    setFormData(prev => ({
      ...prev,
      schoolIds: prev.schoolIds.includes(schoolId)
        ? prev.schoolIds.filter(id => id !== schoolId)
        : [...prev.schoolIds, schoolId]
    }));
  };

  const handleSelectAllSchools = () => {
    setFormData(prev => ({
      ...prev,
      schoolIds: prev.schoolIds.length === schools.length ? [] : schools.map(s => s.id)
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">{isRTL ? 'جاري التحميل...' : 'Loading...'}</div>
      </div>
    );
  }

  return (
    <div className={`flex min-h-screen bg-gray-50`}>
      <Sidebar links={adminLinks} userRole="admin" />

      <main className="flex-1 p-8">
        <div className={`flex  justify-between items-center mb-8`}>
          <h2 className={`text-3xl font-bold text-gray-900 ${isRTL ? 'font-arabic' : ''}`}>
            {isRTL ? 'المعلمون' : 'Instructors'}
          </h2>
          <button
            onClick={() => setShowCreateModal(true)}
            className={`flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 ${isRTL ? 'flex-row-reverse font-arabic' : ''}`}
          >
            <Plus className="w-5 h-5" />
            {isRTL ? 'إضافة معلم جديد' : 'Add New Instructor'}
          </button>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase`}>
                  {isRTL ? 'الاسم' : 'Name'}
                </th>
                <th className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase`}>
                  {isRTL ? 'الدور' : 'Role'}
                </th>
                <th className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase`}>
                  {isRTL ? 'عدد الفصول' : 'Number of Classes'}
                </th>
                <th className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase`}>
                  {isRTL ? 'آخر تسجيل دخول' : 'Last Login'}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {instructors.map((instructor) => (
                <tr key={instructor.id} className="hover:bg-gray-50 cursor-pointer">
                  <td className="px-6 py-4 whitespace-nowrap" onClick={() => router.push(`/admin/instructors/${instructor.id}`)}>
                    <div className={`flex gap-2`}>
                      <UserCheck className="w-5 h-5 text-blue-600" />
                      <span className={`text-blue-600 hover:text-blue-800 ${isRTL ? 'font-arabic' : ''}`}>
                        {instructor.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 ${isRTL ? 'font-arabic' : ''}`}>
                      {isRTL ? (instructor.role === 'instructor' ? 'معلم' : instructor.role === 'admin' ? 'مدير حساب' : instructor.role === 'school_admin' ? 'مدير مدرسة' : 'مدير فواتير') : instructor.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-gray-600 ${isRTL ? 'font-arabic' : ''}`}>
                    {instructor.classCount || 0}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-gray-600 ${isRTL ? 'font-arabic' : ''}`}>
                    {instructor.lastLogin ? new Date(instructor.lastLogin).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US') : (isRTL ? 'أبداً' : 'Never')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className={`flex  justify-between items-center p-6 border-b`}>
              <h3 className={`text-xl font-bold ${isRTL ? 'font-arabic' : ''}`}>
                {isRTL ? 'إضافة معلم جديد' : 'Add New Instructor'}
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'text-right font-arabic' : 'text-left'}`}>
                    {isRTL ? 'الاسم *' : 'Name *'}
                  </label>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={isRTL ? 'text-right' : ''}
                    required
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'text-right font-arabic' : 'text-left'}`}>
                    {isRTL ? 'البريد الإلكتروني *' : 'Email *'}
                  </label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={isRTL ? 'text-right' : ''}
                    required
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'text-right font-arabic' : 'text-left'}`}>
                    {isRTL ? 'المعرف الفريد *' : 'ID (unique identifier) *'}
                  </label>
                  <Input
                    type="text"
                    value={formData.studentId}
                    onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                    className={isRTL ? 'text-right' : ''}
                    required
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'text-right font-arabic' : 'text-left'}`}>
                    {isRTL ? 'كلمة المرور *' : 'Password *'}
                  </label>
                  <Input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className={isRTL ? 'text-right' : ''}
                    required
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'text-right font-arabic' : 'text-left'}`}>
                    {isRTL ? 'الدور *' : 'Role *'}
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isRTL ? 'text-right font-arabic' : ''}`}
                    required
                  >
                    <option value="instructor">{isRTL ? 'معلم' : 'Instructor'}</option>
                    <option value="admin">{isRTL ? 'مدير حساب' : 'Account Admin'}</option>
                    <option value="school_admin">{isRTL ? 'مدير مدرسة' : 'School Admin'}</option>
                    <option value="billing_admin">{isRTL ? 'مدير فواتير' : 'Billing Admin'}</option>
                  </select>
                </div>

                {formData.role === 'instructor' && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <label className={`block text-sm font-medium text-gray-700 mb-3 ${isRTL ? 'text-right font-arabic' : 'text-left'}`}>
                      {isRTL ? 'صلاحيات المعلم' : 'Instructor Permissions'}
                    </label>
                    <div className="space-y-3">
                      <div className={`flex items-center gap-2  `}>
                        <Checkbox
                          checked={formData.permissions.accessAllStudents}
                          onCheckedChange={(checked) => setFormData({ ...formData, permissions: { ...formData.permissions, accessAllStudents: checked as boolean } })}
                        />
                        <span className={`text-sm text-gray-700 ${isRTL ? 'font-arabic' : ''}`}>
                          {isRTL ? 'الوصول إلى جميع الطلاب من جميع المدارس' : 'Access all students from all schools'}
                        </span>
                      </div>
                      <div className={`flex items-center gap-2  `}>
                        <Checkbox
                          checked={formData.permissions.canCrudStudents}
                          onCheckedChange={(checked) => setFormData({ ...formData, permissions: { ...formData.permissions, canCrudStudents: checked as boolean } })}
                        />
                        <span className={`text-sm text-gray-700 ${isRTL ? 'font-arabic' : ''}`}>
                          {isRTL ? 'يمكنه إدارة معلومات الطلاب' : 'Can CRUD student info'}
                        </span>
                      </div>
                      <div className={`flex items-center gap-2  `}>
                        <Checkbox
                          checked={formData.permissions.canRenameDeleteClasses}
                          onCheckedChange={(checked) => setFormData({ ...formData, permissions: { ...formData.permissions, canRenameDeleteClasses: checked as boolean } })}
                        />
                        <span className={`text-sm text-gray-700 ${isRTL ? 'font-arabic' : ''}`}>
                          {isRTL ? 'يمكنه تغيير أسماء الفصول او حذفها' : 'Can change class names or Delete it'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {formData.role === 'school_admin' && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className={`flex  justify-between items-center mb-3`}>
                      <label className={`block text-sm font-medium text-gray-700 ${isRTL ? 'font-arabic' : ''}`}>
                        {isRTL ? 'اختر المدارس' : 'Select Schools'}
                      </label>
                      <button
                        type="button"
                        onClick={handleSelectAllSchools}
                        className={`text-sm text-blue-600 hover:text-blue-800 ${isRTL ? 'font-arabic' : ''}`}
                      >
                        {formData.schoolIds.length === schools.length
                          ? (isRTL ? 'إلغاء تحديد الكل' : 'Deselect All')
                          : (isRTL ? 'تحديد الكل' : 'Select All')}
                      </button>
                    </div>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {schools.map((school) => (
                        <div key={school.id} className={`flex items-center gap-2  `}>
                          <Checkbox
                            checked={formData.schoolIds.includes(school.id)}
                            onCheckedChange={() => handleSchoolToggle(school.id)}
                          />
                          <span className={`text-sm text-gray-700 ${isRTL ? 'font-arabic' : ''}`}>
                            {school.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className={`flex  gap-3 mt-6 pt-4 border-t`}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className={`flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 ${isRTL ? 'font-arabic' : ''}`}
                >
                  {isRTL ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className={`flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 ${isRTL ? 'font-arabic' : ''}`}
                >
                  {isRTL ? 'إنشاء' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

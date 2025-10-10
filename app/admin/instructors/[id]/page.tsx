
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, User, FileText, GraduationCap, Plus, X, Settings, Edit } from 'lucide-react';
import { Sidebar, adminLinks } from '@/components/Sidebar';
import { useLanguage } from '@/app/contexts/LanguageContext';
import ConfirmDeleteModal from '@/components/modals/ConfirmDelete';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';

type Tab = 'overview' | 'history' | 'classes';

export default function InstructorDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { isRTL } = useLanguage();
    const instructorId = params.id as string;

    const [activeTab, setActiveTab] = useState<Tab>('overview');
    const [instructor, setInstructor] = useState<any>(null);
    const [classes, setClasses] = useState<any[]>([]);
    const [allClasses, setAllClasses] = useState<any[]>([]);
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddClassModal, setShowAddClassModal] = useState(false);
    const [showDeleteModal, setShowDelete] = useState(false);
    const [DeleteLoading, setDeleteLoading] = useState(false);
    const [selectedClasses, setSelectedClasses] = useState<number[]>([]);
    const [schools, setSchools] = useState<any[]>([]);


    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [updateFormData, setUpdateFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'instructor',
        schoolIds: [] as number[],
        permissions: {
            canAccessAllStudents: false,
            canRenameDeleteClasses: false,
            canCrudStudents: false,
        }
    });

    useEffect(() => {
        fetchInstructorData();
    }, [instructorId]);

    const fetchInstructorData = async () => {
        try {
            const [instructorRes, classesRes, historyRes, allClassesRes, schoolsRes] = await Promise.all([
                fetch(`/api/admin/instructors/${instructorId}`),
                fetch(`/api/admin/instructors/${instructorId}/classes`),
                fetch(`/api/admin/instructors/${instructorId}/history`),
                fetch('/api/admin/classes'),
                fetch('/api/admin/schools')
            ]);

            if (!instructorRes.ok) {
                router.push('/admin/instructors');
                return;
            }

            const instructorData = await instructorRes.json();
            const classesData = await classesRes.json();
            const historyData = await historyRes.json();
            const allClassesData = await allClassesRes.json();
            const schoolsData = await schoolsRes.json();

            setInstructor(instructorData);
            setClasses(classesData.classes || []);
            setHistory(historyData.logs || []);
            setAllClasses(allClassesData.classes || []);
            setSchools(schoolsData.schools || []);
            setUpdateFormData({
                name: instructorData.name||'',
                email: instructorData.email||'',
                password: '',
                role: instructorData.role||'instructor',
                schoolIds:schoolsData.schools|| [] as number[],
                permissions: {
                    canAccessAllStudents: instructorData.permissions?.canAccessAllStudents||false,
                    canRenameDeleteClasses: instructorData.permissions?.canRenameDeleteClasses||false,
                    canCrudStudents: instructorData.permissions?.canCrudStudents||false,
                }
            });
        } catch (error) {
            console.error('Error fetching instructor data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddClasses = async () => {
        try {
            const res = await fetch(`/api/admin/instructors/${instructorId}/classes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ classIds: selectedClasses }),
            });

            if (res.ok) {
                setShowAddClassModal(false);
                setSelectedClasses([]);
                fetchInstructorData();
            }
        } catch (error) {
            console.error('Error adding classes:', error);
        }
    };

    const toggleClassSelection = (classId: number) => {
        setSelectedClasses(prev =>
            prev.includes(classId)
                ? prev.filter(id => id !== classId)
                : [...prev, classId]
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-xl">Loading...</div>
            </div>
        );
    }

    if (!instructor) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-xl">Instructor not found</div>
            </div>
        );
    }

    const tabs = [
        { id: 'overview' as Tab, labelAr: 'نظرة عامة', labelEn: 'Overview', icon: <User className="w-5 h-5" /> },
        { id: 'history' as Tab, labelAr: 'سجل الأحداث', labelEn: 'Record History', icon: <FileText className="w-5 h-5" /> },
        { id: 'classes' as Tab, labelAr: 'الفصول', labelEn: 'Classes', icon: <GraduationCap className="w-5 h-5" /> },
    ];

    const availableClasses = allClasses.filter(
        c => !classes.some(ic => ic.id === c.id)
    );

    const handleDelete = async (classId: number) => {
        setDeleteLoading(true)
        try {
            const res = await fetch(`/api/admin/instructors/${instructorId}/classes/${classId}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                fetchInstructorData();
                setDeleteLoading(false)
                setShowDelete(false)
            }
        } catch (error) {
            console.error('Error unassigning class:', error);
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            let updateData = updateFormData
            const res = await fetch(`/api/admin/instructors/${instructorId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updateData),
            });
            if (res.ok) {
                setShowUpdateModal(false);
                fetchInstructorData(); // Refresh data after update
            }
        } catch (error) {
            console.error('Error updating instructor:', error);
        }
    };

    const handleSelectAllSchools = () => {
        setUpdateFormData(prev => ({
            ...prev,
            schoolIds: prev.schoolIds.length === schools.length ? [] : schools.map(s => s.id)
        }));
    };

    const handleSchoolToggle = (schoolId: number) => {
        setUpdateFormData(prev => ({
            ...prev,
            schoolIds: prev.schoolIds.includes(schoolId)
                ? prev.schoolIds.filter(id => id !== schoolId)
                : [...prev.schoolIds, schoolId]
        }));
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar links={adminLinks} userRole="admin" />

            <main className="flex-1 px-8 py-8">
                <div className="mb-8">
                    <button
                        onClick={() => router.push('/admin/instructors')}
                        className={`flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4  `}
                    >
                        <ArrowLeft className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
                        <span className={isRTL ? 'font-arabic' : ''}>{isRTL ? 'العودة للمعلمين' : 'Back to Instructors'}</span>
                    </button>
                    <div className='flex justify-between'>
                        <div>
                            <h1 className={`text-xl font-bold text-gray-900 ${isRTL ? 'font-arabic' : ''}`}>
                                {instructor.name}
                            </h1>
                            <p className={`text-gray-600 mt-2 ${isRTL ? 'font-arabic' : ''}`}>
                                {instructor.email}
                            </p>
                        </div>

                        <button
                            onClick={() => setShowUpdateModal(true)}
                            className="flex-1 md:flex-none px-6 py-3 border border-gray-500 text-gray rounded-lg hover:bg-gray-400 flex items-center gap-2 justify-center"
                        >
                            <Edit className="w-5 h-5" />
                            Update Instructor
                        </button>
                    </div>
                </div>

                <div className={`border-b border-gray-200 mb-8  `}>
                    <nav className={`flex gap-8  `}>
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 pb-4 border-b-2 transition-colors   ${activeTab === tab.id
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                {tab.icon}
                                <span className={isRTL ? 'font-arabic' : ''}>{isRTL ? tab.labelAr : tab.labelEn}</span>
                            </button>
                        ))}
                    </nav>
                </div>

                {activeTab === 'overview' && (
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className={`text-xl font-bold text-gray-900 mb-6 ${isRTL ? 'font-arabic text-right' : ''}`}>
                            {isRTL ? 'نظرة عامة' : 'Overview'}
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'font-arabic text-right' : ''}`}>
                                    {isRTL ? 'الاسم' : 'Name'}
                                </label>
                                <p className={`text-gray-900 ${isRTL ? 'text-right' : ''}`}>{instructor.name}</p>
                            </div>
                            <div>
                                <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'font-arabic text-right' : ''}`}>
                                    {isRTL ? 'عدد الفصول' : 'Number of Classes'}
                                </label>
                                <p className={`text-gray-900 ${isRTL ? 'text-right' : ''}`}>{instructor.classCount || 0}</p>
                            </div>
                            {
                                instructor.role !== "instructor" &&
                                (<div>
                                    <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'font-arabic text-right' : ''}`}>
                                        {isRTL ? 'عدد المدارس' : 'Number of Schools'}
                                    </label>
                                    <p className={`text-gray-900 ${isRTL ? 'text-right' : ''}`}>{instructor.schoolCount || 0}</p>
                                </div>)
                            }
                            <div>
                                <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'font-arabic text-right' : ''}`}>
                                    {isRTL ? 'آخر نشاط' : 'Last Activity'}
                                </label>
                                <p className={`text-gray-900 ${isRTL ? 'text-right' : ''}`}>
                                    {instructor.lastActivity ? new Date(instructor.lastActivity).toLocaleDateString() : 'N/A'}
                                </p>
                            </div>
                            <div>
                                <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'font-arabic text-right' : ''}`}>
                                    {isRTL ? 'آخر تسجيل دخول' : 'Last Login'}
                                </label>
                                <p className={`text-gray-900 ${isRTL ? 'text-right' : ''}`}>
                                    {instructor.lastLogin ? new Date(instructor.lastLogin).toLocaleDateString() : 'N/A'}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'history' && (
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase ${isRTL ? 'text-right' : 'text-left'}`}>
                                            {isRTL ? 'الوقت' : 'Time'}
                                        </th>
                                        <th className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase ${isRTL ? 'text-right' : 'text-left'}`}>
                                            {isRTL ? 'الوصف' : 'Description'}
                                        </th>
                                        <th className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase ${isRTL ? 'text-right' : 'text-left'}`}>
                                            {isRTL ? 'بواسطة' : 'By'}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {history.length === 0 ? (
                                        <tr>
                                            <td colSpan={3} className="px-6 py-4 text-center text-gray-500">
                                                {isRTL ? 'لا توجد سجلات' : 'No records found'}
                                            </td>
                                        </tr>
                                    ) : (
                                        history.map((log) => (
                                            <tr key={log.id}>
                                                <td className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${isRTL ? 'text-right' : ''}`}>
                                                    {new Date(log.createdAt).toLocaleString()}
                                                </td>
                                                <td className={`px-6 py-4 text-sm text-gray-900 ${isRTL ? 'text-right' : ''}`}>
                                                    {log.description}
                                                </td>
                                                <td className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${isRTL ? 'text-right' : ''}`}>
                                                    {log.userName}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'classes' && (
                    <div>
                        <div className={`flex justify-between items-center mb-6  `}>
                            <h2 className={`text-xl font-bold text-gray-900 ${isRTL ? 'font-arabic' : ''}`}>
                                {isRTL ? 'الفصول المعينة' : 'Assigned Classes'}
                            </h2>
                            <button
                                onClick={() => setShowAddClassModal(true)}
                                className={`flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 ${isRTL ? 'flex-row-reverse font-arabic' : ''}`}
                            >
                                <Plus className="w-5 h-5" />
                                {isRTL ? 'إضافة فصل' : 'Add Class'}
                            </button>
                        </div>

                        <div className="bg-white rounded-lg shadow-md overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase ${isRTL ? 'text-right' : 'text-left'}`}>
                                            {isRTL ? 'اسم الفصل' : 'Class Name'}
                                        </th>
                                        <th className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase ${isRTL ? 'text-right' : 'text-left'}`}>
                                            {isRTL ? 'عدد الطلاب' : 'Number of Students'}
                                        </th>
                                        <th className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase ${isRTL ? 'text-right' : 'text-left'}`}>
                                            {isRTL ? 'تاريخ التفعيل' : 'Date Active'}
                                        </th>
                                        <th className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase ${isRTL ? 'text-right' : 'text-left'}`}>
                                            {isRTL ? 'الإجراء' : 'Action'}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {classes.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                                                {isRTL ? 'لا توجد فصول معينة' : 'No classes assigned'}
                                            </td>
                                        </tr>
                                    ) : (
                                        classes.map((cls) => (
                                            <tr key={cls.id}>
                                                <td className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${isRTL ? 'text-right' : ''}`}>
                                                    {cls.name}
                                                </td>
                                                <td className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${isRTL ? 'text-right' : ''}`}>
                                                    {cls.studentCount || 0}
                                                </td>
                                                <td className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${isRTL ? 'text-right' : ''}`}>
                                                    {cls.assignedAt ? new Date(cls.assignedAt).toLocaleDateString() : 'N/A'}
                                                </td>
                                                <td className={`px-6 py-4 whitespace-nowrap text-sm ${isRTL ? 'text-right' : ''}`}>
                                                    <button
                                                        onClick={() => setShowDelete(true)}
                                                        className="text-red-600 hover:text-red-800"
                                                    >
                                                        {isRTL ? 'إلغاء التعيين' : 'Unassign'}
                                                    </button>

                                                    <ConfirmDeleteModal
                                                        isOpen={showDeleteModal}
                                                        onClose={() => setShowDelete(false)}
                                                        onConfirm={() => handleDelete(cls.id)}
                                                        itemName={isRTL ? "الفصل" : "Class"}
                                                        loading={DeleteLoading}
                                                    />
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </main>

            {showAddClassModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                        <div className={`flex justify-between items-center mb-4  `}>
                            <h3 className={`text-xl font-bold ${isRTL ? 'font-arabic' : ''}`}>
                                {isRTL ? 'إضافة فصول' : 'Add Classes'}
                            </h3>
                            <button onClick={() => setShowAddClassModal(false)} className="text-gray-500 hover:text-gray-700">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="space-y-2 mb-4">
                            {availableClasses.length === 0 ? (
                                <p className={`text-gray-500 ${isRTL ? 'text-right font-arabic' : ''}`}>
                                    {isRTL ? 'جميع الفصول معينة بالفعل' : 'All classes are already assigned'}
                                </p>
                            ) : (
                                availableClasses.map((cls) => (
                                    <label
                                        key={cls.id}
                                        className={`flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer  `}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedClasses.includes(cls.id)}
                                            onChange={() => toggleClassSelection(cls.id)}
                                            className="w-4 h-4"
                                        />
                                        <span className={isRTL ? 'font-arabic' : ''}>{cls.name}</span>
                                    </label>
                                ))
                            )}
                        </div>

                        <div className={`flex gap-3  `}>
                            <button
                                onClick={() => setShowAddClassModal(false)}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                {isRTL ? 'إلغاء' : 'Cancel'}
                            </button>
                            <button
                                onClick={handleAddClasses}
                                disabled={selectedClasses.length === 0}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                            >
                                {isRTL ? 'إضافة' : 'Add'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showUpdateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="flex justify-between items-center p-6 border-b">
                            <h3 className="text-xl font-bold">
                                Update Instructor
                            </h3>
                            <button onClick={() => setShowUpdateModal(false)} className="text-gray-500 hover:text-gray-700">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleUpdate} className="flex-1 overflow-y-auto p-6">
                            <div className="space-y-4">
                                <div>
                                    <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'text-right font-arabic' : 'text-left'}`}>
                                        {isRTL ? 'الاسم *' : 'Name *'}
                                    </label>
                                    <input
                                        type="text"
                                        value={updateFormData.name}
                                        onChange={(e) => setUpdateFormData({ ...updateFormData, name: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'text-right font-arabic' : 'text-left'}`}>
                                        {isRTL ? 'البريد الالكتروني *' : 'Email *'}
                                    </label>
                                    <input
                                        type="email"
                                        value={updateFormData.email}
                                        onChange={(e) => setUpdateFormData({ ...updateFormData, email: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'text-right font-arabic' : 'text-left'}`}>
                                        {isRTL ? 'كلمة المرور *' : 'Password *'}
                                    </label>
                                    <Input
                                        type="password"
                                        value={updateFormData.password}
                                        onChange={(e) => setUpdateFormData({ ...updateFormData, password: e.target.value })}
                                        className={isRTL ? 'text-right' : ''}
                                        
                                    />
                                </div>

                                <div>
                                    <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'text-right font-arabic' : 'text-left'}`}>
                                        {isRTL ? 'الدور *' : 'Role *'}
                                    </label>
                                    <select
                                        value={updateFormData.role}
                                        onChange={(e) => setUpdateFormData({ ...updateFormData, role: e.target.value })}
                                        className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isRTL ? 'text-right font-arabic' : ''}`}
                                        required
                                    >
                                        <option value="instructor">{isRTL ? 'معلم' : 'Instructor'}</option>
                                        <option value="admin">{isRTL ? 'مدير حساب' : 'Account Admin'}</option>
                                        <option value="school_admin">{isRTL ? 'مدير مدرسة' : 'School Admin'}</option>
                                        <option value="billing_admin">{isRTL ? 'مدير فواتير' : 'Billing Admin'}</option>
                                    </select>
                                </div>

                                {updateFormData.role === 'instructor' && (
                                    <div className="p-4 bg-gray-50 rounded-lg">
                                        <label className={`block text-sm font-medium text-gray-700 mb-3 ${isRTL ? 'text-right font-arabic' : 'text-left'}`}>
                                            {isRTL ? 'صلاحيات المعلم' : 'Instructor Permissions'}
                                        </label>
                                        <div className="space-y-3">
                                            <div className={`flex items-center gap-2  `}>
                                                <Checkbox
                                                    checked={updateFormData.permissions?.canAccessAllStudents}
                                                    onCheckedChange={(checked) => setUpdateFormData({ ...updateFormData, permissions: { ...updateFormData.permissions, canAccessAllStudents: checked as boolean } })}
                                                />
                                                <span className={`text-sm text-gray-700 ${isRTL ? 'font-arabic' : ''}`}>
                                                    {isRTL ? 'الوصول إلى جميع الطلاب من جميع المدارس' : 'Access all students from all schools'}
                                                </span>
                                            </div>
                                            <div className={`flex items-center gap-2  `}>
                                                <Checkbox
                                                    checked={updateFormData.permissions?.canCrudStudents}
                                                    onCheckedChange={(checked) => setUpdateFormData({ ...updateFormData, permissions: { ...updateFormData.permissions, canCrudStudents: checked as boolean } })}
                                                />
                                                <span className={`text-sm text-gray-700 ${isRTL ? 'font-arabic' : ''}`}>
                                                    {isRTL ? 'يمكنه إدارة معلومات الطلاب' : 'Can CRUD student info'}
                                                </span>
                                            </div>
                                            <div className={`flex items-center gap-2  `}>
                                                <Checkbox
                                                    checked={updateFormData.permissions?.canRenameDeleteClasses}
                                                    onCheckedChange={(checked) => setUpdateFormData({ ...updateFormData, permissions: { ...updateFormData.permissions, canRenameDeleteClasses: checked as boolean } })}
                                                />
                                                <span className={`text-sm text-gray-700 ${isRTL ? 'font-arabic' : ''}`}>
                                                    {isRTL ? 'يمكنه تغيير أسماء الفصول او حذفها' : 'Can change class names or Delete it'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {updateFormData.role === 'school_admin' && (
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
                                                {updateFormData.schoolIds.length === schools.length
                                                    ? (isRTL ? 'إلغاء تحديد الكل' : 'Deselect All')
                                                    : (isRTL ? 'تحديد الكل' : 'Select All')}
                                            </button>
                                        </div>
                                        <div className="space-y-2 max-h-40 overflow-y-auto">
                                            {schools.map((school) => (
                                                <div key={school.id} className={`flex items-center gap-2  `}>
                                                    <Checkbox
                                                        checked={updateFormData.schoolIds.includes(school.id)}
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

                            <div className="flex gap-3 mt-6 pt-4 border-t">
                                <button
                                    type="button"
                                    onClick={() => setShowUpdateModal(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    Update
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

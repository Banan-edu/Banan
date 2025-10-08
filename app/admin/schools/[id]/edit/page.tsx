
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { Sidebar, adminLinks } from '@/components/Sidebar';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SchoolFormData {
  name: string;
  country: string;
  address: string;
  phone: string;
}

export default function EditSchoolPage() {
  const params = useParams();
  const router = useRouter();
  const { isRTL } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState<SchoolFormData>({
    name: '',
    country: '',
    address: '',
    phone: '',
  });

  useEffect(() => {
    fetchSchoolData();
  }, [params.id]);

  const fetchSchoolData = async () => {
    try {
      const res = await fetch(`/api/admin/schools/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setFormData({
          name: data.school.name,
          country: data.school.country,
          address: data.school.address,
          phone: data.school.phone || '',
        });
      } else {
        router.push('/admin/schools');
      }
    } catch (error) {
      console.error('Error fetching school:', error);
      setError(isRTL ? 'حدث خطأ في تحميل البيانات' : 'Error loading data');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const res = await fetch(`/api/admin/schools/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setSuccess(isRTL ? 'تم التحديث بنجاح' : 'Updated successfully');
        setTimeout(() => {
          router.push(`/admin/schools/${params.id}`);
        }, 1500);
      } else {
        const data = await res.json();
        setError(data.error || (isRTL ? 'حدث خطأ' : 'An error occurred'));
      }
    } catch (err) {
      setError(isRTL ? 'حدث خطأ في الاتصال' : 'Connection error');
    } finally {
      setSubmitting(false);
    }
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

      <main className="flex-1 px-8 py-8">
        <div className={`mb-8`}>
          <button
            onClick={() => router.push(`/admin/schools/${params.id}`)}
            className={`flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}
          >
            <ArrowLeft className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
            <span className={isRTL ? 'font-arabic' : ''}>{isRTL ? 'العودة' : 'Back'}</span>
          </button>
          
          <h1 className={`text-3xl font-bold text-gray-900 ${isRTL ? 'font-arabic' : ''}`}>
            {isRTL ? 'تعديل المدرسة' : 'Edit School'}
          </h1>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl">
          {error && (
            <div className={`mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm ${isRTL ? 'text-right font-arabic' : ''}`}>
              {error}
            </div>
          )}

          {success && (
            <div className={`mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm ${isRTL ? 'text-right font-arabic' : ''}`}>
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'text-right font-arabic' : ''}`}>
                {isRTL ? 'اسم المدرسة' : 'School Name'} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isRTL ? 'text-right font-arabic' : ''}`}
                placeholder={isRTL ? 'أدخل اسم المدرسة' : 'Enter school name'}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'text-right font-arabic' : ''}`}>
                {isRTL ? 'الدولة' : 'Country'} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                required
                className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isRTL ? 'text-right font-arabic' : ''}`}
                placeholder={isRTL ? 'أدخل اسم الدولة' : 'Enter country name'}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'text-right font-arabic' : ''}`}>
                {isRTL ? 'العنوان' : 'Address'} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isRTL ? 'text-right font-arabic' : ''}`}
                placeholder={isRTL ? 'أدخل العنوان' : 'Enter address'}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'text-right font-arabic' : ''}`}>
                {isRTL ? 'رقم الهاتف' : 'Phone Number'}
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isRTL ? 'text-right font-arabic' : ''}`}
                placeholder={isRTL ? 'أدخل رقم الهاتف' : 'Enter phone number'}
              />
            </div>

            <div className={`flex gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Button
                type="submit"
                disabled={submitting}
                className={`bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 ${isRTL ? 'flex-row-reverse font-arabic' : ''}`}
              >
                <Save className="w-5 h-5" />
                {submitting ? (isRTL ? 'جاري الحفظ...' : 'Saving...') : (isRTL ? 'حفظ' : 'Save')}
              </Button>
              <Button
                type="button"
                onClick={() => router.push(`/admin/schools/${params.id}`)}
                className={`bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors ${isRTL ? 'font-arabic' : ''}`}
              >
                {isRTL ? 'إلغاء' : 'Cancel'}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

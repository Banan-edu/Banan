'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { Sidebar, instructorLinks } from '@/components/Sidebar';
import { ArrowLeft } from 'lucide-react';

const COUNTRIES = [
  'Saudi Arabia',
  'United Arab Emirates',
  'Kuwait',
  'Qatar',
  'Bahrain',
  'Oman',
  'Jordan',
  'Egypt',
  'Lebanon',
  'Iraq',
  'Other',
];

export default function AddSchoolPage() {
  const router = useRouter();
  const { isRTL } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    country: 'Saudi Arabia',
    address: '',
    phone: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/instructor/schools/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        router.push('/instructor/school');
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to create school');
      }
    } catch (error) {
      console.error('Error creating school:', error);
      setError('Failed to create school');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className={`flex ${isRTL ? 'flex-row-reverse' : ''} min-h-screen bg-gray-50`}>
      <Sidebar links={instructorLinks} userRole="instructor" />

      <main className="flex-1 px-8 py-8">
        <div className={`mb-8 ${isRTL ? 'text-right' : 'text-left'}`}>
          <button
            onClick={() => router.push('/instructor/school')}
            className={`flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}
          >
            <ArrowLeft className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
            <span className={isRTL ? 'font-arabic' : ''}>{isRTL ? 'العودة للمدارس' : 'Back to Schools'}</span>
          </button>
          
          <h1 className={`text-3xl font-bold text-gray-900 ${isRTL ? 'font-arabic' : ''}`}>
            {isRTL ? 'إضافة مدرسة جديدة' : 'Add New School'}
          </h1>
          <p className={`text-gray-600 mt-2 ${isRTL ? 'font-arabic' : ''}`}>
            {isRTL ? 'أدخل معلومات المدرسة الجديدة' : 'Enter the new school information'}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-8 max-w-2xl">
          {error && (
            <div className={`mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 ${isRTL ? 'text-right font-arabic' : ''}`}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* School Name */}
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

            {/* Country */}
            <div>
              <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'text-right font-arabic' : ''}`}>
                {isRTL ? 'الدولة' : 'Country'} <span className="text-red-500">*</span>
              </label>
              <select
                name="country"
                value={formData.country}
                onChange={handleChange}
                required
                className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isRTL ? 'text-right font-arabic' : ''}`}
              >
                {COUNTRIES.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </div>

            {/* Address */}
            <div>
              <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'text-right font-arabic' : ''}`}>
                {isRTL ? 'العنوان الكامل' : 'Full Address'} <span className="text-red-500">*</span>
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                rows={3}
                className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isRTL ? 'text-right font-arabic' : ''}`}
                placeholder={isRTL ? 'أدخل العنوان الكامل' : 'Enter full address'}
              />
            </div>

            {/* Phone */}
            <div>
              <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'text-right font-arabic' : ''}`}>
                {isRTL ? 'رقم الهاتف' : 'Phone Number'} <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isRTL ? 'text-right font-arabic' : ''}`}
                placeholder={isRTL ? 'أدخل رقم الهاتف' : 'Enter phone number'}
              />
            </div>

            {/* Submit Button */}
            <div className={`flex gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <button
                type="submit"
                disabled={loading}
                className={`px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed ${isRTL ? 'font-arabic' : ''}`}
              >
                {loading ? (isRTL ? 'جاري الإنشاء...' : 'Creating...') : (isRTL ? 'إنشاء المدرسة' : 'Create School')}
              </button>
              <button
                type="button"
                onClick={() => router.push('/instructor/school')}
                className={`px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors ${isRTL ? 'font-arabic' : ''}`}
              >
                {isRTL ? 'إلغاء' : 'Cancel'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

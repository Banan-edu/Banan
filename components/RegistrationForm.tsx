'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/app/contexts/LanguageContext';

interface RegistrationFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RegistrationForm({ isOpen, onClose }: RegistrationFormProps) {
  const { isRTL } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    gender: 'male' as 'male' | 'female',
    dateOfBirth: '',
    phone: '',
    email: '',
    currentTypingSpeed: '',
    desiredTypingSpeed: '',
    additionalInfo: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          currentTypingSpeed: formData.currentTypingSpeed ? parseInt(formData.currentTypingSpeed) : undefined,
          desiredTypingSpeed: formData.desiredTypingSpeed ? parseInt(formData.desiredTypingSpeed) : undefined,
        }),
      });
      const data = await res.json();
      
      if (data.success) {
        setMessage('✅ ' + data.message);
        setFormData({
          fullName: '',
          gender: 'male',
          dateOfBirth: '',
          phone: '',
          email: '',
          currentTypingSpeed: '',
          desiredTypingSpeed: '',
          additionalInfo: '',
        });
        setTimeout(() => onClose(), 2000);
      } else {
        setMessage('❌ ' + data.message);
      }
    } catch (error) {
      setMessage('❌ ' + (isRTL ? 'حدث خطأ في الاتصال' : 'Connection error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-xl p-6 max-w-2xl w-full my-8" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="flex justify-between items-center mb-6">
          <h3 className={`text-2xl font-bold ${isRTL ? 'arabic-heading' : ''}`}>
            {isRTL ? 'التسجيل في برنامج بنان - الدفعة الأولى 2025' : 'Register for Banan Program - First Cohort 2025'}
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isRTL ? 'arabic-body' : ''}`}>
                {isRTL ? 'الاسم الكامل *' : 'Full Name *'}
              </label>
              <Input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${isRTL ? 'arabic-body' : ''}`}>
                {isRTL ? 'الجنس *' : 'Gender *'}
              </label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'male' | 'female' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="male">{isRTL ? 'ذكر' : 'Male'}</option>
                <option value="female">{isRTL ? 'أنثى' : 'Female'}</option>
              </select>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${isRTL ? 'arabic-body' : ''}`}>
                {isRTL ? 'تاريخ الميلاد *' : 'Date of Birth *'}
              </label>
              <Input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                required
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${isRTL ? 'arabic-body' : ''}`}>
                {isRTL ? 'رقم الهاتف *' : 'Phone *'}
              </label>
              <Input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${isRTL ? 'arabic-body' : ''}`}>
                {isRTL ? 'البريد الإلكتروني *' : 'Email *'}
              </label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${isRTL ? 'arabic-body' : ''}`}>
                {isRTL ? 'سرعة الطباعة الحالية (كلمة/دقيقة)' : 'Current Typing Speed (WPM)'}
              </label>
              <Input
                type="number"
                value={formData.currentTypingSpeed}
                onChange={(e) => setFormData({ ...formData, currentTypingSpeed: e.target.value })}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${isRTL ? 'arabic-body' : ''}`}>
                {isRTL ? 'السرعة المرغوبة (كلمة/دقيقة)' : 'Desired Typing Speed (WPM)'}
              </label>
              <Input
                type="number"
                value={formData.desiredTypingSpeed}
                onChange={(e) => setFormData({ ...formData, desiredTypingSpeed: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className={`block text-sm font-medium mb-2 ${isRTL ? 'arabic-body' : ''}`}>
              {isRTL ? 'معلومات إضافية' : 'Additional Information'}
            </label>
            <Textarea
              value={formData.additionalInfo}
              onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })}
              rows={3}
            />
          </div>
          {message && (
            <div className={`p-3 rounded-lg text-center ${message.includes('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {message}
            </div>
          )}
          <div className="flex gap-3">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="flex-1"
            >
              {isRTL ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
            >
              {isSubmitting ? (isRTL ? 'جاري الإرسال...' : 'Sending...') : (isRTL ? 'تسجيل' : 'Register')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

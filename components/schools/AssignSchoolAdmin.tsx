
'use client';

import { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import { useLanguage } from '@/app/contexts/LanguageContext';

interface Admin {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface AssignAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  schoolId: number;
  onAdminsAssigned: () => void;
}

export default function AssignAdminModal({ isOpen, onClose, schoolId, onAdminsAssigned }: AssignAdminModalProps) {
  const [availableAdmins, setAvailableAdmins] = useState<Admin[]>([]);
  const [selectedAdmins, setSelectedAdmins] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { isRTL } = useLanguage();

  useEffect(() => {
    if (isOpen) {
      fetchAvailableAdmins();
    }
  }, [isOpen, schoolId]);

  const fetchAvailableAdmins = async () => {
    try {
      const res = await fetch(`/api/admin/schools/${schoolId}/available-admins`);
      if (res.ok) {
        const data = await res.json();
        setAvailableAdmins(data.admins || []);
      }
    } catch (err) {
      console.error('Error fetching admins:', err);
    }
  };

  const toggleAdmin = (adminId: number) => {
    setSelectedAdmins(prev =>
      prev.includes(adminId)
        ? prev.filter(id => id !== adminId)
        : [...prev, adminId]
    );
  };

  const handleAssign = async () => {
    if (selectedAdmins.length === 0) {
      setError(isRTL ? 'الرجاء اختيار مسؤول واحد على الأقل' : 'Please select at least one admin');
      return;
    }

    setLoading(true);
    setError('');

    try {
      for (const adminId of selectedAdmins) {
        const res = await fetch(`/api/admin/schools/${schoolId}/admins`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: adminId }),
        });

        if (!res.ok) {
          console.error(`Failed to assign admin ${adminId}`);
          const data = await res.json();
          setError(data.error || (isRTL ? 'حدث خطأ' : 'An error occurred'));
        }
      }
      setSelectedAdmins([]);
      onAdminsAssigned();
      onClose();
    } catch (err) {
      setError(isRTL ? 'حدث خطأ في الاتصال' : 'Connection error');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        <div className={`flex items-center justify-between p-6 border-b border-gray-200 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <h2 className={`text-xl font-bold text-gray-900 ${isRTL ? 'font-arabic' : ''}`}>
            {isRTL ? 'تعيين مسؤولين للمدرسة' : 'Assign Admins to School'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-96">
          {error && (
            <div className={`mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm ${isRTL ? 'text-right font-arabic' : ''}`}>
              {error}
            </div>
          )}

          {availableAdmins.length === 0 ? (
            <div className={`text-center text-gray-500 py-8 ${isRTL ? 'font-arabic' : ''}`}>
              {isRTL ? 'لا يوجد مسؤولون متاحون للتعيين' : 'No admins available to assign'}
            </div>
          ) : (
            <div className="space-y-2">
              {availableAdmins.map((admin) => (
                <label
                  key={admin.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer ${isRTL ? 'flex-row-reverse' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={selectedAdmins.includes(admin.id)}
                    onChange={() => toggleAdmin(admin.id)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <div className={`flex-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                    <div className={`font-medium text-gray-900 ${isRTL ? 'font-arabic' : ''}`}>
                      {admin.name}
                    </div>
                    <div className="text-sm text-gray-500">{admin.email}</div>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        <div className={`flex gap-4 p-6 border-t border-gray-200 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <button
            onClick={handleAssign}
            disabled={loading || selectedAdmins.length === 0}
            className={`px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed ${isRTL ? 'font-arabic' : ''}`}
          >
            {loading ? (isRTL ? 'جاري التعيين...' : 'Assigning...') : (isRTL ? 'تعيين المسؤولين' : 'Assign Admins')}
          </button>
          <button
            onClick={onClose}
            className={`px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors ${isRTL ? 'font-arabic' : ''}`}
          >
            {isRTL ? 'إلغاء' : 'Cancel'}
          </button>
        </div>
      </div>
    </div>
  );
}

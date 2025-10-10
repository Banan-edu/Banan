
'use client';

import { X } from 'lucide-react';
import { useLanguage } from '@/app/contexts/LanguageContext';

interface ConfirmDeleteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    message?: string;
    itemName?: string;
    loading?: boolean;
}

export default function ConfirmDeleteModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    itemName,
    loading = false,
}: ConfirmDeleteModalProps) {
    const { isRTL } = useLanguage();

    if (!isOpen) return null;

    const defaultTitle = isRTL ? 'تأكيد الحذف' : 'Confirm Delete';
    const defaultMessage = isRTL
        ? `هل أنت متأكد أنك تريد حذف ${itemName || 'هذا العنصر'}؟ لا يمكن التراجع عن هذا الإجراء.`
        : `Are you sure you want to delete ${itemName || 'this item'}? This action cannot be undone.`;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-10 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
                <div className="flex items-center justify-between mb-4">
                    <h3 className={`text-xl font-bold text-gray-900 ${isRTL ? 'font-arabic' : ''}`}>
                        {title || defaultTitle}
                    </h3>
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <p className={`text-gray-600 mb-6 ${isRTL ? 'font-arabic text-right' : ''}`}>
                    {message || defaultMessage}
                </p>

                <div className={`flex gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className={`flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 ${isRTL ? 'font-arabic' : ''
                            }`}
                    >
                        {isRTL ? 'إلغاء' : 'Cancel'}
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={loading}
                        className={`flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 ${isRTL ? 'font-arabic' : ''
                            }`}
                    >
                        {loading
                            ? isRTL
                                ? 'جاري الحذف...'
                                : 'Deleting...'
                            : isRTL
                                ? 'حذف'
                                : 'Delete'}
                    </button>
                </div>
            </div>
        </div>
    );
}

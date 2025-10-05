'use client';

import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/app/contexts/LanguageContext';

interface PricingSectionProps {
  onRegisterClick: () => void;
}

export function PricingSection({ onRegisterClick }: PricingSectionProps) {
  const { isRTL } = useLanguage();

  const features = isRTL ? [
    'دروس تفاعلية باللغتين',
    'تتبع الأداء والتقدم',
    'شهادة إنجاز معتمدة',
    'دعم فني متواصل',
    'تحديثات مجانية',
  ] : [
    'Interactive lessons in both languages',
    'Performance and progress tracking',
    'Certified completion certificate',
    'Continuous technical support',
    'Free updates',
  ];

  return (
    <section id="pricing" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className={`text-3xl lg:text-4xl font-bold text-gray-900 mb-4 ${isRTL ? 'arabic-heading' : ''}`}>
            {isRTL ? 'عرض الدفعة الأولى الخاص' : 'First Cohort Special Offer'}
          </h2>
          <p className={`text-xl text-gray-600 ${isRTL ? 'arabic-body' : ''}`}>
            {isRTL ? 'سجل الآن واستفد من العرض الخاص' : 'Register now and benefit from the special offer'}
          </p>
        </div>

        <div className="max-w-lg mx-auto">
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden border-4 border-blue-500">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-8 text-center">
              <h3 className={`text-2xl font-bold mb-2 ${isRTL ? 'arabic-heading' : ''}`}>
                {isRTL ? 'الدفعة الأولى' : 'First Cohort'}
              </h3>
              <div className="flex items-center justify-center gap-4 mb-4">
                <span className="text-5xl font-bold">500</span>
                <div className={`text-left ${isRTL ? 'text-right' : ''}`}>
                  <div className="text-sm">{isRTL ? 'ريال' : 'SAR'}</div>
                  <div className="text-sm line-through opacity-75">1000</div>
                </div>
              </div>
              <div className="bg-red-500 text-white px-4 py-2 rounded-full inline-block">
                {isRTL ? 'خصم 50%' : '50% OFF'}
              </div>
            </div>

            <div className="p-8">
              <ul className="space-y-4 mb-8">
                {features.map((feature, index) => (
                  <li key={index} className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse text-right' : ''}`}>
                    <Check className="text-green-500 flex-shrink-0" size={20} />
                    <span className={isRTL ? 'arabic-body' : ''}>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={onRegisterClick}
                className="w-full bg-blue-600 text-white py-4 text-lg font-semibold rounded-lg hover:bg-blue-700"
              >
                {isRTL ? 'سجل الآن' : 'Register Now'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

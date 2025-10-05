'use client';

import { CheckCircle } from 'lucide-react';
import { useLanguage } from '@/app/contexts/LanguageContext';

export function LearningJourney() {
  const { isRTL } = useLanguage();

  const steps = isRTL ? [
    { title: 'ابدأ من الصفر', desc: 'تعلم الأساسيات بطريقة بسيطة وواضحة' },
    { title: 'تمرن يومياً', desc: 'مارس الطباعة مع دروس تفاعلية' },
    { title: 'تابع تقدمك', desc: 'راقب تطورك مع إحصائيات مفصلة' },
    { title: 'احصل على شهادة', desc: 'شهادة إنجاز معتمدة عند الإتمام' },
  ] : [
    { title: 'Start from Zero', desc: 'Learn the basics in a simple and clear way' },
    { title: 'Practice Daily', desc: 'Practice typing with interactive lessons' },
    { title: 'Track Progress', desc: 'Monitor your development with detailed statistics' },
    { title: 'Get Certified', desc: 'Certified completion certificate upon finishing' },
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className={`text-3xl lg:text-4xl font-bold text-gray-900 mb-4 ${isRTL ? 'arabic-heading' : ''}`}>
            {isRTL ? 'رحلة التعلم معنا' : 'Your Learning Journey'}
          </h2>
          <p className={`text-xl text-gray-600 ${isRTL ? 'arabic-body' : ''}`}>
            {isRTL ? 'خطوات بسيطة نحو إتقان الطباعة السريعة' : 'Simple steps towards mastering fast typing'}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="bg-white p-6 rounded-xl shadow-md text-center hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  {index + 1}
                </div>
                <h3 className={`text-lg font-bold text-gray-900 mb-2 ${isRTL ? 'arabic-heading' : ''}`}>{step.title}</h3>
                <p className={`text-gray-600 ${isRTL ? 'arabic-body' : ''}`}>{step.desc}</p>
                <CheckCircle className="w-8 h-8 text-green-500 mx-auto mt-4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

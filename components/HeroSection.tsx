'use client';

import { Button } from '@/components/ui/button';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { Keyboard, Sparkles } from 'lucide-react';

interface HeroSectionProps {
  onRegisterClick: () => void;
}

export function HeroSection({ onRegisterClick }: HeroSectionProps) {
  const { isRTL } = useLanguage();

  return (
    <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white py-20 overflow-hidden">
      <div className="absolute inset-0 bg-grid-white/10"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <Keyboard className="w-20 h-20 text-blue-200" />
              <Sparkles className="w-8 h-8 text-yellow-300 absolute -top-2 -right-2" />
            </div>
          </div>
          
          <h1 className={`text-4xl md:text-6xl font-bold mb-6 ${isRTL ? 'arabic-hero-title' : ''}`}>
            {isRTL ? 'تعلم الطباعة باللمس بطريقة احترافية' : 'Learn Professional Touch Typing'}
          </h1>
          
          <p className={`text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto ${isRTL ? 'arabic-body' : ''}`}>
            {isRTL 
              ? 'منصة تعليمية متكاملة لتطوير مهارات الطباعة السريعة والمهارات الرقمية باللغتين العربية والإنجليزية'
              : 'A comprehensive learning platform to develop fast typing and digital skills in Arabic and English'
            }
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              onClick={onRegisterClick}
              className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 text-lg font-semibold rounded-lg shadow-lg"
            >
              {isRTL ? 'سجل الآن - الدفعة الأولى' : 'Register Now - First Cohort'}
            </Button>
            <a href="#features">
              <Button variant="outline" className="border-2 border-white text-white hover:bg-white/10 px-8 py-3 text-lg">
                {isRTL ? 'اكتشف المزيد' : 'Learn More'}
              </Button>
            </a>
          </div>

          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-white">1000+</div>
              <div className="text-blue-200">{isRTL ? 'طالب' : 'Students'}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">50+</div>
              <div className="text-blue-200">{isRTL ? 'درس' : 'Lessons'}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">98%</div>
              <div className="text-blue-200">{isRTL ? 'نسبة النجاح' : 'Success Rate'}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">2</div>
              <div className="text-blue-200">{isRTL ? 'لغة' : 'Languages'}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

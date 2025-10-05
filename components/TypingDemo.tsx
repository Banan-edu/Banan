'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/app/contexts/LanguageContext';

export function TypingDemo() {
  const { isRTL } = useLanguage();
  const [text, setText] = useState('');
  const fullText = isRTL 
    ? 'تعلم الطباعة السريعة باللمس مع منصة بَنان التعليمية...'
    : 'Learn fast touch typing with Banan educational platform...';

  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      if (index < fullText.length) {
        setText(fullText.substring(0, index + 1));
        index++;
      } else {
        setTimeout(() => {
          setText('');
          index = 0;
        }, 2000);
      }
    }, 100);

    return () => clearInterval(timer);
  }, [fullText]);

  return (
    <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className={`text-3xl lg:text-4xl font-bold mb-8 ${isRTL ? 'arabic-heading' : ''}`}>
            {isRTL ? 'جرب الطباعة الآن' : 'Try Typing Now'}
          </h2>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 max-w-3xl mx-auto">
            <div className={`text-2xl font-mono min-h-[60px] ${isRTL ? 'text-right' : 'text-left'}`}>
              {text}
              <span className="animate-pulse">|</span>
            </div>
          </div>
          <p className={`mt-6 text-blue-100 ${isRTL ? 'arabic-body' : ''}`}>
            {isRTL ? 'ابدأ رحلتك معنا اليوم!' : 'Start your journey with us today!'}
          </p>
        </div>
      </div>
    </section>
  );
}

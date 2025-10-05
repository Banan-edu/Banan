'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'ar' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isRTL: boolean;
}

const translations: Record<Language, Record<string, string>> = {
  ar: {
    'popup-title': 'عرض الدفعة الأولى',
    'popup-subtitle': 'سجل الآن واحصل على خصم خاص',
    'discount-text': 'خصم 50%',
    'price-text': '500 ريال',
    'original-price': '1000 ريال',
    'cohort-text': 'للدفعة الأولى فقط',
    'feature-1': '✓ دروس مخصصة بالعربية والإنجليزية',
    'feature-2': '✓ تتبع التقدم والأداء',
    'feature-3': '✓ شهادة إنجاز معتمدة',
    'register-btn': 'سجل الآن',
    'lang-toggle': 'English',
    'features-title': 'لماذا تختار بَنان؟',
    'features-description': 'منصة تعليمية شاملة مصممة لتطوير مهاراتك الرقمية\nمن الطباعة باللمس إلى مهارات الذكاء الاصطناعي',
    'feature1-title': 'طباعة باللمس احترافية',
    'feature1-desc': 'تعلم الطباعة السريعة باللمس بطريقة علمية مع دروس تفاعلية متدرجة',
    'feature2-title': 'مهارات الذكاء الاصطناعي',
    'feature2-desc': 'تعلم كيفية استخدام أدوات الذكاء الاصطناعي وكتابة الأوامر الفعالة',
    'feature3-title': 'تعلم تفاعلي وممتع',
    'feature3-desc': 'ألعاب وتحديات تجعل التعلم ممتعاً ومحفزاً',
    'feature4-title': 'تتبع تقدمك',
    'feature4-desc': 'إحصائيات دقيقة وتقارير مفصلة عن أدائك وتطورك',
    'feature5-title': 'شهادات معتمدة',
    'feature5-desc': 'احصل على شهادة إنجاز معتمدة عند إتمام البرنامج',
    'feature6-title': 'دعم متعدد اللغات',
    'feature6-desc': 'تعلم بالعربية والإنجليزية بواجهة سهلة الاستخدام',
    'contact-title': 'تواصل معنا',
    'contact-description': 'نحن هنا لمساعدتك في رحلتك التعليمية',
    'phone-title': 'الهاتف',
    'email-title': 'البريد الإلكتروني',
    'address-title': 'العنوان',
    'address-text': 'المملكة العربية السعودية، الرياض',
    'send-message-btn': 'إرسال الرسالة',
    'footer-description': 'منصة تعليمية رائدة لتطوير المهارات الرقمية',
    'footer-copyright': 'جميع الحقوق محفوظة © 2025 بَنان - منصة تعليمية',
  },
  en: {
    'popup-title': 'First Cohort Offer',
    'popup-subtitle': 'Register now and get a special discount',
    'discount-text': '50% OFF',
    'price-text': '500 SAR',
    'original-price': '1000 SAR',
    'cohort-text': 'First cohort only',
    'feature-1': '✓ Customized Arabic & English lessons',
    'feature-2': '✓ Progress tracking',
    'feature-3': '✓ Certified completion',
    'register-btn': 'Register Now',
    'lang-toggle': 'العربية',
    'features-title': 'Why Choose Banan?',
    'features-description': 'A comprehensive learning platform designed to develop your digital skills\nFrom touch typing to AI skills',
    'feature1-title': 'Professional Touch Typing',
    'feature1-desc': 'Learn fast touch typing scientifically with progressive interactive lessons',
    'feature2-title': 'AI Skills',
    'feature2-desc': 'Learn how to use AI tools and write effective prompts',
    'feature3-title': 'Interactive & Fun Learning',
    'feature3-desc': 'Games and challenges that make learning enjoyable and motivating',
    'feature4-title': 'Track Your Progress',
    'feature4-desc': 'Accurate statistics and detailed reports about your performance',
    'feature5-title': 'Certified Credentials',
    'feature5-desc': 'Get a certified completion certificate when you finish the program',
    'feature6-title': 'Multilingual Support',
    'feature6-desc': 'Learn in Arabic and English with an easy-to-use interface',
    'contact-title': 'Contact Us',
    'contact-description': 'We are here to help you in your learning journey',
    'phone-title': 'Phone',
    'email-title': 'Email',
    'address-title': 'Address',
    'address-text': 'Saudi Arabia, Riyadh',
    'send-message-btn': 'Send Message',
    'footer-description': 'Leading educational platform for digital skills development',
    'footer-copyright': 'All Rights Reserved © 2025 Banan - Educational Platform',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('ar');

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  const isRTL = language === 'ar';

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRTL }}>
      <div dir={isRTL ? 'rtl' : 'ltr'}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}

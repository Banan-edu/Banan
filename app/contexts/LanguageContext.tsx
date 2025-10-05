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
    'nav-home': 'الرئيسية',
    'nav-features': 'المميزات',
    'nav-courses': 'الدورات',
    'nav-pricing': 'الأسعار',
    'nav-contact': 'تواصل معنا',
    'hero-title': 'تعلم الطباعة باللمس بطريقة احترافية',
    'hero-subtitle': 'مع منصة بَنان التعليمية',
    'hero-description': 'منصة تعليمية متكاملة لتطوير مهارات الطباعة السريعة والمهارات الرقمية باللغتين العربية والإنجليزية',
    'start-learning-btn': 'ابدأ التعلم الآن',
    'journey-title': 'رحلة التعلم معنا',
    'journey-description': 'طريقك نحو إتقان الطباعة السريعة في 4 خطوات بسيطة',
    'journey-step1-title': 'ابدأ من الصفر',
    'journey-step1-desc': 'تعلم الأساسيات بطريقة بسيطة وواضحة',
    'journey-step2-title': 'تمرن يومياً',
    'journey-step2-desc': 'مارس الطباعة مع دروس تفاعلية',
    'journey-step3-title': 'تابع تقدمك',
    'journey-step3-desc': 'راقب تطورك مع إحصائيات مفصلة',
    'journey-step4-title': 'احصل على شهادة',
    'journey-step4-desc': 'شهادة إنجاز معتمدة عند الإتمام',
    'journey-cta-title': 'ابدأ رحلتك معنا اليوم!',
    'typing-demo-title': 'جرب الطباعة الآن',
    'typing-demo-subtitle': 'اختبر مهاراتك مع دروس تفاعلية في 5 مستويات',
    'form-title': 'التسجيل في برنامج بنان - الدفعة الأولى',
    'name-label': 'الاسم الكامل *',
    'gender-label': 'الجنس *',
    'gender-select': 'اختر الجنس',
    'male-option': 'ذكر',
    'female-option': 'أنثى',
    'dob-label': 'تاريخ الميلاد *',
    'phone-label': 'رقم الهاتف *',
    'email-label': 'البريد الإلكتروني *',
    'current-speed-label': 'سرعة الطباعة الحالية (كلمة/دقيقة)',
    'desired-speed-label': 'السرعة المرغوبة (كلمة/دقيقة)',
    'additional-info-label': 'معلومات إضافية',
    'terms-label': 'أوافق على الشروط والأحكام',
    'submit-btn': 'تسجيل',
    'test-speed-link': 'اختبر سرعتك هنا',
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
    'features-description': 'منصة تعليمية شاملة مصممة لتطوير مهاراتك الرقمية',
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
    'nav-home': 'Home',
    'nav-features': 'Features',
    'nav-courses': 'Courses',
    'nav-pricing': 'Pricing',
    'nav-contact': 'Contact',
    'hero-title': 'Learn Professional Touch Typing',
    'hero-subtitle': 'With Banan Educational Platform',
    'hero-description': 'A comprehensive learning platform to develop fast typing and digital skills in Arabic and English',
    'start-learning-btn': 'Start Learning Now',
    'journey-title': 'Your Learning Journey',
    'journey-description': 'Your path to mastering fast typing in 4 simple steps',
    'journey-step1-title': 'Start from Zero',
    'journey-step1-desc': 'Learn the basics in a simple and clear way',
    'journey-step2-title': 'Practice Daily',
    'journey-step2-desc': 'Practice typing with interactive lessons',
    'journey-step3-title': 'Track Progress',
    'journey-step3-desc': 'Monitor your development with detailed statistics',
    'journey-step4-title': 'Get Certified',
    'journey-step4-desc': 'Certified completion certificate upon finishing',
    'journey-cta-title': 'Start your journey with us today!',
    'typing-demo-title': 'Try Typing Now',
    'typing-demo-subtitle': 'Test your skills with interactive lessons in 5 levels',
    'form-title': 'Register for Banan Program - First Cohort',
    'name-label': 'Full Name *',
    'gender-label': 'Gender *',
    'gender-select': 'Select Gender',
    'male-option': 'Male',
    'female-option': 'Female',
    'dob-label': 'Date of Birth *',
    'phone-label': 'Phone *',
    'email-label': 'Email *',
    'current-speed-label': 'Current Typing Speed (WPM)',
    'desired-speed-label': 'Desired Typing Speed (WPM)',
    'additional-info-label': 'Additional Information',
    'terms-label': 'I agree to the terms and conditions',
    'submit-btn': 'Submit',
    'test-speed-link': 'Test your speed here',
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
    'features-description': 'A comprehensive learning platform designed to develop your digital skills',
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

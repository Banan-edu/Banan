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
    'hero-title': 'نؤهل الجيل القادم\nلمهارات المستقبل',
    'hero-subtitle': '',
    'hero-description': 'منصة تعليمية ذكية مدعومة بالذكاء الاصطناعي لتعليم الطباعة باللمس والمهارات الرقمية للطلاب في السعودية والخليج',
    'start-learning-btn': 'ابدأ التعلم الآن',
    'journey-title': 'رحلة التعلم مع بنان',
    'journey-description': 'مسار تعليمي شامل يطور مهاراتك من الأساسيات إلى الخبرة المتقدمة',
    'journey-step1-title': 'الطباعة باللمس',
    'journey-step1-desc': 'تعلم أساسيات الطباعة باللغتين العربية والإنجليزية بطريقة ممتعة ومحفزة',
    'journey-step2-title': 'البرمجة وهندسة الأوامر',
    'journey-step2-desc': 'محاكاة البرمجة ومهارات كتابة أوامر الذكاء الاصطناعي الفعالة',
    'journey-step3-title': 'تطوير AI Agents',
    'journey-step3-desc': 'بناء وبرمجة عملاء الذكاء الاصطناعي لأتمتة المهام وحل المشاكل',
    'journey-step4-title': 'ريادة الأعمال الرقمية',
    'journey-step4-desc': 'تطبيق والابتكار باستخدام أدوات الذكاء الاصطناعي في ريادة الأعمال',
    'journey-cta-title': 'فلنبدأ رحلتنا اليوم',
    'typing-demo-title': 'جرب الطباعة الآن',
    'typing-demo-subtitle': 'اختبر مهاراتك مع دروس تفاعلية في 5 مستويات',
    'pricing-inst-title': 'أنشئ خطة لمؤسستك الآن',
    'pricing-inst-subtitle': 'نقدم حلول تعليمية مخصصة للمدارس والجامعات والمؤسسات التعليمية\nبأسعار مرنة تناسب احتياجاتكم',
    'pricing-offers-title': 'ما نقدمه للمؤسسات',
    'pricing-unlimited': 'عدد طلاب غير محدود',
    'pricing-admin': 'لوحة تحكم إدارية',
    'pricing-training': 'تدريب المعلمين',
    'pricing-custom': 'تخصيص المحتوى',
    'pricing-manager': 'مدير حساب مخصص',
    'pricing-reports': 'تقارير تفصيلية',
    'pricing-contact-btn': 'تواصل معنا',
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
    'discount-text': 'خصم 33%',
    'price-text': '1000 ريال',
    'original-price': '1500 ريال',
    'cohort-text': 'للدفعة الأولى فقط',
    'feature-1': '✓ دروس مخصصة بالعربية والإنجليزية',
    'feature-2': '✓ تتبع التقدم والأداء',
    'feature-3': '✓ شهادة إنجاز معتمدة',
    'register-btn': 'سجل الآن',
    'lang-toggle': 'English',
    'features-title': 'مميزات منصة بنان',
    'features-description': 'تقنيات متطورة ومحتوى مخصص\nلتعليم الطباعة باللمس والمهارات الرقمية بطريقة تفاعلية وممتعة',
    'feature1-title': 'الطباعة باللمس',
    'feature1-desc': 'تعلم الطباعة باللمس باللغتين العربية والإنجليزية مع دروس تفاعلية مخصصة للمنطقة',
    'feature2-title': 'الذكاء الاصطناعي التكيفي',
    'feature2-desc': 'نظام ذكي يتكيف مع مستوى الطالب ويقدم تجربة تعليمية شخصية ومتطورة',
    'feature3-title': 'التعلم التفاعلي والألعاب',
    'feature3-desc': 'ألعاب تعليمية ممتعة وتحديات تحفز الطلاب على التطور المستمر',
    'feature4-title': 'تتبع التقدم المباشر',
    'feature4-desc': 'لوحة تحكم متقدمة لمتابعة تقدم الطلاب وتحليل الأداء بتفصيل',
    'feature5-title': 'شهادات معتمدة',
    'feature5-desc': 'شهادات إتمام معتمدة تضيف قيمة لملف الطالب الأكاديمي والمهني',
    'feature6-title': 'محتوى ثقافي محلي',
    'feature6-desc': 'محتوى مصمم خصيصاً للثقافة السعودية والخليجية مع مراعاة القيم المحلية',
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
    'pricing-inst-title': 'Create a Plan for Your Institution Now',
    'pricing-inst-subtitle': 'We provide customized educational solutions for schools, universities, and educational institutions\nwith flexible pricing that suits your needs',
    'pricing-offers-title': 'What We Offer for Institutions',
    'pricing-unlimited': 'Unlimited students',
    'pricing-admin': 'Admin dashboard',
    'pricing-training': 'Teacher training',
    'pricing-custom': 'Content customization',
    'pricing-manager': 'Dedicated account manager',
    'pricing-reports': 'Detailed reports',
    'pricing-contact-btn': 'Contact Us',
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
    'discount-text': '33% OFF',
    'price-text': '1000 SAR',
    'original-price': '1500 SAR',
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
    return translations[language][key] !== undefined ? translations[language][key] : key;
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

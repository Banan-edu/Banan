'use client';

import { Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';
import { useLanguage } from '@/app/contexts/LanguageContext';

export function Footer() {
  const { t, isRTL } = useLanguage();

  const sections = [
    {
      title: isRTL ? 'الخدمات' : 'Services',
      links: [
        { text: isRTL ? 'الطباعة باللمس' : 'Touch Typing', href: '#' },
        { text: isRTL ? 'مهارات الذكاء الاصطناعي' : 'AI Skills', href: '#' },
        { text: isRTL ? 'البرمجة الأساسية' : 'Basic Programming', href: '#' },
        { text: isRTL ? 'الأدوات الرقمية' : 'Digital Tools', href: '#' }
      ]
    },
    {
      title: isRTL ? 'الدعم' : 'Support',
      links: [
        { text: isRTL ? 'مركز المساعدة' : 'Help Center', href: '#' },
        { text: isRTL ? 'الأسئلة الشائعة' : 'FAQ', href: '#' },
        { text: isRTL ? 'تواصل معنا' : 'Contact Us', href: '#contact' },
        { text: isRTL ? 'الدروس التعليمية' : 'Tutorials', href: '#' }
      ]
    },
    {
      title: isRTL ? 'الشركة' : 'Company',
      links: [
        { text: isRTL ? 'من نحن' : 'About Us', href: '#' },
        { text: isRTL ? 'الوظائف' : 'Careers', href: '#' },
        { text: isRTL ? 'سياسة الخصوصية' : 'Privacy Policy', href: '#' },
        { text: isRTL ? 'شروط الخدمة' : 'Terms of Service', href: '#' }
      ]
    }
  ];

  const socialLinks = [
    { icon: Facebook, href: '#' },
    { icon: Twitter, href: '#' },
    { icon: Linkedin, href: '#' },
    { icon: Instagram, href: '#' }
  ];

  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-2xl font-bold mb-4">بَنان</h3>
            <p className={`text-gray-400 mb-6 ${isRTL ? 'arabic-body' : ''}`}>
              {t('footer-description')}
            </p>
            <div className={`flex gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
              {socialLinks.map((social, index) => {
                const Icon = social.icon;
                return (
                  <a
                    key={index}
                    href={social.href}
                    className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors"
                  >
                    <Icon size={20} />
                  </a>
                );
              })}
            </div>
          </div>
          
          {sections.map((section, index) => (
            <div key={index} className={isRTL ? 'text-right' : 'text-left'}>
              <h4 className={`text-lg font-semibold mb-6 ${isRTL ? 'arabic-heading' : ''}`}>{section.title}</h4>
              <ul className="space-y-3 text-gray-400">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <a href={link.href} className={`hover:text-white transition-colors ${isRTL ? 'arabic-body' : ''}`}>
                      {link.text}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
          <p className={isRTL ? 'arabic-body' : ''}>{t('footer-copyright')}</p>
        </div>
      </div>
    </footer>
  );
}

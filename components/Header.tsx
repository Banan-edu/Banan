'use client';

import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/app/contexts/LanguageContext';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t, language, setLanguage, isRTL } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'ar' ? 'en' : 'ar');
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <img 
                src="/assets/logo.svg" 
                alt="Banan Logo" 
                className="h-10 w-auto object-contain"
              />
            </div>
          </div>
          
          <nav className={`hidden md:flex gap-8 ${isRTL ? 'space-x-reverse' : ''}`}>
            <button
              onClick={() => scrollToSection('home')}
              className={`text-gray-700 hover:text-blue-600 transition-colors ${isRTL ? 'arabic-text font-arabic' : ''}`}
            >
              {t('nav-home')}
            </button>
            <button
              onClick={() => scrollToSection('features')}
              className={`text-gray-700 hover:text-blue-600 transition-colors ${isRTL ? 'arabic-text font-arabic' : ''}`}
            >
              {t('nav-features')}
            </button>
            <button
              onClick={() => scrollToSection('courses')}
              className={`text-gray-700 hover:text-blue-600 transition-colors ${isRTL ? 'arabic-text font-arabic' : ''}`}
            >
              {t('nav-courses')}
            </button>
            <button
              onClick={() => scrollToSection('pricing')}
              className={`text-gray-700 hover:text-blue-600 transition-colors ${isRTL ? 'arabic-text font-arabic' : ''}`}
            >
              {t('nav-pricing')}
            </button>
            <button
              onClick={() => scrollToSection('contact')}
              className={`text-gray-700 hover:text-blue-600 transition-colors ${isRTL ? 'arabic-text font-arabic' : ''}`}
            >
              {t('nav-contact')}
            </button>
          </nav>
          
          <div className="flex items-center space-x-4 space-x-reverse">
            <Button
              onClick={toggleLanguage}
              variant="outline"
              className="bg-blue-50 text-blue-600 border-blue-200 px-4 py-2 rounded-lg font-semibold hover:bg-blue-100 transition-colors"
            >
              {language === 'ar' ? 'English' : 'العربية'}
            </Button>
            
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-gray-700 hover:text-blue-600"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
        
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-2">
              <button onClick={() => scrollToSection('home')} className="text-gray-700 hover:text-blue-600 transition-colors py-2 text-left">{t('nav-home')}</button>
              <button onClick={() => scrollToSection('features')} className="text-gray-700 hover:text-blue-600 transition-colors py-2 text-left">{t('nav-features')}</button>
              <button onClick={() => scrollToSection('courses')} className="text-gray-700 hover:text-blue-600 transition-colors py-2 text-left">{t('nav-courses')}</button>
              <button onClick={() => scrollToSection('pricing')} className="text-gray-700 hover:text-blue-600 transition-colors py-2 text-left">{t('nav-pricing')}</button>
              <button onClick={() => scrollToSection('contact')} className="text-gray-700 hover:text-blue-600 transition-colors py-2 text-left">{t('nav-contact')}</button>
              <div className="pt-4 border-t border-gray-100 mt-4">
                <Button onClick={toggleLanguage} variant="outline" className="w-full bg-blue-50 text-blue-600 border-blue-200 px-4 py-2 rounded-lg font-semibold hover:bg-blue-100 transition-colors">
                  {language === 'ar' ? 'English' : 'العربية'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

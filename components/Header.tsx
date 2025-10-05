'use client';

import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { useRouter } from 'next/navigation';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { t, language, setLanguage, isRTL } = useLanguage();
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      const hasAuthToken = document.cookie.includes('auth_token=');
      setIsLoggedIn(hasAuthToken);
    };
    
    checkAuth();
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  const toggleLanguage = () => {
    setLanguage(language === 'ar' ? 'en' : 'ar');
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setIsLoggedIn(false);
    router.push('/');
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
              <h1 className="text-2xl font-bold text-blue-600">بنان</h1>
            </div>
          </div>
          
          {!isLoggedIn && (
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
          )}
          
          <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Button
              onClick={toggleLanguage}
              variant="outline"
              className="bg-blue-50 text-blue-600 border-blue-200 px-4 py-2 rounded-lg font-semibold hover:bg-blue-100 transition-colors"
            >
              {language === 'ar' ? 'English' : 'العربية'}
            </Button>

            {isLoggedIn ? (
              <Button
                onClick={handleLogout}
                variant="outline"
                className="bg-red-50 text-red-600 border-red-200 px-4 py-2 rounded-lg font-semibold hover:bg-red-100 transition-colors"
              >
                {isRTL ? 'تسجيل الخروج' : 'Logout'}
              </Button>
            ) : (
              <Button
                onClick={() => router.push('/login')}
                variant="outline"
                className="bg-blue-600 text-white border-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                {isRTL ? 'تسجيل الدخول' : 'Login'}
              </Button>
            )}
            
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-gray-700 hover:text-blue-600"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
        
        {isMenuOpen && !isLoggedIn && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-2">
              <button onClick={() => scrollToSection('home')} className="text-gray-700 hover:text-blue-600 transition-colors py-2 text-left">{t('nav-home')}</button>
              <button onClick={() => scrollToSection('features')} className="text-gray-700 hover:text-blue-600 transition-colors py-2 text-left">{t('nav-features')}</button>
              <button onClick={() => scrollToSection('courses')} className="text-gray-700 hover:text-blue-600 transition-colors py-2 text-left">{t('nav-courses')}</button>
              <button onClick={() => scrollToSection('pricing')} className="text-gray-700 hover:text-blue-600 transition-colors py-2 text-left">{t('nav-pricing')}</button>
              <button onClick={() => scrollToSection('contact')} className="text-gray-700 hover:text-blue-600 transition-colors py-2 text-left">{t('nav-contact')}</button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

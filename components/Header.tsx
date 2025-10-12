'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { useRouter } from 'next/navigation';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const { t, language, setLanguage, isRTL } = useLanguage();
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      const hasAuthToken = document.cookie.includes('auth_token=');
      setIsLoggedIn(hasAuthToken);
    };

    checkAuth();

    const interval = setInterval(checkAuth, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleLanguage = () => {
    setLanguage(language === 'ar' ? 'en' : 'ar');
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    setIsLoggedIn(false);
    router.push('/');
    router.refresh();
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
              <Link href="/" className="text-2xl font-bold text-blue-600 hover:text-blue-700 transition-colors">
                <img src="/assets/logo.png" alt="بنان" className="h-12 w-auto" />
              </Link>
            </div>
          </div>

          <nav className={`hidden md:flex gap-8 ${isRTL ? 'space-x-reverse' : ''}`}>
            <Button
              variant='menu'
              onClick={() => scrollToSection('home')}
              className={`text-gray-700 hover:text-blue-600 transition-colors ${isRTL ? 'arabic-text font-arabic' : ''}`}
            >
              {t('nav-home')}
            </Button>
            <Button
              variant='menu'
              onClick={() => scrollToSection('features')}
              className={`text-gray-700 hover:text-blue-600 transition-colors ${isRTL ? 'arabic-text font-arabic' : ''}`}
            >
              {t('nav-features')}
            </Button>
            <Button
              variant='menu'
              onClick={() => scrollToSection('courses')}
              className={`text-gray-700 hover:text-blue-600 transition-colors ${isRTL ? 'arabic-text font-arabic' : ''}`}
            >
              {t('nav-courses')}
            </Button>
            <Button
              variant='menu'
              onClick={() => scrollToSection('pricing')}
              className={`text-gray-700 hover:text-blue-600 transition-colors ${isRTL ? 'arabic-text font-arabic' : ''}`}
            >
              {t('nav-pricing')}
            </Button>
            <Button
              variant='menu'
              onClick={() => scrollToSection('contact')}
              className={`text-gray-700 hover:text-blue-600 transition-colors ${isRTL ? 'arabic-text font-arabic' : ''}`}
            >
              {t('nav-contact')}
            </Button>
          </nav>

          <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Button
              onClick={toggleLanguage}
              variant="outline"
              className="bg-blue-500 text-blue-600 border-blue-200 px-4 py-2 rounded-lg font-semibold hover:bg-blue-100 transition-colors"
            >
              {language === 'ar' ? 'English' : 'العربية'}
            </Button>

            {isLoggedIn === true ? (
              <Button
                onClick={handleLogout}
                variant="default"
                className="bg-red-50 text-red-600 border-red-200 px-4 py-2 rounded-lg font-semibold hover:bg-red-100 transition-colors"
              >
                {isRTL ? 'تسجيل الخروج' : 'Logout'}
              </Button>
            ) : isLoggedIn === false ? (
              <Button
                onClick={() => router.push('/login')}
                variant="default"
                className="bg-blue-600 text-white border-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                {isRTL ? 'تسجيل الدخول' : 'Login'}
              </Button>
            ) : null}

            <Button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              variant='hidden'
              className="md:hidden text-gray-700 hover:text-blue-600"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </Button>
          </div>
        </div>

        {isMenuOpen && isLoggedIn !== null && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-2">
              {isLoggedIn === true ? (
                <>
                  <Link href="/" className="text-gray-700 hover:text-blue-600 transition-colors py-2 text-left">{isRTL ? 'الرئيسية' : 'Home'}</Link>
                  <Link href="/#pricing" className="text-gray-700 hover:text-blue-600 transition-colors py-2 text-left">{isRTL ? 'الأسعار' : 'Pricing'}</Link>
                  <Link href="/student" className="text-gray-700 hover:text-blue-600 transition-colors py-2 text-left">{isRTL ? 'لوحة التحكم' : 'Dashboard'}</Link>
                </>
              ) : (
                <>
                  <Button onClick={() => scrollToSection('home')} variant='menu' className="text-gray-700 hover:text-blue-600 transition-colors py-2 text-left">{t('nav-home')}</Button>
                  <Button onClick={() => scrollToSection('features')} variant='menu' className="text-gray-700 hover:text-blue-600 transition-colors py-2 text-left">{t('nav-features')}</Button>
                  <Button onClick={() => scrollToSection('courses')} variant='menu' className="text-gray-700 hover:text-blue-600 transition-colors py-2 text-left">{t('nav-courses')}</Button>
                  <Button onClick={() => scrollToSection('pricing')} variant='menu' className="text-gray-700 hover:text-blue-600 transition-colors py-2 text-left">{t('nav-pricing')}</Button>
                  <Button onClick={() => scrollToSection('contact')} variant='menu' className="text-gray-700 hover:text-blue-600 transition-colors py-2 text-left">{t('nav-contact')}</Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

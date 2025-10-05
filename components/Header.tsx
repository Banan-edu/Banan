'use client';

import { useState } from 'react';
import { Menu, X, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/app/contexts/LanguageContext';
import Link from 'next/link';

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { language, setLanguage, isRTL } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'ar' ? 'en' : 'ar');
  };

  const navigation = [
    { name: isRTL ? 'المميزات' : 'Features', href: '#features' },
    { name: isRTL ? 'الدورات' : 'Courses', href: '#courses' },
    { name: isRTL ? 'الأسعار' : 'Pricing', href: '#pricing' },
    { name: isRTL ? 'تواصل معنا' : 'Contact', href: '#contact' },
  ];

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-blue-600">بَنان</h1>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-gray-700 hover:text-blue-600 transition-colors"
              >
                {item.name}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Globe size={20} />
              <span className="text-sm">{language === 'ar' ? 'EN' : 'عربي'}</span>
            </button>
            
            <Link href="/login">
              <Button className="px-4 py-2">
                {isRTL ? 'تسجيل الدخول' : 'Login'}
              </Button>
            </Link>

            <button
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden py-4 space-y-2">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.name}
              </a>
            ))}
          </div>
        )}
      </nav>
    </header>
  );
}

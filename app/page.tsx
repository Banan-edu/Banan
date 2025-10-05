'use client';

import { useState, useEffect } from 'react';
import { HeroSection } from '@/components/HeroSection';
import { EarlyBirdPopup } from '@/components/EarlyBirdPopup';
import { RegistrationForm } from '@/components/RegistrationForm';
import { FeaturesSection } from '@/components/FeaturesSection';
import { LearningJourney } from '@/components/LearningJourney';
import { TypingDemo } from '@/components/TypingDemo';
import { CoursesSection } from '@/components/CoursesSection';
import { PricingSection } from '@/components/PricingSection';
import { ContactSection } from '@/components/ContactSection';
import { useLanguage } from '@/app/contexts/LanguageContext';

export default function Home() {
  const [isRegistrationFormOpen, setIsRegistrationFormOpen] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const { isRTL } = useLanguage();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          setUserName(data.user.name);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };

    fetchUser();
  }, []);

  const handleRegisterClick = () => {
    setIsRegistrationFormOpen(true);
  };

  const handleCloseRegistrationForm = () => {
    setIsRegistrationFormOpen(false);
  };

  return (
    <div className="bg-gray-50">
      {userName && (
        <div className="bg-blue-600 text-white py-3">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className={`text-lg font-semibold ${isRTL ? 'text-right' : 'text-left'}`}>
              {isRTL ? `مرحباً، ${userName}` : `Welcome, ${userName}`}
            </p>
          </div>
        </div>
      )}
      <HeroSection onRegisterClick={handleRegisterClick} />
      <FeaturesSection />
      <LearningJourney />
      <TypingDemo />
      <CoursesSection onRegisterClick={handleRegisterClick} />
      <PricingSection onRegisterClick={handleRegisterClick} />
      <ContactSection />
      
      <EarlyBirdPopup onRegisterClick={handleRegisterClick} />
      <RegistrationForm
        isOpen={isRegistrationFormOpen}
        onClose={handleCloseRegistrationForm}
      />
    </div>
  );
}

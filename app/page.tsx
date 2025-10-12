'use client';

import { useState } from 'react';
import { HeroSection } from '@/components/HeroSection';
import { EarlyBirdPopup } from '@/components/EarlyBirdPopup';
import { RegistrationForm } from '@/components/RegistrationForm';
import { FeaturesSection } from '@/components/FeaturesSection';
import { LearningJourney } from '@/components/LearningJourney';
import { TypingDemo } from '@/components/TypingDemo';
import { CoursesSection } from '@/components/CoursesSection';
import { PricingSection } from '@/components/PricingSection';
import { ContactSection } from '@/components/ContactSection';
import { useLanguage } from './contexts/LanguageContext';

export default function Home() {
  const [isRegistrationFormOpen, setIsRegistrationFormOpen] = useState(false);
  const { t, isRTL } = useLanguage();

  const handleRegisterClick = () => {
    setIsRegistrationFormOpen(true);
  };

  const handleCloseRegistrationForm = () => {
    setIsRegistrationFormOpen(false);
  };

  return (
    <div className="bg-gray-50">
      <HeroSection onRegisterClick={handleRegisterClick} t={t} isRTL={isRTL} />
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

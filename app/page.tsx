'use client';

import { useState } from 'react';
import { Header } from '@/components/Header';
import { HeroSection } from '@/components/HeroSection';
import { EarlyBirdPopup } from '@/components/EarlyBirdPopup';
import { RegistrationForm } from '@/components/RegistrationForm';
import { FeaturesSection } from '@/components/FeaturesSection';
import { LearningJourney } from '@/components/LearningJourney';
import { TypingDemo } from '@/components/TypingDemo';
import { CoursesSection } from '@/components/CoursesSection';
import { PricingSection } from '@/components/PricingSection';
import { ContactSection } from '@/components/ContactSection';
import { Footer } from '@/components/Footer';

export default function Home() {
  const [isRegistrationFormOpen, setIsRegistrationFormOpen] = useState(false);

  const handleRegisterClick = () => {
    setIsRegistrationFormOpen(true);
  };

  const handleCloseRegistrationForm = () => {
    setIsRegistrationFormOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <HeroSection onRegisterClick={handleRegisterClick} />
      <FeaturesSection />
      <LearningJourney />
      <TypingDemo />
      <CoursesSection onRegisterClick={handleRegisterClick} />
      <PricingSection onRegisterClick={handleRegisterClick} />
      <ContactSection />
      <Footer />
      
      <EarlyBirdPopup onRegisterClick={handleRegisterClick} />
      <RegistrationForm
        isOpen={isRegistrationFormOpen}
        onClose={handleCloseRegistrationForm}
      />
    </div>
  );
}

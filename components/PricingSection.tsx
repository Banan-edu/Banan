'use client';

import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { useLanguage } from '@/app/contexts/LanguageContext';

interface PricingSectionProps {
  onRegisterClick: () => void;
}

export function PricingSection({ onRegisterClick }: PricingSectionProps) {
  const { t, isRTL } = useLanguage();

  return (
    <section id="pricing" className="py-20 bg-gradient-to-br from-blue-600 to-blue-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className={`text-3xl lg:text-4xl font-bold text-white mb-6 text-center ${isRTL ? 'arabic-heading arabic-text-center' : ''}`}>
            {t('pricing-inst-title')}
          </h2>
          <p className={`text-xl text-blue-100 max-w-3xl mx-auto mb-8 text-center leading-relaxed ${isRTL ? 'arabic-body arabic-text-center' : ''}`}>
            {t('pricing-inst-subtitle').split('\n').map((line, i) => (
              <span key={i}>
                {line}
                {i === 0 && <br />}
              </span>
            ))}
          </p>
          
          <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-8 max-w-2xl mx-auto mb-8">
            <h3 className={`text-2xl font-bold text-white mb-6 text-center ${isRTL ? 'arabic-heading arabic-text-center' : ''}`}>
              {t('pricing-offers-title')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-white">
              <div className={`flex items-center`}>
                <Check className="h-5 w-5 text-green-300 mx-2 flex-shrink-0" />
                <span className={`${isRTL ? 'arabic-body' : ''}`}>
                  {t('pricing-unlimited')}
                </span>
              </div>
              <div className={`flex items-center`}>
                <Check className="h-5 w-5 text-green-300 mx-2 flex-shrink-0" />
                <span className={`${isRTL ? 'arabic-body' : ''}`}>
                  {t('pricing-admin')}
                </span>
              </div>
              <div className={`flex items-center`}>
                <Check className="h-5 w-5 text-green-300 mx-2 flex-shrink-0" />
                <span className={`${isRTL ? 'arabic-body' : ''}`}>
                  {t('pricing-training')}
                </span>
              </div>
              <div className={`flex items-center`}>
                <Check className="h-5 w-5 text-green-300 mx-2 flex-shrink-0" />
                <span className={`${isRTL ? 'arabic-body' : ''}`}>
                  {t('pricing-custom')}
                </span>
              </div>
              <div className={`flex items-center`}>
                <Check className="h-5 w-5 text-green-300 mx-2 flex-shrink-0" />
                <span className={`${isRTL ? 'arabic-body' : ''}`}>
                  {t('pricing-manager')}
                </span>
              </div>
              <div className={`flex items-center`}>
                <Check className="h-5 w-5 text-green-300 mx-2 flex-shrink-0" />
                <span className={`${isRTL ? 'arabic-body' : ''}`}>
                  {t('pricing-reports')}
                </span>
              </div>
            </div>
          </div>
          
          <Button
            onClick={() => window.location.href = '#contact'}
            variant='outline'
            className={`bg-white text-blue-600 px-12 py-4 rounded-xl font-bold text-lg btn-hover-scale shadow-xl hover:bg-blue-50 transition-colors ${isRTL ? 'arabic-button arabic-text' : ''}`}
          >
            {t('pricing-contact-btn')}
          </Button>
        </div>
      </div>
    </section>
  );
}

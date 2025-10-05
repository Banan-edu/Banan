'use client';

import { Keyboard, Brain, Gamepad2, TrendingUp, Award, Globe } from 'lucide-react';
import { useLanguage } from '@/app/contexts/LanguageContext';

export function FeaturesSection() {
  const { t, isRTL } = useLanguage();

  const features = [
    {
      icon: Keyboard,
      titleKey: 'feature1-title',
      descKey: 'feature1-desc',
      bgColor: 'from-blue-50 to-blue-100',
      iconColor: 'bg-blue-600'
    },
    {
      icon: Brain,
      titleKey: 'feature2-title',
      descKey: 'feature2-desc',
      bgColor: 'from-green-50 to-green-100',
      iconColor: 'bg-green-600'
    },
    {
      icon: Gamepad2,
      titleKey: 'feature3-title',
      descKey: 'feature3-desc',
      bgColor: 'from-purple-50 to-purple-100',
      iconColor: 'bg-purple-600'
    },
    {
      icon: TrendingUp,
      titleKey: 'feature4-title',
      descKey: 'feature4-desc',
      bgColor: 'from-orange-50 to-orange-100',
      iconColor: 'bg-orange-600'
    },
    {
      icon: Award,
      titleKey: 'feature5-title',
      descKey: 'feature5-desc',
      bgColor: 'from-red-50 to-red-100',
      iconColor: 'bg-red-600'
    },
    {
      icon: Globe,
      titleKey: 'feature6-title',
      descKey: 'feature6-desc',
      bgColor: 'from-teal-50 to-teal-100',
      iconColor: 'bg-teal-600'
    }
  ];

  return (
    <section id="features" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className={`text-3xl lg:text-4xl font-bold text-gray-900 mb-4 ${isRTL ? 'arabic-heading' : ''}`}>
            {t('features-title')}
          </h2>
          <p className={`text-xl text-gray-600 max-w-3xl mx-auto ${isRTL ? 'arabic-body' : ''}`}>
            {t('features-description').split('\n').map((line, index) => (
              <span key={index}>
                {line}
                {index < t('features-description').split('\n').length - 1 && <br />}
              </span>
            ))}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className={`bg-gradient-to-br ${feature.bgColor} p-8 rounded-2xl hover:shadow-lg transition-shadow text-center`}
              >
                <div className={`w-16 h-16 ${feature.iconColor} text-white rounded-2xl flex items-center justify-center mb-6 mx-auto`}>
                  <Icon size={32} />
                </div>
                <h3 className={`text-xl font-bold text-gray-900 mb-4 ${isRTL ? 'arabic-heading' : ''}`}>
                  {t(feature.titleKey as any)}
                </h3>
                <p className={`text-gray-600 ${isRTL ? 'arabic-body' : ''}`}>
                  {t(feature.descKey as any)}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

import { Button } from '@/components/ui/button';

interface HeroSectionProps {
  onRegisterClick: () => void;
  t: (key: string) => string;
  isRTL: boolean;
}

export function HeroSection({ onRegisterClick, t, isRTL }: HeroSectionProps) {

  return (
    <section id="home" className="relative text-white py-20 overflow-hidden">
      <div className="absolute inset-0">
        <img
          src="/images/hero.jpeg"
          alt="Digital learning and typing skills education"
          className="w-full h-full object-cover opacity-15"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/80 via-sky-400/75 to-indigo-600/85"></div>
      </div>

      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-400/20 to-transparent"></div>
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-purple-300/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/4 w-48 h-48 bg-indigo-200/5 rounded-full blur-2xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[500px]">
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <h1 className={`text-5xl lg:text-6xl font-bold hero-text-shadow ${isRTL ? 'arabic-hero-title arabic-text' : ''}`}>
                <span className="block text-white leading-tight mb-3 animate-fade-in-up">
                  {t('hero-title').split('\n').map((line, i) => (
                    <span key={i}>
                      {line}
                      {i === 0 && <br />}
                    </span>
                  ))}
                </span>
                {t('hero-subtitle') && (
                  <span className="block text-purple-200 text-xl lg:text-5xl leading-tight animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                    {t('hero-subtitle')}
                  </span>
                )}
              </h1>
              <div className="w-24 h-1 bg-gradient-to-r from-purple-300 to-indigo-100 mx-auto"></div>
            </div>

            <p className={`text-xl lg:text-xl text-indigo-50 leading-relaxed max-w-2xl mx-auto ${isRTL ? 'arabic-body arabic-text' : ''}`}>
              {t('hero-description')}
            </p>

            <div className="flex justify-center pt-4">
              <Button
                onClick={onRegisterClick}
                variant='default'
                className={`px-10 py-4 rounded-xl font-bold text-lg btn-hover-scale shadow-xl ${isRTL ? 'arabic-button arabic-text' : ''}`}
              >
                {t('start-learning-btn')}
              </Button>
            </div>
          </div>

          <div className={`relative ${isRTL ? 'lg:order-first' : ''}`}>
            <div className="relative">
              <div className="relative z-10">
                <img
                  src="/images/hero.jpeg"
                  alt="Digital education technology for typing and computer skills"
                  className="rounded-2xl shadow-2xl w-full hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              </div>
              <div className="absolute -inset-4 bg-gradient-to-r from-indigo-400/20 to-purple-400/20 rounded-3xl blur-lg"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

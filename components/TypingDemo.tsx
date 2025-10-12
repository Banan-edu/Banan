'use client';

import { useState, useEffect, useCallback } from 'react';
import { RotateCcw, Trophy, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/app/contexts/LanguageContext';

interface TypingLevel {
  level: number;
  arabicText: string;
  englishText: string;
  targetWPM: number;
  targetAccuracy: number;
}

const typingLevels: TypingLevel[] = [
  {
    level: 1,
    arabicText: 'مرحبا بك في برنامج بنان التعليمي',
    englishText: 'Welcome to Banan educational program',
    targetWPM: 15,
    targetAccuracy: 90,
  },
  {
    level: 2,
    arabicText: 'تعلم الطباعة باللمس يحتاج إلى الممارسة المستمرة والصبر',
    englishText: 'Learning touch typing requires continuous practice and patience',
    targetWPM: 20,
    targetAccuracy: 90,
  },
  {
    level: 3,
    arabicText: 'المهارات الرقمية أصبحت ضرورية في عالمنا المعاصر للنجاح والتطور',
    englishText: 'Digital skills have become essential in our contemporary world for success and development',
    targetWPM: 25,
    targetAccuracy: 90,
  },
  {
    level: 4,
    arabicText: 'الطباعة السريعة والدقيقة تزيد من الإنتاجية وتوفر الوقت في العمل والدراسة بشكل كبير',
    englishText: 'Fast and accurate typing increases productivity and saves significant time in work and study',
    targetWPM: 30,
    targetAccuracy: 90,
  },
  {
    level: 5,
    arabicText: 'إتقان مهارة الطباعة باللمس يفتح آفاقا جديدة للتعلم والعمل في المجالات التقنية والأكاديمية المتنوعة',
    englishText: 'Mastering touch typing skills opens new horizons for learning and working in various technical and academic fields',
    targetWPM: 35,
    targetAccuracy: 90,
  },
];

export function TypingDemo() {
  const { t, isRTL } = useLanguage();
  const [currentLevel, setCurrentLevel] = useState(1);
  const [typingLanguage, setTypingLanguage] = useState<'ar' | 'en'>('ar');
  const [typedText, setTypedText] = useState('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [isCompleted, setIsCompleted] = useState(false);
  const [levelPassed, setLevelPassed] = useState(false);
  const [showLevelComplete, setShowLevelComplete] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const currentLevelData = typingLevels[currentLevel - 1];
  const sampleText =
    typingLanguage === 'ar'
      ? currentLevelData.arabicText
      : currentLevelData.englishText;
  const textDirection = typingLanguage === 'ar' ? 'rtl' : 'ltr';

  const resetDemo = useCallback(() => {
    setTypedText('');
    setStartTime(null);
    setWpm(0);
    setAccuracy(100);
    setIsCompleted(false);
    setLevelPassed(false);
    setShowLevelComplete(false);
    setIsTyping(false);
  }, []);

  const toggleTypingLanguage = () => {
    setTypingLanguage(typingLanguage === 'ar' ? 'en' : 'ar');
    resetDemo();
  };

  const nextLevel = () => {
    if (currentLevel < typingLevels.length) {
      setCurrentLevel(currentLevel + 1);
      resetDemo();
    }
  };

  const restartLevel = () => resetDemo();

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // prevent unwanted browser behavior
      if (e.key === ' ' || e.key === 'Backspace') e.preventDefault();

      if (isCompleted) return;

      if (e.key.length === 1 || e.key === 'Backspace') {
        setTypedText(prev => {
          let newText = prev;

          if (e.key === 'Backspace') {
            if (prev.length > 0) {
              newText = prev.slice(0, -1);
            }
          } else {
            newText = prev + e.key;
          }

          // start timer on first key
          if (newText.length === 1 && startTime === null) {
            setStartTime(Date.now());
          }

          // calculate WPM and accuracy
          if (startTime) {
            const timeInMinutes = (Date.now() - startTime) / 60000;
            const wordsTyped = newText.trim().split(' ').length;
            setWpm(Math.round(wordsTyped / timeInMinutes) || 0);
          }

          let correctChars = 0;
          for (let i = 0; i < newText.length; i++) {
            if (newText[i] === sampleText[i]) correctChars++;
          }

          const acc =
            newText.length > 0
              ? Math.round((correctChars / newText.length) * 100)
              : 100;
          setAccuracy(acc);

          if (newText === sampleText) {
            setIsCompleted(true);
            const passed =
              wpm >= currentLevelData.targetWPM &&
              acc >= currentLevelData.targetAccuracy;
            setLevelPassed(passed);
            setShowLevelComplete(true);
          }

          setIsTyping(true);
          setTimeout(() => setIsTyping(false), 800);

          return newText;
        });
      }
    },
    [
      isCompleted,
      sampleText,
      startTime,
      wpm,
      currentLevelData.targetWPM,
      currentLevelData.targetAccuracy,
    ]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const getCharacterClass = (index: number) => {
    if (index >= typedText.length) return 'text-gray-500';
    return typedText[index] === sampleText[index]
      ? 'text-green-600'
      : 'text-red-600';
  };

  const renderTextWithUnderline = () => (
    <div
      className={`relative inline-block leading-relaxed text-2xl ${
        textDirection === 'rtl' ? 'text-right font-arabic' : 'text-left'
      }`}
      dir={textDirection}
    >
      {sampleText.split('').map((char, index) => {
        const isCursor = index === typedText.length && !isCompleted;
        return (
          <span
            key={index}
            className={`${getCharacterClass(index)} relative px-1 transition-all duration-150`}
          >
            {char === ' ' ? '\u00A0' : char}
            {isCursor && (
              <span className="absolute left-0 right-0 -bottom-1 h-[2px] bg-blue-500 animate-pulse rounded-full" />
            )}
          </span>
        );
      })}
    </div>
  );

  const stats = [
    {
      value: wpm.toString(),
      label: isRTL ? 'كلمة/دقيقة' : 'WPM',
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      value: `${accuracy}%`,
      label: isRTL ? 'دقة' : 'Accuracy',
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      value: `${currentLevelData.targetWPM}+`,
      label: isRTL ? 'المطلوب' : 'Target WPM',
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
    {
      value: `${currentLevel}/5`,
      label: isRTL ? 'المستوى' : 'Level',
      color: 'text-orange-600',
      bg: 'bg-orange-50',
    },
  ];

  return (
    <section className="py-20 bg-gray-50 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2
            className={`text-4xl font-bold text-gray-900 mb-4 ${
              isRTL ? 'font-arabic' : ''
            }`}
          >
            {t('typing-demo-title')}
          </h2>
          <p
            className={`text-xl text-gray-600 max-w-3xl mx-auto ${
              isRTL ? 'font-arabic' : ''
            }`}
          >
            {t('typing-demo-subtitle')}
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Header */}
            <div className="bg-blue-600 text-white p-6 flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center p-1">
                  <img
                    src="/assets/keyboard.svg"
                    alt="Keyboard"
                    className={`w-full h-full object-contain ${
                      isTyping ? 'animate-pulse scale-110' : 'scale-100'
                    }`}
                  />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">
                    {isRTL ? 'درس الطباعة - المستوى ' : 'Typing Lesson - Level '}
                    {currentLevel}
                  </h3>
                  <p className="text-blue-200">
                    {isRTL ? (
                      <>
                        الهدف: {currentLevelData.targetWPM} كلمة/دقيقة،{' '}
                        {currentLevelData.targetAccuracy}% دقة
                      </>
                    ) : (
                      `Target: ${currentLevelData.targetWPM} WPM, ${currentLevelData.targetAccuracy}% accuracy`
                    )}
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  onClick={toggleTypingLanguage}
                  variant="outline"
                  className="bg-white text-blue-600 hover:bg-blue-50 border-white px-3 py-1 text-sm"
                >
                  {typingLanguage === 'ar' ? 'English' : 'العربية'}
                </Button>
                <div>
                  <div className="text-2xl font-bold" dir="ltr">
                    {Math.round((typedText.length / sampleText.length) * 100)}%
                  </div>
                  <div className="text-blue-200 text-sm">
                    {isRTL ? 'التقدم' : 'Progress'}
                  </div>
                </div>
              </div>
            </div>

            {/* Typing area */}
            <div className="p-8">
              <div className="bg-gray-100 p-6 rounded-lg mb-4 min-h-[120px]">
                {renderTextWithUnderline()}
              </div>

              <div className="flex gap-4 mb-4 justify-center">
                <Button onClick={restartLevel} variant="outline" className="px-4">
                  <RotateCcw size={20} />
                  <span className="ml-2">{isRTL ? 'إعادة' : 'Restart'}</span>
                </Button>
              </div>

              {showLevelComplete && (
                <div
                  className={`border rounded-lg p-6 text-center mb-4 ${
                    levelPassed
                      ? 'bg-green-50 border-green-200 text-green-700'
                      : 'bg-orange-50 border-orange-200 text-orange-700'
                  }`}
                >
                  {levelPassed ? (
                    <>
                      <div className="flex items-center justify-center mb-2">
                        <Trophy className="mr-2" size={24} />
                        <h3 className="font-semibold text-lg">
                          {isRTL ? '🎉 ممتاز! اجتزت المستوى!' : '🎉 Excellent! Level Passed!'}
                        </h3>
                      </div>
                      <p className="mb-4">
                        {isRTL
                          ? `أحرزت ${wpm} كلمة/دقيقة بدقة ${accuracy}%`
                          : `You achieved ${wpm} WPM with ${accuracy}% accuracy`}
                      </p>
                      {currentLevel < typingLevels.length ? (
                        <Button
                          onClick={nextLevel}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          {isRTL ? 'المستوى التالي' : 'Next Level'}
                          <ChevronRight size={20} className="ml-1" />
                        </Button>
                      ) : (
                        <div>
                          <h3 className="font-semibold text-xl mb-2">
                            {isRTL
                              ? '🏆 تهانينا! أكملت جميع المستويات!'
                              : '🏆 Congratulations! All levels completed!'}
                          </h3>
                          <p>
                            {isRTL
                              ? 'لقد أتقنت مهارة الطباعة باللمس'
                              : 'You have mastered touch typing skills'}
                          </p>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <h3 className="font-semibold text-lg mb-2">
                        {isRTL ? '💪 استمر في المحاولة!' : '💪 Keep trying!'}
                      </h3>
                      <p className="mb-4">
                        {isRTL
                          ? `تحتاج إلى ${currentLevelData.targetWPM} كلمة/دقيقة و ${currentLevelData.targetAccuracy}% دقة`
                          : `You need ${currentLevelData.targetWPM} WPM and ${currentLevelData.targetAccuracy}% accuracy`}
                      </p>
                      <Button onClick={restartLevel} variant="outline">
                        {isRTL ? 'حاول مرة أخرى' : 'Try Again'}
                      </Button>
                    </>
                  )}
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                {stats.map((stat, i) => (
                  <div key={i} className={`${stat.bg} p-4 rounded-lg`}>
                    <div className={`text-2xl font-bold ${stat.color}`} dir="ltr">
                      {stat.value}
                    </div>
                    <div className="text-gray-600">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

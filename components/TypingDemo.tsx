'use client';

import { useState, useEffect } from 'react';
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
    targetAccuracy: 90
  },
  {
    level: 2,
    arabicText: 'تعلم الطباعة باللمس يحتاج إلى الممارسة المستمرة والصبر',
    englishText: 'Learning touch typing requires continuous practice and patience',
    targetWPM: 20,
    targetAccuracy: 90
  },
  {
    level: 3,
    arabicText: 'المهارات الرقمية أصبحت ضرورية في عالمنا المعاصر للنجاح والتطور',
    englishText: 'Digital skills have become essential in our contemporary world for success and development',
    targetWPM: 25,
    targetAccuracy: 90
  },
  {
    level: 4,
    arabicText: 'الطباعة السريعة والدقيقة تزيد من الإنتاجية وتوفر الوقت في العمل والدراسة بشكل كبير',
    englishText: 'Fast and accurate typing increases productivity and saves significant time in work and study',
    targetWPM: 30,
    targetAccuracy: 90
  },
  {
    level: 5,
    arabicText: 'إتقان مهارة الطباعة باللمس يفتح آفاقا جديدة للتعلم والعمل في المجالات التقنية والأكاديمية المتنوعة',
    englishText: 'Mastering touch typing skills opens new horizons for learning and working in various technical and academic fields',
    targetWPM: 35,
    targetAccuracy: 90
  }
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
  const sampleText = typingLanguage === 'ar' ? currentLevelData.arabicText : currentLevelData.englishText;
  const textDirection = typingLanguage === 'ar' ? 'rtl' : 'ltr';

  const toggleTypingLanguage = () => {
    setTypingLanguage(typingLanguage === 'ar' ? 'en' : 'ar');
    resetDemo();
  };

  const resetDemo = () => {
    setTypedText('');
    setStartTime(null);
    setWpm(0);
    setAccuracy(100);
    setIsCompleted(false);
    setLevelPassed(false);
    setShowLevelComplete(false);
    setIsTyping(false);
  };

  const nextLevel = () => {
    if (currentLevel < typingLevels.length) {
      setCurrentLevel(currentLevel + 1);
      resetDemo();
    }
  };

  const restartLevel = () => {
    resetDemo();
  };

  useEffect(() => {
    if (typedText.length === 1 && startTime === null) {
      setStartTime(Date.now());
    }

    if (typedText.length > 0) {
      const currentTime = Date.now();
      if (startTime) {
        const timeInMinutes = (currentTime - startTime) / 60000;
        const wordsTyped = typedText.trim().split(' ').length;
        const calculatedWPM = Math.round(wordsTyped / timeInMinutes) || 0;
        setWpm(calculatedWPM);
      }

      let correctChars = 0;
      for (let i = 0; i < typedText.length; i++) {
        if (typedText[i] === sampleText[i]) {
          correctChars++;
        }
      }
      const accuracyRate = typedText.length > 0 ? (correctChars / typedText.length) * 100 : 100;
      setAccuracy(Math.round(accuracyRate));

      if (typedText === sampleText) {
        setIsCompleted(true);
        const passed = wpm >= currentLevelData.targetWPM && accuracy >= currentLevelData.targetAccuracy;
        setLevelPassed(passed);
        setShowLevelComplete(true);
      }
    }
  }, [typedText, startTime, sampleText, wpm, accuracy, currentLevelData]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const handleTyping = () => {
      if (!isCompleted) {
        setIsTyping(true);
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => {
          setIsTyping(false);
        }, 800);
      }
    };
    
    if (typedText.length > 0) {
      handleTyping();
    } else {
      setIsTyping(false);
    }
    
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [typedText, isCompleted]);

  const getCharacterClass = (index: number) => {
    if (index >= typedText.length) return 'text-gray-500';
    return typedText[index] === sampleText[index] 
      ? 'text-green-600 bg-green-100' 
      : 'text-red-600 bg-red-100';
  };

  const renderTextWithHighlight = () => {
    if (textDirection === 'rtl') {
      const chars = sampleText.split('');
      const segments: Array<{text: string, type: 'correct' | 'incorrect' | 'untyped'}> = [];
      let currentSegment: {text: string, type: 'correct' | 'incorrect' | 'untyped'} = { text: '', type: 'untyped' };
      
      chars.forEach((char, index) => {
        let charType: 'correct' | 'incorrect' | 'untyped';
        
        if (index >= typedText.length) {
          charType = 'untyped';
        } else if (typedText[index] === char) {
          charType = 'correct';
        } else {
          charType = 'incorrect';
        }
        
        if (currentSegment.type !== charType) {
          if (currentSegment.text) {
            segments.push(currentSegment);
          }
          currentSegment = { text: char, type: charType };
        } else {
          currentSegment.text += char;
        }
      });
      
      if (currentSegment.text) {
        segments.push(currentSegment);
      }
      
      return (
        <div className="relative">
          {segments.map((segment, index) => {
            let className = '';
            switch (segment.type) {
              case 'correct':
                className = 'text-green-600 bg-green-100';
                break;
              case 'incorrect':
                className = 'text-red-600 bg-red-100';
                break;
              case 'untyped':
                className = 'text-gray-500';
                break;
            }
            
            return (
              <span key={index} className={`${className} rounded px-1`}>
                {segment.text}
              </span>
            );
          })}
          {typedText.length < sampleText.length && (
            <span className="bg-blue-500 text-white px-0.5 animate-pulse rounded ml-1">|</span>
          )}
        </div>
      );
    } else {
      return (
        <>
          {sampleText.split('').map((char, index) => (
            <span
              key={index}
              className={`${getCharacterClass(index)} px-0.5 py-1 rounded`}
              style={{ letterSpacing: '1px' }}
            >
              {char}
            </span>
          ))}
          {typedText.length < sampleText.length && (
            <span className="bg-blue-500 text-white px-0.5 animate-pulse">|</span>
          )}
        </>
      );
    }
  };

  const stats = [
    { value: wpm.toString(), label: isRTL ? 'كلمة/دقيقة' : 'WPM', color: 'text-blue-600', bg: 'bg-blue-50' },
    { value: `${accuracy}%`, label: isRTL ? 'دقة' : 'Accuracy', color: 'text-green-600', bg: 'bg-green-50' },
    { value: `${currentLevelData.targetWPM}+`, label: isRTL ? 'المطلوب' : 'Target WPM', color: 'text-purple-600', bg: 'bg-purple-50' },
    { value: `${currentLevel}/5`, label: isRTL ? 'المستوى' : 'Level', color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className={`text-4xl font-bold text-gray-900 mb-4 ${isRTL ? 'font-arabic' : ''}`}>
            {t('typing-demo-title')}
          </h2>
          <p className={`text-xl text-gray-600 max-w-3xl mx-auto ${isRTL ? 'font-arabic' : ''}`}>
            {t('typing-demo-subtitle')}
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-blue-600 text-white p-6">
              <div className="flex items-center justify-between">
                <div className={`flex items-center space-x-4 ${isRTL ? 'space-x-reverse' : ''}`}>
                  <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center p-1">
                    <img 
                      src="/assets/keyboard.svg"
                      alt="Keyboard"
                      className={`w-full h-full object-contain transition-all duration-300 ease-in-out ${
                        isTyping 
                          ? 'animate-pulse scale-110' 
                          : 'scale-100'
                      }`}
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">
                      {isRTL ? 'درس الطباعة - المستوى ' : 'Typing Lesson - Level '}
                      <span dir="ltr">{currentLevel}</span>
                    </h3>
                    <p className="text-blue-200">
                      {isRTL ? (
                        <>الهدف: <span dir="ltr">{currentLevelData.targetWPM}</span> كلمة/دقيقة، <span dir="ltr">{currentLevelData.targetAccuracy}%</span> دقة</>
                      ) : (
                        `Target: ${currentLevelData.targetWPM} WPM, ${currentLevelData.targetAccuracy}% accuracy`
                      )}
                    </p>
                  </div>
                </div>
                <div className={`flex items-center gap-4 ${isRTL ? 'text-right' : 'text-left'}`}>
                  <Button
                    onClick={toggleTypingLanguage}
                    variant="outline"
                    className="bg-white text-blue-600 hover:bg-blue-50 border-white px-3 py-1 text-sm"
                  >
                    {typingLanguage === 'ar' ? 'English' : 'العربية'}
                  </Button>
                  <div>
                    <div className="text-2xl font-bold" dir="ltr">{Math.round((typedText.length / sampleText.length) * 100)}%</div>
                    <div className="text-blue-200 text-sm">
                      {isRTL ? 'التقدم' : 'Progress'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-8">
              <div className="mb-6">
                <div className={`bg-gray-100 p-6 rounded-lg text-2xl leading-relaxed mb-4 ${textDirection === 'rtl' ? 'text-right font-arabic' : 'text-left'}`} dir={textDirection}>
                  {renderTextWithHighlight()}
                </div>
                <div className="flex gap-4 mb-4">
                  <input
                    type="text"
                    value={typedText}
                    onChange={(e) => setTypedText(e.target.value)}
                    placeholder={typingLanguage === 'ar' ? 'ابدأ الكتابة هنا...' : 'Start typing here...'}
                    className="flex-1 p-4 border-2 border-gray-200 rounded-lg text-xl focus:border-blue-600 focus:outline-none"
                    dir={textDirection}
                    style={{ letterSpacing: textDirection === 'rtl' ? 'normal' : '1px' }}
                    maxLength={sampleText.length}
                  />
                  <Button
                    onClick={restartLevel}
                    variant="outline"
                    className="px-4 py-2"
                  >
                    <RotateCcw size={20} />
                    <span className="ml-2">{isRTL ? 'إعادة' : 'Restart'}</span>
                  </Button>
                </div>
                
                {showLevelComplete && (
                  <div className={`border rounded-lg p-6 text-center mb-4 ${levelPassed ? 'bg-green-50 border-green-200 text-green-700' : 'bg-orange-50 border-orange-200 text-orange-700'}`}>
                    {levelPassed ? (
                      <div>
                        <div className="flex items-center justify-center mb-2">
                          <Trophy className="mr-2" size={24} />
                          <h3 className="font-semibold text-lg">
                            {isRTL ? '🎉 ممتاز! اجتزت المستوى!' : '🎉 Excellent! Level Passed!'}
                          </h3>
                        </div>
                        <p className="mb-4">
                          {isRTL ? (
                            <>أحرزت <span dir="ltr">{wpm}</span> كلمة/دقيقة بدقة <span dir="ltr">{accuracy}%</span></>
                          ) : (
                            `You achieved ${wpm} WPM with ${accuracy}% accuracy`
                          )}
                        </p>
                        {currentLevel < typingLevels.length ? (
                          <Button onClick={nextLevel} className="bg-green-600 hover:bg-green-700 text-white">
                            <span>{isRTL ? 'المستوى التالي' : 'Next Level'}</span>
                            <ChevronRight size={20} className="ml-1" />
                          </Button>
                        ) : (
                          <div>
                            <h3 className="font-semibold text-xl mb-2">
                              {isRTL ? '🏆 تهانينا! أكملت جميع المستويات!' : '🏆 Congratulations! All levels completed!'}
                            </h3>
                            <p>{isRTL ? 'لقد أتقنت مهارة الطباعة باللمس' : 'You have mastered touch typing skills'}</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div>
                        <h3 className="font-semibold text-lg mb-2">
                          {isRTL ? '💪 استمر في المحاولة!' : '💪 Keep trying!'}
                        </h3>
                        <p className="mb-4">
                          {isRTL ? (
                            <>تحتاج إلى <span dir="ltr">{currentLevelData.targetWPM}</span> كلمة/دقيقة و <span dir="ltr">{currentLevelData.targetAccuracy}%</span> دقة للانتقال للمستوى التالي</>
                          ) : (
                            `You need ${currentLevelData.targetWPM} WPM and ${currentLevelData.targetAccuracy}% accuracy to advance`
                          )}
                        </p>
                        <Button onClick={restartLevel} variant="outline">
                          {isRTL ? 'حاول مرة أخرى' : 'Try Again'}
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                {stats.map((stat, index) => (
                  <div key={index} className={`${stat.bg} p-4 rounded-lg`}>
                    <div className={`text-2xl font-bold ${stat.color}`} dir="ltr">{stat.value}</div>
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

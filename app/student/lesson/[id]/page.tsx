'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-clike';
type ErrorPattern = {
  count: number;
  type: string;
};

type ErrorPatterns = Record<string, ErrorPattern>;

export default function LessonPage() {
  const params = useParams();
  const router = useRouter();
  const [lesson, setLesson] = useState<any>(null);
  const [userInput, setUserInput] = useState('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [isComplete, setIsComplete] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  // Detailed tracking
  const [keystrokes, setKeystrokes] = useState<any[]>([]);
  const [letterStats, setLetterStats] = useState<Map<string, any>>(new Map());
  const [errorPatterns, setErrorPatterns] = useState<ErrorPatterns>({});

  useEffect(() => {
    const fetchLesson = async () => {
      const res = await fetch(`/api/student/lesson/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setLesson(data.lesson);
      }
    };

    fetchLesson();
  }, [params.id]);

  useEffect(() => {
    if (lesson?.type === 'coding' && lesson?.text) {
      setTimeout(() => {
        Prism.highlightAll();
      }, 100);
    }
  }, [lesson]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    if (!lesson || !userInput || !startTime) return;

    const targetText = lesson.text;
    const correctChars = userInput.split('').filter((char, i) => char === targetText[i]).length;
    const acc = userInput.length > 0 ? Math.round((correctChars / userInput.length) * 100) : 100;
    setAccuracy(acc);

    const timeElapsed = (Date.now() - startTime) / 1000 / 60;
    const wordsTyped = userInput.split(' ').length;
    const calculatedWpm = Math.round(wordsTyped / timeElapsed) || 0;
    setWpm(calculatedWpm);

    if (userInput === targetText) {
      handleComplete();
    }
  }, [userInput, lesson, startTime]);

  const handleComplete = async () => {
    if (isComplete || !lesson || !startTime) return;
    
    setIsComplete(true);
    const timeSpent = Math.round((Date.now() - startTime) / 1000);
    const score = Math.round((accuracy * wpm) / 10);

    // Prepare letter data
    const letterData = Array.from(letterStats.values()).map(stat => ({
      letter: stat.letter,
      correctCount: stat.correctCount,
      incorrectCount: stat.incorrectCount,
      totalTimeMs: stat.totalTimeMs,
      avgTimeMs: stat.times.length > 0 
        ? Math.round(stat.times.reduce((a: number, b: number) => a + b, 0) / stat.times.length)
        : 0,
      errors: stat.errors,
    }));

    // Prepare session data for replay
    const sessionData = {
      keystrokes,
      totalKeystrokes: keystrokes.length,
      backspaceCount: keystrokes.filter((k: any) => k.char === 'Backspace').length,
      peakSpeed: wpm,
      startTime: startTime,
      endTime: Date.now(),
    };

    await fetch(`/api/student/lesson/${params.id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        score,
        speed: wpm,
        accuracy,
        timeSpent,
        sessionData,
        letterData,
        errorPatterns,
      }),
    });

    setTimeout(() => {
      router.back();
    }, 2000);
  };

  // Auto-save on page unload (if user closes mid-lesson)
  useEffect(() => {
    const handleBeforeUnload = async () => {
      if (startTime && !isComplete && keystrokes.length > 0) {
        const timeSpent = Math.round((Date.now() - startTime) / 1000);
        const score = Math.round((accuracy * wpm) / 10);

        const letterData = Array.from(letterStats.values()).map(stat => ({
          letter: stat.letter,
          correctCount: stat.correctCount,
          incorrectCount: stat.incorrectCount,
          totalTimeMs: stat.totalTimeMs,
          avgTimeMs: stat.times.length > 0 
            ? Math.round(stat.times.reduce((a: number, b: number) => a + b, 0) / stat.times.length)
            : 0,
          errors: stat.errors,
        }));

        const sessionData = {
          keystrokes,
          incomplete: true,
          startTime: startTime,
          endTime: Date.now(),
        };

        // Use sendBeacon for reliable delivery on page unload
        const data = JSON.stringify({
          score,
          speed: wpm,
          accuracy,
          timeSpent,
          sessionData,
          letterData,
          errorPatterns,
        });

        navigator.sendBeacon(`/api/student/lesson/${params.id}`, data);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [startTime, isComplete, keystrokes, wpm, accuracy, letterStats, errorPatterns, params.id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    
    if (!startTime) {
      setStartTime(Date.now());
    }

    // Track keystroke
    const timestamp = Date.now() - (startTime || Date.now());
    const currentIndex = value.length - 1;
    const targetText = lesson?.text || '';
    const typedChar = value[currentIndex];
    const expectedChar = targetText[currentIndex];
    const isCorrect = typedChar === expectedChar;

    // Record keystroke for session replay
    const keystrokeEvent = {
      char: typedChar,
      timestamp,
      correct: isCorrect,
      expected: expectedChar,
      index: currentIndex,
    };
    setKeystrokes(prev => [...prev, keystrokeEvent]);

    // Update letter statistics
    if (typedChar) {
      const stats = letterStats.get(expectedChar) || {
        letter: expectedChar,
        correctCount: 0,
        incorrectCount: 0,
        totalTimeMs: 0,
        errors: {},
        times: [],
      };

      if (isCorrect) {
        stats.correctCount++;
      } else {
        stats.incorrectCount++;
        stats.errors[typedChar] = (stats.errors[typedChar] || 0) + 1;
        
        // Track error pattern
        const patternKey = `${expectedChar}->${typedChar}`;
        setErrorPatterns(prev => ({
          ...prev,
          [patternKey]: {
            count: (prev[patternKey]?.count || 0) + 1,
            type: 'substitution',
          },
        }));
      }

      // Track timing
      const lastKeystroke = keystrokes[keystrokes.length - 1];
      if (lastKeystroke) {
        const timeDiff = timestamp - lastKeystroke.timestamp;
        stats.times.push(timeDiff);
        stats.totalTimeMs += timeDiff;
      }

      letterStats.set(expectedChar, stats);
      setLetterStats(new Map(letterStats));
    }

    setUserInput(value);
  };

  const renderText = () => {
    if (!lesson) return null;

    const targetText = lesson.text;
    
    return targetText.split('').map((char: string, index: number) => {
      let className = 'text-gray-800';
      
      if (index < userInput.length) {
        className = userInput[index] === char ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50';
      } else if (index === userInput.length) {
        className = 'bg-blue-200';
      }

      return (
        <span key={index} className={className}>
          {char === '\n' ? '↵\n' : char}
        </span>
      );
    });
  };

  if (!lesson) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="text-blue-600 hover:text-blue-800 mb-4"
          >
            ← Back to Course
          </button>
          <h1 className="text-3xl font-bold text-gray-900">{lesson.name}</h1>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-500">Speed</div>
            <div className="text-3xl font-bold text-blue-600">{wpm} WPM</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-500">Accuracy</div>
            <div className="text-3xl font-bold text-green-600">{accuracy}%</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-500">Time</div>
            <div className="text-3xl font-bold text-purple-600">
              {startTime ? Math.round((Date.now() - startTime) / 1000) : 0}s
            </div>
          </div>
        </div>

        {isComplete && (
          <div className="bg-green-100 border-2 border-green-500 rounded-lg p-6 mb-6 text-center">
            <h2 className="text-2xl font-bold text-green-800 mb-2">Lesson Complete!</h2>
            <p className="text-green-700">Great job! Redirecting back to course...</p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-lg p-6 mb-4">
          <h2 className="text-lg font-semibold mb-4">Type this text:</h2>
          {lesson.type === 'coding' ? (
            <pre className="mb-4 p-4 rounded-lg bg-gray-900">
              <code className={`language-${lesson.codeLanguage || 'javascript'}`}>
                {lesson.text}
              </code>
            </pre>
          ) : (
            <div className="mb-4 p-4 font-mono text-lg leading-relaxed bg-gray-50 rounded">
              {renderText()}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Your input:</h2>
          <textarea
            ref={inputRef}
            value={userInput}
            onChange={handleInputChange}
            className="w-full h-32 p-4 font-mono text-lg border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
            placeholder="Start typing here..."
            disabled={isComplete}
          />
        </div>
      </div>
    </div>
  );
}

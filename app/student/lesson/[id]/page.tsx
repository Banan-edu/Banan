'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

type ErrorPattern = { count: number; type: string };
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

  const [keystrokes, setKeystrokes] = useState<any[]>([]);
  const [letterStats, setLetterStats] = useState<Map<string, any>>(new Map());
  const [errorPatterns, setErrorPatterns] = useState<ErrorPatterns>({});

  // --- Fetch Lesson ---
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

  // --- Calculate Accuracy + Speed ---
  useEffect(() => {
    if (!lesson || !userInput || !startTime) return;
    const targetText = lesson.text;
    const correctChars = userInput.split('').filter((c, i) => c === targetText[i]).length;
    const acc = userInput.length ? Math.round((correctChars / userInput.length) * 100) : 100;
    setAccuracy(acc);

    const timeElapsed = (Date.now() - startTime) / 1000 / 60;
    const wordsTyped = userInput.trim().split(/\s+/).length;
    setWpm(Math.round(wordsTyped / timeElapsed) || 0);

    if (userInput === targetText) handleComplete();
  }, [userInput, lesson, startTime]);

  // --- Handle Before Unload (autosave progress) ---
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (startTime && !isComplete && keystrokes.length > 0) {
        const timeSpent = Math.round((Date.now() - startTime) / 1000);
        const score = Math.round((accuracy * wpm) / 10);
        const letterData = Array.from(letterStats.values()).map(stat => ({
          letter: stat.letter,
          correctCount: stat.correctCount,
          incorrectCount: stat.incorrectCount,
          totalTimeMs: stat.totalTimeMs,
          avgTimeMs: stat.times.length
            ? Math.round(stat.times.reduce((a: number, b: number) => a + b, 0) / stat.times.length)
            : 0,
          errors: stat.errors,
        }));

        const sessionData = {
          keystrokes,
          incomplete: true,
          startTime,
          endTime: Date.now(),
        };

        const payload = JSON.stringify({
          score,
          speed: wpm,
          accuracy,
          timeSpent,
          sessionData,
          letterData,
          errorPatterns,
        });

        navigator.sendBeacon(`/api/student/lesson/${params.id}`, payload);
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [startTime, isComplete, keystrokes, wpm, accuracy, letterStats, errorPatterns, params.id]);

  // --- Handle Lesson Completion ---
  const handleComplete = async () => {
    if (isComplete || !lesson || !startTime) return;
    setIsComplete(true);
    const timeSpent = Math.round((Date.now() - startTime) / 1000);
    const score = Math.round((accuracy * wpm) / 10);

    const letterData = Array.from(letterStats.values()).map(stat => ({
      letter: stat.letter,
      correctCount: stat.correctCount,
      incorrectCount: stat.incorrectCount,
      totalTimeMs: stat.totalTimeMs,
      avgTimeMs: stat.times.length
        ? Math.round(stat.times.reduce((a: number, b: number) => a + b, 0) / stat.times.length)
        : 0,
      errors: stat.errors,
    }));

    const sessionData = {
      keystrokes,
      totalKeystrokes: keystrokes.length,
      backspaceCount: keystrokes.filter((k: any) => k.char === 'Backspace').length,
      peakSpeed: wpm,
      startTime,
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

    setTimeout(() => router.back(), 2000);
  };

  // --- Keyboard Input Handler ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lesson || isComplete) return;

      e.preventDefault();

      const targetText = lesson.text;
      const currentIndex = userInput.length;

      if (!startTime) setStartTime(Date.now());

      let newInput = userInput;
      let typedChar = '';

      if (e.key === 'Backspace') {
        newInput = userInput.slice(0, -1);
        typedChar = 'Backspace';
      } else if (e.key === 'Enter') {
        newInput += '\n';
        typedChar = '\n';
      } else if (e.key.length === 1) {
        newInput += e.key;
        typedChar = e.key;
      } else return;

      const timestamp = Date.now() - (startTime || Date.now());
      const expectedChar = targetText[currentIndex];
      const isCorrect = typedChar === expectedChar;

      setKeystrokes(prev => [...prev, { char: typedChar, timestamp, correct: isCorrect, expected: expectedChar, index: currentIndex }]);

      if (typedChar && typedChar !== 'Backspace') {
        const stats = letterStats.get(expectedChar) || {
          letter: expectedChar,
          correctCount: 0,
          incorrectCount: 0,
          totalTimeMs: 0,
          errors: {},
          times: [],
        };

        if (isCorrect) stats.correctCount++;
        else {
          stats.incorrectCount++;
          stats.errors[typedChar] = (stats.errors[typedChar] || 0) + 1;
          const patternKey = `${expectedChar}->${typedChar}`;
          setErrorPatterns(prev => ({
            ...prev,
            [patternKey]: {
              count: (prev[patternKey]?.count || 0) + 1,
              type: 'substitution',
            },
          }));
        }

        const last = keystrokes[keystrokes.length - 1];
        if (last) {
          const diff = timestamp - last.timestamp;
          stats.times.push(diff);
          stats.totalTimeMs += diff;
        }

        letterStats.set(expectedChar, stats);
        setLetterStats(new Map(letterStats));
      }

      setUserInput(newInput);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [userInput, lesson, isComplete, startTime, keystrokes]);

  // --- Text Rendering (no textbox, underlining next char) ---
  const renderText = () => {
    if (!lesson) return null;
    const target = lesson.text;
    return target.split('').map((char: string, i: number) => {
      let style = 'text-gray-800';
      if (i < userInput.length) {
        style = userInput[i] === char ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50';
      } else if (i === userInput.length) {
        style = 'underline decoration-blue-500 decoration-2';
      }

      return (
        <span key={i} className={`${style} whitespace-pre-wrap`}>
          {char}
        </span>
      );
    });
  };

  if (!lesson)
    return (
      <div className="min-h-screen flex items-center justify-center text-xl">Loading...</div>
    );

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 select-none">
      <div className="max-w-5xl mx-auto">
        <button onClick={() => router.back()} className="text-blue-600 hover:text-blue-800 mb-4">
          ← Back to Course
        </button>

        <h1 className="text-3xl font-bold mb-6">{lesson.name}</h1>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-sm text-gray-500">Speed</div>
            <div className="text-2xl font-bold text-blue-600">{wpm} WPM</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-sm text-gray-500">Accuracy</div>
            <div className="text-2xl font-bold text-green-600">{accuracy}%</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-sm text-gray-500">Time</div>
            <div className="text-2xl font-bold text-purple-600">
              {startTime ? Math.round((Date.now() - startTime) / 1000) : 0}s
            </div>
          </div>
        </div>

        {isComplete && (
          <div className="bg-green-100 border border-green-400 text-green-800 rounded-lg p-4 mb-6 text-center">
            <h2 className="text-xl font-bold mb-1">Lesson Complete!</h2>
            <p>Great job! Redirecting back...</p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-lg p-6 font-mono text-lg leading-relaxed whitespace-pre-wrap">
          {renderText()}
        </div>
      </div>
    </div>
  );
}

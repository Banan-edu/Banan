'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { VirtualKeyboardGuide } from '@/components/students/VirtualKeyboard';
import { useLanguage } from '@/app/contexts/LanguageContext';

type ErrorPattern = { count: number; type: string };
type ErrorPatterns = Record<string, ErrorPattern>;
/**
 * lockLanguage
 * soundFx
 * theme
 * showReplayButton
 * showLowercaseLetters
 * games
 * anchoringLessons
 */
interface LessonConfig {
  disableBackspace: boolean;
  blockOnError: boolean;
  lockVirtualKeyboard: boolean;
  lockLanguage: boolean;
  lockHands: boolean;
  soundFx: boolean;
  voiceOver: 'full' | 'partial' | 'none';
  theme: string;
  font: string;
  showReplayButton: boolean;
  showLowercaseLetters: boolean;
  speedAdjustment: number;
  accuracyRequirement: number;
  highContrast?: boolean;
  fontSize?: 'extra-large' | 'large' | 'default';
  virtualKeyboardGuide?: 'right' | 'left' | 'both' | 'none';
  closedCaptioning?: boolean;
  games?: boolean;
  anchoringLessons?: boolean;
}

export default function LessonPage() {
  const params = useParams();
  const router = useRouter();

  const [lesson, setLesson] = useState<any>(null);
  const [config, setConfig] = useState<any>(null);
  const [userInput, setUserInput] = useState('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [isComplete, setIsComplete] = useState(false);
  const { isRTL } = useLanguage();

  const [keystrokes, setKeystrokes] = useState<any[]>([]);
  const [letterStats, setLetterStats] = useState<Map<string, any>>(new Map());
  const [errorPatterns, setErrorPatterns] = useState<ErrorPatterns>({});

  const [recordingAllowed, setRecordingAllowed] = useState<boolean | null>(null);


  // ============= SCREEN & CAMERA RECORDING STATES =============
  const [isRecording, setIsRecording] = useState(false);
  const screenRecorderRef = useRef<MediaRecorder | null>(null);
  const cameraRecorderRef = useRef<MediaRecorder | null>(null);
  const screenChunksRef = useRef<Blob[]>([]);
  const cameraChunksRef = useRef<Blob[]>([]);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      screenStreamRef.current?.getTracks().forEach(track => track.stop());
      cameraStreamRef.current?.getTracks().forEach(track => track.stop());
      if (screenRecorderRef.current?.state === 'recording') screenRecorderRef.current.stop();
      if (cameraRecorderRef.current?.state === 'recording') cameraRecorderRef.current.stop();
    };
  }, []);

  // ============= RECORDING FUNCTIONS =============
  const startRecording = async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: { displaySurface: 'monitor', },
        audio: false,
      });
      screenStreamRef.current = screenStream;

      const cameraStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });
      cameraStreamRef.current = cameraStream;

      const screenRecorder = new MediaRecorder(screenStream, {
        mimeType: 'video/webm;codecs=vp8',
      });
      screenRecorderRef.current = screenRecorder;
      screenChunksRef.current = [];

      screenRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) screenChunksRef.current.push(e.data);
      };

      const cameraRecorder = new MediaRecorder(cameraStream, {
        mimeType: 'video/webm;codecs=vp8',
      });
      cameraRecorderRef.current = cameraRecorder;
      cameraChunksRef.current = [];

      cameraRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) cameraChunksRef.current.push(e.data);
      };

      // Start recording
      screenRecorder.start(1000);
      cameraRecorder.start(1000);
      setIsRecording(true);
      setRecordingAllowed(true); // ✅ Mark as allowed
      console.log('✅ Recording started (screen + camera)');
    } catch (err) {
      console.error('❌ Error starting recording:', err);
      alert('You must allow screen and camera permissions to start the lesson.');
      setRecordingAllowed(false); // ❌ Permissions denied
    }
  };


  const stopRecording = async (): Promise<{ screenBlob: Blob | null; cameraBlob: Blob | null }> => {
    return new Promise((resolve) => {
      let screenBlob: Blob | null = null;
      let cameraBlob: Blob | null = null;
      let stoppedCount = 0;

      const checkComplete = () => {
        stoppedCount++;
        if (stoppedCount === 2) {
          resolve({ screenBlob, cameraBlob });
        }
      };

      // Stop screen recording
      if (screenRecorderRef.current && screenRecorderRef.current.state !== 'inactive') {
        screenRecorderRef.current.onstop = () => {
          screenBlob = new Blob(screenChunksRef.current, { type: 'video/webm' });
          console.log('📹 Screen recording stopped, size:', screenBlob.size);
          screenStreamRef.current?.getTracks().forEach(track => track.stop());
          checkComplete();
        };
        screenRecorderRef.current.stop();
      } else {
        checkComplete();
      }

      // Stop camera recording
      if (cameraRecorderRef.current && cameraRecorderRef.current.state !== 'inactive') {
        cameraRecorderRef.current.onstop = () => {
          cameraBlob = new Blob(cameraChunksRef.current, { type: 'video/webm' });
          console.log('📷 Camera recording stopped, size:', cameraBlob.size);
          cameraStreamRef.current?.getTracks().forEach(track => track.stop());
          checkComplete();
        };
        cameraRecorderRef.current.stop();
      } else {
        checkComplete();
      }

      setIsRecording(false);
    });
  };

  // Upload recordings to cloud (this will be handled by the API)
  const uploadRecordings = async (screenBlob: Blob | null, cameraBlob: Blob | null, progressId: number) => {
    const formData = new FormData();

    if (screenBlob) {
      formData.append('screenRecording', screenBlob, 'screen.webm');
    }
    if (cameraBlob) {
      formData.append('cameraRecording', cameraBlob, 'camera.webm');
    }
    formData.append('progressId', progressId.toString());

    try {
      const res = await fetch(`/api/student/lesson/${params.id}/upload-recordings`, {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        console.log('✅ Recordings uploaded successfully');
      } else {
        console.error('❌ Failed to upload recordings');
      }
    } catch (err) {
      console.error('❌ Error uploading recordings:', err);
    }
  };

  // --- Fetch Lesson ---
  useEffect(() => {
    const fetchLesson = async () => {
      const res = await fetch(`/api/student/lesson/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setLesson(data.lesson);
        setConfig(data.config);
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

    // Stop recordings first
    const { screenBlob, cameraBlob } = await stopRecording();

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

    const res = await fetch(`/api/student/lesson/${params.id}`, {
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

    if (res.ok) {
      const data = await res.json();
      const progressId = data.progress?.id;

      // Upload recordings with progressId
      if (progressId && (screenBlob || cameraBlob)) {
        await uploadRecordings(screenBlob, cameraBlob, progressId);
        router.back()
      }
    }

  };

  // --- Keyboard Input Handler ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lesson || isComplete) return;

      e.preventDefault();

      const targetText = lesson.text;
      const currentIndex = userInput.length;


      if (recordingAllowed === false) {
        alert('Recording permissions are required before typing.');
        return;
      }

      if (!startTime) setStartTime(Date.now());


      let newInput = userInput;
      let typedChar = '';

      if (e.key === 'Backspace') {
        if (config.disableBackspace) {
          return;
        }
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

      if (config.blockOnError && !isCorrect && typedChar !== 'Backspace') {
        // Don't allow incorrect character to be typed
        return;
      }
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

  if (!window.MediaRecorder) {
    console.warn('MediaRecorder not supported on this browser.');
    return;
  }
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

  const handleStartLesson = async () => {
    if (isRecording || recordingAllowed) return;

    try {
      await startRecording();
      setRecordingAllowed(true);
    } catch (err) {
      setRecordingAllowed(false);
    }
  };

  if (recordingAllowed === null) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-lg">
        <p className="mb-4">Please allow screen and camera access to start the lesson.</p>
        <button
          onClick={handleStartLesson}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          Start Lesson
        </button>
      </div>
    );
  }

  if (!lesson || !config)
    return (
      <div className="min-h-screen flex items-center justify-center text-xl">Loading...</div>
    );

  // ✅ CONFIG: Determine font size class based on config.fontSize
  const getFontSizeClass = () => {
    if (config.fontSize === 'extra-large') return 'text-3xl';
    if (config.fontSize === 'large') return 'text-2xl';
    return 'text-lg'; // normal
  };

  // ✅ CONFIG: Determine font family based on config.fontType
  const getFontFamilyClass = () => {
    if (config.font === 'dyslexic') return 'font-dyslexic'; // You'll need to load this font
    return 'font-mono'; // default
  };

  // ✅ CONFIG: Determine background color based on config.highContrast
  const getBackgroundClass = () => {
    if (config.highContrast) return 'bg-[#121212] text-[#F5F5F5]'; // High contrast mode
    return 'bg-gray-50'; // Normal mode
  };

  return (
    <div className={`min-h-screen py-8 px-4 select-none ${getBackgroundClass()}`}>
      <div className="max-w-5xl mx-auto">
        <button onClick={() => { if (recordingAllowed) { stopRecording(); } router.back() }} className="text-blue-600 hover:text-blue-800 mb-4">
          ← Back to Course
        </button>

        <h1 className="text-3xl font-bold mb-6">{lesson.name}</h1>

        {config.showReplayButton && (
          <div className="mb-4">
            {/* Add a button to restart the lesson */}
            <button
              onClick={() => {
                setUserInput('');
                setStartTime(null);
                setWpm(0);
                setAccuracy(100);
                setIsComplete(false);
                setKeystrokes([]);
                setLetterStats(new Map());
                setErrorPatterns({});
              }}
              className="px-4 py-2 bg-gray-300 hover:text-white rounded-lg hover:bg-gray-400 transition"
            >
              {isRTL ? 'اعادة' : 'Replay'}
            </button>
          </div>
        )}
        {config.closedCaptioning && (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 rounded-lg p-2 mb-4 text-sm">
            📝 Closed Captions: Enabled
          </div>
        )}
        {/* there should be voice guiding */}
        {config.voiceOver && (
          <div className="bg-blue-100 border border-blue-400 text-blue-800 rounded-lg p-2 mb-4 text-sm">
            🔊 Voice-Over: {config.voiceOver === 'full' ? 'Fully Guided' : 'Guided'}
          </div>
        )}

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-sm text-gray-500">Speed</div>
            <div className="text-2xl font-bold text-blue-600">{wpm} WPM</div>
            {/* ✅ CONFIG: Show goal speed from config */}
            {config.speedAdjustment && (
              <div className="text-xs text-gray-400">Goal: {config.speedAdjustment} WPM</div>
            )}
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-sm text-gray-500">Accuracy</div>
            <div className="text-2xl font-bold text-green-600">{accuracy}%</div>
            {config.accuracyRequirement && (
              <div className="text-xs text-gray-400">Min: {config.accuracyRequirement}%</div>
            )}
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-sm text-gray-500">Time</div>
            <div className="text-2xl font-bold text-purple-600">
              {startTime ? Math.round((Date.now() - startTime) / 1000) : 0}s
            </div>
            {config.timeLimit && (
              <div className="text-xs text-gray-400">Limit: {config.timeLimit}s</div>
            )}
          </div>
        </div>

        {isComplete && (
          <div className="bg-green-100 border border-green-400 text-green-800 rounded-lg p-4 mb-6 text-center">
            <h2 className="text-xl font-bold mb-1">Lesson Complete!</h2>
            <p>Great job! Redirecting back...</p>
          </div>
        )}

        <div
          dir={lesson.language === 'ar' ? 'rtl' : 'ltr'}
          className={`bg-white rounded-lg shadow-lg p-6 ${getFontSizeClass()} ${getFontFamilyClass()} leading-relaxed whitespace-pre-wrap ${config.highContrast ? 'bg-black text-white' : ''}`}
        >
          {renderText()}
        </div>

        {config.virtualKeyboardGuide !== 'none' && (
          <div className="bg-purple-100 border border-purple-400 text-purple-800 rounded-lg p-2 mb-4 text-sm">
            ⌨️ Virtual Keyboard Guide: {config.virtualKeyboardGuide === 'right' ? 'Right Hand' : 'Left Hand'}
            <VirtualKeyboardGuide
              currentChar={lesson.text[userInput.length] || ''}
              nextChar={lesson.text[userInput.length + 1] || ''}
              lockHands={true}
              handType={config.virtualKeyboardGuide}
              isRTL={isRTL}
            />
          </div>
        )}

        {config.disableBackspace && (
          <div className="mt-4 bg-orange-100 border border-orange-400 text-orange-800 rounded-lg p-2 text-sm">
            ⚠️ Backspace is disabled for this lesson
          </div>
        )}
        {config.blockOnError && (
          <div className="mt-4 bg-red-100 border border-red-400 text-red-800 rounded-lg p-2 text-sm">
            🚫 Error blocking is active - incorrect keys will be ignored
          </div>
        )}
      </div>
    </div>
  );
}

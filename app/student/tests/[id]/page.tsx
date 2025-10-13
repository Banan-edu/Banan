'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

type ErrorPattern = { count: number; type: string };
type ErrorPatterns = Record<string, ErrorPattern>;

export default function TestPage() {
    const params = useParams();
    const router = useRouter();

    // ====================== STATE VARIABLES ======================
    const [test, setTest] = useState<any>(null);
    const [testResult, setTestResult] = useState<any>(null);
    const [userInput, setUserInput] = useState('');
    const [startTime, setStartTime] = useState<number | null>(null);
    const [wpm, setWpm] = useState(0);
    const [accuracy, setAccuracy] = useState(100);
    const [isComplete, setIsComplete] = useState(false);
    const [timeLeft, setTimeLeft] = useState<number | null>(null);
    const [keystrokes, setKeystrokes] = useState<any[]>([]);
    const [letterStats, setLetterStats] = useState<Map<string, any>>(new Map());
    const [errorPatterns, setErrorPatterns] = useState<ErrorPatterns>({});
    const [recordingAllowed, setRecordingAllowed] = useState<boolean | null>(null);

    // ====================== RECORDING HANDLERS ======================
    const [isRecording, setIsRecording] = useState(false);
    const screenRecorderRef = useRef<MediaRecorder | null>(null);
    const cameraRecorderRef = useRef<MediaRecorder | null>(null);
    const screenChunksRef = useRef<Blob[]>([]);
    const cameraChunksRef = useRef<Blob[]>([]);
    const screenStreamRef = useRef<MediaStream | null>(null);
    const cameraStreamRef = useRef<MediaStream | null>(null);

    // ✅ Cleanup on unmount to stop any recording streams
    useEffect(() => {
        return () => {
            screenStreamRef.current?.getTracks().forEach(track => track.stop());
            cameraStreamRef.current?.getTracks().forEach(track => track.stop());
            if (screenRecorderRef.current?.state === 'recording') screenRecorderRef.current.stop();
            if (cameraRecorderRef.current?.state === 'recording') cameraRecorderRef.current.stop();
        };
    }, []);

    // ====================== TIMER EFFECT ======================
    useEffect(() => {
        if (!test?.hasTimeLimit || !startTime || isComplete) return;

        const interval = setInterval(() => {
            const elapsed = Math.floor((Date.now() - startTime) / 1000);
            const remaining = (test.timeLimit * 60) - elapsed;

            if (remaining <= 0) {
                setTimeLeft(0);
                handleComplete(); // ✅ ensure handleComplete only runs once
            } else {
                setTimeLeft(remaining);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [test, startTime, isComplete]);

    // ====================== START RECORDING ======================
    const startRecording = async () => {
        try {
            // ✅ Request both screen and camera
            const screenStream = await navigator.mediaDevices.getDisplayMedia({
                video: { displaySurface: 'monitor' },
                audio: false,
            });
            screenStreamRef.current = screenStream;

            const cameraStream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: false,
            });
            cameraStreamRef.current = cameraStream;

            // ✅ Setup both recorders
            const screenRecorder = new MediaRecorder(screenStream, { mimeType: 'video/webm;codecs=vp8' });
            const cameraRecorder = new MediaRecorder(cameraStream, { mimeType: 'video/webm;codecs=vp8' });
            screenRecorderRef.current = screenRecorder;
            cameraRecorderRef.current = cameraRecorder;
            screenChunksRef.current = [];
            cameraChunksRef.current = [];

            // ✅ Capture data chunks
            screenRecorder.ondataavailable = e => e.data.size > 0 && screenChunksRef.current.push(e.data);
            cameraRecorder.ondataavailable = e => e.data.size > 0 && cameraChunksRef.current.push(e.data);

            // ✅ Start recording
            screenRecorder.start(1000);
            cameraRecorder.start(1000);
            setIsRecording(true);
            setRecordingAllowed(true);
            console.log('✅ Recording started (screen + camera)');
        } catch (err) {
            console.error('❌ Error starting recording:', err);
            alert('You must allow screen and camera permissions to start the test.');
            setRecordingAllowed(false);
        }
    };

    // ====================== STOP RECORDING ======================
    const stopRecording = async (): Promise<{ screenBlob: Blob | null; cameraBlob: Blob | null }> => {
        return new Promise((resolve) => {
            let screenBlob: Blob | null = null;
            let cameraBlob: Blob | null = null;
            let stoppedCount = 0;

            const checkComplete = () => {
                stoppedCount++;
                if (stoppedCount === 2) resolve({ screenBlob, cameraBlob });
            };

            // ✅ Stop screen recording
            if (screenRecorderRef.current && screenRecorderRef.current.state !== 'inactive') {
                screenRecorderRef.current.onstop = () => {
                    screenBlob = new Blob(screenChunksRef.current, { type: 'video/webm' });
                    screenStreamRef.current?.getTracks().forEach(track => track.stop());
                    checkComplete();
                };
                screenRecorderRef.current.stop();
            } else checkComplete();

            // ✅ Stop camera recording
            if (cameraRecorderRef.current && cameraRecorderRef.current.state !== 'inactive') {
                cameraRecorderRef.current.onstop = () => {
                    cameraBlob = new Blob(cameraChunksRef.current, { type: 'video/webm' });
                    cameraStreamRef.current?.getTracks().forEach(track => track.stop());
                    checkComplete();
                };
                cameraRecorderRef.current.stop();
            } else checkComplete();

            setIsRecording(false);
        });
    };

    // ====================== UPLOAD RECORDINGS ======================
    const uploadRecordings = async (screenBlob: Blob | null, cameraBlob: Blob | null, resultId: number) => {
        const formData = new FormData();
        if (screenBlob) formData.append('screenRecording', screenBlob, 'screen.webm');
        if (cameraBlob) formData.append('cameraRecording', cameraBlob, 'camera.webm');
        formData.append('resultId', resultId.toString());

        try {
            const res = await fetch(`/api/student/tests/${params.id}/upload-recordings`, { method: 'POST', body: formData });
            if (res.ok) console.log('✅ Recordings uploaded successfully');
            else console.error('❌ Failed to upload recordings');
        } catch (err) {
            console.error('❌ Error uploading recordings:', err);
        }
    };

    // ====================== FETCH TEST DATA ======================
    useEffect(() => {
        const fetchTest = async () => {
            const res = await fetch(`/api/student/tests/${params.id}`);
            if (res.ok) {
                const data = await res.json();
                setTest(data.test);
                setTestResult(data.result);
                if (data.canAttempt === false) {
                    alert(data.message || 'You cannot attempt this test');
                    router.push('/student/tests');
                }
            } else router.push('/student/tests');
        };
        fetchTest();
    }, [params.id]);

    // ====================== ACCURACY + SPEED CALCULATION ======================
    useEffect(() => {
        if (!test || !userInput || !startTime) return;
        const targetText = test.text;

        // ✅ Compute correct characters
        const correctChars = userInput.split('').filter((c, i) => c === targetText[i]).length;
        const acc = userInput.length ? Math.round((correctChars / userInput.length) * 100) : 100;
        setAccuracy(acc);

        // ✅ Compute WPM
        const timeElapsed = (Date.now() - startTime) / 1000 / 60;
        const wordsTyped = userInput.trim().split(/\s+/).length;
        setWpm(Math.round(wordsTyped / timeElapsed) || 0);

        // ✅ Completion check
        if (userInput === targetText) handleComplete();
    }, [userInput, test, startTime]);

    // ====================== HANDLE COMPLETION ======================
    const handleComplete = async () => {
        if (isComplete || !test || !startTime) return; // ✅ prevent multiple calls
        setIsComplete(true);

        const { screenBlob, cameraBlob } = await stopRecording();
        const timeSpent = Math.round((Date.now() - startTime) / 1000);
        const score = Math.round((accuracy * wpm) / 10);

        // ✅ Passing criteria
        let passed = false;
        if (test.passingCriteria === 'everyone') passed = true;
        else if (test.passingCriteria === 'accuracy') passed = accuracy >= (test.minAccuracy || 0);
        else if (test.passingCriteria === 'speed') passed = wpm >= (test.minSpeed || 0);
        else if (test.passingCriteria === 'both')
            passed = accuracy >= (test.minAccuracy || 0) && wpm >= (test.minSpeed || 0);

        // ✅ Build letterData
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

        // ✅ Build sessionData
        const sessionData = {
            keystrokes,
            totalKeystrokes: keystrokes.length,
            backspaceCount: keystrokes.filter(k => k.char === 'Backspace').length,
            peakSpeed: wpm,
            startTime,
            endTime: Date.now(),
        };

        // ✅ Submit the result
        const res = await fetch(`/api/student/tests/${params.id}/submit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ score, speed: wpm, accuracy, completionTime: timeSpent, passed, sessionData, letterData, errorPatterns }),
        });

        if (res.ok) {
            const data = await res.json();
            const resultId = data.result?.id;

            if (resultId && (screenBlob || cameraBlob)) await uploadRecordings(screenBlob, cameraBlob, resultId);

            setTimeout(() => router.push('/student/tests'), 3000);
        }
    };

    // ====================== KEYBOARD INPUT HANDLER ======================
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!test || isComplete) return;

            if (test.disableBackspace && e.key === 'Backspace') {
                e.preventDefault();
                return;
            }

            e.preventDefault();

            const targetText = test.text;
            const currentIndex = userInput.length;

            if (recordingAllowed === false) {
                alert('Recording permissions are required before typing.');
                return;
            }

            if (!startTime) {
                setStartTime(Date.now());
                if (test.hasTimeLimit) setTimeLeft(test.timeLimit * 60);
            }

            let newInput = userInput;
            let typedChar = '';

            // ✅ Build the new input string
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

            // ✅ Record the keystroke
            setKeystrokes(prev => [
                ...prev,
                { char: typedChar, timestamp, correct: isCorrect, expected: expectedChar, index: currentIndex }
            ]);

            // ✅ Update per-letter stats
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
                    // 🔧 FIXED: explicitly type prev for TS safety
                    setErrorPatterns((prev: ErrorPatterns) => ({
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
    }, [userInput, test, isComplete, startTime, keystrokes, recordingAllowed, letterStats]);

    // ====================== RENDER ======================

    // ✅ Graceful fallback if MediaRecorder not supported
    if (typeof window !== 'undefined' && !('MediaRecorder' in window)) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-red-600">MediaRecorder not supported on this browser.</p>
            </div>
        );
    }

    // ✅ Helper to format time
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // ✅ Display target text with dynamic color + underline
    const renderText = () => {
        if (!test) return null;
        const target = test.text;
        return target.split('').map((char: string, i: number) => {
            let style = 'text-gray-800';
            if (i < userInput.length) {
                style = userInput[i] === char ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50';
            } else if (i === userInput.length) {
                style = 'underline decoration-blue-500 decoration-2';
            }
            return <span key={i} className={`${style} whitespace-pre-wrap`}>{char}</span>;
        });
    };

    // ✅ Start test when user allows recording
    const handleStartTest = async () => {
        if (isRecording || recordingAllowed) return;
        try {
            await startRecording();
            setRecordingAllowed(true);
        } catch {
            setRecordingAllowed(false);
        }
    };

    // ====================== UI STATES ======================
    if (recordingAllowed === null) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
                <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
                    <h2 className="text-2xl font-bold mb-4">{test?.name || 'Loading Test...'}</h2>
                    <p className="text-gray-600 mb-6">
                        Please allow screen and camera access to start the test. This is required for test integrity.
                    </p>
                    {test?.hasTimeLimit && (
                        <p className="text-orange-600 mb-4">⏱️ Time Limit: {test.timeLimit} minutes</p>
                    )}
                    <button
                        onClick={handleStartTest}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Start Test
                    </button>
                </div>
            </div>
        );
    }

    if (!test)
        return (
            <div className="min-h-screen flex items-center justify-center text-xl">Loading...</div>
        );

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 select-none">
            <div className="max-w-5xl mx-auto">
                <div className="flex justify-between items-center mb-4">
                    <button onClick={() => router.push('/student/tests')} className="text-blue-600 hover:text-blue-800">
                        ← Back to Tests
                    </button>
                    {test.hasTimeLimit && timeLeft !== null && (
                        <div className={`text-xl font-bold ${timeLeft < 60 ? 'text-red-600' : 'text-gray-900'}`}>
                            ⏱️ {formatTime(timeLeft)}
                        </div>
                    )}
                </div>

                <h1 className="text-3xl font-bold mb-6">{test.name}</h1>

                {/* ================== Stats Summary ================== */}
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

                {/* ================== Completion Message ================== */}
                {isComplete && (
                    <div className="bg-green-100 border border-green-400 text-green-800 rounded-lg p-4 mb-6 text-center">
                        <h2 className="text-xl font-bold mb-1">Test Complete!</h2>
                        <p>Your results have been submitted. Redirecting...</p>
                    </div>
                )}

                {/* ================== Typing Text ================== */}
                <div
                    dir="ltr"
                    className="bg-white rounded-lg shadow-lg p-6 font-mono text-lg leading-relaxed whitespace-pre-wrap"
                >
                    {renderText()}
                </div>
            </div>
        </div>
    );
}

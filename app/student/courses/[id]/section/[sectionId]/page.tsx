
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { CheckCircle, Circle, Lock, Star } from 'lucide-react';

interface Lesson {
    id: number;
    name: string;
    type: string;
    progress: {
        completed: boolean;
        stars: number;
        score: number;
    } | null;
}

interface Section {
    id: number;
    name: string;
    lessons: Lesson[];
}

export default function SectionPage() {
    const params = useParams();
    const router = useRouter();
    const [section, setSection] = useState<Section | null>(null);
    const [courseName, setCourseName] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSection = async () => {
            try {
                const res = await fetch(`/api/student/section/${params.sectionId}`);
                if (res.ok) {
                    const data = await res.json();
                    setSection(data.section);
                    setCourseName(data.courseName);
                }
            } catch (error) {
                console.error('Error fetching section:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSection();
    }, [params.sectionId]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-xl">Loading...</div>
            </div>
        );
    }

    if (!section) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-xl">Section not found</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                    <button
                        onClick={() => router.push(`/student/courses/${params.id}`)}
                        className="text-blue-600 hover:text-blue-800 mb-4"
                    >
                        ← Back to {courseName}
                    </button>
                    <h1 className="text-4xl font-bold text-gray-900">{section.name}</h1>
                    <p className="text-gray-600 mt-2">{section.lessons.length} lessons</p>
                </div>

                <div className="relative">
                    {section.lessons.map((lesson, index) => {
                        const isLeft = index % 2 === 0;
                        const isCompleted = lesson.progress?.completed;
                        const isLocked = index > 0 && !section.lessons[index - 1]?.progress?.completed;

                        return (
                            <div key={lesson.id} className="relative mb-8">
                                <div
                                    className={`flex ${isLeft ? 'justify-start' : 'justify-end'} items-center`}
                                >
                                    <div
                                        onClick={() => !isLocked && router.push(`/student/lesson/${lesson.id}`)}
                                        className={`
                      bg-white rounded-xl shadow-lg p-6 w-80
                      ${!isLocked ? 'cursor-pointer hover:shadow-xl transition-shadow' : 'opacity-60 cursor-not-allowed'}
                      ${isCompleted ? 'ring-2 ring-green-500' : ''}
                    `}
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    {isLocked ? (
                                                        <Lock className="w-5 h-5 text-gray-400" />
                                                    ) : isCompleted ? (
                                                        <CheckCircle className="w-5 h-5 text-green-500" />
                                                    ) : (
                                                        <Circle className="w-5 h-5 text-gray-400" />
                                                    )}
                                                    <h3 className="font-semibold text-gray-900">{lesson.name}</h3>
                                                </div>
                                                {lesson.type === 'coding' && (
                                                    <span className="inline-block px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">
                                                        Coding
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {lesson.progress && (
                                            <div className="flex items-center gap-2 mt-3 pt-3 border-t">
                                                <div className="flex gap-1">
                                                    {[...Array(lesson.progress?.stars||0)].map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            className={`w-4 h-4 ${i < (lesson.progress?.stars || 0)
                                                                    ? 'fill-yellow-400 text-yellow-400'
                                                                    : 'text-gray-300'
                                                                }`}
                                                        />
                                                    ))}
                                                </div>
                                                <span className="text-sm text-gray-600">
                                                    Score: {lesson.progress.score}
                                                </span>
                                            </div>
                                        )}

                                        {!isLocked && !isCompleted && (
                                            <div className="mt-4">
                                                <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
                                                    Start Lesson
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {index < section.lessons.length - 1 && (
                                    <div className={`absolute ${isLeft ? 'left-1/2' : 'right-1/2'} w-1 h-8 bg-gray-300 -bottom-8 transform -translate-x-1/2`} />
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

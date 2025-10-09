
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { CheckCircle, Circle, Lock } from 'lucide-react';

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

export default function CourseMapPage() {
  const params = useParams();
  const router = useRouter();
  const [course, setCourse] = useState<any>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await fetch(`/api/student/course/${params.id}`);
        if (res.ok) {
          const data = await res.json();
          setCourse(data.course);
          setSections(data.sections);
        }
      } catch (error) {
        console.error('Error fetching course:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  const getSectionProgress = (section: Section) => {
    if (!section.lessons || section.lessons.length === 0) return { completed: 0, total: 0 };
    const completed = section.lessons.filter(l => l.progress?.completed).length;
    return { completed, total: section.lessons.length };
  };

  const isSectionLocked = (index: number) => {
    if (index === 0) return false;
    const prevSection = sections[index - 1];
    const progress = getSectionProgress(prevSection);
    return progress.completed < progress.total;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <button
            onClick={() => router.push('/student/courses')}
            className="text-blue-600 hover:text-blue-800 mb-4"
          >
            ← Back to Courses
          </button>
          <h1 className="text-4xl font-bold text-gray-900">{course?.name}</h1>
          <p className="text-gray-600 mt-2">{course?.description}</p>
        </div>

        <div className="relative">
          {sections.map((section, index) => {
            const isLeft = index % 2 === 0;
            const progress = getSectionProgress(section);
            const isCompleted = progress.completed === progress.total && progress.total > 0;
            const isLocked = isSectionLocked(index);

            return (
              <div key={section.id} className="relative mb-8">
                <div
                  className={`flex ${isLeft ? 'justify-start' : 'justify-end'} items-center`}
                >
                  <div
                    onClick={() => !isLocked && router.push(`/student/courses/${params.id}/section/${section.id}`)}
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
                          <h3 className="font-semibold text-gray-900">{section.name}</h3>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t">
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>{progress.total} lessons</span>
                        <span>{progress.completed}/{progress.total} completed</span>
                      </div>
                      <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${progress.total > 0 ? (progress.completed / progress.total) * 100 : 0}%` }}
                        />
                      </div>
                    </div>

                    {!isLocked && !isCompleted && (
                      <div className="mt-4">
                        <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
                          {progress.completed > 0 ? 'Continue Section' : 'Start Section'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {index < sections.length - 1 && (
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


'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Star, CheckCircle, Circle, Lock } from 'lucide-react';

interface Lesson {
  id: number;
  name: string;
  type: string;
  progress: {
    completed: boolean;
    stars: number;
    score: number;
    attempts: number;
    timeSpent: number;
  } | null;
}

interface Section {
  id: number;
  name: string;
  lessons: Lesson[];
}

interface Course {
  id: number;
  name: string;
  totalScore: number;
  totalStars: number;
  totalTime: number;
  totalAttempts: number;
  progress: number;
}

export function StudentProgressTab({ studentId, isRTL }: { studentId: string; isRTL: boolean }) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchProgress();
  }, [studentId]);

  const fetchProgress = async () => {
    try {
      const res = await fetch(`/api/instructor/students/${studentId}/progress`);
      if (res.ok) {
        const data = await res.json();
        setCourses(data.courses || []);
      }
    } catch (error) {
      console.error('Error fetching progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const viewCourseDetails = async (course: Course) => {
    try {
      const res = await fetch(`/api/instructor/students/${studentId}/progress/${course.id}/lessons`);
      if (res.ok) {
        const data = await res.json();
        setSections(data.sections || []);
        setSelectedCourse(course);
      }
    } catch (error) {
      console.error('Error fetching course details:', error);
    }
  };

  const formatTime = (seconds: number): string => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) return <div>Loading...</div>;

  // Show detailed course view
  if (selectedCourse && sections.length > 0) {
    const allLessons = sections.flatMap((section) => section.lessons);
    
    return (
      <div className="space-y-6">
        <button
          onClick={() => setSelectedCourse(null)}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          {isRTL ? 'العودة للدورات' : 'Back to Courses'}
        </button>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-6">{selectedCourse.name}</h2>

          {/* Course Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600">{selectedCourse.progress}%</div>
              <div className="text-sm text-gray-600">{isRTL ? 'التقدم' : 'Progress'}</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600">{selectedCourse.totalScore}</div>
              <div className="text-sm text-gray-600">{isRTL ? 'النقاط' : 'Score'}</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-yellow-600">{selectedCourse.totalStars}</div>
              <div className="text-sm text-gray-600">{isRTL ? 'النجوم' : 'Stars'}</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-purple-600">{selectedCourse.totalAttempts}</div>
              <div className="text-sm text-gray-600">{isRTL ? 'المحاولات' : 'Attempts'}</div>
            </div>
            <div className="bg-indigo-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-indigo-600">{formatTime(selectedCourse.totalTime)}</div>
              <div className="text-sm text-gray-600">{isRTL ? 'الوقت' : 'Time'}</div>
            </div>
          </div>

          {/* Lessons Progress Map */}
          <div className="relative">
            {allLessons.map((lesson, index) => {
              const isLeft = index % 2 === 0;
              const isCompleted = lesson.progress?.completed;
              const isLocked = index > 0 && !allLessons[index - 1]?.progress?.completed;

              return (
                <div key={lesson.id} className="relative mb-8">
                  <div className={`flex ${isLeft ? 'justify-start' : 'justify-end'} items-center`}>
                    <div
                      className={`
                        bg-white border-2 rounded-xl shadow-lg p-6 w-80
                        ${isCompleted ? 'border-green-500' : 'border-gray-200'}
                        ${isLocked ? 'opacity-60' : ''}
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
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">{isRTL ? 'النجوم' : 'Stars'}:</span>
                            <div className="flex gap-1">
                              {[...Array(3)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < (lesson.progress?.stars || 0)
                                      ? 'fill-yellow-400 text-yellow-400'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">{isRTL ? 'النقاط' : 'Score'}:</span>
                            <span className="font-semibold">{lesson.progress.score}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">{isRTL ? 'المحاولات' : 'Attempts'}:</span>
                            <span className="font-semibold">{lesson.progress.attempts}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">{isRTL ? 'الوقت' : 'Time'}:</span>
                            <span className="font-semibold">{formatTime(lesson.progress.timeSpent)}</span>
                          </div>
                        </div>
                      )}

                      {!lesson.progress && !isLocked && (
                        <div className="text-center text-gray-500 text-sm">
                          {isRTL ? 'لم يبدأ بعد' : 'Not started yet'}
                        </div>
                      )}
                    </div>
                  </div>

                  {index < allLessons.length - 1 && (
                    <div
                      className={`absolute ${
                        isLeft ? 'left-1/2' : 'right-1/2'
                      } w-1 h-8 bg-gray-300 -bottom-8 transform -translate-x-1/2`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Show courses list
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.length === 0 ? (
        <p className="text-gray-500 col-span-full">{isRTL ? 'لا توجد دورات' : 'No enrolled courses'}</p>
      ) : (
        courses.map((course) => (
          <div key={course.id} className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">{course.name}</h3>

            <div className="space-y-2 mb-4 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">{isRTL ? 'التقدم' : 'Progress'}:</span>
                <span className="font-semibold">{course.progress}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{isRTL ? 'النقاط' : 'Score'}:</span>
                <span className="font-semibold">{course.totalScore}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{isRTL ? 'النجوم' : 'Stars'}:</span>
                <span className="font-semibold">{course.totalStars}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{isRTL ? 'المحاولات' : 'Attempts'}:</span>
                <span className="font-semibold">{course.totalAttempts}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{isRTL ? 'الوقت' : 'Time'}:</span>
                <span className="font-semibold">{formatTime(course.totalTime)}</span>
              </div>
            </div>

            <div className="h-32 flex items-center justify-center bg-gray-50 rounded-lg mb-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{course.progress}%</div>
                <div className="text-sm text-gray-600">{isRTL ? 'التقدم' : 'Progress'}</div>
              </div>
            </div>

            <button
              onClick={() => viewCourseDetails(course)}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {isRTL ? 'عرض التفاصيل' : 'View Per Lesson'}
            </button>
          </div>
        ))
      )}
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Plus, List, Code, Type } from 'lucide-react';

export default function InstructorCourseDetailPage() {
  const [course, setCourse] = useState<any>(null);
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddSectionModal, setShowAddSectionModal] = useState(false);
  const [showAddLessonModal, setShowAddLessonModal] = useState(false);
  const [selectedSection, setSelectedSection] = useState<any>(null);
  const [newSectionName, setNewSectionName] = useState('');
  const [newLessonData, setNewLessonData] = useState({
    name: '',
    type: 'text',
    content: '',
    language: 'javascript',
  });
  
  const router = useRouter();
  const params = useParams();
  const courseId = params.id;

  useEffect(() => {
    fetchCourseData();
  }, []);

  const fetchCourseData = async () => {
    try {
      const res = await fetch(`/api/instructor/courses/${courseId}`);
      if (!res.ok) {
        router.push('/instructor/courses');
        return;
      }
      const data = await res.json();
      setCourse(data.course);
      setSections(data.sections || []);
    } catch (error) {
      console.error('Error fetching course:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSection = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/instructor/courses/${courseId}/sections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newSectionName }),
      });
      if (res.ok) {
        setShowAddSectionModal(false);
        setNewSectionName('');
        fetchCourseData();
      }
    } catch (error) {
      console.error('Error adding section:', error);
    }
  };

  const handleAddLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/instructor/courses/${courseId}/lessons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sectionId: selectedSection.id,
          ...newLessonData,
        }),
      });
      if (res.ok) {
        setShowAddLessonModal(false);
        setSelectedSection(null);
        setNewLessonData({ name: '', type: 'text', content: '', language: 'javascript' });
        fetchCourseData();
      }
    } catch (error) {
      console.error('Error adding lesson:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-4">
              <button onClick={() => router.push('/instructor')} className="text-2xl font-bold text-blue-600">
                بَنان
              </button>
              <span className="text-gray-600">Course: {course?.name}</span>
            </div>
            <button
              onClick={() => router.push('/instructor/courses')}
              className="px-4 py-2 text-gray-600 hover:text-gray-900"
            >
              Back to Courses
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">{course?.name}</h2>
            {course?.description && (
              <p className="text-gray-600 mt-2">{course.description}</p>
            )}
          </div>
          <button
            onClick={() => setShowAddSectionModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-5 h-5" />
            Add Section
          </button>
        </div>

        {sections.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No sections yet. Add a section to start creating lessons!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {sections.map((section) => (
              <div key={section.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">{section.name}</h3>
                  <button
                    onClick={() => {
                      setSelectedSection(section);
                      setShowAddLessonModal(true);
                    }}
                    className="flex items-center gap-2 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Add Lesson
                  </button>
                </div>
                
                {section.lessons && section.lessons.length > 0 ? (
                  <div className="space-y-2">
                    {section.lessons.map((lesson: any) => (
                      <div key={lesson.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded">
                        {lesson.type === 'coding' ? (
                          <Code className="w-5 h-5 text-purple-600" />
                        ) : (
                          <Type className="w-5 h-5 text-blue-600" />
                        )}
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{lesson.name}</p>
                          <p className="text-sm text-gray-500">
                            {lesson.type === 'coding' ? `Coding (${lesson.language})` : 'Text'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No lessons in this section yet.</p>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {showAddSectionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Add New Section</h3>
            <form onSubmit={handleAddSection}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Section Name *
                </label>
                <input
                  type="text"
                  value={newSectionName}
                  onChange={(e) => setNewSectionName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddSectionModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add Section
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAddLessonModal && selectedSection && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Add Lesson to: {selectedSection.name}</h3>
            <form onSubmit={handleAddLesson}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lesson Name *
                </label>
                <input
                  type="text"
                  value={newLessonData.name}
                  onChange={(e) => setNewLessonData({ ...newLessonData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lesson Type *
                </label>
                <select
                  value={newLessonData.type}
                  onChange={(e) => setNewLessonData({ ...newLessonData, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="text">Text</option>
                  <option value="coding">Coding</option>
                </select>
              </div>

              {newLessonData.type === 'coding' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Programming Language *
                  </label>
                  <select
                    value={newLessonData.language}
                    onChange={(e) => setNewLessonData({ ...newLessonData, language: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="javascript">JavaScript</option>
                    <option value="python">Python</option>
                    <option value="java">Java</option>
                    <option value="cpp">C++</option>
                  </select>
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content *
                </label>
                <textarea
                  value={newLessonData.content}
                  onChange={(e) => setNewLessonData({ ...newLessonData, content: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  rows={10}
                  required
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddLessonModal(false);
                    setSelectedSection(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add Lesson
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

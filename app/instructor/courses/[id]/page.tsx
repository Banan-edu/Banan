
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Plus, Code, Type, Trash2, Edit2, GripVertical } from 'lucide-react';
import { instructorLinks, Sidebar } from '@/components/Sidebar';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function SortableSection({ section, onEdit, onDelete, onAddLesson, onEditLesson, onDeleteLesson }: any) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `section-${section.id}`, data: { type: 'section', section } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center gap-3 mb-4">
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
          <GripVertical className="w-5 h-5 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 flex-1">{section.name}</h3>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(section)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(section)}
            className="p-2 text-red-600 hover:bg-red-50 rounded"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onAddLesson(section)}
            className="flex items-center gap-2 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
          >
            <Plus className="w-4 h-4" />
            Add Lesson
          </button>
        </div>
      </div>

      {section.lessons && section.lessons.length > 0 ? (
        <SortableContext items={section.lessons.map((l: any) => `lesson-${l.id}`)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {section.lessons.map((lesson: any) => (
              <SortableLesson
                key={lesson.id}
                lesson={lesson}
                onEdit={onEditLesson}
                onDelete={onDeleteLesson}
              />
            ))}
          </div>
        </SortableContext>
      ) : (
        <p className="text-gray-500 text-sm">No lessons in this section yet.</p>
      )}
    </div>
  );
}

function SortableLesson({ lesson, onEdit, onDelete }: any) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `lesson-${lesson.id}`, data: { type: 'lesson', lesson } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-3 p-3 bg-gray-50 rounded">
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
        <GripVertical className="w-4 h-4 text-gray-400" />
      </div>
      {lesson.type === 'coding' ? (
        <Code className="w-5 h-5 text-purple-600" />
      ) : (
        <Type className="w-5 h-5 text-blue-600" />
      )}
      <div className="flex-1">
        <p className="font-medium text-gray-900">{lesson.name}</p>
        <p className="text-sm text-gray-500">
          {lesson.type === 'coding' ? `Coding (${lesson.codeLanguage})` : 'Text'}
        </p>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onEdit(lesson)}
          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
        >
          <Edit2 className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(lesson)}
          className="p-1 text-red-600 hover:bg-red-50 rounded"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default function InstructorCourseDetailPage() {
  const [course, setCourse] = useState<any>(null);
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showAddSectionModal, setShowAddSectionModal] = useState(false);
  const [showAddLessonModal, setShowAddLessonModal] = useState(false);
  const [showEditSectionModal, setShowEditSectionModal] = useState(false);
  const [showEditLessonModal, setShowEditLessonModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<{ type: 'section' | 'lesson'; item: any } | null>(null);
  const [selectedSection, setSelectedSection] = useState<any>(null);
  const [selectedLesson, setSelectedLesson] = useState<any>(null);
  const [newSectionName, setNewSectionName] = useState('');
  const [editSectionName, setEditSectionName] = useState('');
  const [newLessonData, setNewLessonData] = useState({
    name: '',
    type: 'text',
    content: '',
    language: 'javascript',
  });
  const [editLessonData, setEditLessonData] = useState({
    name: '',
    type: 'text',
    content: '',
    language: 'javascript',
  });

  const router = useRouter();
  const params = useParams();
  const courseId = params.id;

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

  const handleEditSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSection) return;

    try {
      const res = await fetch(`/api/instructor/courses/${courseId}/sections/${selectedSection.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editSectionName }),
      });
      if (res.ok) {
        setShowEditSectionModal(false);
        setSelectedSection(null);
        setEditSectionName('');
        fetchCourseData();
      }
    } catch (error) {
      console.error('Error updating section:', error);
    }
  };

  const handleDeleteSection = async () => {
    if (!showDeleteConfirm || showDeleteConfirm.type !== 'section') return;

    try {
      const res = await fetch(`/api/instructor/courses/${courseId}/sections/${showDeleteConfirm.item.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setShowDeleteConfirm(null);
        fetchCourseData();
      }
    } catch (error) {
      console.error('Error deleting section:', error);
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

  const handleEditLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLesson) return;

    try {
      const res = await fetch(`/api/instructor/courses/${courseId}/lessons/${selectedLesson.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editLessonData),
      });
      if (res.ok) {
        setShowEditLessonModal(false);
        setSelectedLesson(null);
        setEditLessonData({ name: '', type: 'text', content: '', language: 'javascript' });
        fetchCourseData();
      }
    } catch (error) {
      console.error('Error updating lesson:', error);
    }
  };

  const handleDeleteLesson = async () => {
    if (!showDeleteConfirm || showDeleteConfirm.type !== 'lesson') return;

    try {
      const res = await fetch(`/api/instructor/courses/${courseId}/lessons/${showDeleteConfirm.item.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setShowDeleteConfirm(null);
        fetchCourseData();
      }
    } catch (error) {
      console.error('Error deleting lesson:', error);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeType = activeId.startsWith('section-') ? 'section' : 'lesson';
    const overType = overId.startsWith('section-') ? 'section' : 'lesson';

    // Section reordering
    if (activeType === 'section' && overType === 'section') {
      const activeSectionId = parseInt(activeId.replace('section-', ''));
      const overSectionId = parseInt(overId.replace('section-', ''));

      const oldIndex = sections.findIndex((s) => s.id === activeSectionId);
      const newIndex = sections.findIndex((s) => s.id === overSectionId);

      const newSections = arrayMove(sections, oldIndex, newIndex);
      setSections(newSections);

      const sectionOrders = newSections.map((section, index) => ({
        id: section.id,
        order: index + 1,
      }));

      try {
        await fetch(`/api/instructor/courses/${courseId}/sections/reorder`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sectionOrders }),
        });
      } catch (error) {
        console.error('Error reordering sections:', error);
        fetchCourseData();
      }
    }

    // Lesson reordering (same or different section)
    if (activeType === 'lesson' && overType === 'lesson') {
      const activeLessonId = parseInt(activeId.replace('lesson-', ''));
      const overLessonId = parseInt(overId.replace('lesson-', ''));

      let sourceSectionIndex = -1;
      let sourceLesson: any = null;
      let sourceLessonIndex = -1;

      for (let i = 0; i < sections.length; i++) {
        const index = sections[i].lessons?.findIndex((l: any) => l.id === activeLessonId);
        if (index !== undefined && index >= 0) {
          sourceSectionIndex = i;
          sourceLessonIndex = index;
          sourceLesson = sections[i].lessons[index];
          break;
        }
      }

      let targetSectionIndex = -1;
      let targetLessonIndex = -1;

      for (let i = 0; i < sections.length; i++) {
        const index = sections[i].lessons?.findIndex((l: any) => l.id === overLessonId);
        if (index !== undefined && index >= 0) {
          targetSectionIndex = i;
          targetLessonIndex = index;
          break;
        }
      }

      if (sourceSectionIndex === -1 || targetSectionIndex === -1) return;

      const newSections = [...sections];

      if (sourceSectionIndex === targetSectionIndex) {
        // Same section reorder
        const newLessons = arrayMove(
          newSections[sourceSectionIndex].lessons,
          sourceLessonIndex,
          targetLessonIndex
        );
        newSections[sourceSectionIndex] = {
          ...newSections[sourceSectionIndex],
          lessons: newLessons,
        };
      } else {
        // Cross-section move
        const sourceLessons = [...newSections[sourceSectionIndex].lessons];
        sourceLessons.splice(sourceLessonIndex, 1);
        newSections[sourceSectionIndex] = {
          ...newSections[sourceSectionIndex],
          lessons: sourceLessons,
        };

        const targetLessons = [...newSections[targetSectionIndex].lessons];
        targetLessons.splice(targetLessonIndex, 0, sourceLesson);
        newSections[targetSectionIndex] = {
          ...newSections[targetSectionIndex],
          lessons: targetLessons,
        };
      }

      setSections(newSections);

      const lessonOrders: any[] = [];
      newSections.forEach((section) => {
        section.lessons?.forEach((lesson: any, index: number) => {
          lessonOrders.push({
            id: lesson.id,
            order: index + 1,
            sectionId: section.id,
          });
        });
      });

      try {
        await fetch(`/api/instructor/courses/${courseId}/lessons/reorder`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lessonOrders }),
        });
      } catch (error) {
        console.error('Error reordering lessons:', error);
        fetchCourseData();
      }
    }
  };

  const allSortableIds = [
    ...sections.map(s => `section-${s.id}`),
    ...sections.flatMap(s => s.lessons?.map((l: any) => `lesson-${l.id}`) || [])
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar links={instructorLinks} userRole="instructor" />

      <main className="flex-1 px-8 py-8">
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
          <DndContext 
            sensors={sensors} 
            collisionDetection={closestCenter} 
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={allSortableIds} strategy={verticalListSortingStrategy}>
              <div className="space-y-6">
                {sections.map((section) => (
                  <SortableSection
                    key={section.id}
                    section={section}
                    onEdit={(s: any) => {
                      setSelectedSection(s);
                      setEditSectionName(s.name);
                      setShowEditSectionModal(true);
                    }}
                    onDelete={(s: any) => setShowDeleteConfirm({ type: 'section', item: s })}
                    onAddLesson={(s: any) => {
                      setSelectedSection(s);
                      setShowAddLessonModal(true);
                    }}
                    onEditLesson={(l: any) => {
                      setSelectedLesson(l);
                      setEditLessonData({
                        name: l.name,
                        type: l.type,
                        content: l.text,
                        language: l.codeLanguage || 'javascript',
                      });
                      setShowEditLessonModal(true);
                    }}
                    onDeleteLesson={(l: any) => setShowDeleteConfirm({ type: 'lesson', item: l })}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
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

      {showEditSectionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Edit Section</h3>
            <form onSubmit={handleEditSection}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Section Name *
                </label>
                <input
                  type="text"
                  value={editSectionName}
                  onChange={(e) => setEditSectionName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditSectionModal(false);
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
                  Update Section
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

      {showEditLessonModal && selectedLesson && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Edit Lesson</h3>
            <form onSubmit={handleEditLesson}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lesson Name *
                </label>
                <input
                  type="text"
                  value={editLessonData.name}
                  onChange={(e) => setEditLessonData({ ...editLessonData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lesson Type *
                </label>
                <select
                  value={editLessonData.type}
                  onChange={(e) => setEditLessonData({ ...editLessonData, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="text">Text</option>
                  <option value="coding">Coding</option>
                </select>
              </div>

              {editLessonData.type === 'coding' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Programming Language *
                  </label>
                  <select
                    value={editLessonData.language}
                    onChange={(e) => setEditLessonData({ ...editLessonData, language: e.target.value })}
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
                  value={editLessonData.content}
                  onChange={(e) => setEditLessonData({ ...editLessonData, content: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  rows={10}
                  required
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditLessonModal(false);
                    setSelectedLesson(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Update Lesson
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this {showDeleteConfirm.type}?
              {showDeleteConfirm.type === 'section' && ' All lessons in this section will also be deleted.'}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={showDeleteConfirm.type === 'section' ? handleDeleteSection : handleDeleteLesson}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

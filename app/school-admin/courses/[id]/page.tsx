
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Plus } from 'lucide-react';
import { schoolAdminLinks, Sidebar } from '@/components/Sidebar';
import ConfirmDeleteModal from '@/components/modals/ConfirmDelete';
import SectionModal from '@/components/courses/lessons/SectionModal';
import LessonModal from '@/components/courses/lessons/LessonModal';
import SortableSection from '@/components/courses/lessons/SortableSection';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

export default function InstructorCourseDetailPage() {
  const [course, setCourse] = useState<any>(null);
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);

  const [showSectionModal, setShowSectionModal] = useState(false);
  const [sectionModalMode, setSectionModalMode] = useState<'add' | 'edit'>('add');
  const [selectedSection, setSelectedSection] = useState<any>(null);

  const [showLessonModal, setShowLessonModal] = useState(false);
  const [lessonModalMode, setLessonModalMode] = useState<'add' | 'edit'>('add');
  const [selectedLesson, setSelectedLesson] = useState<any>(null);

  const [deleteModal, setDeleteModal] = useState<{ type: 'section' | 'lesson'; item: any } | null>(null);

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
      const res = await fetch(`/api/school-admin/courses/${courseId}`);
      if (!res.ok) {
        router.push('/school-admin/courses');
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

  const handleSectionSubmit = async (name: string) => {
    if (sectionModalMode === 'add') {
      const res = await fetch(`/api/school-admin/courses/${courseId}/sections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      if (res.ok) {
        setShowSectionModal(false);
        fetchCourseData();
      }
    } else {
      const res = await fetch(`/api/school-admin/courses/${courseId}/sections/${selectedSection.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      if (res.ok) {
        setShowSectionModal(false);
        setSelectedSection(null);
        fetchCourseData();
      }
    }
  };

  const handleLessonSubmit = async (data: any) => {
    if (lessonModalMode === 'add') {
      const res = await fetch(`/api/school-admin/courses/${courseId}/lessons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sectionId: selectedSection.id,
          ...data,
        }),
      });
      if (res.ok) {
        setShowLessonModal(false);
        setSelectedSection(null);
        fetchCourseData();
      }
    } else {
      const res = await fetch(`/api/school-admin/courses/${courseId}/lessons/${selectedLesson.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        setShowLessonModal(false);
        setSelectedLesson(null);
        fetchCourseData();
      }
    }
  };

  const handleDelete = async () => {
    if (!deleteModal) return;

    if (deleteModal.type === 'section') {
      const res = await fetch(`/api/school-admin/courses/${courseId}/sections/${deleteModal.item.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setDeleteModal(null);
        fetchCourseData();
      }
    } else {
      const res = await fetch(`/api/school-admin/courses/${courseId}/lessons/${deleteModal.item.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setDeleteModal(null);
        fetchCourseData();
      }
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

    if (activeType === 'section' && overType === 'section') {
      const activeSectionId = parseInt(activeId.replace('section-', ''));
      const overSectionId = parseInt(overId.replace('section-', ''));
      const oldIndex = sections.findIndex((s) => s.id === activeSectionId);
      const newIndex = sections.findIndex((s) => s.id === overSectionId);
      const newSections = arrayMove(sections, oldIndex, newIndex);
      setSections(newSections);

      await fetch(`/api/school-admin/courses/${courseId}/sections/reorder`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sectionOrders: newSections.map((section, index) => ({ id: section.id, order: index + 1 })),
        }),
      });
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
      <Sidebar links={schoolAdminLinks} userRole="school-admin" />

      <main className="flex-1 px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">{course?.name}</h2>
            {course?.description && (
              <p className="text-gray-600 mt-2">{course.description}</p>
            )}
          </div>
          <button
            onClick={() => {
              setSectionModalMode('add');
              setShowSectionModal(true);
            }}
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
                      setSectionModalMode('edit');
                      setShowSectionModal(true);
                    }}
                    onDelete={(s: any) => setDeleteModal({ type: 'section', item: s })}
                    onAddLesson={(s: any) => {
                      setSelectedSection(s);
                      setLessonModalMode('add');
                      setShowLessonModal(true);
                    }}
                    onEditLesson={(l: any) => {
                      setSelectedLesson(l);
                      setLessonModalMode('edit');
                      setShowLessonModal(true);
                    }}
                    onDeleteLesson={(l: any) => setDeleteModal({ type: 'lesson', item: l })}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </main>

      <SectionModal
        isOpen={showSectionModal}
        onClose={() => {
          setShowSectionModal(false);
          setSelectedSection(null);
        }}
        onSubmit={handleSectionSubmit}
        initialName={selectedSection?.name || ''}
        mode={sectionModalMode}
      />

      <LessonModal
        isOpen={showLessonModal}
        onClose={() => {
          setShowLessonModal(false);
          setSelectedLesson(null);
          setSelectedSection(null);
        }}
        onSubmit={handleLessonSubmit}
        sectionName={selectedSection?.name || ''}
        initialData={selectedLesson ? {
          name: selectedLesson.name,
          type: selectedLesson.type,
          text: selectedLesson.text,
          language: selectedLesson.codeLanguage,
        } : undefined}
        mode={lessonModalMode}
      />

      <ConfirmDeleteModal
        isOpen={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        onConfirm={handleDelete}
        itemName={deleteModal?.item?.name}
        message={deleteModal?.type === 'section'
          ? 'All lessons in this section will also be deleted.'
          : undefined}
      />
    </div>
  );
}

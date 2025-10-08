
'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Edit2, Trash2, Plus } from 'lucide-react';

import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import SortableLesson from './SortableLesson';

interface SortableSectionProps {
  section: any;
  onEdit: (section: any) => void;
  onDelete: (section: any) => void;
  onAddLesson: (section: any) => void;
  onEditLesson: (lesson: any) => void;
  onDeleteLesson: (lesson: any) => void;
}

export default function SortableSection({
  section,
  onEdit,
  onDelete,
  onAddLesson,
  onEditLesson,
  onDeleteLesson,
}: SortableSectionProps) {
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

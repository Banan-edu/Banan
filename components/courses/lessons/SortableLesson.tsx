
'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Code, Type, Edit2, Trash2 } from 'lucide-react';

interface SortableLessonProps {
  lesson: any;
  onEdit: (lesson: any) => void;
  onDelete: (lesson: any) => void;
}

export default function SortableLesson({ lesson, onEdit, onDelete }: SortableLessonProps) {
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

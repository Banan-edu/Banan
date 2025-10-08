
'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

interface LessonFormData {
  name: string;
  type: 'text' | 'coding';
  content: string;
  language?: string;
  objective?: string;
  disableBackspace?: boolean;
  blockOnError?: boolean;
  useMeaningfulWords?: boolean;
  isPlacementTest?: boolean;
  goalSpeed?: number;
  minSpeed?: number;
  minAccuracy?: number;
  targetScore?: number;
  timeLimit?: number;
  instructions?: Array<{
    titleTag?: string;
    slideTitle?: string;
    content?: string;
    highlightChar?: string;
    mediaUrl?: string;
    audioPath?: string;
  }>;
}

interface LessonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: LessonFormData) => Promise<void>;
  sectionName: string;
  initialData?: Partial<LessonFormData>;
  mode: 'add' | 'edit';
}

export default function LessonModal({
  isOpen,
  onClose,
  onSubmit,
  sectionName,
  initialData,
  mode,
}: LessonModalProps) {
  const [formData, setFormData] = useState<LessonFormData>({
    name: initialData?.name || '',
    type: initialData?.type || 'text',
    content: initialData?.content || '',
    language: initialData?.language || 'javascript',
    objective: initialData?.objective || '',
    disableBackspace: initialData?.disableBackspace || false,
    blockOnError: initialData?.blockOnError || false,
    useMeaningfulWords: initialData?.useMeaningfulWords || true,
    isPlacementTest: initialData?.isPlacementTest || false,
    goalSpeed: initialData?.goalSpeed || 20,
    minSpeed: initialData?.minSpeed || 3,
    minAccuracy: initialData?.minAccuracy || 80,
    targetScore: initialData?.targetScore || 1000,
    timeLimit: initialData?.timeLimit || 10,
    instructions: initialData?.instructions || [],
  });

  const [activeTab, setActiveTab] = useState<'basic' | 'settings' | 'goals' | 'instructions'>('basic');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(formData);
    } finally {
      setLoading(false);
    }
  };

  const addInstruction = () => {
    setFormData({
      ...formData,
      instructions: [
        ...(formData.instructions || []),
        { slideTitle: '', content: '' },
      ],
    });
  };

  const updateInstruction = (index: number, field: string, value: string) => {
    const newInstructions = [...(formData.instructions || [])];
    newInstructions[index] = { ...newInstructions[index], [field]: value };
    setFormData({ ...formData, instructions: newInstructions });
  };

  const removeInstruction = (index: number) => {
    setFormData({
      ...formData,
      instructions: formData.instructions?.filter((_, i) => i !== index),
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-xl font-bold">
            {mode === 'add' ? `Add Lesson to: ${sectionName}` : 'Edit Lesson'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex border-b">
          {['basic', 'settings', 'goals', 'instructions'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-6 py-3 font-medium capitalize ${
                activeTab === tab
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          {activeTab === 'basic' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lesson Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lesson Objective
                </label>
                <textarea
                  value={formData.objective}
                  onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={2}
                  placeholder="Simply complete the lesson / Meet performance goals"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lesson Type *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'text' | 'coding' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="text">Text</option>
                  <option value="coding">Coding</option>
                </select>
              </div>

              {formData.type === 'coding' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Programming Language *
                  </label>
                  <select
                    value={formData.language}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="javascript">JavaScript</option>
                    <option value="python">Python</option>
                    <option value="java">Java</option>
                    <option value="cpp">C++</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content *
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  rows={10}
                  required
                />
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 mb-3">Lesson Settings</h4>
              
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.disableBackspace}
                  onChange={(e) => setFormData({ ...formData, disableBackspace: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Disable backspace on this lesson</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.blockOnError}
                  onChange={(e) => setFormData({ ...formData, blockOnError: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Block students on error</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.useMeaningfulWords}
                  onChange={(e) => setFormData({ ...formData, useMeaningfulWords: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Lesson includes meaningful words</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isPlacementTest}
                  onChange={(e) => setFormData({ ...formData, isPlacementTest: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">This lesson is a placement test</span>
              </label>
            </div>
          )}

          {activeTab === 'goals' && (
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 mb-3">Performance Goals</h4>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Goal Speed (wpm)
                  </label>
                  <input
                    type="number"
                    value={formData.goalSpeed}
                    onChange={(e) => setFormData({ ...formData, goalSpeed: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Speed (wpm)
                  </label>
                  <input
                    type="number"
                    value={formData.minSpeed}
                    onChange={(e) => setFormData({ ...formData, minSpeed: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Accuracy (%)
                  </label>
                  <input
                    type="number"
                    value={formData.minAccuracy}
                    onChange={(e) => setFormData({ ...formData, minAccuracy: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Score (points)
                  </label>
                  <input
                    type="number"
                    value={formData.targetScore}
                    onChange={(e) => setFormData({ ...formData, targetScore: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time Limit (min)
                  </label>
                  <input
                    type="number"
                    value={formData.timeLimit}
                    onChange={(e) => setFormData({ ...formData, timeLimit: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'instructions' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-900">Lesson Instructions</h4>
                <button
                  type="button"
                  onClick={addInstruction}
                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                >
                  Add Slide
                </button>
              </div>

              {formData.instructions?.map((instruction, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm text-gray-700">Slide {index + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeInstruction(index)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  </div>

                  <input
                    type="text"
                    value={instruction.titleTag || ''}
                    onChange={(e) => updateInstruction(index, 'titleTag', e.target.value)}
                    placeholder="Title Tag (Optional)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />

                  <input
                    type="text"
                    value={instruction.slideTitle || ''}
                    onChange={(e) => updateInstruction(index, 'slideTitle', e.target.value)}
                    placeholder="Slide Title"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />

                  <textarea
                    value={instruction.content || ''}
                    onChange={(e) => updateInstruction(index, 'content', e.target.value)}
                    placeholder="Instruction content here"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    rows={3}
                  />

                  <input
                    type="text"
                    value={instruction.highlightChar || ''}
                    onChange={(e) => updateInstruction(index, 'highlightChar', e.target.value)}
                    placeholder="Character to highlight on keyboard (Optional)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />

                  <input
                    type="text"
                    value={instruction.mediaUrl || ''}
                    onChange={(e) => updateInstruction(index, 'mediaUrl', e.target.value)}
                    placeholder="Image/Youtube URL (Optional)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />

                  <input
                    type="text"
                    value={instruction.audioPath || ''}
                    onChange={(e) => updateInstruction(index, 'audioPath', e.target.value)}
                    placeholder="Audio instruction mp3 file path (Optional)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              ))}

              {(!formData.instructions || formData.instructions.length === 0) && (
                <p className="text-gray-500 text-center py-4">No instructions added yet</p>
              )}
            </div>
          )}

          <div className="flex gap-3 mt-6 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : mode === 'add' ? 'Add Lesson' : 'Update Lesson'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { Sidebar, adminLinks } from '@/components/Sidebar';

const GRADES = [
  'unassigned',
  '1st Grade',
  '2nd Grade',
  '3rd Grade',
  '4th Grade',
  '5th Grade',
  '6th Grade',
  '7th Grade',
  '8th Grade',
  '9th Grade',
  '10th Grade',
  '11th Grade',
  '12th Grade',
];

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function EditClassPage() {
  const router = useRouter();
  const params = useParams();
  const { isRTL } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [instructors, setInstructors] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [classData, setClassData] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    grade: 'unassigned',
    instructorIds: [] as number[],
    courseIds: [] as number[],
    startOfWeek: 'sunday',
    minStarsToPass: 3,
    dailyGoal: 10,
    weeklyGoal: 50,
    scoreboardVisibility: 'public',
    disableBackspace: false,
    blockOnError: false,
    lockVirtualKeyboard: false,
    lockLanguage: false,
    lockHands: false,
    soundFx: true,
    voiceOver: false,
    showReplayButton: true,
    allowJumpAhead: false,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch class data
      const classRes = await fetch(`/api/admin/classes/${params.id}/edit`);
      if (!classRes.ok) {
        router.push('/admin/classes');
        return;
      }
      const classInfo = await classRes.json();
      setClassData(classInfo);

      // Fetch instructors
      const instructorsRes = await fetch('/api/admin/instructors?role=instructor');
      if (instructorsRes.ok) {
        const instructorsData = await instructorsRes.json();
        setInstructors(instructorsData.instructors || []);
      }

      // Fetch courses
      const coursesRes = await fetch('/api/admin/courses');
      if (coursesRes.ok) {
        const coursesData = await coursesRes.json();
        setCourses(coursesData.courses || []);
      }

      // Set form data with existing values
      setFormData({
        name: classInfo.name || '',
        description: classInfo.description || '',
        grade: classInfo.grade || 'unassigned',
        instructorIds: classInfo.instructorIds || [],
        courseIds: classInfo.courseIds || [],
        startOfWeek: classInfo.startOfWeek || 'sunday',
        minStarsToPass: classInfo.minStarsToPass || 3,
        dailyGoal: classInfo.dailyGoal || 10,
        weeklyGoal: classInfo.weeklyGoal || 50,
        scoreboardVisibility: classInfo.scoreboardVisibility || 'public',
        disableBackspace: classInfo.disableBackspace || false,
        blockOnError: classInfo.blockOnError || false,
        lockVirtualKeyboard: classInfo.lockVirtualKeyboard || false,
        lockLanguage: classInfo.lockLanguage || false,
        lockHands: classInfo.lockHands || false,
        soundFx: classInfo.soundFx !== false,
        voiceOver: classInfo.voiceOver || false,
        showReplayButton: classInfo.showReplayButton !== false,
        allowJumpAhead: classInfo.allowJumpAhead || false,
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load class data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const res = await fetch(`/api/admin/classes/${params.id}/edit`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        router.push(`/admin/classes/${params.id}`);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to update class');
      }
    } catch (error) {
      console.error('Error updating class:', error);
      setError('Failed to update class');
    } finally {
      setSaving(false);
    }
  };

  const handleMultiSelect = (field: 'instructorIds' | 'courseIds', id: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(id)
        ? prev[field].filter(i => i !== id)
        : [...prev[field], id]
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar links={adminLinks} userRole="admin" />

      <main className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Edit Class</h1>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-xl shadow-md p-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Class Name *
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
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Grade
                </label>
                <select
                  value={formData.grade}
                  onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {GRADES.map(grade => (
                    <option key={grade} value={grade}>{grade}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Instructors
                </label>
                <div className="border border-gray-300 rounded-lg p-3 max-h-40 overflow-y-auto">
                  {instructors.map(instructor => (
                    <label key={instructor.id} className="flex items-center space-x-2 py-1">
                      <input
                        type="checkbox"
                        checked={formData.instructorIds.includes(instructor.id)}
                        onChange={() => handleMultiSelect('instructorIds', instructor.id)}
                        className="rounded border-gray-300"
                      />
                      <span>{instructor.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Courses
                </label>
                <div className="border border-gray-300 rounded-lg p-3 max-h-40 overflow-y-auto">
                  {courses.map(course => (
                    <label key={course.id} className="flex items-center space-x-2 py-1">
                      <input
                        type="checkbox"
                        checked={formData.courseIds.includes(course.id)}
                        onChange={() => handleMultiSelect('courseIds', course.id)}
                        className="rounded border-gray-300"
                      />
                      <span>{course.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Practice Settings */}
            <div className="space-y-4 border-t pt-6">
              <h2 className="text-xl font-semibold text-gray-900">Practice Settings</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start of Week
                </label>
                <select
                  value={formData.startOfWeek}
                  onChange={(e) => setFormData({ ...formData, startOfWeek: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {DAYS_OF_WEEK.map(day => (
                    <option key={day} value={day.toLowerCase()}>{day}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Stars to Pass (1-5)
                </label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={formData.minStarsToPass}
                  onChange={(e) => setFormData({ ...formData, minStarsToPass: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Daily Practice Goal (minutes)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.dailyGoal}
                  onChange={(e) => setFormData({ ...formData, dailyGoal: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Weekly Practice Goal (minutes)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.weeklyGoal}
                  onChange={(e) => setFormData({ ...formData, weeklyGoal: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Scoreboard Visibility
                </label>
                <select
                  value={formData.scoreboardVisibility}
                  onChange={(e) => setFormData({ ...formData, scoreboardVisibility: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="public">Students see each other&apos;s scores</option>
                  <option value="private">Private scores</option>
                  <option value="leaderboard">Leaderboard only</option>
                </select>
              </div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.disableBackspace}
                  onChange={(e) => setFormData({ ...formData, disableBackspace: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <span>Disable Backspace</span>
              </label>
            </div>

            {/* Student Controls */}
            <div className="space-y-4 border-t pt-6">
              <h2 className="text-xl font-semibold text-gray-900">Student Controls</h2>


              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.blockOnError}
                  onChange={(e) => setFormData({ ...formData, blockOnError: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <span>Block on Error</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.lockVirtualKeyboard}
                  onChange={(e) => setFormData({ ...formData, lockVirtualKeyboard: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <span>Lock Virtual Keyboard</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.lockLanguage}
                  onChange={(e) => setFormData({ ...formData, lockLanguage: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <span>Lock Keyboard Language/Layout</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.lockHands}
                  onChange={(e) => setFormData({ ...formData, lockHands: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <span>Lock Virtual Hands</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.soundFx}
                  onChange={(e) => setFormData({ ...formData, soundFx: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <span>Enable Sound FX</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.voiceOver}
                  onChange={(e) => setFormData({ ...formData, voiceOver: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <span>Enable Voice-Over</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={!formData.showReplayButton}
                  onChange={(e) => setFormData({ ...formData, showReplayButton: !e.target.checked })}
                  className="rounded border-gray-300"
                />
                <span>Prevent Replay Button Usage</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.allowJumpAhead}
                  onChange={(e) => setFormData({ ...formData, allowJumpAhead: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <span>Allow Student to jump Ahead</span>
              </label>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-6">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={() => router.push(`/admin/classes/${params.id}`)}
                className="flex-1 px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

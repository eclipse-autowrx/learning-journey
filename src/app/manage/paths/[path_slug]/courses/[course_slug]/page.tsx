'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { showToast } from '@/lib/utils/notifications';
import Btn from '@/app/components/atom/Btn';
import VideoLesson from '@/app/components/lessons/VideoLesson';
import TextMarkdownLesson from '@/app/components/lessons/TextMarkdownLesson';
import TextMarkdownEditor from '@/app/components/lessons/TextMarkdownEditor';
import QuizLesson from '@/app/components/lessons/QuizLesson';
import InteractiveLesson from '@/app/components/lessons/InteractiveLesson';
import UnknownLessonViewer from '@/app/components/lessons/UnknownLessonViewer';
import UnknownLessonEditor from '@/app/components/lessons/UnknownLessonEditor';
import VideoLessonEditor from '@/app/components/lessons/VideoLessonEditor';
import {
  FaGraduationCap,
  FaBook,
  FaPlus,
  FaEdit,
  FaTrash,
  FaArrowLeft,
  FaArrowRight,
  FaEllipsisV,
  FaCog,
  FaList,
  FaSave,
  FaTimes
} from 'react-icons/fa';

interface Course {
  _id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  state: string;
  total_lessons: number;
  duration: number;
  icon: string;
  top_icon: string;
  image?: string;
  enrollment_count: number;
  completion_count: number;
  created_at: string;
  updated_at: string;
}

interface Lesson {
  _id: string;
  name: string;
  slug: string;
  description: string;
  lesson_type: string;
  state: string;
  duration: number;
  created_at: string;
}

export default function CourseDetailPage() {
  const params = useParams();
  const pathSlug = params?.path_slug as string;
  const courseSlug = params?.course_slug as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedLessonSlug, setSelectedLessonSlug] = useState<string | null>(null);
  const [lessonDetailTab, setLessonDetailTab] = useState<'info' | 'view' | 'edit'>('info');
  const [editableLesson, setEditableLesson] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'info' | 'lessons'>('info');
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // Edit mode states
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    category: '',
    duration: 0,
    icon: '',
    top_icon: '',
    image: ''
  });

  // Add state for showLessonModal, lessonForm, and selectedLessons
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [lessonForm, setLessonForm] = useState({
    name: '',
    description: '',
    lesson_type: 'text-markdown',
    state: 'draft'
  });
  const [selectedLessons, setSelectedLessons] = useState<string[]>([]);

  useEffect(() => {
    fetchCourseData();
  }, [courseSlug]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.dropdown-container')) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchCourseData = async () => {
    try {
      const [courseRes, lessonsRes] = await Promise.all([
        fetch(`/api/courses/${courseSlug}`),
        fetch(`/api/courses/${courseSlug}/lessons`)
      ]);

      const courseData = await courseRes.json();
      const lessonsData = await lessonsRes.json();

      if (courseData.success) {
        setCourse(courseData.data);
        // Set edit form with current data
        setEditForm({
          name: courseData.data.name || '',
          description: courseData.data.description || '',
          category: courseData.data.category || '',
          duration: courseData.data.duration || 0,
          icon: courseData.data.icon || '',
          top_icon: courseData.data.top_icon || '',
          image: courseData.data.image || ''
        });
      }
      if (lessonsData.success) {
        setLessons(lessonsData.data);
        if (!selectedLessonSlug && lessonsData.data.length > 0) {
          setSelectedLessonSlug(lessonsData.data[0].slug);
          setEditableLesson(lessonsData.data[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching course data:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectedLesson: Lesson | null = selectedLessonSlug
    ? lessons.find(l => l.slug === selectedLessonSlug) || null
    : null;

  useEffect(() => {
    if (selectedLesson) {
      setEditableLesson(selectedLesson);
      setLessonDetailTab('info');
    }
  }, [selectedLessonSlug]);

  const hasLessonChanges = useMemo(() => {
    if (!selectedLesson || !editableLesson) return false;
    const base: any = selectedLesson;
    const edited: any = editableLesson;
    const pick = (obj: any) => ({
      name: obj.name,
      slug: obj.slug,
      lesson_type: obj.lesson_type,
      duration: obj.duration,
      description: obj.description,
      markdown_content: obj.markdown_content,
      video_url: obj.video_url,
      video_provider: obj.video_provider,
      video_duration: obj.video_duration,
      quiz_questions: obj.quiz_questions,
      sequence: obj.sequence,
    });
    try {
      return JSON.stringify(pick(base)) !== JSON.stringify(pick(edited));
    } catch {
      return true;
    }
  }, [selectedLesson, editableLesson]);

  const mapLessonForRender = (lesson: Lesson) => {
    // Adapt minimal lesson shape to renderer expectations
    const common: any = {
      ...lesson,
      name: lesson.name,
      description: lesson.description || '',
      slug: lesson.slug,
      completion_criteria: 'view'
    };
    switch (lesson.lesson_type) {
      case 'video':
        return {
          ...common,
          video_url: (lesson as any).video_url || '',
          video_duration: (lesson as any).video_duration || lesson.duration * 60 || 0,
          video_provider: (lesson as any).video_provider || 'youtube',
        };
      case 'text-markdown':
        return {
          ...common,
          markdown_content: (lesson as any).markdown_content || '',
        };
      case 'quiz':
        return {
          ...common,
          quiz_questions: (lesson as any).quiz_questions || [],
          passing_score: (lesson as any).passing_score || 70,
          max_attempts: (lesson as any).max_attempts || 3,
        };
      case 'interactive':
        return {
          ...common,
          sequence: (lesson as any).sequence || undefined,
          context: (lesson as any).context || undefined,
        };
      default:
        return common;
    }
  };

  function VideoLessonEditor({ value, onChange }: { value: any, onChange: (v: any) => void }) {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Video URL</label>
          <input className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            value={value.video_url || ''}
            onChange={e => onChange({ ...value, video_url: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Provider</label>
          <input className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            value={value.video_provider || ''}
            onChange={e => onChange({ ...value, video_provider: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Duration (minutes)</label>
          <input type="number" className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            value={Math.max(0, Math.floor((value.video_duration || 0) / 60))}
            onChange={e => onChange({ ...value, video_duration: Number(e.target.value) * 60 })} />
        </div>
      </div>
    );
  }


  function QuizLessonEditor({ value, onChange }: { value: any, onChange: (v: any) => void }) {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Quiz JSON</label>
        <textarea rows={16}
          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm font-mono"
          value={JSON.stringify(value.quiz_questions || [], null, 2)}
          onChange={e => {
            try { const arr = JSON.parse(e.target.value); onChange({ ...value, quiz_questions: arr }); } catch { }
          }} />
      </div>
    );
  }

  function InteractiveLessonEditor({ value, onChange }: { value: any, onChange: (v: any) => void }) {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Sequence JSON</label>
        <textarea rows={16}
          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm font-mono"
          value={JSON.stringify(value.sequence || {}, null, 2)}
          onChange={e => {
            try { const obj = JSON.parse(e.target.value); onChange({ ...value, sequence: obj }); } catch { }
          }} />
      </div>
    );
  }

  const getStateColor = (state: string) => {
    switch (state) {
      case 'published':
        return 'bg-blue-100 text-blue-800';
      case 'draft':
        return 'bg-blue-100 text-blue-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getLessonTypeColor = (type: string) => {
    switch (type) {
      case 'video':
        return 'bg-red-100 text-red-800';
      case 'text-markdown':
        return 'bg-blue-100 text-blue-800';
      case 'quiz':
        return 'bg-purple-100 text-purple-800';
      case 'interactive':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  // Course edit handlers
  const handleSave = async () => {
    try {
      const response = await fetch(`/api/courses/${courseSlug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        showToast.success('Course updated successfully');
        setIsEditing(false);
        fetchCourseData(); // Refresh data
      } else {
        const error = await response.json();
        showToast.error(`Error: ${error.error || 'Failed to update course'}`);
      }
    } catch (error) {
      console.error('Error updating course:', error);
      showToast.error('Failed to update course');
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    if (course) {
      setEditForm({
        name: course.name || '',
        description: course.description || '',
        category: course.category || '',
        duration: course.duration || 0,
        icon: course.icon || '',
        top_icon: course.top_icon || '',
        image: course.image || ''
      });
    }
  };

  // Add openCreateLesson and handleLessonSubmit
  const openCreateLesson = () => {
    setLessonForm({ name: '', description: '', lesson_type: 'text-markdown', state: 'draft' });
    setShowLessonModal(true);
  };

  const handleLessonSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // 1. Create lesson
      const lessonRes = await fetch('/api/lessons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lessonForm)
      });
      const lessonData = await lessonRes.json();
      if (!lessonData.success) throw new Error(lessonData.error || 'Failed to create lesson');
      const newLesson = lessonData.data;
      // 2. Add lesson to course
      await fetch(`/api/courses/${courseSlug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ $push: { lessons: newLesson._id } })
      });
      showToast.success('Lesson created and added to course');
      setShowLessonModal(false);
      fetchCourseData();
    } catch (err: any) {
      showToast.error(err?.message || 'Failed to create lesson');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading course details...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaGraduationCap className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Course not found</h3>
          <p className="mt-1 text-sm text-gray-500">
            The course you're looking for doesn't exist.
          </p>
          <div className="mt-6">
            <Link
              href={`/manage/paths/${pathSlug}`}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <FaArrowLeft className="mr-2 h-4 w-4" />
              Back to Path
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Link
                href={`/manage/paths/${pathSlug}`}
                className="mr-4 inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <FaArrowLeft className="mr-2 h-4 w-4" />
                Back to Path
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{course.name}</h1>
                <p className="mt-1 text-sm text-gray-500">{course.slug}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">State:</span>
              <select
                value={course.state}
                onChange={async (e) => {
                  try {
                    const res = await fetch(`/api/courses/${courseSlug}`, {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ state: e.target.value })
                    });
                    const data = await res.json();
                    if (data.success) {
                      setCourse(prev => prev ? { ...prev, state: e.target.value } : null);
                      showToast.success('Course state updated successfully');
                    } else {
                      showToast.error(data.error || 'Failed to update course state');
                    }
                  } catch (error) {
                    showToast.error('Failed to update course state');
                  }
                }}
                className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="draft">draft</option>
                <option value="published">published</option>
                <option value="archived">archived</option>
              </select>
              <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStateColor(course.state)}`}>{course.state}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="bg-white shadow rounded-lg">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('info')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'info'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                <FaCog className="inline mr-2 h-4 w-4" />
                Course Information
              </button>
              <button
                onClick={() => setActiveTab('lessons')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'lessons'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                <FaList className="inline mr-2 h-4 w-4" />
                Lessons ({lessons.length})
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'info' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
                  <div className="flex items-center space-x-3">
                    {isEditing ? (
                      <>
                        <Btn onClick={handleSave}>
                          <FaSave className="mr-2 h-4 w-4" />
                          Save
                        </Btn>
                        <Btn variant="outlined" onClick={handleCancelEdit}>
                          <FaTimes className="mr-2 h-4 w-4" />
                          Cancel
                        </Btn>
                      </>
                    ) : (
                      <Btn onClick={() => setIsEditing(true)}>
                        <FaEdit className="mr-2 h-4 w-4" />
                        Edit Course
                      </Btn>
                    )}
                  </div>
                </div>
                <div className="flex gap-8">
                  {/* Basic Information */}
                  <div className="flex-1">
                    <dl className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <dt className="text-sm font-medium text-gray-700 mb-2">Name</dt>
                          {isEditing ? (
                            <input
                              type="text"
                              value={editForm.name}
                              onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                              className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                          ) : (
                            <dd className="text-sm text-gray-900">{course.name}</dd>
                          )}
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-700 mb-2">Slug</dt>
                          <dd className="text-sm text-gray-500 font-mono">{course.slug}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-700 mb-2">Category</dt>
                          {isEditing ? (
                            <input
                              type="text"
                              value={editForm.category}
                              onChange={(e) => setEditForm({...editForm, category: e.target.value})}
                              className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                          ) : (
                            <dd className="text-sm text-gray-900">{course.category || '-'}</dd>
                          )}
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-700 mb-2">Duration</dt>
                          {isEditing ? (
                            <input
                              type="number"
                              value={editForm.duration}
                              onChange={(e) => setEditForm({...editForm, duration: Number(e.target.value)})}
                              className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Duration in minutes"
                            />
                          ) : (
                            <dd className="text-sm text-gray-900">{course.duration ? formatDuration(course.duration) : '-'}</dd>
                          )}
                        </div>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-700 mb-2">Description</dt>
                        {isEditing ? (
                          <textarea
                            value={editForm.description}
                            onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                            rows={4}
                            className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          />
                        ) : (
                          <dd className="text-sm text-gray-900">{course.description}</dd>
                        )}
                      </div>
                    </dl>
                  </div>
                  {/* Course Image */}
                  <div className="w-[300px] flex-shrink-0">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-gray-900">Image</h3>
                      {!isEditing && (
                        <Btn variant="link">
                          <FaEdit className="mr-1.5 h-3.5 w-3.5" />
                          {course.image ? 'Change Image' : 'Upload Image'}
                        </Btn>
                      )}
                    </div>
                    <div className="space-y-4">
                      {isEditing ? (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
                          <input
                            type="url"
                            value={editForm.image}
                            onChange={(e) => setEditForm({...editForm, image: e.target.value})}
                            className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            placeholder="https://example.com/image.jpg"
                          />
                          {editForm.image && (
                            <div className="mt-3">
                              <img
                                src={editForm.image}
                                alt="Preview"
                                className="w-[300px] h-[200px] object-cover rounded-lg border border-gray-200"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            </div>
                          )}
                        </div>
                      ) : (
                        <>
                          {course.image ? (
                            <div>
                              <img
                                src={course.image}
                                alt={course.name}
                                className="w-[300px] h-[300px] object-cover rounded-lg border border-gray-200"
                              />
                            </div>
                          ) : (
                            <div className="w-[300px] h-[300px] border-2 border-dashed border-gray-300 rounded-lg text-center flex items-center justify-center">
                              <div>
                                <FaBook className="mx-auto h-12 w-12 text-gray-400" />
                                <p className="mt-2 text-sm text-gray-500">No image uploaded</p>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'lessons' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Lessons</h3>
                  <Btn onClick={openCreateLesson}>
                    <FaPlus className="mr-2 h-4 w-4" />
                    Add Lesson
                  </Btn>
                </div>

                {lessons.length === 0 ? (
                  <div className="text-center py-12">
                    <FaBook className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No lessons</h3>
                    <p className="mt-1 text-sm text-gray-500">This course doesn't have any lessons yet.</p>
                  </div>
                ) : (
                  <div className="flex gap-6">
                    {/* Left: lesson list */}
                    <div className="w-[320px] min-w-[320px]">
                      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                        <ul className="divide-y divide-gray-200">
                          {lessons.map((l: any, index: number) => (
                            <li
                              key={l._id}
                              className={`p-4 cursor-pointer ${selectedLessonSlug === l.slug ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                              onClick={() => setSelectedLessonSlug(l.slug)}
                            >
                              <div className="flex flex-col items-start space-y-1">
                                <div className="text-sm font-medium text-gray-900">{index + 1}. {l.name}</div>
                                <span className={`inline-flex px-2 py-0.5 text-[10px] font-semibold rounded-full ${getLessonTypeColor(l.lesson_type)}`}>
                                  {l.lesson_type}
                                </span>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Right: view/edit tabs with render and editor side-by-side */}
                    <div className="flex-1">
                      {!selectedLesson ? (
                        <div className="h-full flex items-center justify-center text-gray-500">Select a lesson to view/edit</div>
                      ) : (
                        <div className="bg-white border border-gray-200 rounded-lg">
                          <div className="border-b border-gray-200 flex items-center justify-between">
                            <div className="flex">
                              <button onClick={() => setLessonDetailTab('info')} 
                                className={`px-4 py-2 text-sm font-medium ${lessonDetailTab === 'info' ? 'text-blue-600 border-b-2 border-blue-500' : 'text-gray-600'}`}>
                                  Lesson Info</button>
                              <button onClick={() => setLessonDetailTab('view')} 
                                className={`px-4 py-2 text-sm font-medium ${lessonDetailTab === 'view' ? 'text-blue-600 border-b-2 border-blue-500' : 'text-gray-600'}`}>
                                  Content</button>
                              <button onClick={() => setLessonDetailTab('edit')} 
                                className={`px-4 py-2 text-sm font-medium ${lessonDetailTab === 'edit' ? 'text-blue-600 border-b-2 border-blue-500' : 'text-gray-600'}`}>
                                  Edit Content</button>
                            </div>
                            <div className="px-4 py-2">
                              <button
                                disabled={!hasLessonChanges}
                                className={`inline-flex items-center px-4 py-1.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${hasLessonChanges ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-300 cursor-not-allowed'}`}
                                onClick={async () => {
                                  try {
                                    const originalSlug = selectedLesson?.slug;
                                    const res = await fetch(`/api/lessons/${originalSlug}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editableLesson) });
                                    const data = await res.json();
                                    if (data.success) {
                                      setLessons(prev => prev.map(l => l.slug === originalSlug ? { ...l, ...editableLesson } as any : l));
                                      setSelectedLessonSlug(editableLesson.slug || originalSlug);
                                    } else {
                                      showToast.error(data.error || 'Failed to save lesson');
                                    }
                                  } catch (err: any) { showToast.error(err?.message || 'Failed to save lesson'); }
                                }}
                              >
                                Save Changes
                              </button>
                            </div>
                          </div>

                          <div className="p-4">
                            {lessonDetailTab === 'info' && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700">Name</label>
                                    <input className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm" value={(editableLesson?.name) || ''} onChange={(e) => setEditableLesson((p: any) => ({ ...p, name: e.target.value }))} />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700">Slug</label>
                                    <input className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm" value={(editableLesson?.slug) || ''} onChange={(e) => setEditableLesson((p: any) => ({ ...p, slug: e.target.value }))} />
                                  </div>
                                  {/* <div>
                                    <label className="block text-sm font-medium text-gray-700">Type</label>
                                    <select className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm" value={(editableLesson?.lesson_type)||''} onChange={(e)=> setEditableLesson((p:any)=> ({...p, lesson_type: e.target.value}))}>
                                      <option value="text-markdown">text-markdown</option>
                                      <option value="video">video</option>
                                      <option value="quiz">quiz</option>
                                      <option value="interactive">interactive</option>
                                    </select>
                                  </div> */}
                                  {/* <div>
                                    <label className="block text-sm font-medium text-gray-700">Duration (minutes)</label>
                                    <input type="number" className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm" value={(editableLesson?.duration)||0} onChange={(e)=> setEditableLesson((p:any)=> ({...p, duration: Number(e.target.value)}))} />
                                  </div> */}
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700">Description</label>
                                  <textarea rows={4} className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm" value={(editableLesson?.description) || ''} onChange={(e) => setEditableLesson((p: any) => ({ ...p, description: e.target.value }))} />
                                </div>
                                {/* Save moved to header */}
                              </div>
                            )}

                            {lessonDetailTab === 'view' && (
                              <div>
                                {(() => {
                                  const adapted = mapLessonForRender(editableLesson as Lesson);
                                  switch (editableLesson?.lesson_type) {
                                    case 'video':
                                      return <VideoLesson lesson={adapted as any} onComplete={() => { }} />
                                    case 'text-markdown':
                                      return <TextMarkdownLesson lesson={adapted as any} onSumbitLesson={() => { }} onCloseRequest={() => { }} />
                                    case 'quiz':
                                      return <QuizLesson lesson={adapted as any} onSumbitLesson={() => { }} onCloseRequest={() => { }} />
                                    case 'interactive':
                                      return <InteractiveLesson lesson={adapted as any} onSumbitLesson={() => { }} onCloseRequest={() => { }} />
                                    default:
                                      return <UnknownLessonViewer lesson={adapted as any} />
                                  }
                                })()}
                              </div>
                            )}

                            {lessonDetailTab === 'edit' && (
                              <div>
                                {(() => {
                                  const adapted = mapLessonForRender(editableLesson as Lesson);
                                  const onChange = (v: any) => setEditableLesson((prev: any) => ({ ...prev, ...v }));
                                  switch (editableLesson?.lesson_type) {
                                    case 'video':
                                      return <VideoLessonEditor value={adapted} onChange={onChange} />
                                    case 'text-markdown':
                                      return <TextMarkdownEditor value={adapted} onChange={onChange} />
                                    case 'quiz':
                                      return <QuizLessonEditor value={adapted} onChange={onChange} />
                                    case 'interactive':
                                      return <InteractiveLessonEditor value={adapted} onChange={onChange} />
                                    default:
                                      return <UnknownLessonEditor value={adapted} onChange={onChange} />
                                  }
                                })()}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add modal UI for lesson creation */}
      {showLessonModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Create Lesson</h3>
              <form onSubmit={handleLessonSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name *</label>
                  <input type="text" required value={lessonForm.name} onChange={e => setLessonForm(f => ({ ...f, name: e.target.value }))} className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea value={lessonForm.description} onChange={e => setLessonForm(f => ({ ...f, description: e.target.value }))} rows={3} className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Lesson Type *</label>
                  <select value={lessonForm.lesson_type} onChange={e => setLessonForm(f => ({ ...f, lesson_type: e.target.value }))} className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                    <option value="text-markdown">Text Markdown</option>
                    <option value="video">Video</option>
                    <option value="quiz">Quiz</option>
                    <option value="interactive">Interactive</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <Btn variant="outlined" onClick={() => setShowLessonModal(false)} type="button">Cancel</Btn>
                  <Btn type="submit">Create Lesson</Btn>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Checkboxes and Delete Selected button */}
      {lessons.length > 0 && (
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Bulk Actions</h3>
            {selectedLessons.length > 0 && (
              <Btn variant="danger" onClick={async () => {
                try {
                  await fetch('/api/lessons/bulk', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ids: selectedLessons })
                  });
                  showToast.success('Lessons deleted');
                  setSelectedLessons([]);
                  fetchCourseData();
                } catch (err) {
                  showToast.error('Failed to delete lessons');
                }
              }}>Delete Selected ({selectedLessons.length})</Btn>
            )}
          </div>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <ul className="divide-y divide-gray-200">
              {lessons.map((l: any) => (
                <li key={l._id} className="p-4 flex items-center">
                  <input type="checkbox" checked={selectedLessons.includes(l._id)} onChange={e => setSelectedLessons(prev => e.target.checked ? [...prev, l._id] : prev.filter(id => id !== l._id))} className="mr-2" />
                  <div className="flex flex-col items-start space-y-1">
                    <div className="text-sm font-medium text-gray-900">{l.name}</div>
                    <span className={`inline-flex px-2 py-0.5 text-[10px] font-semibold rounded-full ${getLessonTypeColor(l.lesson_type)}`}>
                      {l.lesson_type}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

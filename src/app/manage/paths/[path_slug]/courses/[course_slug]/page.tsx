'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
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
  FaList
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
                <p className="mt-1 text-sm text-gray-500">
                  {course.slug}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStateColor(course.state)}`}>
                {course.state}
              </span>
              <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
                <FaEdit className="mr-2 h-4 w-4" />
                Edit Course
              </button>
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
                <div className="flex gap-8">
                  {/* Basic Information */}
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
                    <dl className="space-y-4">
                      <div className="flex items-center">
                        <dt className="text-sm font-semibold text-gray-700 w-32 flex-shrink-0 border-r border-gray-200 pr-3">Name</dt>
                        <dd className="text-sm text-gray-900 ml-3">{course.name}</dd>
                      </div>
                      <div className="flex items-center">
                        <dt className="text-sm font-semibold text-gray-700 w-32 flex-shrink-0 border-r border-gray-200 pr-3">Slug</dt>
                        <dd className="text-sm text-gray-900 ml-3">{course.slug}</dd>
                      </div>
                      <div className="flex items-start">
                        <dt className="text-sm font-semibold text-gray-700 w-32 flex-shrink-0 border-r border-gray-200 pr-3">Description</dt>
                        <dd className="text-sm text-gray-900 flex-1 ml-3">{course.description}</dd>
                      </div>
                      <div className="flex items-center">
                        <dt className="text-sm font-semibold text-gray-700 w-32 flex-shrink-0 border-r border-gray-200 pr-3">Category</dt>
                        <dd className="text-sm text-gray-900 ml-3">{course.category || '-'}</dd>
                      </div>
                      <div className="flex items-center">
                        <dt className="text-sm font-semibold text-gray-700 w-32 flex-shrink-0 border-r border-gray-200 pr-3">State</dt>
                        <dd className="ml-3">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStateColor(course.state)}`}>
                            {course.state}
                          </span>
                        </dd>
                      </div>
                      <div className="flex items-center">
                        <dt className="text-sm font-semibold text-gray-700 w-32 flex-shrink-0 border-r border-gray-200 pr-3">Total Lessons</dt>
                        <dd className="text-sm text-gray-900 ml-3">{course.total_lessons || 0}</dd>
                      </div>
                      <div className="flex items-center">
                        <dt className="text-sm font-semibold text-gray-700 w-32 flex-shrink-0 border-r border-gray-200 pr-3">Duration</dt>
                        <dd className="text-sm text-gray-900 ml-3">{course.duration ? formatDuration(course.duration) : '-'}</dd>
                      </div>
                      <div className="flex items-center">
                        <dt className="text-sm font-semibold text-gray-700 w-32 flex-shrink-0 border-r border-gray-200 pr-3">Created</dt>
                        <dd className="text-sm text-gray-900 ml-3">{new Date(course.created_at).toLocaleDateString()}</dd>
                      </div>
                    </dl>
                  </div>

                  {/* Course Image */}
                  <div className="w-[300px] flex-shrink-0">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-gray-900">Image</h3>
                      <button className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
                        <FaEdit className="mr-1.5 h-3.5 w-3.5" />
                        {course.image ? 'Change Image' : 'Upload Image'}
                      </button>
                    </div>
                    <div className="space-y-4">
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
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'lessons' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Lessons</h3>
                  <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
                    <FaPlus className="mr-2 h-4 w-4" />
                    Add Lesson
                  </button>
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
                                      alert(data.error || 'Failed to save lesson');
                                    }
                                  } catch (err: any) { alert(err?.message || 'Failed to save lesson'); }
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
                                      return <QuizLesson lesson={adapted as any} onComplete={() => { }} />
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
    </div>
  );
}

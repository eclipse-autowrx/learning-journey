// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { showToast, showDeleteConfirm } from '@/lib/utils/notifications';
import Btn from '@/app/components/atom/Btn';
import VideoLesson from '@/app/components/lessons/VideoLesson';
import TextMarkdownLesson from '@/app/components/lessons/TextMarkdownLesson';
import TextMarkdownEditor from '@/app/components/lessons/TextMarkdownEditor';
import QuizLesson from '@/app/components/lessons/QuizLesson';
import InteractiveLesson from '@/app/components/lessons/InteractiveLesson';
import UnknownLessonViewer from '@/app/components/lessons/UnknownLessonViewer';
import UnknownLessonEditor from '@/app/components/lessons/UnknownLessonEditor';
import VideoLessonEditor from '@/app/components/lessons/VideoLessonEditor';
import { FaInfoCircle, FaEye } from "react-icons/fa";
import QuizLessonEditor from '@/app/components/lessons/QuizLessonEditor';
import InteractiveLessonEditor from '@/app/components/lessons/InteractiveLessonEditor';

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
  FaTimes,
  FaArrowUp,
  FaArrowDown,
  FaGripVertical
} from 'react-icons/fa';
import ManageBreadCrumb from '@/app/components/atom/ManageBreadCrumb';
import DropdownMenu, { DropdownItem } from '@/app/components/atom/DropdownMenu';
import { COURSE_STATES, LESSON_STATES } from '@/lib/const';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import ImageEditor from '@/app/components/atom/ImageEditor';
import { useAuth } from '@/lib/frontend/auth';

function validateQuizLesson(lesson: any) {
  if (lesson.lesson_type !== 'quiz') {
    return true; // Not a quiz, no validation needed
  }

  const questions = lesson.quiz_questions || [];
  if (questions.length === 0) {
    showToast.error('A quiz must have at least one question.');
    return false;
  }

  for (const q of questions) {
    if (!q.question?.trim()) {
      showToast.error('All questions must have text.');
      return false;
    }
    if (!q.answers || q.answers.length === 0) {
      showToast.error(`Question "${q.question}" must have at least one answer.`);
      return false;
    }
    let hasCorrect = false;
    for (const a of q.answers) {
      if (!a.label?.trim()) {
        showToast.error(`All answers for question "${q.question}" must have text.`);
        return false;
      }
      if (a.is_correct) {
        hasCorrect = true;
      }
    }
    if (!hasCorrect) {
      showToast.error(`Question "${q.question}" must have one correct answer.`);
      return false;
    }
  }

  return true;
}

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
  const { isAuthenticated, loading: authLoading } = useAuth();
  
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [path, setPath] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'info' | 'lessons'>('info');
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  
  // Edit mode states
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    slug: '',
    description: '',
    image: null as string | null,
    thumb: null as string | null,
    category: '',
    state: '',
    tags: [] as string[],
    configs: {},
    extends: {},
  });
  const [courseState, setCourseState] = useState('draft');
  const [isStateDropdownOpen, setIsStateDropdownOpen] = useState(false);
  
  // Bulk selection and filter states
  const [selectedLessons, setSelectedLessons] = useState<string[]>([]);
  const [selectedLessonStates, setSelectedLessonStates] = useState<string[]>(LESSON_STATES.map(s => s.value));
  const [selectedLessonSlug, setSelectedLessonSlug] = useState<string | null>(null);
  const [showBulkActionModal, setShowBulkActionModal] = useState(false);
  const [bulkActionType, setBulkActionType] = useState<'state' | 'delete' | null>(null);
  const [bulkNewState, setBulkNewState] = useState<string>('draft');

  // Lesson creation modal states
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [lessonForm, setLessonForm] = useState<any>({
    name: '',
    description: '',
    lesson_type: 'text-markdown',
    state: 'draft',
    content: {},
  });
  const [isSaving, setIsSaving] = useState(false);

  // Lesson editing states
  const [editableLesson, setEditableLesson] = useState<Lesson | null>(null);
  const [lessonDetailTab, setLessonDetailTab] = useState<'info' | 'edit' | 'view'>('info');
  const [isLessonDirty, setIsLessonDirty] = useState(false);

  const fetchCourseData = async () => {
    try {
      // Fetch path data first
      const pathRes = await fetch(`/api/paths/${pathSlug}`);
      const pathData = await pathRes.json();
      if (pathData.success) {
        setPath(pathData.data);
      }

      const courseRes = await fetch(`/api/courses/${courseSlug}`);
      const courseData = await courseRes.json();

      if (courseData.success) {
        setCourse(courseData.data);
        setLessons(courseData.data.lessons || []);
        setEditForm({
          name: courseData.data.name || '',
          slug: courseData.data.slug || '',
          description: courseData.data.description || '',
          image: courseData.data.image || null,
          thumb: courseData.data.thumb || null,
          category: courseData.data.category || '',
          state: courseData.data.state || 'draft',
          tags: courseData.data.tags || [],
          configs: courseData.data.configs || {},
          extends: courseData.data.extends || {},
        });
        setCourseState(courseData.data.state || 'draft');
      } else {
        console.error('Failed to fetch course:', courseData.error);
      }
    } catch (error) {
      console.error('Error fetching course data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchCourseData();
    }
  }, [isAuthenticated, courseSlug]);

  useEffect(() => {
     const handleClickOutside = (event: MouseEvent) => {
       const target = event.target as Element;
       if (!target.closest('.dropdown-container')) {
         setOpenDropdown(null);
         setIsStateDropdownOpen(false);
       }
     };
     document.addEventListener('mousedown', handleClickOutside);
     return () => {
       document.removeEventListener('mousedown', handleClickOutside);
     };
   }, []);

   // This useEffect must be called unconditionally to follow Rules of Hooks
   useEffect(() => {
     if (selectedLessonSlug && lessons.length > 0) {
       const foundLesson = lessons.find(l => l.slug === selectedLessonSlug);
       if (foundLesson) {
         setEditableLesson(foundLesson);
         setLessonDetailTab('info');
       }
     }
   }, [selectedLessonSlug, lessons]);

   useEffect(() => {
    // Select the first lesson by default if no lesson is selected
    if (lessons.length > 0 && !selectedLessonSlug) {
      setSelectedLessonSlug(lessons[0].slug);
    }
  }, [lessons, selectedLessonSlug]);

   const handleLessonContentChange = (newValue: any) => {
     setEditableLesson((prev: any) => ({ ...prev, ...newValue }));
     setIsLessonDirty(true);
   };

   const handleLessonInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
     const { name, value } = e.target;
     setEditableLesson((prev: any) => ({ ...prev, [name]: value }));
     setIsLessonDirty(true);
   };

   // Calculate selectedLesson after all hooks are declared
   const selectedLesson: Lesson | null = selectedLessonSlug
     ? lessons.find(l => l.slug === selectedLessonSlug) || null
     : null;

   if (authLoading) {
     return (
         <div className="min-h-screen bg-gray-50 flex items-center justify-center">
             <div className="text-center">
                 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                 <p className="mt-4 text-gray-600">Checking authentication...</p>
             </div>
         </div>
     );
   }

   if (!isAuthenticated) {
     return (
         <div className="min-h-screen bg-gray-50 flex items-center justify-center">
             <div className="text-center">
                 <h3 className="mt-2 text-lg font-medium text-gray-900">Authentication Required</h3>
                 <p className="mt-1 text-sm text-gray-500">
                     You must be logged in to access this page.
                 </p>
             </div>
         </div>
     );
   }

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
          name: (lesson as any).sequence?.name || lesson.name,
          description: (lesson as any).sequence?.description || lesson.description,
          auto_run_next: (lesson as any).sequence?.auto_run_next ?? true,
          auto_start: (lesson as any).sequence?.auto_start ?? true,
          trigger_source: (lesson as any).sequence?.trigger_source || 'learning',
          actions: (lesson as any).sequence?.actions || [],
        };
      default:
        return common;
    }
  };

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
      if (!editForm.name) {
        showToast.error('Course name cannot be empty');
        return;
      }
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
        slug: course.slug || '',
        description: course.description || '',
        category: course.category || '',
        image: course.image || null,
        thumb: null,
        state: course.state || 'draft',
        tags: [],
        configs: {},
        extends: {},
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

    if (!lessonForm.name) {
      showToast.error('Lesson name cannot be empty');
      return;
    }
    let submissionData: any = { ...lessonForm };
    if (lessonForm.lesson_type === 'text-markdown') {
      submissionData.markdown_content = `# New Lesson
    
Start writing your lesson content here.`;
    } else if (lessonForm.lesson_type === 'quiz') {
      submissionData.quiz_questions = [
        {
          "question": "Sample Question: What is the capital of France?",
          "answers": [
            { "label": "Paris", "is_correct": true },
            { "label": "London" },
            { "label": "Berlin" },
            { "label": "Madrid" }
          ]
        }
      ];
    }

    try {
      // 1. Create lesson
      const lessonRes = await fetch('/api/lessons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData)
      });
      const lessonData = await lessonRes.json();
      if (!lessonData.success) throw new Error(lessonData.error || 'Failed to create lesson');
      const newLesson = lessonData.data;
      // 2. Add lesson to course
      const updatedLessons = [...lessons.map(l => l._id), newLesson._id];
      await fetch(`/api/courses/${courseSlug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessons: updatedLessons })
      });
      showToast.success('Lesson created and added to course');
      setShowLessonModal(false);
      // Update state and set new lesson as active
      const updatedLessonsState = [...lessons, newLesson];
      setLessons(updatedLessonsState);
      setSelectedLessonSlug(newLesson.slug);
    } catch (err: any) {
      showToast.error(err?.message || 'Failed to create lesson');
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    const lessonToDelete = lessons.find(l => l._id === lessonId);
    if (!lessonToDelete) return;

    const result = await showDeleteConfirm(`lesson "${lessonToDelete.name}"`);
    if (!result.isConfirmed) {
      return;
    }

    try {
      const lessonIndexToDelete = lessons.findIndex(l => l._id === lessonId);

      const updatedLessons = lessons.filter(l => l._id !== lessonId).map(l => l._id);
      await fetch(`/api/courses/${courseSlug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessons: updatedLessons })
      });
      // Optionally, you might want to delete the lesson document itself if it's not referenced anywhere else
      // await fetch(`/api/lessons/${lessonId}`, { method: 'DELETE' });
      showToast.success('Lesson removed from course');
      
      const newLessons = lessons.filter(l => l._id !== lessonId);
      setLessons(newLessons);

      if (selectedLessonSlug === lessons[lessonIndexToDelete].slug) {
        if (newLessons.length === 0) {
          setSelectedLessonSlug(null);
        } else {
          const newActiveIndex = Math.max(0, lessonIndexToDelete - 1);
          setSelectedLessonSlug(newLessons[newActiveIndex].slug);
        }
      }

    } catch (err: any) {
      showToast.error(err?.message || 'Failed to remove lesson');
    }
  };

  const handleMoveLesson = async (lessonId: string, direction: 'up' | 'down') => {
    const index = lessons.findIndex(l => l._id === lessonId);
    if (index === -1) return;

    const newLessons = [...lessons];
    const [lesson] = newLessons.splice(index, 1);

    if (direction === 'up' && index > 0) {
      newLessons.splice(index - 1, 0, lesson);
    } else if (direction === 'down' && index < newLessons.length) {
      newLessons.splice(index + 1, 0, lesson);
    } else {
      return; // Cannot move further
    }

    try {
      await fetch(`/api/courses/${courseSlug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessons: newLessons.map(l => l._id) })
      });
      showToast.success('Lesson moved');
      setLessons(newLessons); // Optimistic update
    } catch (err: any) {
      showToast.error(err?.message || 'Failed to move lesson');
      fetchCourseData(); // Re-fetch to correct state
    }
  };

  const onDragEnd = (result: any) => {
    if (!result.destination) {
      return;
    }

    const items = Array.from(lessons);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setLessons(items); // Optimistic update

    const lessonIds = items.map(item => item._id);

    // Call API to update the order
    updateLessonOrder(lessonIds);
  };

  const updateLessonOrder = async (lessonIds: string[]) => {
    try {
      await fetch(`/api/courses/${courseSlug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessons: lessonIds })
      });
      showToast.success('Lesson order updated');
    } catch (err: any) {
      showToast.error(err?.message || 'Failed to update lesson order');
      fetchCourseData(); // Re-fetch to correct state in case of failure
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

  if (!course || !path) {
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
      <ManageBreadCrumb items={[
        { label: 'Paths', link: '/manage?tab=paths' },
        { label: path.name, link: `/manage/paths/${path.slug}` },
        { label: 'Courses', link: `/manage/paths/${path.slug}` },
        { label: course.name }
      ]} />
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{course.name}</h1>
                <p className="mt-1 text-sm text-gray-500">{course.slug}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-500">State:</span>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStateColor(course.state)}`}>{course.state}</span>
                <DropdownMenu
                  items={COURSE_STATES.filter(s => s.value !== 'released' && s.value !== 'published').map((s) => ({
                    label: s.label,
                    onClick: async () => {
                      try {
                        const res = await fetch(`/api/courses/${courseSlug}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ state: s.value }) });
                        const data = await res.json();
                        if (data.success) {
                          setCourse(prev => prev ? { ...prev, state: s.value } : null);
                          showToast.success('Course state updated successfully');
                        } else {
                          showToast.error(data.error || 'Failed to update course state');
                        }
                      } catch (error) { showToast.error('Failed to update course state'); }
                    },
                  })) as DropdownItem[]}
                  trigger={<span>Change State</span>}
                  buttonAriaLabel="Change state"
                  align="left"
                />
              </div>
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
                          <dt className="text-sm font-semibold text-gray-900 mb-2">Name</dt>
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
                          <dt className="text-sm font-semibold text-gray-900 mb-2">Slug</dt>
                          <dd className="text-sm text-gray-700 font-mono">{course.slug}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-semibold text-gray-900 mb-2">Category</dt>
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
                      </div>
                      <div>
                        <dt className="text-sm font-semibold text-gray-900 mb-2">Description</dt>
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
                    {isEditing ? (
                      <ImageEditor
                        label="Course Image"
                        imageUrl={editForm.image}
                        onImageUrlChange={(url) => setEditForm({ ...editForm, image: url })}
                        allowDelete={false}
                        mode="avatar"
                      />
                    ) : (
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">Course Image</label>
                        {course.image ? (
                          <img src={course.image} alt={course.name} className="rounded-md w-full object-contain" />
                        ) : (
                          <div className="text-sm text-gray-500">No image</div>
                        )}
                      </div>
                    )}
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
                      <DragDropContext onDragEnd={onDragEnd}>
                        <Droppable droppableId="lessons">
                          {(provided) => (
                            <div
                              {...provided.droppableProps}
                              ref={provided.innerRef}
                              className="bg-white border border-gray-200 rounded-lg overflow-hidden"
                            >
                              <ul className="divide-y divide-gray-200">
                                {lessons.map((l: any, index: number) => (
                                  <Draggable key={l._id} draggableId={l._id} index={index}>
                                    {(provided) => (
                                      <li
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        className={`p-4 cursor-pointer group ${selectedLessonSlug === l.slug ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                                        onClick={() => setSelectedLessonSlug(l.slug)}
                                      >
                                        <div className="flex justify-between items-center">
                                          <div className="flex items-center">
                                            <div {...provided.dragHandleProps} className="p-1">
                                              <FaGripVertical className="h-4 w-4 text-gray-400" />
                                            </div>
                                            <div className="flex flex-col items-start space-y-1 ml-2">
                                              <div className="text-sm font-medium text-gray-900">{index + 1}. {l.name}</div>
                                              <span className={`inline-flex px-2 py-0.5 text-[10px] font-semibold rounded-full ${getLessonTypeColor(l.lesson_type)}`}>
                                                {l.lesson_type}
                                              </span>
                                            </div>
                                          </div>
                                          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={(e) => { e.stopPropagation(); handleDeleteLesson(l._id); }} className="p-1 rounded-full hover:bg-red-100 text-red-500">
                                              <FaTrash className="h-3 w-3" />
                                            </button>
                                          </div>
                                        </div>
                                      </li>
                                    )}
                                  </Draggable>
                                ))}
                                {provided.placeholder}
                              </ul>
                            </div>
                          )}
                        </Droppable>
                      </DragDropContext>
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
                                <FaInfoCircle className="inline mr-2 h-4 w-4" />
                                Lesson Info
                              </button>
                              <button onClick={() => setLessonDetailTab('edit')} 
                                className={`px-4 py-2 text-sm font-medium ${lessonDetailTab === 'edit' ? 'text-blue-600 border-b-2 border-blue-500' : 'text-gray-600'}`}>
                                <FaEdit className="inline mr-2 h-4 w-4" />
                                Edit Content
                              </button>
                              <button onClick={() => setLessonDetailTab('view')} 
                                className={`px-4 py-2 text-sm font-medium ${lessonDetailTab === 'view' ? 'text-blue-600 border-b-2 border-blue-500' : 'text-gray-600'}`}>
                                <FaEye className="inline mr-2 h-4 w-4" />
                                Preview
                              </button>
                              
                            </div>
                            <div className="px-4 py-2">
                              <button
                                disabled={!isLessonDirty}
                                className={`inline-flex items-center px-4 py-1.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${isLessonDirty ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-300 cursor-not-allowed'}`}
                                onClick={async () => {
                                  if (editableLesson?.lesson_type === 'quiz' && !validateQuizLesson(editableLesson)) {
                                    return; // Stop if validation fails
                                  }
                                  if (!editableLesson?.name) {
                                    showToast.error('Lesson name cannot be empty');
                                    return;
                                  }
                                  try {
                                    const originalSlug = selectedLesson?.slug;
                                    if (!editableLesson) return;
                                    const res = await fetch(`/api/lessons/${originalSlug}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editableLesson) });
                                    const data = await res.json();
                                    if (data.success) {
                                      // Manually update the lesson in the list to avoid re-fetch
                                      setLessons(prev => prev.map(l => l.slug === originalSlug ? { ...l, ...editableLesson } as any : l));
                                      // Update selected lesson slug if it changed
                                      if (editableLesson.slug && editableLesson.slug !== originalSlug) {
                                        setSelectedLessonSlug(editableLesson.slug);
                                      }
                                      setIsLessonDirty(false); // Reset dirty state
                                      showToast.success('Lesson saved successfully');
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
                                    <input name="name" className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm" value={(editableLesson?.name) || ''} onChange={handleLessonInfoChange} />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700">Slug</label>
                                    <input name="slug" className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm" value={(editableLesson?.slug) || ''} onChange={handleLessonInfoChange} />
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
                                  <textarea name="description" rows={4} className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm" value={(editableLesson?.description) || ''} onChange={handleLessonInfoChange} />
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
                                      return <VideoLesson lesson={adapted as any} onSumbitLesson={() => { }} onCloseRequest={() => { }} />
                                    case 'text-markdown':
                                      return <TextMarkdownLesson lesson={adapted as any} onSumbitLesson={() => { }} onCloseRequest={() => { }} showNextButton={false} />
                                    case 'quiz':
                                      return <QuizLesson lesson={adapted as any} onSumbitLesson={() => { }} onCloseRequest={() => { }} showNextButton={false} />
                                    case 'interactive':
                                      return <InteractiveLesson lesson={adapted as any} onSumbitLesson={() => { }} onCloseRequest={() => { }} showNextButton={false} />
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
                                  const onChange = handleLessonContentChange;
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
                  <input type="text" required value={lessonForm.name} onChange={(e) => setLessonForm((f: any) => ({ ...f, name: e.target.value }))} className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea value={lessonForm.description} onChange={(e) => setLessonForm((f: any) => ({ ...f, description: e.target.value }))} rows={3} className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Lesson Type *</label>
                  <select value={lessonForm.lesson_type} onChange={(e) => setLessonForm((f: any) => ({ ...f, lesson_type: e.target.value }))} className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
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

    </div>
  );
}

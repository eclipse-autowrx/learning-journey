// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

'use client';

import { useState, useEffect } from 'react';
import { useParams, usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { showToast, showDeleteConfirm, showBulkDeleteConfirm, showStateChangeConfirm, showBulkOperationResult } from '@/lib/utils/notifications';
import { FaRoute, FaArrowLeft } from 'react-icons/fa';
import { useAuth } from '@/lib/frontend/auth';
import PathHeader from '@/app/components/paths/PathHeader';
import PathTabs from '@/app/components/paths/PathTabs';
import PathInfoTab from '@/app/components/paths/PathInfoTab';
import CoursesTab from '@/app/components/paths/CoursesTab';
import BulkActionModal from '@/app/components/paths/BulkActionModal';
import CourseCreationModal from '@/app/components/paths/CourseCreationModal';
import PathCanvasEditor from '@/app/components/paths/PathCanvasEditor';

interface MapItem {
  course_id?: string;
  certificate_id?: string;
  x: string;
  y: string;
}

interface Path {
  _id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  tags: string[];
  state: string;
  path_type: string;
  background_img: string;
  image: string;
  thumb: string;
  valid_from: string;
  valid_to: string;
  configs: any;
  extends: any;
  hiddenContent: any;
  created_by?: string;
  time_to_complete?: number;
  level?: string;
  created_at: string;
  updated_at: string;
  courses: Course[];
  maps: MapItem[];
  key_points?: { title: string; content: string }[];
  required_course_ids?: string[];
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
  created_at: string;
}

export default function PathDetailPage() {
  const params = useParams();
  const pathSlug = params?.path_slug as string;
  const { isAuthenticated, loading: authLoading } = useAuth();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const [path, setPath] = useState<Path | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Initialize activeTab from URL params
  const getInitialTab = (): 'info' | 'courses' | 'canvas' => {
    const tab = searchParams?.get('tab');
    if (tab === 'courses' || tab === 'canvas') {
      return tab;
    }
    return 'info';
  };
  
  const [activeTab, setActiveTab] = useState<'info' | 'courses' | 'canvas'>(getInitialTab);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  
  // Edit mode states
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    slug: '',
    description: '',
    image: null as string | null,
    background_img: null as string | null,
    thumb: null as string | null,
    category: '',
    state: '',
    created_by: '',
    time_to_complete: 0 as number,
    level: '1',
    display_type: 'list',
    tags: [] as string[],
    valid_from: '',
    valid_to: '',
    configs: {
      display_type: 'canvas'
    },
    key_points: [] as { title: string; content: string }[]
  });
  const [pathState, setPathState] = useState('draft');
  
  // Bulk selection and filter states
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [selectedCourseStates, setSelectedCourseStates] = useState<string[]>(['draft', 'reviewing', 'published', 'archived']);
  const [showBulkActionModal, setShowBulkActionModal] = useState(false);
  const [bulkActionType, setBulkActionType] = useState<'state' | 'delete' | null>(null);
  const [bulkNewState, setBulkNewState] = useState<string>('draft');

  // Course creation modal states
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [courseForm, setCourseForm] = useState({
    name: '',
    description: '',
    state: 'draft'
  });

  // Certificate configuration states
  const [requiredCourseIds, setRequiredCourseIds] = useState<string[]>([]);
  
  // Lesson counts for each course
  const [courseLessonCounts, setCourseLessonCounts] = useState<Record<string, number>>({});

  const handleSaveCanvas = async (maps: MapItem[]) => {
    try {
      const response = await fetch(`/api/creator/paths/${pathSlug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ maps }),
      });

      if (response.ok) {
        showToast.success('Canvas layout updated successfully');
        fetchPathData();
      } else {
        const error = await response.json();
        showToast.error(`Error: ${error.error || 'Failed to update canvas layout'}`);
      }
    } catch (error) {
      console.error('Error updating canvas layout:', error);
      showToast.error('Failed to update canvas layout');
    }
  };

  const handleBackgroundImageUpdate = async (url: string) => {
    try {
      const response = await fetch(`/api/creator/paths/${pathSlug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ background_img: url }),
      });

      if (response.ok) {
        showToast.success('Background image updated successfully');
        fetchPathData();
      } else {
        const error = await response.json();
        showToast.error(`Error: ${error.error || 'Failed to update background image'}`);
      }
    } catch (error) {
      console.error('Error updating background image:', error);
      showToast.error('Failed to update background image');
    }
  };

  const fetchPathData = async () => {
    try {
      const pathRes = await fetch(`/api/creator/paths/${pathSlug}`);
      const pathData = await pathRes.json();

      if (pathData.success) {
        setPath(pathData.data);
        setEditForm({
          name: pathData.data.name || '',
          slug: pathData.data.slug || '',
          description: pathData.data.description || '',
          image: pathData.data.image || null,
          background_img: pathData.data.background_img || null,
          thumb: pathData.data.thumb || null,
          category: pathData.data.category || '',
          state: pathData.data.state || 'draft',
          created_by: pathData.data.created_by || '',
          time_to_complete: typeof pathData.data.time_to_complete === 'number' ? pathData.data.time_to_complete : 0,
          level: pathData.data.level || '1',
          display_type: pathData.data.configs?.display_type || 'canvas',
          tags: pathData.data.tags || [],
          valid_from: pathData.data.valid_from ? pathData.data.valid_from.split('T')[0] : '',
          valid_to: pathData.data.valid_to ? pathData.data.valid_to.split('T')[0] : '',
          configs: {
            display_type: pathData.data.configs?.display_type || 'canvas'
          },
          key_points: Array.isArray(pathData.data.key_points) ? pathData.data.key_points : []
        });
        setPathState(pathData.data.state || 'draft');
        if (pathData.data.courses && Array.isArray(pathData.data.courses)) {
          setCourses(pathData.data.courses);
          fetchLessonCounts(pathData.data.courses);
        }
        setRequiredCourseIds(pathData.data.required_course_ids || []);
      } else {
        console.error('Failed to fetch path:', pathData.error);
      }
    } catch (error) {
      console.error('Error fetching path data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchPathData();
    }
  }, [isAuthenticated, pathSlug]);

  // Handle URL parameter changes
  useEffect(() => {
    const tab = searchParams?.get('tab');
    if (tab === 'courses' || tab === 'canvas') {
      setActiveTab(tab);
    } else {
      setActiveTab('info');
    }
  }, [searchParams]);

  // Handle tab change with URL update
  const handleTabChange = (tab: 'info' | 'courses' | 'canvas') => {
    setActiveTab(tab);
    const url = new URL(window.location.href);
    if (tab === 'info') {
      url.searchParams.delete('tab');
    } else {
      url.searchParams.set('tab', tab);
    }
    window.history.pushState({}, '', url.toString());
  };

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

  if (authLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-neutral-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    const qs = searchParams?.toString();
    const returnTo = encodeURIComponent(`${pathname}${qs ? `?${qs}` : ''}`);
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <h3 className="mt-2 text-lg font-medium text-neutral-900">Authentication Required</h3>
          <p className="mt-1 text-sm text-neutral-500">
            You must be logged in to access this page.
          </p>
          <div className="mt-6">
            <Link href={`/login?returnTo=${returnTo}`} className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700">
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleSave = async () => {
    try {
      if (!editForm.name) {
        showToast.error('Path name cannot be empty');
        return;
      }
      const response = await fetch(`/api/creator/paths/${pathSlug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        showToast.success('Path updated successfully');
        setIsEditing(false);
        fetchPathData();
      } else {
        const error = await response.json();
        showToast.error(`Error: ${error.error || 'Failed to update path'}`);
      }
    } catch (error) {
      console.error('Error updating path:', error);
      showToast.error('Failed to update path');
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    if (path) {
      setEditForm({
        name: path.name || '',
        slug: path.slug || '',
        description: path.description || '',
        image: path.image || null,
        background_img: path.background_img || null,
        thumb: path.thumb || null,
        category: path.category || '',
        state: path.state || 'draft',
        created_by: path.created_by || '',
        time_to_complete: typeof path.time_to_complete === 'number' ? path.time_to_complete : 0,
        level: path.level || '1',
        display_type: path.configs?.display_type || 'canvas',
        tags: path.tags || [],
        valid_from: path.valid_from ? path.valid_from.split('T')[0] : '',
        valid_to: path.valid_to ? path.valid_to.split('T')[0] : '',
        configs: {
          display_type: path.configs?.display_type || 'canvas'
        },
        key_points: Array.isArray(path.key_points) ? path.key_points : []
      });
      setPathState(path.state || 'draft');
    }
  };

  // State change handler
  const handleStateChange = async (newState: string) => {
    try {
      const response = await fetch(`/api/creator/paths/${pathSlug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ state: newState }),
      });

      if (response.ok) {
        showToast.success('Path state updated successfully');
        setPathState(newState);
        fetchPathData();
      } else {
        const error = await response.json();
        showToast.error(`Error: ${error.error || 'Failed to update path state'}`);
      }
    } catch (error) {
      console.error('Error updating path state:', error);
      showToast.error('Failed to update path state');
    }
  };

  // Course creation handlers
  const openCreateCourse = () => {
    setCourseForm({
      name: '',
      description: '',
      state: 'draft'
    });
    setShowCourseModal(true);
  };

  const handleCourseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseForm.name) {
      showToast.error('Course name cannot be empty');
      return;
    }
    
    try {
      const courseResponse = await fetch('/api/creator/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(courseForm),
      });

      if (!courseResponse.ok) {
        const error = await courseResponse.json();
        showToast.error(`Error: ${error.error || 'Failed to create course'}`);
        return;
      }

      const courseResult = await courseResponse.json();
      const newCourse = courseResult.data;

      const currentCourseIds = path?.courses?.map(c => typeof c === 'string' ? c : c._id) || [];
      const updatedCourseIds = [...currentCourseIds, newCourse._id];

      const pathUpdateResponse = await fetch(`/api/creator/paths/${pathSlug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courses: updatedCourseIds
        }),
      });

      if (!pathUpdateResponse.ok) {
        const error = await pathUpdateResponse.json();
        console.error('Error updating path with new course:', error);
        showToast.warning('Course created but failed to add to path. Please refresh the page.');
        return;
      }

      showToast.success('Course created and added to path successfully');
      setShowCourseModal(false);
      setCourseForm({
        name: '',
        description: '',
        state: 'draft'
      });
      fetchPathData();
    } catch (error) {
      console.error('Error creating course:', error);
      showToast.error('Failed to create course');
    }
  };

  const handleDeleteCourse = async (course: Course) => {
    const result = await showDeleteConfirm(course.name);
    if (!result.isConfirmed) {
      return;
    }

    try {
      const courseResponse = await fetch(`/api/creator/courses/${course.slug}`, {
        method: 'DELETE',
      });

      if (!courseResponse.ok) {
        const error = await courseResponse.json();
        showToast.error(`Error: ${error.error || 'Failed to delete course'}`);
        return;
      }

      const currentCourseIds = path?.courses?.map(c => typeof c === 'string' ? c : c._id) || [];
      const updatedCourseIds = currentCourseIds.filter(id => id !== course._id);

      const pathUpdateResponse = await fetch(`/api/creator/paths/${pathSlug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courses: updatedCourseIds
        }),
      });

      if (!pathUpdateResponse.ok) {
        const error = await pathUpdateResponse.json();
        console.error('Error updating path after course deletion:', error);
        showToast.warning('Course deleted but failed to update path. Please refresh the page.');
        return;
      }

      showToast.success(`Course "${course.name}" deleted successfully`);
      fetchPathData();
    } catch (error) {
      console.error('Error deleting course:', error);
      showToast.error('Failed to delete course');
    }
  };

  // Certificate configuration handlers
  const handleRequiredCourseToggleWithSave = async (courseId: string) => {
    const updated = requiredCourseIds.includes(courseId) 
      ? requiredCourseIds.filter(id => id !== courseId)
      : [...requiredCourseIds, courseId];
    
    setRequiredCourseIds(updated);

    try {
      const response = await fetch(`/api/creator/paths/${pathSlug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ required_course_ids: updated }),
      });

      if (response.ok) {
        const action = updated.includes(courseId) ? 'marked as mandatory' : 'removed from mandatory';
        showToast.success(`Course ${action} successfully`);
        fetchPathData();
      } else {
        const error = await response.json();
        showToast.error(`Error: ${error.error || 'Failed to update course requirement'}`);
        setRequiredCourseIds(requiredCourseIds);
      }
    } catch (error) {
      console.error('Error updating course requirement:', error);
      showToast.error('Failed to update course requirement');
      setRequiredCourseIds(requiredCourseIds);
    }
  };

  // Clean up ghost course IDs
  const handleCleanupGhostCourses = async () => {
    const availableCourseIds = courses.map(course => course._id);
    const validRequiredIds = requiredCourseIds.filter(id => availableCourseIds.includes(id));
    
    setRequiredCourseIds(validRequiredIds);

    try {
      const response = await fetch(`/api/creator/paths/${pathSlug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ required_course_ids: validRequiredIds }),
      });

      if (response.ok) {
        showToast.success('Ghost course IDs removed successfully');
        fetchPathData();
      } else {
        const error = await response.json();
        showToast.error(`Error: ${error.error || 'Failed to clean up ghost courses'}`);
        setRequiredCourseIds(requiredCourseIds);
      }
    } catch (error) {
      console.error('Error cleaning up ghost courses:', error);
      showToast.error('Failed to clean up ghost courses');
      setRequiredCourseIds(requiredCourseIds);
    }
  };

  // Detect ghost course IDs
  const getGhostCourseIds = () => {
    const availableCourseIds = courses.map(course => course._id);
    return requiredCourseIds.filter(id => !availableCourseIds.includes(id));
  };

  // Fetch lesson counts for all courses
  const fetchLessonCounts = async (coursesList: Course[]) => {
    const lessonCounts: Record<string, number> = {};
    
    const promises = coursesList.map(async (course) => {
      try {
        const response = await fetch(`/api/courses/${course.slug}/lessons`);
        const data = await response.json();
        if (data.success && Array.isArray(data.data)) {
          lessonCounts[course._id] = data.data.length;
        } else {
          lessonCounts[course._id] = course.total_lessons || 0;
        }
      } catch (error) {
        console.error(`Error fetching lessons for course ${course.slug}:`, error);
        lessonCounts[course._id] = course.total_lessons || 0;
      }
    });
    
    await Promise.all(promises);
    setCourseLessonCounts(lessonCounts);
  };

  // Bulk selection handlers
  const handleSelectAllCourses = (checked: boolean) => {
    if (checked) {
      const visibleCourses = courses
        .filter(c => selectedCourseStates.includes(c.state))
        .map(c => c._id);
      setSelectedCourses(visibleCourses);
    } else {
      setSelectedCourses([]);
    }
  };

  const handleToggleCourse = (id: string) => {
    setSelectedCourses(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  // Bulk action handlers
  const handleBulkStateChange = async () => {
    const result = await showStateChangeConfirm('courses', selectedCourses.length, bulkNewState);
    if (!result.isConfirmed) {
      return;
    }
    
    try {
      const response = await fetch('/api/creator/courses/bulk', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ids: selectedCourses,
          state: bulkNewState
        }),
      });

      const result = await response.json();
      showBulkOperationResult(result);
      
      if (result.success) {
        await fetchPathData();
        setSelectedCourses([]);
        setShowBulkActionModal(false);
      }
    } catch (error) {
      console.error('Error performing bulk state change:', error);
      showToast.error('Failed to update items');
    }
  };

  const handleBulkDelete = async () => {
    const result = await showBulkDeleteConfirm('courses', selectedCourses.length);
    if (!result.isConfirmed) {
      return;
    }
    
    try {
      const response = await fetch('/api/creator/courses/bulk', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ids: selectedCourses
        }),
      });

      const result = await response.json();
      showBulkOperationResult(result);
      
      if (result.success) {
        await fetchPathData();
        setSelectedCourses([]);
        setShowBulkActionModal(false);
      }
    } catch (error) {
      console.error('Error performing bulk delete:', error);
      showToast.error('Failed to delete items');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-neutral-600">Loading path details...</p>
        </div>
      </div>
    );
  }

  if (!path) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <FaRoute className="mx-auto h-12 w-12 text-neutral-400" />
          <h3 className="mt-2 text-sm font-medium text-neutral-900">Path not found</h3>
          <p className="mt-1 text-sm text-neutral-500">
            The path you're looking for doesn't exist.
          </p>
          <div className="mt-6">
            <Link
              href="/manage"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
            >
              <FaArrowLeft className="mr-2 h-4 w-4" />
              Back to Management
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <PathHeader 
        path={path}
        pathState={pathState}
        onStateChange={handleStateChange}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PathTabs
          activeTab={activeTab}
          onTabChange={handleTabChange}
          coursesCount={courses.length}
        />

        <div className="bg-white shadow rounded-lg">
          <div className={activeTab === 'canvas' ? 'py-6' : 'p-6'}>
            {activeTab === 'info' && (
              <PathInfoTab
                path={path}
                isEditing={isEditing}
                editForm={editForm}
                onEditFormChange={setEditForm}
                onSave={handleSave}
                onCancelEdit={handleCancelEdit}
                onStartEdit={() => setIsEditing(true)}
                pathSlug={pathSlug}
              />
            )}

            {activeTab === 'courses' && (
              <CoursesTab
                courses={courses}
                selectedCourseStates={selectedCourseStates}
                onSelectedCourseStatesChange={setSelectedCourseStates}
                onCreateCourse={openCreateCourse}
                selectedCourses={selectedCourses}
                onSelectedCoursesChange={setSelectedCourses}
                onToggleCourse={handleToggleCourse}
                onSelectAllCourses={handleSelectAllCourses}
                onBulkStateChange={handleBulkStateChange}
                onBulkDelete={handleBulkDelete}
                onClearSelection={() => setSelectedCourses([])}
                onShowBulkActionModal={(type) => {
                  setBulkActionType(type);
                  setShowBulkActionModal(true);
                }}
                requiredCourseIds={requiredCourseIds}
                onRequiredCourseToggle={handleRequiredCourseToggleWithSave}
                onDeleteCourse={handleDeleteCourse}
                courseLessonCounts={courseLessonCounts}
                pathSlug={pathSlug}
                openDropdown={openDropdown}
                onOpenDropdownChange={setOpenDropdown}
                getGhostCourseIds={getGhostCourseIds}
                onCleanupGhostCourses={handleCleanupGhostCourses}
              />
            )}

            {activeTab === 'canvas' && (
              <div className=''>
                {path && (
                  <PathCanvasEditor
                    path={path}
                    onSave={handleSaveCanvas}
                    onBackgroundImageUpdate={handleBackgroundImageUpdate}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <BulkActionModal
        isOpen={showBulkActionModal}
        onClose={() => setShowBulkActionModal(false)}
        actionType={bulkActionType}
        selectedCount={selectedCourses.length}
        bulkNewState={bulkNewState}
        onBulkNewStateChange={setBulkNewState}
        onBulkStateChange={handleBulkStateChange}
        onBulkDelete={handleBulkDelete}
      />

      <CourseCreationModal
        isOpen={showCourseModal}
        onClose={() => setShowCourseModal(false)}
        courseForm={courseForm}
        onCourseFormChange={setCourseForm}
        onSubmit={handleCourseSubmit}
      />
    </div>
  );
}

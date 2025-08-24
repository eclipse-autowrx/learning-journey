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
import StateFilter from '@/app/components/atom/StateFilter';
import Btn from '@/app/components/atom/Btn';
import TagEditor from '@/app/components/atom/TagEditor';
import { 
  FaRoute, 
  FaGraduationCap, 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaArrowLeft,
  FaArrowRight,
  FaArrowUp,
  FaArrowDown,
  FaEllipsisV,
  FaCog,
  FaList,
  FaSave,
  FaTimes,
  FaThLarge
} from 'react-icons/fa';
import { COURSE_STATES, PATH_STATES, PATH_LEVELS } from '@/lib/const';
import ManageBreadCrumb from '@/app/components/atom/ManageBreadCrumb';
import UserBadge from '@/app/components/atom/UserBadge';
import DropdownMenu, { DropdownItem } from '@/app/components/atom/DropdownMenu';
import ImageEditor from '@/app/components/atom/ImageEditor';
import PathCanvasEditor from '@/app/components/paths/PathCanvasEditor';
import { useAuth } from '@/lib/frontend/auth';

interface MapItem {
  course_id: string;
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
  courses: Course[]; // Added courses to the Path interface
  maps: MapItem[];
  key_points?: { title: string; content: string }[];
  required_course_ids?: string[]; // Added for certificate requirements
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
  const [activeTab, setActiveTab] = useState<'info' | 'courses' | 'certificate' | 'canvas'>('info');
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
  const [isStateDropdownOpen, setIsStateDropdownOpen] = useState(false);
  
  // Bulk selection and filter states
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [selectedCourseStates, setSelectedCourseStates] = useState<string[]>(COURSE_STATES.map(s => s.value));
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
  const [isCertificateModified, setIsCertificateModified] = useState(false);

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
        fetchPathData(); // Refresh data
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
        fetchPathData(); // Refresh data
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
        // Set edit form with current data
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
        // Set courses from the path data if available
        if (pathData.data.courses && Array.isArray(pathData.data.courses)) {
          setCourses(pathData.data.courses);
        }
        // Set required course IDs for certificate
        setRequiredCourseIds(pathData.data.required_course_ids || []);
        setIsCertificateModified(false);
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
    const qs = searchParams?.toString();
    const returnTo = encodeURIComponent(`${pathname}${qs ? `?${qs}` : ''}`);
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
                <h3 className="mt-2 text-lg font-medium text-gray-900">Authentication Required</h3>
                <p className="mt-1 text-sm text-gray-500">
                    You must be logged in to access this page.
                </p>
                <div className="mt-6">
                  <Link href={`/login?returnTo=${returnTo}`} className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
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
        fetchPathData(); // Refresh data
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
        fetchPathData(); // Refresh data
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
      // Step 1: Create the course
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

      // Step 2: Add the course to the path's courses array
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
      fetchPathData(); // Refresh data to show new course
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
      // Step 1: Delete the course
      const courseResponse = await fetch(`/api/creator/courses/${course.slug}`, {
        method: 'DELETE',
      });

      if (!courseResponse.ok) {
        const error = await courseResponse.json();
        showToast.error(`Error: ${error.error || 'Failed to delete course'}`);
        return;
      }

      // Step 2: Remove the course from the path's courses array
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
      fetchPathData(); // Refresh data
    } catch (error) {
      console.error('Error deleting course:', error);
      showToast.error('Failed to delete course');
    }
  };

  // Certificate configuration handlers
  const handleRequiredCourseToggle = (courseId: string) => {
    setRequiredCourseIds(prev => {
      const updated = prev.includes(courseId) 
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId];
      setIsCertificateModified(true);
      return updated;
    });
  };

  const handleSaveCertificateConfig = async () => {
    try {
      const response = await fetch(`/api/creator/paths/${pathSlug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ required_course_ids: requiredCourseIds }),
      });

      if (response.ok) {
        showToast.success('Certificate requirements updated successfully');
        setIsCertificateModified(false);
        fetchPathData(); // Refresh data
      } else {
        const error = await response.json();
        showToast.error(`Error: ${error.error || 'Failed to update certificate requirements'}`);
      }
    } catch (error) {
      console.error('Error updating certificate requirements:', error);
      showToast.error('Failed to update certificate requirements');
    }
  };

  const handleCancelCertificateEdit = () => {
    setRequiredCourseIds(path?.required_course_ids || []);
    setIsCertificateModified(false);
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
    // Show confirmation dialog
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
      
      // Show result using toast notifications
      showBulkOperationResult(result);
      
      if (result.success) {
        // Refresh data after operation
        await fetchPathData();
        
        // Clear selections
        setSelectedCourses([]);
        setShowBulkActionModal(false);
      }
    } catch (error) {
      console.error('Error performing bulk state change:', error);
      showToast.error('Failed to update items');
    }
  };

  const handleBulkDelete = async () => {
    // Show confirmation dialog
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
      
      // Show result using toast notifications
      showBulkOperationResult(result);
      
      if (result.success) {
        // Refresh data after operation
        await fetchPathData();
        
        // Clear selections
        setSelectedCourses([]);
        setShowBulkActionModal(false);
      }
    } catch (error) {
      console.error('Error performing bulk delete:', error);
      showToast.error('Failed to delete items');
    }
  };

  const getStateColor = (state: string) => {
    switch (state) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'reviewing':
        return 'bg-yellow-100 text-yellow-800';
      case 'draft':
        return 'bg-blue-100 text-blue-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
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
          <p className="mt-4 text-gray-600">Loading path details...</p>
        </div>
      </div>
    );
  }

  if (!path) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaRoute className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Path not found</h3>
          <p className="mt-1 text-sm text-gray-500">
            The path you're looking for doesn't exist.
          </p>
          <div className="mt-6">
            <Link
              href="/manage"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
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
    <div className="min-h-screen bg-gray-50">
      <ManageBreadCrumb items={[
        { label: 'Paths', link: '/manage?tab=paths' },
        { label: path.name }
      ]} rightSlot={<UserBadge align="right" variant="transparent" />} />
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{path.name}</h1>
                <p className="mt-1 text-sm text-gray-500">
                  {path.slug}
                </p>
              </div>
            </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-500">State:</span>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStateColor(pathState)}`}>{pathState}</span>
                  <DropdownMenu
                    items={PATH_STATES.filter(s => s.value !== 'published').map((s) => ({ label: s.label, onClick: async () => { await handleStateChange(s.value); } })) as DropdownItem[]}
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="bg-white shadow rounded-lg">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('info')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'info'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FaCog className="inline mr-2 h-4 w-4" />
                Path Information
              </button>
              <button
                onClick={() => setActiveTab('courses')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'courses'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FaList className="inline mr-2 h-4 w-4" />
                Courses ({courses.length})
              </button>
              <button
                onClick={() => setActiveTab('certificate')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'certificate'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FaGraduationCap className="inline mr-2 h-4 w-4" />
                Certificate
              </button>
              <button
                onClick={() => setActiveTab('canvas')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'canvas'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FaThLarge className="inline mr-2 h-4 w-4" />
                Canvas
              </button>
            </nav>
          </div>

          <div className={activeTab === 'canvas' ? 'py-6' : 'p-6'}>
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
                        Edit Path
                      </Btn>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-8">
                  {/* Basic Information */}
                  <div className="flex-1">
                    <dl className="space-y-6">
                      {/* Row 1: Name (with slug under) and Category */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <dt className="text-sm font-semibold text-gray-900 mb-2">Name</dt>
                          {isEditing ? (
                            <>
                              <input
                                type="text"
                                value={editForm.name}
                                onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                                className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                              />
                              <p className="mt-1 text-xs text-gray-500">Slug: <span className="font-mono">{editForm.slug || path.slug}</span></p>
                            </>
                          ) : (
                            <>
                              <dd className="text-sm text-gray-900">{path.name}</dd>
                              <p className="mt-1 text-xs text-gray-500">Slug: <span className="font-mono">{path.slug}</span></p>
                            </>
                          )}
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
                            <dd className="text-sm text-gray-900">{path.category || '-'}</dd>
                          )}
                        </div>
                      </div>

                      {/* Row 2: Level and Time to Complete */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <dt className="text-sm font-semibold text-gray-900 mb-2">Level</dt>
                          {isEditing ? (
                            <select
                              value={editForm.level}
                              onChange={(e) => setEditForm({...editForm, level: e.target.value})}
                              className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            >
                              {PATH_LEVELS.map((level) => (
                                <option key={level.value} value={level.value}>
                                  {level.label}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <dd className="text-sm text-gray-900">
                              {PATH_LEVELS.find(l => l.value === (path.level || '1'))?.label || 'Level 1 - Beginner'}
                            </dd>
                          )}
                        </div>

                        <div>
                          <dt className="text-sm font-semibold text-gray-900 mb-2">Time to complete (hours)</dt>
                          {isEditing ? (
                            <input
                              type="number"
                              min={0}
                              step="0.5"
                              value={editForm.time_to_complete ?? 0}
                              onChange={(e) => setEditForm({ ...editForm, time_to_complete: Number(e.target.value) })}
                              className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                              placeholder="e.g. 2"
                            />
                          ) : (
                            <dd className="text-sm text-gray-700">{typeof path.time_to_complete === 'number' ? path.time_to_complete : 0}</dd>
                          )}
                        </div>
                      </div>

                      {/* Row 4: Valid From and Valid To */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <dt className="text-sm font-semibold text-gray-900 mb-2">Valid From</dt>
                          {isEditing ? (
                            <input
                              type="date"
                              value={editForm.valid_from}
                              onChange={(e) => setEditForm({...editForm, valid_from: e.target.value})}
                              className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                          ) : (
                            <dd className="text-sm text-gray-700">
                              {path.valid_from ? new Date(path.valid_from).toLocaleDateString() : '-'}
                            </dd>
                          )}
                        </div>

                        <div>
                          <dt className="text-sm font-semibold text-gray-900 mb-2">Valid To</dt>
                          {isEditing ? (
                            <input
                              type="date"
                              value={editForm.valid_to}
                              onChange={(e) => setEditForm({...editForm, valid_to: e.target.value})}
                              className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                          ) : (
                            <dd className="text-sm text-gray-700">
                              {path.valid_to ? new Date(path.valid_to).toLocaleDateString() : '-'}
                            </dd>
                          )}
                        </div>
                      </div>

                      {/* Row 3: Display Type */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <dt className="text-sm font-semibold text-gray-900 mb-2">Display Type</dt>
                          {isEditing ? (
                            <select
                              value={editForm.configs?.display_type || 'list'}
                              onChange={(e) => {
                                const value = e.target.value as 'list' | 'canvas';
                                setEditForm(prev => ({
                                  ...prev,
                                  display_type: value,
                                  configs: { ...(prev.configs || {}), display_type: value }
                                }));
                              }}
                              className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="list">List</option>
                              <option value="canvas">Canvas</option>
                            </select>
                          ) : (
                            <dd className="text-sm text-gray-700 capitalize">{(path.configs?.display_type || 'list')}</dd>
                          )}
                        </div>
                        <div>
                          {/* Empty div to maintain grid layout */}
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
                          <dd className="text-sm text-gray-700">{path.description}</dd>
                        )}
                      </div>

                      {/* Row: Key Points Editor */}
                      <div>
                        <dt className="text-sm font-semibold text-gray-900 mb-2">Key Points</dt>
                        {isEditing ? (
                          <div className="space-y-3">
                            {(editForm.key_points || []).map((kp, idx) => (
                              <div key={idx} className="border rounded-md p-3 bg-gray-50">
                                <div className="flex items-center gap-2 mb-2">
                                  <input
                                    type="text"
                                    value={kp.title}
                                    onChange={(e) => {
                                      const next = [...(editForm.key_points || [])];
                                      next[idx] = { ...next[idx], title: e.target.value };
                                      setEditForm({ ...editForm, key_points: next });
                                    }}
                                    placeholder="Title"
                                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                  />
                                  <div className="flex flex-col">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (idx === 0) return;
                                        const next = [...(editForm.key_points || [])];
                                        [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
                                        setEditForm({ ...editForm, key_points: next });
                                      }}
                                      className="p-1 text-gray-600 hover:text-black"
                                      title="Move up"
                                    >
                                      <FaArrowUp />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const next = [...(editForm.key_points || [])];
                                        if (idx >= next.length - 1) return;
                                        [next[idx + 1], next[idx]] = [next[idx], next[idx + 1]];
                                        setEditForm({ ...editForm, key_points: next });
                                      }}
                                      className="p-1 text-gray-600 hover:text-black"
                                      title="Move down"
                                    >
                                      <FaArrowDown />
                                    </button>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const next = (editForm.key_points || []).filter((_, i) => i !== idx);
                                      setEditForm({ ...editForm, key_points: next });
                                    }}
                                    className="px-2 py-1 text-sm text-white bg-red-500 rounded hover:bg-red-600"
                                  >
                                    Delete
                                  </button>
                                </div>
                                <textarea
                                  value={kp.content}
                                  onChange={(e) => {
                                    const next = [...(editForm.key_points || [])];
                                    next[idx] = { ...next[idx], content: e.target.value };
                                    setEditForm({ ...editForm, key_points: next });
                                  }}
                                  rows={3}
                                  placeholder="Content"
                                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={() => setEditForm({ ...editForm, key_points: [...(editForm.key_points || []), { title: '', content: '' }] })}
                              className="px-3 py-2 text-sm text-white bg-blue-600 rounded hover:bg-blue-700"
                            >
                              Add Key Point
                            </button>
                          </div>
                        ) : (
                          <dd className="space-y-2 text-gray-700">
                            {(path.key_points || []).map((kp, idx) => (
                              <div key={idx}>
                                <div className="text-sm font-semibold text-gray-800">{kp.title}</div>
                                <div className="text-sm text-gray-700">{kp.content}</div>
                              </div>
                            ))}
                            {(path.key_points || []).length === 0 && (
                              <span className="text-sm text-gray-500">No key points</span>
                            )}
                          </dd>
                        )}
                      </div>

                      {/* Row: Provider (stored in created_by) */}
                      <div>
                        <dt className="text-sm font-semibold text-gray-900 mb-2">Provider</dt>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editForm.created_by || ''}
                            onChange={(e) => setEditForm({ ...editForm, created_by: e.target.value })}
                            className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Provider organization name"
                          />
                        ) : (
                          <dd className="text-sm text-gray-700">{path.created_by || '-'}</dd>
                        )}
                      </div>

                      <div>
                        <dt className="text-sm font-medium text-gray-700 mb-2">Tags</dt>
                        {isEditing ? (
                          <TagEditor
                            tags={editForm.tags}
                            onChange={(newTags) => setEditForm({...editForm, tags: newTags})}
                            placeholder="Type and press Enter to add tags..."
                          />
                        ) : (
                          <dd className="flex flex-wrap gap-2">
                            {path.tags && path.tags.length > 0 ? (
                              path.tags.map((tag, index) => (
                                <span key={index} className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                                  {tag}
                                </span>
                              ))
                            ) : (
                              <span className="text-sm text-gray-500">No tags</span>
                            )}
                          </dd>
                        )}
                      </div>

                      
                      {/* Configuration Details */}
                      {path.configs && Object.keys(path.configs).filter(key => key !== 'display_type').length > 0 && (
                        <>
                          <div className="pt-4 border-t border-gray-200">
                            <dt className="text-sm font-medium text-gray-500 mb-2">Configs</dt>
                            <dd className="mt-1 space-y-2">
                              {Object.entries(path.configs)
                                .filter(([key]) => key !== 'display_type')
                                .map(([key, value]) => (
                                  <div key={key} className="flex items-center">
                                    <span className="text-sm font-semibold text-gray-700 w-32 flex-shrink-0 border-r border-gray-200 pr-3">{key}:</span>
                                    <span className="text-sm text-gray-900 ml-3">{String(value)}</span>
                                  </div>
                              ))}
                            </dd>
                          </div>
                        </>
                      )}
                      
                      {path.extends && Object.keys(path.extends).length > 0 && (
                        <>
                          <div className="pt-4 border-t border-gray-200">
                            <dt className="text-sm font-medium text-gray-500 mb-2">Extends</dt>
                            <dd className="mt-1 space-y-2">
                              {Object.entries(path.extends).map(([key, value]) => (
                                <div key={key} className="flex items-center">
                                  <span className="text-sm font-semibold text-gray-700 w-32 flex-shrink-0 border-r border-gray-200 pr-3">{key}:</span>
                                  <span className="text-sm text-gray-900 ml-3">{String(value)}</span>
                                </div>
                              ))}
                            </dd>
                          </div>
                        </>
                      )}
                      
                      {path.hiddenContent && Object.keys(path.hiddenContent).length > 0 && (
                        <>
                          <div className="pt-4 border-t border-gray-200">
                            <dt className="text-sm font-medium text-gray-500 mb-2">Hidden Content</dt>
                            <dd className="mt-1 space-y-2">
                              {Object.entries(path.hiddenContent).map(([key, value]) => (
                                <div key={key} className="flex items-center">
                                  <span className="text-sm font-semibold text-gray-700 w-32 flex-shrink-0 border-r border-gray-200 pr-3">{key}:</span>
                                  <span className="text-sm text-gray-900 ml-3">{String(value)}</span>
                                </div>
                              ))}
                            </dd>
                          </div>
                        </>
                      )}
                    </dl>
                  </div>
                  <div className="w-[300px] flex-shrink-0 space-y-6">
                    <ImageEditor 
                      label="Image"
                      imageUrl={editForm.image}
                      onImageUrlChange={(url) => setEditForm({ ...editForm, image: url })}
                      onUploadComplete={async (url) => {
                        try {
                          const resp = await fetch(`/api/creator/paths/${pathSlug}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ image: url }) });
                          if (!resp.ok) throw new Error((await resp.json()).error || 'Failed to save image');
                        } catch (e) { throw e; }
                      }}
                      allowDelete={false}
                      mode="avatar"
                    />
                  </div>
                </div>




              </div>
            )}

            {activeTab === 'courses' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Courses in this Path ({courses.length})
                  </h3>
                  <div className="flex items-center space-x-3">
                    <StateFilter
                      states={COURSE_STATES}
                      selectedStates={selectedCourseStates}
                      onStatesChange={setSelectedCourseStates}
                    />
                    <button 
                      onClick={openCreateCourse}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                    >
                      <FaPlus className="mr-2 h-4 w-4" />
                      Add Course
                    </button>
                  </div>
                </div>

                {courses.length === 0 ? (
                  <div className="text-center py-12">
                    <FaGraduationCap className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No courses</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      This path doesn't have any courses yet.
                    </p>
                    <div className="mt-6">
                      <button 
                        onClick={openCreateCourse}
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                      >
                        <FaPlus className="mr-2 h-4 w-4" />
                        Add Course
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    {/* Bulk Actions Bar */}
                    {selectedCourses.length > 0 && (
                      <div className="bg-blue-50 border-b border-blue-200 px-6 py-3 mb-4 rounded-t-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-blue-700">
                            {selectedCourses.length} item{selectedCourses.length > 1 ? 's' : ''} selected
                          </span>
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => setSelectedCourses([])}
                              className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                            >
                              Clear Selection
                            </button>
                            <button
                              onClick={() => {
                                setBulkActionType('state');
                                setShowBulkActionModal(true);
                              }}
                              className="inline-flex items-center px-3 py-1.5 border border-blue-300 rounded-md text-sm font-medium text-blue-700 bg-white hover:bg-blue-50"
                            >
                              Change State
                            </button>
                            <button
                              onClick={() => {
                                setBulkActionType('delete');
                                handleBulkDelete();
                              }}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                            >
                              <FaTrash className="mr-2 h-3.5 w-3.5" />
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 w-12">
                              <input
                                type="checkbox"
                                checked={selectedCourses.length > 0 && 
                                  courses
                                    .filter(c => selectedCourseStates.includes(c.state))
                                    .every(c => selectedCourses.includes(c._id))}
                                onChange={(e) => handleSelectAllCourses(e.target.checked)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Course
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Category
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Lessons
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Duration
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              State
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {courses
                            .filter(course => selectedCourseStates.includes(course.state))
                            .map((course, index, filteredArray) => (
                            <tr key={course._id} className={`hover:bg-gray-50 ${selectedCourses.includes(course._id) ? 'bg-blue-50' : ''}`}>
                              <td className="px-6 py-3">
                                <input
                                  type="checkbox"
                                  checked={selectedCourses.includes(course._id)}
                                  onChange={() => handleToggleCourse(course._id)}
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-10 w-10">
                                    <div className="h-10 w-10 rounded-lg bg-blue-500 flex items-center justify-center">
                                      <FaGraduationCap className="h-6 w-6 text-white" />
                                    </div>
                                  </div>
                                  <div className="ml-4">
                                    <Link 
                                      href={`/manage/paths/${pathSlug}/courses/${course.slug}`}
                                      className="text-sm font-medium text-gray-900 hover:text-blue-600"
                                    >
                                      {course.name}
                                    </Link>
                                    <div className="text-sm text-gray-500">
                                      {course.slug}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {course.category || '-'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {course.total_lessons || 0}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {course.duration ? formatDuration(course.duration) : '-'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStateColor(course.state)}`}>
                                  {COURSE_STATES.find(s => s.value === course.state)?.label || course.state}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <div className="flex justify-end space-x-2">
                                  <Link 
                                    href={`/manage/paths/${pathSlug}/courses/${course.slug}`}
                                    className="text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-2 py-1 rounded transition-colors duration-200"
                                    title="View Course"
                                  >
                                    <FaArrowRight className="h-4 w-4" />
                                  </Link>
                                  <div className="relative dropdown-container">
                                    <button 
                                      onClick={() => setOpenDropdown(openDropdown === course._id ? null : course._id)}
                                      className="text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-2 py-1 rounded transition-colors duration-200 cursor-pointer"
                                      title="More options"
                                    >
                                      <FaEllipsisV className="h-4 w-4" />
                                    </button>
                                    {openDropdown === course._id && (
                                      <div className={`absolute right-0 w-48 bg-white rounded-md shadow-lg z-[9999] border border-gray-200 ${
                                        index === filteredArray.length - 1 ? 'bottom-full mb-2' : 'mt-2'
                                      }`}>
                                        <div className="py-1">
                                          {/* <button
                                            onClick={() => {
                                              // TODO: Implement edit course functionality
                                              setOpenDropdown(null);
                                            }}
                                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                                          >
                                            <FaEdit className="h-4 w-4 mr-2" />
                                            Edit Course
                                          </button> */}
                                          <button
                                            onClick={() => {
                                              handleDeleteCourse(course);
                                              setOpenDropdown(null);
                                            }}
                                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                                          >
                                            <FaTrash className="h-4 w-4 mr-2 text-red-600" />
                                            Delete Course
                                          </button>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'certificate' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Certificate Requirements</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Select which courses must be completed to earn a certificate for this path.
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    {isCertificateModified && (
                      <>
                        <Btn onClick={handleSaveCertificateConfig}>
                          <FaSave className="mr-2 h-4 w-4" />
                          Save Changes
                        </Btn>
                        <Btn variant="outlined" onClick={handleCancelCertificateEdit}>
                          <FaTimes className="mr-2 h-4 w-4" />
                          Cancel
                        </Btn>
                      </>
                    )}
                  </div>
                </div>

                {courses.length === 0 ? (
                  <div className="text-center py-12">
                    <FaGraduationCap className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No courses available</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Add courses to this path before configuring certificate requirements.
                    </p>
                    <div className="mt-6">
                      <button 
                        onClick={() => setActiveTab('courses')}
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                      >
                        <FaPlus className="mr-2 h-4 w-4" />
                        Go to Courses Tab
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">

                    <div className="grid gap-4">
                      {courses.map((course) => (
                        <div 
                          key={course._id} 
                          className={`border rounded-lg p-4 transition-colors ${
                            requiredCourseIds.includes(course._id) 
                              ? 'border-green-200 bg-green-50' 
                              : 'border-gray-200 bg-white hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="flex-shrink-0">
                                <input
                                  type="checkbox"
                                  id={`course-${course._id}`}
                                  checked={requiredCourseIds.includes(course._id)}
                                  onChange={() => handleRequiredCourseToggle(course._id)}
                                  className="h-5 w-5 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                                />
                              </div>
                              <div className="flex-shrink-0 h-12 w-12">
                                <div className="h-12 w-12 rounded-lg bg-blue-500 flex items-center justify-center">
                                  <FaGraduationCap className="h-6 w-6 text-white" />
                                </div>
                              </div>
                              <div className="min-w-0 flex-1">
                                <label 
                                  htmlFor={`course-${course._id}`}
                                  className="block text-sm font-medium text-gray-900 cursor-pointer"
                                >
                                  {course.name}
                                </label>
                                <p className="text-sm text-gray-500">{course.slug}</p>
                                {course.description && (
                                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">{course.description}</p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center space-x-4">
                              <div className="text-right">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStateColor(course.state)}`}>
                                  {COURSE_STATES.find(s => s.value === course.state)?.label || course.state}
                                </span>
                                <div className="text-xs text-gray-500 mt-1">
                                  {course.total_lessons || 0} lessons
                                  {course.duration ? ` • ${formatDuration(course.duration)}` : ''}
                                </div>
                              </div>
                              {/* {requiredCourseIds.includes(course._id) && (
                                <div className="flex-shrink-0">
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    Required
                                  </span>
                                </div>
                              )} */}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {isCertificateModified && (
                      <div className="border-t border-gray-200 pt-6">
                        <div className="flex justify-end space-x-3">
                          <Btn variant="outlined" onClick={handleCancelCertificateEdit}>
                            <FaTimes className="mr-2 h-4 w-4" />
                            Cancel Changes
                          </Btn>
                          <Btn onClick={handleSaveCertificateConfig}>
                            <FaSave className="mr-2 h-4 w-4" />
                            Save Certificate Requirements
                          </Btn>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
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

      {/* Bulk Action Modal */}
      {showBulkActionModal && bulkActionType === 'state' && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Change State
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Select the new state for {selectedCourses.length} selected courses.
              </p>
              
              <div className="space-y-2">
                {COURSE_STATES.map((state) => (
                  <label key={state.value} className="flex items-center p-3 border border-gray-200 rounded-md cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="newState"
                      value={state.value}
                      checked={bulkNewState === state.value}
                      onChange={(e) => setBulkNewState(e.target.value)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-3 text-sm">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStateColor(state.value)}`}>
                        {state.label}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowBulkActionModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkStateChange}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
                >
                  Change State
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Course Creation Modal */}
      {showCourseModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Add Course to Path
              </h3>
              
              <form onSubmit={handleCourseSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={courseForm.name}
                    onChange={(e) => setCourseForm({...courseForm, name: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Course name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    value={courseForm.description}
                    onChange={(e) => setCourseForm({...courseForm, description: e.target.value})}
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Course description"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <Btn
                    variant="outlined"
                    onClick={() => setShowCourseModal(false)}
                  >
                    Cancel
                  </Btn>
                  <Btn
                    type="submit"
                  >
                    Create Course
                  </Btn>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

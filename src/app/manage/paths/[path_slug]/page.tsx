'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
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
  FaEllipsisV,
  FaCog,
  FaList,
  FaSave,
  FaTimes
} from 'react-icons/fa';
import { COURSE_STATES, PATH_STATES } from '@/lib/const';
import ManageBreadCrumb from '@/app/components/atom/ManageBreadCrumb';
import ImageEditor from '@/app/components/atom/ImageEditor';

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
  created_at: string;
  updated_at: string;
  courses: Course[]; // Added courses to the Path interface
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
  
  const [path, setPath] = useState<Path | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'info' | 'background' | 'courses'>('info');
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
    display_type: 'list',
    tags: [] as string[],
    valid_from: '',
    valid_to: '',
    configs: {
      display_type: 'canvas'
    }
  });
  const [pathState, setPathState] = useState('draft');
  
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

  useEffect(() => {
    fetchPathData();
  }, [pathSlug]);

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

  const fetchPathData = async () => {
    try {
      const pathRes = await fetch(`/api/paths/${pathSlug}`);
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
          display_type: pathData.data.configs?.display_type || 'canvas',
          tags: pathData.data.tags || [],
          valid_from: pathData.data.valid_from ? pathData.data.valid_from.split('T')[0] : '',
          valid_to: pathData.data.valid_to ? pathData.data.valid_to.split('T')[0] : '',
          configs: {
            display_type: pathData.data.configs?.display_type || 'canvas'
          }
        });
        setPathState(pathData.data.state || 'draft');
        // Set courses from the path data if available
        if (pathData.data.courses && Array.isArray(pathData.data.courses)) {
          setCourses(pathData.data.courses);
        }
      } else {
        console.error('Failed to fetch path:', pathData.error);
      }
    } catch (error) {
      console.error('Error fetching path data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStateColor = (state: string) => {
    switch (state) {
      case 'published':
        return 'bg-blue-100 text-blue-800';
      case 'released':
        return 'bg-green-100 text-green-800';
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
      const response = await fetch('/api/courses/bulk', {
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
      const response = await fetch('/api/courses/bulk', {
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

  // Path edit handlers
  const handleSave = async () => {
    try {
      const response = await fetch(`/api/paths/${pathSlug}`, {
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
        display_type: path.configs?.display_type || 'canvas',
        tags: path.tags || [],
        valid_from: path.valid_from ? path.valid_from.split('T')[0] : '',
        valid_to: path.valid_to ? path.valid_to.split('T')[0] : '',
        configs: {
          display_type: path.configs?.display_type || 'canvas'
        }
      });
      setPathState(path.state || 'draft');
    }
  };

  // State change handler
  const handleStateChange = async (newState: string) => {
    try {
      const response = await fetch(`/api/paths/${pathSlug}`, {
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
    
    try {
      // Step 1: Create the course
      const courseResponse = await fetch('/api/courses', {
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

      const pathUpdateResponse = await fetch(`/api/paths/${pathSlug}`, {
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
      const courseResponse = await fetch(`/api/courses/${course.slug}`, {
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

      const pathUpdateResponse = await fetch(`/api/paths/${pathSlug}`, {
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
      ]} />
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
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">State:</span>
                <select
                  value={pathState}
                  onChange={(e) => handleStateChange(e.target.value)}
                  className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  {PATH_STATES.map((state) => (
                    <option key={state.value} value={state.value}>
                      {state.label}
                    </option>
                  ))}
                </select>
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
                onClick={() => setActiveTab('background')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'background'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FaRoute className="inline mr-2 h-4 w-4" />
                Background Image
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
                        Edit Path
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
                            <dd className="text-sm text-gray-900">{path.name}</dd>
                          )}
                        </div>

                        <div>
                          <dt className="text-sm font-medium text-gray-700 mb-2">Slug</dt>
                          <dd className="text-sm text-gray-500 font-mono">{path.slug}</dd>
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
                            <dd className="text-sm text-gray-900">{path.category || '-'}</dd>
                          )}
                        </div>

                        <div>
                          <dt className="text-sm font-medium text-gray-700 mb-2">Valid From</dt>
                          {isEditing ? (
                            <input
                              type="date"
                              value={editForm.valid_from}
                              onChange={(e) => setEditForm({...editForm, valid_from: e.target.value})}
                              className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                          ) : (
                            <dd className="text-sm text-gray-900">
                              {path.valid_from ? new Date(path.valid_from).toLocaleDateString() : '-'}
                            </dd>
                          )}
                        </div>

                        <div>
                          <dt className="text-sm font-medium text-gray-700 mb-2">Valid To</dt>
                          {isEditing ? (
                            <input
                              type="date"
                              value={editForm.valid_to}
                              onChange={(e) => setEditForm({...editForm, valid_to: e.target.value})}
                              className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                          ) : (
                            <dd className="text-sm text-gray-900">
                              {path.valid_to ? new Date(path.valid_to).toLocaleDateString() : '-'}
                            </dd>
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
                          <dd className="text-sm text-gray-900">{path.description}</dd>
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
                      allowDelete={false}
                      mode="avatar"
                    />
                  </div>
                </div>




              </div>
            )}

            {activeTab === 'background' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-medium text-gray-900">Background Image</h3>
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
                        Edit Background Image
                      </Btn>
                    )}
                  </div>
                </div>
                
                <div className="space-y-6">
                  {isEditing ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Background Image URL</label>
                      <input
                        type="url"
                        value={editForm.background_img || ''}
                        onChange={(e) => setEditForm({...editForm, background_img: e.target.value || null})}
                        className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="https://example.com/background.jpg"
                      />
                      {editForm.background_img && (
                        <div className="mt-4">
                          <img
                            src={editForm.background_img}
                            alt="Background Preview"
                            className="w-full h-96 object-cover rounded-lg border border-gray-200"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <dt className="text-sm font-medium text-gray-500 mb-2">Current Background Image</dt>
                      {path.background_img ? (
                        <div className="mt-2">
                          <img 
                            src={path.background_img} 
                            alt={`${path.name} background`}
                            className="w-full h-96 object-cover rounded-lg border border-gray-200"
                          />
                        </div>
                      ) : (
                        <div className="mt-2 p-6 border-2 border-dashed border-gray-300 rounded-lg text-center">
                          <FaRoute className="mx-auto h-8 w-8 text-gray-400" />
                          <p className="mt-2 text-sm text-gray-500">No background image uploaded</p>
                        </div>
                      )}
                    </div>
                  )}
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
                                      <div className={`absolute right-0 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200 ${
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

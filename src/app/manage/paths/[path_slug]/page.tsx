'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
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
  FaList
} from 'react-icons/fa';

interface Path {
  _id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
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
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Link 
                href="/manage"
                className="mr-4 inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <FaArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{path.name}</h1>
                <p className="mt-1 text-sm text-gray-500">
                  {path.slug}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStateColor(path.state)}`}>
                {path.state}
              </span>
              <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
                <FaEdit className="mr-2 h-4 w-4" />
                Edit Path
              </button>
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
                <div className="flex gap-8">
                  {/* Basic Information */}
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
                    <dl className="space-y-4">
                      <div className="flex items-center">
                        <dt className="text-sm font-semibold text-gray-700 w-32 flex-shrink-0 border-r border-gray-200 pr-3">Name</dt>
                        <dd className="text-sm text-gray-900 ml-3">{path.name}</dd>
                      </div>
                      <div className="flex items-center">
                        <dt className="text-sm font-semibold text-gray-700 w-32 flex-shrink-0 border-r border-gray-200 pr-3">Slug</dt>
                        <dd className="text-sm text-gray-900 ml-3">{path.slug}</dd>
                      </div>
                      <div className="flex items-start">
                        <dt className="text-sm font-semibold text-gray-700 w-32 flex-shrink-0 border-r border-gray-200 pr-3">Description</dt>
                        <dd className="text-sm text-gray-900 flex-1 ml-3">{path.description}</dd>
                      </div>
                      <div className="flex items-center">
                        <dt className="text-sm font-semibold text-gray-700 w-32 flex-shrink-0 border-r border-gray-200 pr-3">Category</dt>
                        <dd className="text-sm text-gray-900 ml-3">{path.category || '-'}</dd>
                      </div>
                      <div className="flex items-center">
                        <dt className="text-sm font-semibold text-gray-700 w-32 flex-shrink-0 border-r border-gray-200 pr-3">Path Type</dt>
                        <dd className="text-sm text-gray-900 ml-3">{path.path_type}</dd>
                      </div>
                      <div className="flex items-center">
                        <dt className="text-sm font-semibold text-gray-700 w-32 flex-shrink-0 border-r border-gray-200 pr-3">State</dt>
                        <dd className="ml-3">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStateColor(path.state)}`}>
                            {path.state}
                          </span>
                        </dd>
                      </div>
                      <div className="flex items-center">
                        <dt className="text-sm font-semibold text-gray-700 w-32 flex-shrink-0 border-r border-gray-200 pr-3">Valid From</dt>
                        <dd className="text-sm text-gray-900 ml-3">
                          {path.valid_from ? new Date(path.valid_from).toLocaleDateString() : '-'}
                        </dd>
                      </div>
                      <div className="flex items-center">
                        <dt className="text-sm font-semibold text-gray-700 w-32 flex-shrink-0 border-r border-gray-200 pr-3">Valid To</dt>
                        <dd className="text-sm text-gray-900 ml-3">
                          {path.valid_to ? new Date(path.valid_to).toLocaleDateString() : '-'}
                        </dd>
                      </div>
                      <div className="flex items-center">
                        <dt className="text-sm font-semibold text-gray-700 w-32 flex-shrink-0 border-r border-gray-200 pr-3">Created</dt>
                        <dd className="text-sm text-gray-900 ml-3">
                          {new Date(path.created_at).toLocaleDateString()}
                        </dd>
                      </div>

                      
                      {/* Configuration Details */}
                      {path.configs && Object.keys(path.configs).length > 0 && (
                        <>
                          <div className="pt-4 border-t border-gray-200">
                            <dt className="text-sm font-medium text-gray-500 mb-2">Configs</dt>
                            <dd className="mt-1 space-y-2">
                              {Object.entries(path.configs).map(([key, value]) => (
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

                  {/* Path Image */}
                  <div className="w-[300px] flex-shrink-0">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-gray-900">Image</h3>
                      <button className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
                        <FaEdit className="mr-1.5 h-3.5 w-3.5" />
                        {path.image ? 'Change Image' : 'Upload Image'}
                      </button>
                    </div>
                    <div className="space-y-4">
                      {path.image ? (
                        <div>
                          <img 
                            src={path.image} 
                            alt={path.name}
                            className="w-[300px] h-[300px] object-cover rounded-lg border border-gray-200"
                          />
                        </div>
                      ) : (
                        <div className="w-[300px] h-[300px] border-2 border-dashed border-gray-300 rounded-lg text-center flex items-center justify-center">
                          <div>
                            <FaRoute className="mx-auto h-12 w-12 text-gray-400" />
                            <p className="mt-2 text-sm text-gray-500">No image uploaded</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>




              </div>
            )}

            {activeTab === 'background' && (
              <div>
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Background Image</h3>
                  <div className="space-y-4">
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
                    <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
                      <FaEdit className="mr-2 h-4 w-4" />
                      Edit Background Image
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'courses' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Courses in this Path
                  </h3>
                  <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
                    <FaPlus className="mr-2 h-4 w-4" />
                    Add Course
                  </button>
                </div>

                {courses.length === 0 ? (
                  <div className="text-center py-12">
                    <FaGraduationCap className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No courses</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      This path doesn't have any courses yet.
                    </p>
                    <div className="mt-6">
                      <button className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                        <FaPlus className="mr-2 h-4 w-4" />
                        Add Course
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
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
                        {courses.map((course) => (
                          <tr key={course._id} className="hover:bg-gray-50">
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
                                {course.state}
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
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                                      <div className="py-1">
                                        <button
                                          onClick={() => {
                                            // TODO: Implement edit course functionality
                                            setOpenDropdown(null);
                                          }}
                                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                                        >
                                          <FaEdit className="h-4 w-4 mr-2" />
                                          Edit Course
                                        </button>
                                        <button
                                          onClick={() => {
                                            // TODO: Implement delete course functionality
                                            setOpenDropdown(null);
                                          }}
                                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                                        >
                                          <FaTrash className="h-4 w-4 mr-2" />
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
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

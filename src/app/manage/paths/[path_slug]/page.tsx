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
  FaEye,
  FaArrowLeft,
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
  const pathSlug = params.path_slug as string;
  
  const [path, setPath] = useState<Path | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'info' | 'courses'>('info');

  useEffect(() => {
    fetchPathData();
  }, [pathSlug]);

  const fetchPathData = async () => {
    try {
      const [pathRes, coursesRes] = await Promise.all([
        fetch(`/api/paths/${pathSlug}`),
        fetch(`/api/paths/${pathSlug}/courses`)
      ]);

      const pathData = await pathRes.json();
      const coursesData = await coursesRes.json();

      if (pathData.success) {
        setPath(pathData.data);
      }
      if (coursesData.success) {
        setCourses(coursesData.data);
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
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
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
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
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
              <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700">
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
                    ? 'border-green-500 text-green-600'
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
                    ? 'border-purple-500 text-purple-600'
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
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Basic Information */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
                    <dl className="space-y-4">
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Name</dt>
                        <dd className="mt-1 text-sm text-gray-900">{path.name}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Slug</dt>
                        <dd className="mt-1 text-sm text-gray-900">{path.slug}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Description</dt>
                        <dd className="mt-1 text-sm text-gray-900">{path.description}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Category</dt>
                        <dd className="mt-1 text-sm text-gray-900">{path.category || '-'}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Path Type</dt>
                        <dd className="mt-1 text-sm text-gray-900">{path.path_type}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">State</dt>
                        <dd className="mt-1">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStateColor(path.state)}`}>
                            {path.state}
                          </span>
                        </dd>
                      </div>
                    </dl>
                  </div>

                  {/* Media & Configuration */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Media & Configuration</h3>
                    <dl className="space-y-4">
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Background Image</dt>
                        <dd className="mt-1 text-sm text-gray-900">{path.background_img || '-'}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Image</dt>
                        <dd className="mt-1 text-sm text-gray-900">{path.image || '-'}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Thumbnail</dt>
                        <dd className="mt-1 text-sm text-gray-900">{path.thumb || '-'}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Valid From</dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {path.valid_from ? new Date(path.valid_from).toLocaleDateString() : '-'}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Valid To</dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {path.valid_to ? new Date(path.valid_to).toLocaleDateString() : '-'}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Created</dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {new Date(path.created_at).toLocaleDateString()}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>

                {/* Configuration Details */}
                {(path.configs || path.extends || path.hiddenContent) && (
                  <div className="mt-8">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Configuration Details</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {path.configs && Object.keys(path.configs).length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 mb-2">Configs</h4>
                          <pre className="text-xs bg-gray-50 p-3 rounded overflow-auto">
                            {JSON.stringify(path.configs, null, 2)}
                          </pre>
                        </div>
                      )}
                      {path.extends && Object.keys(path.extends).length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 mb-2">Extends</h4>
                          <pre className="text-xs bg-gray-50 p-3 rounded overflow-auto">
                            {JSON.stringify(path.extends, null, 2)}
                          </pre>
                        </div>
                      )}
                      {path.hiddenContent && Object.keys(path.hiddenContent).length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 mb-2">Hidden Content</h4>
                          <pre className="text-xs bg-gray-50 p-3 rounded overflow-auto">
                            {JSON.stringify(path.hiddenContent, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'courses' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Courses in this Path
                  </h3>
                  <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700">
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
                      <button className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700">
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
                                  <div className="h-10 w-10 rounded-lg bg-purple-500 flex items-center justify-center">
                                    <FaGraduationCap className="h-6 w-6 text-white" />
                                  </div>
                                </div>
                                <div className="ml-4">
                                  <Link 
                                    href={`/manage/paths/${pathSlug}/courses/${course.slug}`}
                                    className="text-sm font-medium text-gray-900 hover:text-purple-600"
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
                                  className="text-blue-600 hover:text-blue-900"
                                >
                                  <FaEye className="h-4 w-4" />
                                </Link>
                                <button className="text-indigo-600 hover:text-indigo-900">
                                  <FaEdit className="h-4 w-4" />
                                </button>
                                <button className="text-red-600 hover:text-red-900">
                                  <FaTrash className="h-4 w-4" />
                                </button>
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

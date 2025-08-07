'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  FaBook, 
  FaEdit, 
  FaSave, 
  FaArrowLeft,
  FaCog,
  FaEye,
  FaVideo,
  FaFileAlt,
  FaQuestionCircle,
  FaCogs
} from 'react-icons/fa';

interface Lesson {
  _id: string;
  name: string;
  slug: string;
  description: string;
  lesson_type: string;
  state: string;
  duration: number;
  content: any;
  configs: any;
  created_at: string;
  updated_at: string;
}

export default function LessonDetailPage() {
  const params = useParams();
  const pathSlug = params.path_slug as string;
  const courseSlug = params.course_slug as string;
  const lessonSlug = params.lesson_slug as string;
  
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    fetchLessonData();
  }, [lessonSlug]);

  const fetchLessonData = async () => {
    try {
      const response = await fetch(`/api/lessons/${lessonSlug}`);
      const data = await response.json();

      if (data.success) {
        setLesson(data.data);
        setFormData(data.data);
      }
    } catch (error) {
      console.error('Error fetching lesson data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/lessons/${lessonSlug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        setLesson(data.data);
        setFormData(data.data);
        setEditing(false);
      }
    } catch (error) {
      console.error('Error saving lesson:', error);
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

  const getLessonTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <FaVideo className="h-5 w-5 text-red-500" />;
      case 'text':
        return <FaFileAlt className="h-5 w-5 text-blue-500" />;
      case 'quiz':
        return <FaQuestionCircle className="h-5 w-5 text-purple-500" />;
      case 'interactive':
        return <FaCogs className="h-5 w-5 text-green-500" />;
      default:
        return <FaBook className="h-5 w-5 text-gray-500" />;
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading lesson details...</p>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaBook className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Lesson not found</h3>
          <p className="mt-1 text-sm text-gray-500">
            The lesson you're looking for doesn't exist.
          </p>
          <div className="mt-6">
            <Link
              href={`/manage/paths/${pathSlug}/courses/${courseSlug}`}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700"
            >
              <FaArrowLeft className="mr-2 h-4 w-4" />
              Back to Course
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
                href={`/manage/paths/${pathSlug}/courses/${courseSlug}`}
                className="mr-4 inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <FaArrowLeft className="mr-2 h-4 w-4" />
                Back to Course
              </Link>
              <div className="flex items-center">
                {getLessonTypeIcon(lesson.lesson_type)}
                <div className="ml-3">
                  <h1 className="text-3xl font-bold text-gray-900">{lesson.name}</h1>
                  <p className="mt-1 text-sm text-gray-500">
                    {lesson.slug} • {lesson.lesson_type} • {formatDuration(lesson.duration)}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStateColor(lesson.state)}`}>
                {lesson.state}
              </span>
              {editing ? (
                <div className="flex space-x-2">
                  <button 
                    onClick={handleSave}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                  >
                    <FaSave className="mr-2 h-4 w-4" />
                    Save
                  </button>
                  <button 
                    onClick={() => {
                      setEditing(false);
                      setFormData(lesson);
                    }}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => setEditing(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700"
                >
                  <FaEdit className="mr-2 h-4 w-4" />
                  Edit Lesson
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lesson Information */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Lesson Information</h3>
              </div>
              <div className="p-6">
                {editing ? (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Name</label>
                      <input
                        type="text"
                        value={formData.name || ''}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Description</label>
                      <textarea
                        rows={4}
                        value={formData.description || ''}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Lesson Type</label>
                      <select
                        value={formData.lesson_type || ''}
                        onChange={(e) => setFormData({...formData, lesson_type: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                      >
                        <option value="video">Video</option>
                        <option value="text">Text</option>
                        <option value="quiz">Quiz</option>
                        <option value="interactive">Interactive</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">State</label>
                      <select
                        value={formData.state || ''}
                        onChange={(e) => setFormData({...formData, state: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                      >
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                        <option value="archived">Archived</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Duration (minutes)</label>
                      <input
                        type="number"
                        value={formData.duration || ''}
                        onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value)})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Name</dt>
                      <dd className="mt-1 text-sm text-gray-900">{lesson.name}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Description</dt>
                      <dd className="mt-1 text-sm text-gray-900">{lesson.description}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Lesson Type</dt>
                      <dd className="mt-1 flex items-center">
                        {getLessonTypeIcon(lesson.lesson_type)}
                        <span className="ml-2 text-sm text-gray-900 capitalize">{lesson.lesson_type}</span>
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">State</dt>
                      <dd className="mt-1">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStateColor(lesson.state)}`}>
                          {lesson.state}
                        </span>
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Duration</dt>
                      <dd className="mt-1 text-sm text-gray-900">{formatDuration(lesson.duration)}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Created</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {new Date(lesson.created_at).toLocaleDateString()}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {new Date(lesson.updated_at).toLocaleDateString()}
                      </dd>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Lesson Content */}
            <div className="mt-8 bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Lesson Content</h3>
              </div>
              <div className="p-6">
                {editing ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Content (JSON)</label>
                    <textarea
                      rows={12}
                      value={JSON.stringify(formData.content || {}, null, 2)}
                      onChange={(e) => {
                        try {
                          const parsed = JSON.parse(e.target.value);
                          setFormData({...formData, content: parsed});
                        } catch (error) {
                          // Invalid JSON, keep as string
                        }
                      }}
                      className="block w-full border border-gray-300 rounded-md px-3 py-2 font-mono text-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Enter lesson content as JSON..."
                    />
                  </div>
                ) : (
                  <div>
                    <pre className="bg-gray-50 p-4 rounded text-sm overflow-auto max-h-96">
                      {JSON.stringify(lesson.content || {}, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
              </div>
              <div className="p-6 space-y-3">
                <button className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
                  <FaEye className="mr-2 h-4 w-4" />
                  Preview Lesson
                </button>
                <button className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                  <FaCog className="mr-2 h-4 w-4" />
                  Advanced Settings
                </button>
              </div>
            </div>

            {/* Configuration */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Configuration</h3>
              </div>
              <div className="p-6">
                {editing ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Configs (JSON)</label>
                    <textarea
                      rows={6}
                      value={JSON.stringify(formData.configs || {}, null, 2)}
                      onChange={(e) => {
                        try {
                          const parsed = JSON.parse(e.target.value);
                          setFormData({...formData, configs: parsed});
                        } catch (error) {
                          // Invalid JSON, keep as string
                        }
                      }}
                      className="block w-full border border-gray-300 rounded-md px-3 py-2 font-mono text-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Enter configuration as JSON..."
                    />
                  </div>
                ) : (
                  <div>
                    <pre className="bg-gray-50 p-3 rounded text-xs overflow-auto max-h-48">
                      {JSON.stringify(lesson.configs || {}, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  FaFolder, 
  FaRoute, 
  FaGraduationCap, 
  FaBook, 
  FaPlus, 
  FaArrowRight, 
  FaEllipsisV,
  FaEdit,
  FaTrash,
  FaChartBar
} from 'react-icons/fa';

interface Stats {
  collections: number;
  paths: number;
  courses: number;
  lessons: number;
}

interface Collection {
  _id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  tags?: string[];
  state: string;
  total_paths: number;
  created_at: string;
}

interface Path {
  _id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  state: string;
  total_courses: number;
  created_at: string;
}

export default function ManagePage() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats>({
    collections: 0,
    paths: 0,
    courses: 0,
    lessons: 0
  });
  const [collections, setCollections] = useState<Collection[]>([]);
  const [paths, setPaths] = useState<Path[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'collections' | 'paths'>('collections');
  
  // Collection modal states
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const [collectionForm, setCollectionForm] = useState({
    name: '',
    description: '',
    category: '',
    tags: [] as string[],
    state: 'draft'
  });
  
  // Dropdown state
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      console.log('Starting to fetch data...');
      
      // Fetch each API separately to identify which one is failing
      console.log('Fetching collections...');
      const collectionsRes = await fetch('/api/collections');
      console.log('Collections response status:', collectionsRes.status);
      const collectionsData = await collectionsRes.json();
      console.log('Collections data:', collectionsData);
      
      console.log('Fetching paths...');
      const pathsRes = await fetch('/api/paths');
      console.log('Paths response status:', pathsRes.status);
      const pathsData = await pathsRes.json();
      console.log('Paths data:', pathsData);
      
      console.log('Fetching courses...');
      const coursesRes = await fetch('/api/courses');
      console.log('Courses response status:', coursesRes.status);
      const coursesData = await coursesRes.json();
      console.log('Courses data:', coursesData);
      
      console.log('Fetching lessons...');
      const lessonsRes = await fetch('/api/lessons');
      console.log('Lessons response status:', lessonsRes.status);
      const lessonsData = await lessonsRes.json();
      console.log('Lessons data:', lessonsData);

      setStats({
        collections: collectionsData.success ? collectionsData.data.length : 0,
        paths: pathsData.success ? pathsData.data.length : 0,
        courses: coursesData.success ? coursesData.data.length : 0,
        lessons: lessonsData.success ? lessonsData.data.length : 0
      });

      if (collectionsData.success) {
        setCollections(collectionsData.data);
      }
      if (pathsData.success) {
        setPaths(pathsData.data);
      }
      
      console.log('Data fetching completed successfully');
    } catch (error) {
      console.error('Error fetching data:', error);
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

  // Collection functions
  const openCreateCollection = () => {
    setEditingCollection(null);
    setCollectionForm({
      name: '',
      description: '',
      category: '',
      tags: [],
      state: 'draft'
    });
    setShowCollectionModal(true);
  };

  const openEditCollection = (collection: Collection) => {
    setEditingCollection(collection);
    setCollectionForm({
      name: collection.name,
      description: collection.description || '',
      category: collection.category || '',
      tags: collection.tags || [],
      state: collection.state
    });
    setShowCollectionModal(true);
  };

  const handleCollectionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingCollection 
        ? `/api/collections/${editingCollection.slug}`
        : '/api/collections';
      
      const method = editingCollection ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(collectionForm),
      });

      if (response.ok) {
        setShowCollectionModal(false);
        fetchData(); // Refresh data
      } else {
        const error = await response.json();
        alert(`Error: ${error.error || 'Failed to save collection'}`);
      }
    } catch (error) {
      console.error('Error saving collection:', error);
      alert('Failed to save collection');
    }
  };

  const handleDeleteCollection = async (collection: Collection) => {
    if (!confirm(`Are you sure you want to delete "${collection.name}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/collections/${collection.slug}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchData(); // Refresh data
      } else {
        const error = await response.json();
        alert(`Error: ${error.error || 'Failed to delete collection'}`);
      }
    } catch (error) {
      console.error('Error deleting collection:', error);
      alert('Failed to delete collection');
    }
  };

  const handleViewCollection = (collection: Collection) => {
    // Navigate to collection detail page
    router.push(`/manage/collections/${collection.slug}`);
  };

  const handleClickOutside = (event: MouseEvent) => {
    const target = event.target as Element;
    if (!target.closest('.dropdown-container')) {
      setOpenDropdown(null);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading management dashboard...</p>
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
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Content Management</h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage collections, paths, courses, and lessons
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                href="/"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                ← Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FaFolder className="h-6 w-6 text-blue-500" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Collections
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.collections}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FaRoute className="h-6 w-6 text-blue-500" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Paths
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.paths}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FaGraduationCap className="h-6 w-6 text-blue-500" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Courses
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.courses}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FaBook className="h-6 w-6 text-blue-500" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Lessons
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.lessons}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white shadow rounded-lg">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('collections')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'collections'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Collections ({collections.length})
              </button>
              <button
                onClick={() => setActiveTab('paths')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'paths'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Paths ({paths.length})
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'collections' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Collections
                  </h3>
                  <button 
                    onClick={openCreateCollection}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <FaPlus className="mr-2 h-4 w-4" />
                    Create Collection
                  </button>
                </div>

                {collections.length === 0 ? (
                  <div className="text-center py-12">
                    <FaFolder className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No collections</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Get started by creating a new collection.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Collection
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Category
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Paths
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            State
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Created
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {collections.map((collection) => (
                          <tr key={collection._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10">
                                  <div className="h-10 w-10 rounded-lg bg-blue-500 flex items-center justify-center">
                                    <FaFolder className="h-6 w-6 text-white" />
                                  </div>
                                </div>
                                <div className="ml-4">
                                  <Link 
                                    href={`/manage/collections/${collection.slug}`}
                                    className="text-sm font-medium text-gray-900 hover:text-blue-600"
                                  >
                                    {collection.name}
                                  </Link>
                                  <div className="text-sm text-gray-500">
                                    {collection.slug}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {collection.category || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {collection.total_paths || 0}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStateColor(collection.state)}`}>
                                {collection.state}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(collection.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex justify-end space-x-2">
                                <button 
                                  onClick={() => handleViewCollection(collection)}
                                  className="text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-2 py-1 rounded transition-colors duration-200 cursor-pointer"
                                  title="View Collection"
                                >
                                  <FaArrowRight className="h-4 w-4" />
                                </button>
                                <div className="relative dropdown-container">
                                  <button 
                                    onClick={() => setOpenDropdown(openDropdown === collection._id ? null : collection._id)}
                                    className="text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-2 py-1 rounded transition-colors duration-200 cursor-pointer"
                                    title="More options"
                                  >
                                    <FaEllipsisV className="h-4 w-4" />
                                  </button>
                                  {openDropdown === collection._id && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                                      <div className="py-1">
                                        <button
                                          onClick={() => {
                                            openEditCollection(collection);
                                            setOpenDropdown(null);
                                          }}
                                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                                        >
                                          <FaEdit className="h-4 w-4 mr-2" />
                                          Edit Collection
                                        </button>
                                        <button
                                          onClick={() => {
                                            handleDeleteCollection(collection);
                                            setOpenDropdown(null);
                                          }}
                                          className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 flex items-center"
                                        >
                                          <FaTrash className="h-4 w-4 mr-2" />
                                          Delete Collection
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

            {activeTab === 'paths' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Paths
                  </h3>
                  <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
                    <FaPlus className="mr-2 h-4 w-4" />
                    Create Path
                  </button>
                </div>

                {paths.length === 0 ? (
                  <div className="text-center py-12">
                    <FaRoute className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No paths</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Get started by creating a new path.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Path
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Category
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Courses
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            State
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Created
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {paths.map((path) => (
                          <tr key={path._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10">
                                  <div className="h-10 w-10 rounded-lg bg-blue-500 flex items-center justify-center">
                                    <FaRoute className="h-6 w-6 text-white" />
                                  </div>
                                </div>
                                <div className="ml-4">
                                  <Link 
                                    href={`/manage/paths/${path.slug}`}
                                    className="text-sm font-medium text-gray-900 hover:text-blue-600"
                                  >
                                    {path.name}
                                  </Link>
                                  <div className="text-sm text-gray-500">
                                    {path.slug}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {path.category || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {path.total_courses || 0}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStateColor(path.state)}`}>
                                {path.state}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(path.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex justify-end space-x-2">
                                <Link 
                                  href={`/manage/paths/${path.slug}`}
                                  className="text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-2 py-1 rounded transition-colors duration-200"
                                >
                                  <FaArrowRight className="h-4 w-4" />
                                </Link>
                                <div className="relative dropdown-container">
                                  <button 
                                    onClick={() => setOpenDropdown(openDropdown === path._id ? null : path._id)}
                                    className="text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-2 py-1 rounded transition-colors duration-200 cursor-pointer"
                                    title="More options"
                                  >
                                    <FaEllipsisV className="h-4 w-4" />
                                  </button>
                                  {openDropdown === path._id && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                                      <div className="py-1">
                                        <button
                                          onClick={() => {
                                            // TODO: Implement edit path functionality
                                            setOpenDropdown(null);
                                          }}
                                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                                        >
                                          <FaEdit className="h-4 w-4 mr-2" />
                                          Edit Path
                                        </button>
                                        <button
                                          onClick={() => {
                                            // TODO: Implement delete path functionality
                                            setOpenDropdown(null);
                                          }}
                                          className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 flex items-center"
                                        >
                                          <FaTrash className="h-4 w-4 mr-2" />
                                          Delete Path
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

      {/* Collection Modal */}
      {showCollectionModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingCollection ? 'Edit Collection' : 'Create Collection'}
              </h3>
              
              <form onSubmit={handleCollectionSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={collectionForm.name}
                    onChange={(e) => setCollectionForm({...collectionForm, name: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Collection name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    value={collectionForm.description}
                    onChange={(e) => setCollectionForm({...collectionForm, description: e.target.value})}
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Collection description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Category
                  </label>
                  <input
                    type="text"
                    value={collectionForm.category}
                    onChange={(e) => setCollectionForm({...collectionForm, category: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., fundamentals, hands-on"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Tags
                  </label>
                  <input
                    type="text"
                    value={collectionForm.tags.join(', ')}
                    onChange={(e) => setCollectionForm({
                      ...collectionForm, 
                      tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag)
                    })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="tag1, tag2, tag3"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    State
                  </label>
                  <select
                    value={collectionForm.state}
                    onChange={(e) => setCollectionForm({...collectionForm, state: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCollectionModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {editingCollection ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

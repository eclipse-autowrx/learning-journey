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
import StateFilter from '@/app/components/atom/StateFilter';
import Btn from '@/app/components/atom/Btn';
import { 
  showDeleteConfirm, 
  showBulkDeleteConfirm, 
  showStateChangeConfirm,
  showBulkOperationResult,
  showToast
} from '@/lib/utils/notifications';

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
  const [selectedCollectionStates, setSelectedCollectionStates] = useState<string[]>(['published', 'draft', 'archived']);
  const [selectedPathStates, setSelectedPathStates] = useState<string[]>(['published', 'draft', 'archived', 'locked', 'released']);
  
  // Bulk selection states
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
  const [selectedPaths, setSelectedPaths] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  
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
  
  // Bulk action modal state
  const [showBulkActionModal, setShowBulkActionModal] = useState(false);
  const [bulkActionType, setBulkActionType] = useState<'state' | 'delete' | null>(null);
  const [bulkNewState, setBulkNewState] = useState<string>('draft');

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
        return 'bg-green-100 text-green-800';
      case 'released':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-blue-100 text-blue-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      case 'locked':
        return 'bg-red-100 text-red-800';
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
        showToast.success(editingCollection ? 'Collection updated successfully' : 'Collection created successfully');
        setShowCollectionModal(false);
        fetchData(); // Refresh data
      } else {
        const error = await response.json();
        showToast.error(`Error: ${error.error || 'Failed to save collection'}`);
      }
    } catch (error) {
      console.error('Error saving collection:', error);
      showToast.error('Failed to save collection');
    }
  };

  const handleDeleteCollection = async (collection: Collection) => {
    const result = await showDeleteConfirm(collection.name);
    if (!result.isConfirmed) {
      return;
    }

    try {
      const response = await fetch(`/api/collections/${collection.slug}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        showToast.success(`Collection "${collection.name}" deleted successfully`);
        fetchData(); // Refresh data
      } else {
        const error = await response.json();
        showToast.error(`Error: ${error.error || 'Failed to delete collection'}`);
      }
    } catch (error) {
      console.error('Error deleting collection:', error);
      showToast.error('Failed to delete collection');
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

  // Bulk selection handlers
  const handleSelectAllCollections = (checked: boolean) => {
    if (checked) {
      const visibleCollections = collections
        .filter(c => selectedCollectionStates.includes(c.state))
        .map(c => c._id);
      setSelectedCollections(visibleCollections);
    } else {
      setSelectedCollections([]);
    }
  };

  const handleSelectAllPaths = (checked: boolean) => {
    if (checked) {
      const visiblePaths = paths
        .filter(p => selectedPathStates.includes(p.state))
        .map(p => p._id);
      setSelectedPaths(visiblePaths);
    } else {
      setSelectedPaths([]);
    }
  };

  const handleToggleCollection = (id: string) => {
    setSelectedCollections(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleTogglePath = (id: string) => {
    setSelectedPaths(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  // Bulk action handlers
  const handleBulkStateChange = async () => {
    const itemType = activeTab === 'collections' ? 'collections' : 'paths';
    const selectedItems = activeTab === 'collections' ? selectedCollections : selectedPaths;
    
    // Show confirmation dialog
    const result = await showStateChangeConfirm(itemType, selectedItems.length, bulkNewState);
    if (!result.isConfirmed) {
      return;
    }
    
    try {
      const response = await fetch(`/api/${itemType}/bulk`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ids: selectedItems,
          state: bulkNewState
        }),
      });

      const result = await response.json();
      
      // Show result using toast notifications
      showBulkOperationResult(result);
      
      if (result.success) {
        // Refresh data after operation
        await fetchData();
        
        // Clear selections
        setSelectedCollections([]);
        setSelectedPaths([]);
        setShowBulkActionModal(false);
      }
    } catch (error) {
      console.error('Error performing bulk state change:', error);
      showToast.error('Failed to update items');
    }
  };

  const handleBulkDelete = async () => {
    const itemType = activeTab === 'collections' ? 'collections' : 'paths';
    const selectedItems = activeTab === 'collections' ? selectedCollections : selectedPaths;
    
    // Show confirmation dialog
    const result = await showBulkDeleteConfirm(itemType, selectedItems.length);
    if (!result.isConfirmed) {
      return;
    }
    
    try {
      const response = await fetch(`/api/${itemType}/bulk`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ids: selectedItems
        }),
      });

      const result = await response.json();
      
      // Show result using toast notifications
      showBulkOperationResult(result);
      
      if (result.success) {
        // Refresh data after operation
        await fetchData();
        
        // Clear selections
        setSelectedCollections([]);
        setSelectedPaths([]);
        setShowBulkActionModal(false);
      }
    } catch (error) {
      console.error('Error performing bulk delete:', error);
      showToast.error('Failed to delete items');
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
                  <div className="flex items-center space-x-3">
                    <StateFilter
                      states={['published', 'draft', 'archived']}
                      selectedStates={selectedCollectionStates}
                      onStatesChange={setSelectedCollectionStates}
                    />
                    <button 
                      onClick={openCreateCollection}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                    >
                      <FaPlus className="mr-2 h-4 w-4" />
                      Create Collection
                    </button>
                  </div>
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
                  <div>
                    {/* Bulk Actions Bar */}
                    {selectedCollections.length > 0 && (
                      <div className="bg-blue-50 border-b border-blue-200 px-6 py-3 mb-4 rounded-t-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-blue-700">
                            {selectedCollections.length} item{selectedCollections.length > 1 ? 's' : ''} selected
                          </span>
                          <div className="flex items-center space-x-3">
                            <Btn
                              variant="outlined"
                              onClick={() => setSelectedCollections([])}
                            >
                              Clear Selection
                            </Btn>
                            <Btn
                              variant="outlined"
                              onClick={() => {
                                setBulkActionType('state');
                                setShowBulkActionModal(true);
                              }}
                            >
                              Change State
                            </Btn>
                            <Btn
                              onClick={() => {
                                setBulkActionType('delete');
                                handleBulkDelete();
                              }}
                            >
                              <FaTrash className="mr-2 h-3.5 w-3.5" />
                              Delete
                            </Btn>
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
                                checked={selectedCollections.length > 0 && 
                                  collections
                                    .filter(c => selectedCollectionStates.includes(c.state))
                                    .every(c => selectedCollections.includes(c._id))}
                                onChange={(e) => handleSelectAllCollections(e.target.checked)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                            </th>
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
                        {collections
                          .filter(collection => selectedCollectionStates.includes(collection.state))
                          .map((collection, index, filteredArray) => (
                          <tr key={collection._id} className={`hover:bg-gray-50 ${selectedCollections.includes(collection._id) ? 'bg-blue-50' : ''}`}>
                            <td className="px-6 py-3">
                              <input
                                type="checkbox"
                                checked={selectedCollections.includes(collection._id)}
                                onChange={() => handleToggleCollection(collection._id)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                            </td>
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
                                    <div className={`absolute right-0 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200 ${
                                      index === filteredArray.length - 1 ? 'bottom-0 mb-2' : 'top-0 mt-2'
                                    }`}>
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
                                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                                        >
                                            <FaTrash className="h-4 w-4 mr-2 text-red-600" />
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
                  <div className="flex items-center space-x-3">
                    <StateFilter
                      states={['published', 'draft', 'archived', 'locked', 'released']}
                      selectedStates={selectedPathStates}
                      onStatesChange={setSelectedPathStates}
                    />
                    <Btn>
                      <FaPlus className="mr-2 h-4 w-4" />
                      Create Path
                    </Btn>
                  </div>
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
                  <div>
                    {/* Bulk Actions Bar */}
                    {selectedPaths.length > 0 && (
                      <div className="bg-blue-50 border-b border-blue-200 px-6 py-3 mb-4 rounded-t-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-blue-700">
                            {selectedPaths.length} item{selectedPaths.length > 1 ? 's' : ''} selected
                          </span>
                          <div className="flex items-center space-x-3">
                            <Btn
                              variant="outlined"
                              onClick={() => setSelectedPaths([])}
                            >
                              Clear Selection
                            </Btn>
                            <Btn
                              variant="outlined"
                              onClick={() => {
                                setBulkActionType('state');
                                setShowBulkActionModal(true);
                              }}
                            >
                              Change State
                            </Btn>
                            <Btn
                              onClick={() => {
                                setBulkActionType('delete');
                                handleBulkDelete();
                              }}
                            >
                              <FaTrash className="mr-2 h-3.5 w-3.5" />
                              Delete
                            </Btn>
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
                                checked={selectedPaths.length > 0 && 
                                  paths
                                    .filter(p => selectedPathStates.includes(p.state))
                                    .every(p => selectedPaths.includes(p._id))}
                                onChange={(e) => handleSelectAllPaths(e.target.checked)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                            </th>
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
                        {paths
                          .filter(path => selectedPathStates.includes(path.state))
                          .map((path, index, filteredArray) => (
                          <tr key={path._id} className={`hover:bg-gray-50 ${selectedPaths.includes(path._id) ? 'bg-blue-50' : ''}`}>
                            <td className="px-6 py-3">
                              <input
                                type="checkbox"
                                checked={selectedPaths.includes(path._id)}
                                onChange={() => handleTogglePath(path._id)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                            </td>
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
                                    <div className={`absolute right-0 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200 ${
                                      index === filteredArray.length - 1 ? 'bottom-0 mb-2' : 'top-0 mt-2'
                                    }`}>
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
                                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                                        >
                                          <FaTrash className="h-4 w-4 mr-2 text-red-600" />
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
                Select the new state for {activeTab === 'collections' ? selectedCollections.length : selectedPaths.length} selected {activeTab}.
              </p>
              
              <div className="space-y-2">
                <label className="flex items-center p-3 border border-gray-200 rounded-md cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="newState"
                    value="published"
                    checked={bulkNewState === 'published'}
                    onChange={(e) => setBulkNewState(e.target.value)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-3 text-sm">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStateColor('published')}`}>
                      Published
                    </span>
                  </span>
                </label>
                
                {activeTab === 'paths' && (
                  <label className="flex items-center p-3 border border-gray-200 rounded-md cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="newState"
                      value="released"
                      checked={bulkNewState === 'released'}
                      onChange={(e) => setBulkNewState(e.target.value)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-3 text-sm">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStateColor('released')}`}>
                        Released
                      </span>
                    </span>
                  </label>
                )}
                
                <label className="flex items-center p-3 border border-gray-200 rounded-md cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="newState"
                    value="draft"
                    checked={bulkNewState === 'draft'}
                    onChange={(e) => setBulkNewState(e.target.value)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-3 text-sm">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStateColor('draft')}`}>
                      Draft
                    </span>
                  </span>
                </label>
                
                <label className="flex items-center p-3 border border-gray-200 rounded-md cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="newState"
                    value="archived"
                    checked={bulkNewState === 'archived'}
                    onChange={(e) => setBulkNewState(e.target.value)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-3 text-sm">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStateColor('archived')}`}>
                      Archived
                    </span>
                  </span>
                </label>
                
                {activeTab === 'paths' && (
                  <label className="flex items-center p-3 border border-gray-200 rounded-md cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="newState"
                      value="locked"
                      checked={bulkNewState === 'locked'}
                      onChange={(e) => setBulkNewState(e.target.value)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-3 text-sm">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStateColor('locked')}`}>
                        Locked
                      </span>
                    </span>
                  </label>
                )}
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <Btn
                  variant="outlined"
                  onClick={() => setShowBulkActionModal(false)}
                >
                  Cancel
                </Btn>
                <Btn
                  onClick={handleBulkStateChange}
                >
                  Change State
                </Btn>
              </div>
            </div>
          </div>
        </div>
      )}

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
                  <Btn
                    variant="outlined"
                    onClick={() => setShowCollectionModal(false)}
                  >
                    Cancel
                  </Btn>
                  <Btn
                    type="submit"
                  >
                    {editingCollection ? 'Update' : 'Create'}
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

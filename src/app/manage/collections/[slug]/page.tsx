'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  FaArrowLeft, 
  FaEdit, 
  FaSave, 
  FaTimes, 
  FaPlus, 
  FaTrash, 
  FaSearch,
  FaGraduationCap,
  FaFolder,
  FaRoute,
  FaEllipsisV,
  FaArrowRight
} from 'react-icons/fa';

interface Collection {
  _id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  tags: string[];
  state: string;
  paths: Path[];
  path_order: string[];
  total_paths: number;
  created_at: string;
  updated_at: string;
}

interface Path {
  _id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  state: string;
  difficulty: string;
  estimated_duration: number;
}

export default function CollectionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  
  const [collection, setCollection] = useState<Collection | null>(null);
  const [paths, setPaths] = useState<Path[]>([]);
  const [allPaths, setAllPaths] = useState<Path[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'info' | 'paths'>('info');
  
  // Edit mode states
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    category: '',
    tags: [] as string[],
    state: 'draft'
  });
  
  // Path management states
  const [showAddPathModal, setShowAddPathModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPaths, setFilteredPaths] = useState<Path[]>([]);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      fetchCollectionData();
      fetchAllPaths();
    }
  }, [slug]);

  useEffect(() => {
    // Filter paths based on search term
    if (searchTerm.trim() === '') {
      setFilteredPaths(allPaths.filter(path => 
        !collection?.paths.some(p => p._id === path._id)
      ));
    } else {
      setFilteredPaths(allPaths.filter(path => 
        !collection?.paths.some(p => p._id === path._id) &&
        (path.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
         path.description.toLowerCase().includes(searchTerm.toLowerCase()))
      ));
    }
  }, [searchTerm, allPaths, collection]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openDropdown && !(event.target as Element).closest('.dropdown-container')) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openDropdown]);

  const fetchCollectionData = async () => {
    try {
      const response = await fetch(`/api/collections/${slug}`);
      if (response.ok) {
        const data = await response.json();
        setCollection(data.data);
        setEditForm({
          name: data.data.name,
          description: data.data.description || '',
          category: data.data.category || '',
          tags: data.data.tags || [],
          state: data.data.state
        });
        
        // Set paths from the populated data
        if (data.data.paths && data.data.paths.length > 0) {
          setPaths(data.data.paths);
        }
      } else {
        console.error('Failed to fetch collection');
      }
    } catch (error) {
      console.error('Error fetching collection:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllPaths = async () => {
    try {
      const response = await fetch('/api/paths');
      if (response.ok) {
        const data = await response.json();
        setAllPaths(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching all paths:', error);
    }
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/collections/${slug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        setIsEditing(false);
        fetchCollectionData(); // Refresh data
      } else {
        const error = await response.json();
        alert(`Error: ${error.error || 'Failed to update collection'}`);
      }
    } catch (error) {
      console.error('Error updating collection:', error);
      alert('Failed to update collection');
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditForm({
      name: collection?.name || '',
      description: collection?.description || '',
      category: collection?.category || '',
      tags: collection?.tags || [],
      state: collection?.state || 'draft'
    });
  };

  const handleAddPath = async (pathId: string) => {
    if (!collection) return;
    
    try {
      // Get the path object to add
      const pathToAdd = allPaths.find(p => p._id === pathId);
      if (!pathToAdd) return;

      const updatedPaths = [...collection.paths, pathToAdd];
      const response = await fetch(`/api/collections/${slug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...editForm,
          paths: updatedPaths.map(p => p._id)
        }),
      });

      if (response.ok) {
        setShowAddPathModal(false);
        fetchCollectionData(); // Refresh data
      } else {
        const error = await response.json();
        alert(`Error: ${error.error || 'Failed to add path'}`);
      }
    } catch (error) {
      console.error('Error adding path:', error);
      alert('Failed to add path');
    }
  };

  const handleRemovePath = async (pathId: string) => {
    if (!collection) return;
    
    if (!confirm('Are you sure you want to remove this path from the collection?')) {
      return;
    }
    
    try {
      const updatedPaths = collection.paths.filter(p => p._id !== pathId);
      const response = await fetch(`/api/collections/${slug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...editForm,
          paths: updatedPaths.map(p => p._id)
        }),
      });

      if (response.ok) {
        fetchCollectionData(); // Refresh data
      } else {
        const error = await response.json();
        alert(`Error: ${error.error || 'Failed to remove path'}`);
      }
    } catch (error) {
      console.error('Error removing path:', error);
      alert('Failed to remove path');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading collection...</p>
        </div>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Collection not found</h2>
          <Link href="/manage" className="text-blue-600 hover:text-blue-800">
            ← Back to Management
          </Link>
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
            <div className="flex items-center space-x-4">
              <Link 
                href="/manage"
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <FaArrowLeft className="mr-2 h-4 w-4" />
                Back to Management
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{collection.name}</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Collection • {collection.paths.length} paths
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {activeTab === 'info' && (
                <>
                  {isEditing ? (
                    <>
                      <button
                        onClick={handleSave}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                      >
                        <FaSave className="mr-2 h-4 w-4" />
                        Save
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <FaTimes className="mr-2 h-4 w-4" />
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                    >
                      <FaEdit className="mr-2 h-4 w-4" />
                      Edit
                    </button>
                  )}
                </>
              )}
              {activeTab === 'paths' && (
                <button
                  onClick={() => setShowAddPathModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  <FaPlus className="mr-2 h-4 w-4" />
                  Add Path
                </button>
              )}
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
                <FaFolder className="mr-2 h-4 w-4 inline" />
                Basic Info
              </button>
              <button
                onClick={() => setActiveTab('paths')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'paths'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FaRoute className="mr-2 h-4 w-4 inline" />
                Paths ({collection.paths.length})
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'info' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                        className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <p className="text-sm text-gray-900">{collection.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Slug
                    </label>
                    <p className="text-sm text-gray-500 font-mono">{collection.slug}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.category}
                        onChange={(e) => setEditForm({...editForm, category: e.target.value})}
                        className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <p className="text-sm text-gray-900">{collection.category || '-'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State
                    </label>
                    {isEditing ? (
                      <select
                        value={editForm.state}
                        onChange={(e) => setEditForm({...editForm, state: e.target.value})}
                        className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                        <option value="archived">Archived</option>
                      </select>
                    ) : (
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        collection.state === 'published' ? 'bg-blue-100 text-blue-800' :
                        collection.state === 'draft' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {collection.state}
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  {isEditing ? (
                    <textarea
                      value={editForm.description}
                      onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                      rows={4}
                      className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <p className="text-sm text-gray-900">{collection.description || 'No description provided'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.tags.join(', ')}
                      onChange={(e) => setEditForm({
                        ...editForm, 
                        tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag)
                      })}
                      className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="tag1, tag2, tag3"
                    />
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {collection.tags && collection.tags.length > 0 ? (
                        collection.tags.map((tag, index) => (
                          <span key={index} className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                            {tag}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-gray-500">No tags</span>
                      )}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Created
                    </label>
                    <p className="text-sm text-gray-500">
                      {new Date(collection.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Updated
                    </label>
                    <p className="text-sm text-gray-500">
                      {new Date(collection.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'paths' && (
              <div>
                {paths.length === 0 ? (
                  <div className="text-center py-12">
                    <FaRoute className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No paths in collection</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Get started by adding paths to this collection.
                    </p>
                    <button
                      onClick={() => setShowAddPathModal(true)}
                      className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                    >
                      <FaPlus className="mr-2 h-4 w-4" />
                      Add Path
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {paths.map((path) => (
                      <div key={path._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-lg bg-purple-500 flex items-center justify-center">
                              <FaRoute className="h-6 w-6 text-white" />
                            </div>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">{path.name}</h4>
                            <p className="text-sm text-gray-500">{path.slug}</p>
                            <p className="text-sm text-gray-600">{path.description}</p>
                            <div className="flex items-center space-x-4 mt-1">
                              <span className="text-xs text-gray-500">Difficulty: {path.difficulty}</span>
                              <span className="text-xs text-gray-500">Duration: {path.estimated_duration}h</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Link
                            href={`/manage/paths/${path.slug}`}
                            className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-50"
                            title="View path details"
                          >
                            <FaArrowRight className="h-4 w-4" />
                          </Link>
                          <div className="relative dropdown-container">
                            <button
                              onClick={() => setOpenDropdown(openDropdown === path._id ? null : path._id)}
                              className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
                              title="More options"
                            >
                              <FaEllipsisV className="h-4 w-4" />
                            </button>
                            
                            {openDropdown === path._id && (
                              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
                                <button
                                  onClick={() => {
                                    handleRemovePath(path._id);
                                    setOpenDropdown(null);
                                  }}
                                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                >
                                  <FaTrash className="mr-3 h-4 w-4" />
                                  Remove from collection
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Path Modal */}
      {showAddPathModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Add Path to Collection
              </h3>
              
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Search paths..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="max-h-60 overflow-y-auto space-y-2">
                {filteredPaths.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    {searchTerm ? 'No paths found matching your search' : 'No available paths to add'}
                  </p>
                ) : (
                  filteredPaths.map((path) => (
                    <div key={path._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">{path.name}</h4>
                        <p className="text-xs text-gray-500">{path.category}</p>
                        <p className="text-xs text-gray-400">{path.difficulty} • {path.estimated_duration}h</p>
                      </div>
                      <button
                        onClick={() => handleAddPath(path._id)}
                        className="text-green-600 hover:text-green-900"
                        title="Add to collection"
                      >
                        <FaPlus className="h-4 w-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              <div className="flex justify-end pt-4">
                <button
                  onClick={() => setShowAddPathModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 
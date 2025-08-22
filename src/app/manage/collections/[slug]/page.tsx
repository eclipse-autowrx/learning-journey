// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { showToast, showDeleteConfirm, showBulkDeleteConfirm, showStateChangeConfirm, showBulkOperationResult } from '@/lib/utils/notifications';
import StateFilter from '@/app/components/atom/StateFilter';
import Btn from '@/app/components/atom/Btn';
import TagEditor from '@/app/components/atom/TagEditor';
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
import ManageBreadCrumb from '@/app/components/atom/ManageBreadCrumb';
import DropdownMenu, { DropdownItem } from '@/app/components/atom/DropdownMenu';
import { PATH_STATES, COLLECTION_STATES } from '@/lib/const';
import { useAuth } from '@/lib/frontend/auth';

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
  const collectionSlug = params?.slug as string;
  const { isAuthenticated, loading: authLoading } = useAuth();
  
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
    tags: [] as string[]
  });
  const [collectionState, setCollectionState] = useState('draft');
  const [isStateDropdownOpen, setIsStateDropdownOpen] = useState(false);
  
  // Path management states
  const [showAddPathModal, setShowAddPathModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPaths, setFilteredPaths] = useState<Path[]>([]);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  
  // Bulk selection and filter states
  const [selectedPaths, setSelectedPaths] = useState<string[]>([]);
  const [selectedPathStates, setSelectedPathStates] = useState<string[]>(['published', 'draft', 'archived', 'locked']);
  const [showBulkActionModal, setShowBulkActionModal] = useState(false);
  const [bulkActionType, setBulkActionType] = useState<'state' | 'delete' | null>(null);
  const [bulkNewState, setBulkNewState] = useState<string>('draft');

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openDropdown && !(event.target as Element).closest('.dropdown-container')) {
        setOpenDropdown(null);
      }
      // Close state dropdown when clicking outside
      if (!(event.target as Element).closest('.dropdown-container')) {
        setIsStateDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openDropdown]);

  useEffect(() => {
    if (isAuthenticated && collectionSlug) {
      fetchCollectionData();
      fetchAllPaths();
    }
  }, [isAuthenticated, collectionSlug]);

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

  const fetchCollectionData = async () => {
    if (!collectionSlug) return;
    try {
      const response = await fetch(`/api/collections/${collectionSlug}`);
      if (response.ok) {
        const data = await response.json();
        setCollection(data.data);
        setEditForm({
          name: data.data.name,
          description: data.data.description || '',
          category: data.data.category || '',
          tags: data.data.tags || []
        });
        setCollectionState(data.data.state || 'draft');
        
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
      if (!editForm.name) {
        showToast.error('Collection name cannot be empty');
        return;
      }
      const response = await fetch(`/api/collections/${collectionSlug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...editForm,
          slug: collection?.slug // Preserve the current slug
        }),
      });

      if (response.ok) {
        showToast.success('Collection updated successfully');
        setIsEditing(false);
        fetchCollectionData(); // Refresh data
      } else {
        const error = await response.json();
        showToast.error(`Error: ${error.error || 'Failed to update collection'}`);
      }
    } catch (error) {
      console.error('Error updating collection:', error);
      showToast.error('Failed to update collection');
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditForm({
      name: collection?.name || '',
      description: collection?.description || '',
      category: collection?.category || '',
      tags: collection?.tags || []
    });
  };

  // State change handler
  const handleStateChange = async (newState: string) => {
    try {
      const response = await fetch(`/api/collections/${collectionSlug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ state: newState }),
      });

      if (response.ok) {
        showToast.success('Collection state updated successfully');
        setCollectionState(newState);
        fetchCollectionData(); // Refresh data
      } else {
        const error = await response.json();
        showToast.error(`Error: ${error.error || 'Failed to update collection state'}`);
      }
    } catch (error) {
      console.error('Error updating collection state:', error);
      showToast.error('Failed to update collection state');
    }
  };

  const handleAddPath = async (pathId: string) => {
    if (!collection) return;
    
    try {
      // Get the path object to add
      const pathToAdd = allPaths.find(p => p._id === pathId);
      if (!pathToAdd) return;

      const updatedPaths = [...collection.paths, pathToAdd];
      const response = await fetch(`/api/collections/${collectionSlug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...editForm,
          slug: collection?.slug, // Preserve the current slug
          paths: updatedPaths.map(p => p._id)
        }),
      });

      if (response.ok) {
        showToast.success('Path added to collection successfully');
        setShowAddPathModal(false);
        
        // Optimistically update the UI
        const pathToAdd = allPaths.find(p => p._id === pathId);
        if (pathToAdd) {
            setPaths(prevPaths => [...prevPaths, pathToAdd]);
            setCollection(prevCollection => {
                if (!prevCollection) return null;
                return {
                    ...prevCollection,
                    paths: [...prevCollection.paths, pathToAdd]
                };
            });
        }
      } else {
        const error = await response.json();
        showToast.error(`Error: ${error.error || 'Failed to add path'}`);
      }
    } catch (error) {
      console.error('Error adding path:', error);
      showToast.error('Failed to add path');
    }
  };

  const handleRemovePath = async (pathId: string) => {
    if (!collection) return;
    
    const result = await showDeleteConfirm('path from collection');
    if (!result.isConfirmed) {
      return;
    }
    
    try {
      const updatedPaths = collection.paths.filter(p => p._id !== pathId);
      const response = await fetch(`/api/collections/${collectionSlug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...editForm,
          slug: collection?.slug, // Preserve the current slug
          paths: updatedPaths.map(p => p._id)
        }),
      });

      if (response.ok) {
        showToast.success('Path removed from collection successfully');
        fetchCollectionData(); // Refresh data
      } else {
        const error = await response.json();
        showToast.error(`Error: ${error.error || 'Failed to remove path'}`);
      }
    } catch (error) {
      console.error('Error removing path:', error);
      showToast.error('Failed to remove path');
    }
  };

  // Bulk selection handlers
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

  const handleTogglePath = (id: string) => {
    setSelectedPaths(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  // Bulk action handlers
  const handleBulkStateChange = async () => {
    // Show confirmation dialog
    const result = await showStateChangeConfirm('paths', selectedPaths.length, bulkNewState);
    if (!result.isConfirmed) {
      return;
    }
    
    try {
      const response = await fetch('/api/paths/bulk', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ids: selectedPaths,
          state: bulkNewState
        }),
      });

      const result = await response.json();
      
      // Show result using toast notifications
      showBulkOperationResult(result);
      
      if (result.success) {
        // Refresh data after operation
        await fetchCollectionData();
        
        // Clear selections
        setSelectedPaths([]);
        setShowBulkActionModal(false);
      }
    } catch (error) {
      console.error('Error performing bulk state change:', error);
      showToast.error('Failed to update items');
    }
  };

  const handleBulkRemove = async () => {
    if (!collection) return;
    
    // Show confirmation dialog
    const result = await showBulkDeleteConfirm('paths', selectedPaths.length);
    if (!result.isConfirmed) {
      return;
    }
    
    try {
      const updatedPaths = collection.paths.filter(p => !selectedPaths.includes(p._id));
      const response = await fetch(`/api/collections/${collectionSlug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...editForm,
          slug: collection?.slug, // Preserve the current slug
          paths: updatedPaths.map(p => p._id)
        }),
      });

      if (response.ok) {
        showToast.success(`${selectedPaths.length} paths removed from collection successfully`);
        setSelectedPaths([]);
        fetchCollectionData(); // Refresh data
      } else {
        const error = await response.json();
        showToast.error(`Error: ${error.error || 'Failed to remove paths'}`);
      }
    } catch (error) {
      console.error('Error removing paths:', error);
      showToast.error('Failed to remove paths');
    }
  };

  const getStateColor = (state: string) => {
    switch (state) {
      case 'published':
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
      <ManageBreadCrumb items={[
        { label: 'Collections', link: '/manage?tab=collections' },
        { label: collection.name }
      ]} />
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{collection.name}</h1>
                <p className="mt-1 text-sm text-gray-500">
                  {collection.slug}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-500">State:</span>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStateColor(collectionState)}`}>{collectionState}</span>
                <DropdownMenu
                  items={COLLECTION_STATES.filter(s => s.value !== 'published').map((s) => ({
                    label: s.label,
                    onClick: async () => { await handleStateChange(s.value); },
                  })) as DropdownItem[]}
                  buttonAriaLabel="Change state"
                  trigger={<span>Change State</span>}
                  align="left"
                />
              </div>
              {/* {activeTab === 'paths' && (
                <Btn
                  onClick={() => setShowAddPathModal(true)}
                >
                  <FaPlus className="mr-2 h-4 w-4" />
                  Add Path
                </Btn>
              )} */}
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
                Collection Information
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
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-medium text-gray-900">Collection Information</h3>
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
                        Edit Collection
                      </Btn>
                    )}
                  </div>
                </div>

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
                    <TagEditor
                      tags={editForm.tags}
                      onChange={(newTags) => setEditForm({...editForm, tags: newTags})}
                      placeholder="Type and press Enter to add tags..."
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
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Paths ({paths.length})
                  </h3>
                  <div className="flex items-center space-x-3">
                    <StateFilter
                      states={PATH_STATES}
                      selectedStates={selectedPathStates}
                      onStatesChange={setSelectedPathStates}
                    />
                    <button
                      onClick={() => setShowAddPathModal(true)}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                    >
                      <FaPlus className="mr-2 h-4 w-4" />
                      Add Path
                    </button>
                  </div>
                </div>

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
                  <div>
                    {/* Bulk Actions Bar */}
                    {selectedPaths.length > 0 && (
                      <div className="bg-blue-50 border-b border-blue-200 px-6 py-3 mb-4 rounded-t-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-blue-700">
                            {selectedPaths.length} item{selectedPaths.length > 1 ? 's' : ''} selected
                          </span>
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => setSelectedPaths([])}
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
                                handleBulkRemove();
                              }}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                            >
                              <FaTrash className="mr-2 h-3.5 w-3.5" />
                              Remove from Collection
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
                              Difficulty
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
                                    <div className="h-10 w-10 rounded-lg bg-purple-500 flex items-center justify-center">
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
                                {path.difficulty || '-'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {path.estimated_duration ? `${path.estimated_duration}h` : '-'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStateColor(path.state)}`}>
                                  {path.state}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <div className="flex justify-end space-x-2">
                                  <Link 
                                    href={`/manage/paths/${path.slug}`}
                                    className="text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-2 py-1 rounded transition-colors duration-200"
                                    title="View Path"
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
                                      <div className={`absolute right-0 w-48 bg-white rounded-md shadow-lg z-[9999] border border-gray-200 ${
                                        index === filteredArray.length - 1 ? 'bottom-full mb-2' : 'mt-2'
                                      }`}>
                                        <div className="py-1">
                                          <button
                                            onClick={() => {
                                              handleRemovePath(path._id);
                                              setOpenDropdown(null);
                                            }}
                                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                                          >
                                            <FaTrash className="h-4 w-4 mr-2 text-red-600" />
                                            Remove from Collection
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

      {/* Bulk Action Modal */}
      {showBulkActionModal && bulkActionType === 'state' && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Change State
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Select the new state for {selectedPaths.length} selected paths.
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
    </div>
  );
} 
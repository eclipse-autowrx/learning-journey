'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaRoute, FaPlus, FaEdit, FaTrash, FaEye, FaEllipsisV, FaArrowRight } from 'react-icons/fa';
import { showToast, showDeleteConfirm, showBulkDeleteConfirm, showStateChangeConfirm, showBulkOperationResult } from '@/lib/utils/notifications';
import StateFilter from '@/app/components/atom/StateFilter';
import Btn from '@/app/components/atom/Btn';

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

export default function PathsPage() {
  const [paths, setPaths] = useState<Path[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Bulk selection and filter states
  const [selectedPaths, setSelectedPaths] = useState<string[]>([]);
  const [selectedPathStates, setSelectedPathStates] = useState<string[]>(['published', 'draft', 'archived', 'locked', 'released']);
  const [showBulkActionModal, setShowBulkActionModal] = useState(false);
  const [bulkActionType, setBulkActionType] = useState<'state' | 'delete' | null>(null);
  const [bulkNewState, setBulkNewState] = useState<string>('draft');
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  useEffect(() => {
    fetchPaths();
  }, []);

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

  const fetchPaths = async () => {
    try {
      const response = await fetch('/api/paths');
      const data = await response.json();
      if (data.success) {
        setPaths(data.data);
      }
    } catch (error) {
      console.error('Error fetching paths:', error);
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
      showBulkOperationResult(result);
      
      if (result.success) {
        await fetchPaths();
        setSelectedPaths([]);
        setShowBulkActionModal(false);
      }
    } catch (error) {
      console.error('Error performing bulk state change:', error);
      showToast.error('Failed to update items');
    }
  };

  const handleBulkDelete = async () => {
    const result = await showBulkDeleteConfirm('paths', selectedPaths.length);
    if (!result.isConfirmed) {
      return;
    }
    
    try {
      const response = await fetch('/api/paths/bulk', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ids: selectedPaths
        }),
      });

      const result = await response.json();
      showBulkOperationResult(result);
      
      if (result.success) {
        await fetchPaths();
        setSelectedPaths([]);
        setShowBulkActionModal(false);
      }
    } catch (error) {
      console.error('Error performing bulk delete:', error);
      showToast.error('Failed to delete items');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading paths...</p>
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
              <h1 className="text-3xl font-bold text-gray-900">Paths</h1>
              <p className="mt-1 text-sm text-gray-500">
                Create and manage learning paths
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                href="/manage"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                ← Back to Management
              </Link>
              <Btn
                onClick={() => setShowCreateModal(true)}
              >
                <FaPlus className="mr-2 h-4 w-4" />
                Create Path
              </Btn>
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
                  <FaRoute className="h-6 w-6 text-blue-500" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Paths
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {paths.length}
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
                  <div className="h-6 w-6 bg-blue-500 rounded"></div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Published
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {paths.filter(p => p.state === 'published').length}
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
                  <div className="h-6 w-6 bg-blue-500 rounded"></div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Draft
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {paths.filter(p => p.state === 'draft').length}
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
                  <div className="h-6 w-6 bg-gray-500 rounded"></div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Archived
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {paths.filter(p => p.state === 'archived').length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Paths List */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Paths ({paths.length})
              </h3>
              <div className="flex items-center space-x-3">
                <StateFilter
                  states={['published', 'draft', 'archived', 'locked', 'released']}
                  selectedStates={selectedPathStates}
                  onStatesChange={setSelectedPathStates}
                />
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  <FaPlus className="mr-2 h-4 w-4" />
                  Create Path
                </button>
              </div>
            </div>

            {paths.length === 0 ? (
              <div className="text-center py-12">
                <FaRoute className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No paths</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by creating a new path.
                </p>
                <div className="mt-6">
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <FaPlus className="mr-2 h-4 w-4" />
                    Create Path
                  </button>
                </div>
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
                                  <div className={`absolute right-0 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200 ${
                                    index === filteredArray.length - 1 ? 'bottom-full mb-2' : 'mt-2'
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
        </div>
      </div>

      {/* Create Modal (placeholder) */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg font-medium text-gray-900">Create Path</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  Path creation form will be implemented here.
                </p>
              </div>
              <div className="items-center px-4 py-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300"
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

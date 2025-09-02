'use client';

import { useState, useEffect } from 'react';
import { FaRoute } from 'react-icons/fa';
import StateFilter from '@/app/components/atom/StateFilter';
import { PATH_STATES } from '@/lib/const';

interface Path {
  _id: string;
  name: string;
  slug: string;
  description: string;
  owner_id?: string;
  owner_name?: string;
  category: string;
  state: string;
  courses?: any[];
  created_at: string;
}

interface PathsTabProps {
  hasManageUsers: boolean;
}

export default function PathsTab({ hasManageUsers }: PathsTabProps) {
  // Paths Management state
  const [allPaths, setAllPaths] = useState<Path[]>([]);
  const [loadingAllPaths, setLoadingAllPaths] = useState(false);
  const [selectedPathStates, setSelectedPathStates] = useState<string[]>(['published', 'draft', 'archived', 'locked']);
  const [selectedPaths, setSelectedPaths] = useState<string[]>([]);
  const [showBulkActionModal, setShowBulkActionModal] = useState(false);
  const [bulkActionType, setBulkActionType] = useState<'state' | null>(null);
  const [bulkNewState, setBulkNewState] = useState<string>('draft');

  useEffect(() => {
    if (!hasManageUsers) return;
    fetchAllPaths();
  }, [hasManageUsers]);

  const fetchAllPaths = async () => {
    setLoadingAllPaths(true);
    try {
      const response = await fetch('/api/admin/paths');
      if (response.ok) {
        const data = await response.json();
        setAllPaths(data.success ? data.data : []);
      }
    } catch (error) {
      console.error('Error fetching all paths:', error);
    } finally {
      setLoadingAllPaths(false);
    }
  };

  // Paths management functions
  const handleBulkStateChange = async () => {
    if (selectedPaths.length === 0) return;
    
    try {
      const response = await fetch('/api/admin/paths/bulk', {
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
      
      if (result.success) {
        console.log(`Updated ${result.results.length} paths`);
        await fetchAllPaths();
        setSelectedPaths([]);
        setShowBulkActionModal(false);
      } else {
        console.error('Failed to update paths:', result.error);
      }
    } catch (error) {
      console.error('Error performing bulk state change:', error);
    }
  };

  const handleSelectAllPaths = (checked: boolean) => {
    if (checked) {
      const filteredPaths = allPaths.filter(path => selectedPathStates.includes(path.state));
      setSelectedPaths(filteredPaths.map(p => p._id));
    } else {
      setSelectedPaths([]);
    }
  };

  const handleTogglePath = (id: string) => {
    setSelectedPaths(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
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
      case 'locked':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleIndividualStateChange = async (pathId: string, newState: string) => {
    try {
      const response = await fetch(`/api/admin/paths/${pathId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ state: newState }),
      });
      if (response.ok) {
        await fetchAllPaths();
      } else {
        console.error('Failed to update path state');
      }
    } catch (error) {
      console.error('Error updating path state:', error);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Paths Management</h3>
          <p className="text-sm text-gray-500">Manage path states and visibility</p>
        </div>
        <div className="flex items-center space-x-3">
          <StateFilter
            states={PATH_STATES}
            selectedStates={selectedPathStates}
            onStatesChange={setSelectedPathStates}
          />
        </div>
      </div>

      {loadingAllPaths ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading paths...</p>
        </div>
      ) : allPaths.length === 0 ? (
        <div className="text-center py-12">
          <FaRoute className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No paths</h3>
          <p className="mt-1 text-sm text-gray-500">No paths found in the system.</p>
        </div>
      ) : (
        (() => {
          const filteredPaths = allPaths.filter(path => selectedPathStates.includes(path.state));
          return (
            <div>
              {/* Bulk Actions Bar */}
              {selectedPaths.length > 0 && (
                <div className="bg-blue-50 border-b border-blue-200 px-6 py-3 mb-4 rounded-t-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-blue-700">
                      {selectedPaths.length} path{selectedPaths.length > 1 ? 's' : ''} selected
                    </span>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => setSelectedPaths([])}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        Clear Selection
                      </button>
                      <button
                        onClick={() => {
                          setBulkActionType('state');
                          setShowBulkActionModal(true);
                        }}
                        className="inline-flex items-center px-3 py-1.5 border border-blue-300 text-sm font-medium rounded text-blue-700 bg-white hover:bg-blue-50"
                      >
                        Change State
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
                            filteredPaths.every(p => selectedPaths.includes(p._id))}
                          onChange={(e) => handleSelectAllPaths(e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Path
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Owner
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
                    {filteredPaths.map((path) => (
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
                              <div className="text-sm font-medium text-gray-900">
                                {path.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {path.slug}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {path.owner_name || path.owner_id || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {path.courses?.length || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStateColor(path.state)}`}>
                            {PATH_STATES.find(s => s.value === path.state)?.label || path.state}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(path.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <select
                              value={path.state}
                              onChange={(e) => handleIndividualStateChange(path._id, e.target.value)}
                              className="text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            >
                              {PATH_STATES.map((state) => (
                                <option key={state.value} value={state.value}>
                                  {state.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        })()
      )}

      {/* Bulk Action Modal for Paths */}
      {showBulkActionModal && bulkActionType === 'state' && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Change State for {selectedPaths.length} path{selectedPaths.length > 1 ? 's' : ''}</h3>
              
              <div className="space-y-2">
                {PATH_STATES.map((state) => (
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
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkStateChange}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
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

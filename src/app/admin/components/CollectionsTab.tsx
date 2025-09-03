'use client';

import { useState, useEffect } from 'react';
import { FaPlus, FaTrash, FaGripVertical } from 'react-icons/fa';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SystemSetting {
  _id: string;
  key: string;
  value: any;
  secret: boolean;
  description?: string;
  category: string;
  updated_by: string;
  created_at: string;
  updated_at: string;
}

interface CollectionsTabProps {
  hasManageUsers: boolean;
}

export default function CollectionsTab({ hasManageUsers }: CollectionsTabProps) {
  // Collections Settings state
  const [collectionsSetting, setCollectionsSetting] = useState<SystemSetting | null>(null);
  const [showCollectionsModal, setShowCollectionsModal] = useState(false);
  const [collectionsData, setCollectionsData] = useState<any[]>([]);
  const [selectedCollectionIndex, setSelectedCollectionIndex] = useState<number | null>(null);
  const [availablePaths, setAvailablePaths] = useState<any[]>([]);
  const [loadingPaths, setLoadingPaths] = useState(false);
  const [showAddPathsModal, setShowAddPathsModal] = useState(false);
  const [collectionPaths, setCollectionPaths] = useState<any[]>([]);

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (!hasManageUsers) return;
    fetchCollectionsSetting();
  }, [hasManageUsers]);

  const fetchCollectionsSetting = async () => {
    try {
      const res = await fetch('/api/admin/settings/collections');
      const data = await res.json();
      if (data.success) {
        setCollectionsSetting(data.data);
        setCollectionsData(data.data?.value || []);
      } else {
        // If collections setting doesn't exist, initialize with empty array
        setCollectionsSetting(null);
        setCollectionsData([]);
      }
    } catch (error) {
      console.error('Error fetching collections setting:', error);
      setCollectionsSetting(null);
      setCollectionsData([]);
    }
  };

  const openCreateCollection = () => {
    setShowCollectionsModal(true);
  };

  const handleCollectionClick = async (index: number) => {
    setSelectedCollectionIndex(index);
    const collection = collectionsData[index];
    const pathIds = collection.path_ids || [];

    if (pathIds.length === 0) {
      setCollectionPaths([]);
      return;
    }

    // Fetch path details for the path IDs in this collection
    setLoadingPaths(true);
    try {
      const response = await fetch(`/api/paths?ids=${pathIds.join(',')}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setCollectionPaths(data.data || []);
        }
      }
    } catch (error) {
      console.error('Error fetching collection paths:', error);
      setCollectionPaths([]);
    } finally {
      setLoadingPaths(false);
    }
  };

  const handleCollectionsDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = collectionsData.findIndex((item, index) => `collection-${index}` === active.id);
      const newIndex = collectionsData.findIndex((item, index) => `collection-${index}` === over?.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newCollections = arrayMove(collectionsData, oldIndex, newIndex);
        setCollectionsData(newCollections);

        // Auto-save the reordered collections
        try {
          const response = await fetch('/api/admin/settings/collections', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ value: newCollections }),
          });

          if (!response.ok) {
            throw new Error('Failed to save collections');
          }

          const result = await response.json();
          
          // Update the local state with the saved data to ensure consistency
          if (result.success && result.data) {
            setCollectionsSetting(result.data);
            setCollectionsData(result.data.value || []);
          }
        } catch (error) {
          console.error('Error auto-saving collections:', error);
        }
      }
    }
  };

  const handlePathsDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id && selectedCollectionIndex !== null) {
      const oldIndex = collectionPaths.findIndex((item, index) => `path-${index}` === active.id);
      const newIndex = collectionPaths.findIndex((item, index) => `path-${index}` === over?.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newPaths = arrayMove(collectionPaths, oldIndex, newIndex);
        setCollectionPaths(newPaths);

        // Update the collections data with the new order
        const updated = [...collectionsData];
        updated[selectedCollectionIndex].path_ids = newPaths.map(path => path._id);
        setCollectionsData(updated);

        // Auto-save the reordered paths
        try {
          const response = await fetch('/api/admin/settings/collections', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ value: updated }),
          });

          if (!response.ok) {
            throw new Error('Failed to save collections');
          }
        } catch (error) {
          console.error('Error auto-saving collections:', error);
        }
      }
    }
  };

  const addSelectedPaths = async (selectedPathIds: string[]) => {
    if (selectedCollectionIndex === null) return;

    const updated = [...collectionsData];
    const currentPathIds = updated[selectedCollectionIndex].path_ids || [];
    const newPathIds = [...currentPathIds, ...selectedPathIds];
    updated[selectedCollectionIndex].path_ids = newPathIds;
    setCollectionsData(updated);

    // Auto-save the changes
    try {
      const response = await fetch('/api/admin/settings/collections', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ value: updated }),
      });

      if (response.ok) {
        // Refresh the collection paths display
        await handleCollectionClick(selectedCollectionIndex);
      } else {
        console.error('Failed to save collections');
      }
    } catch (error) {
      console.error('Error auto-saving collections:', error);
    }
  };

  const removePathFromCollection = async (pathId: string) => {
    if (selectedCollectionIndex === null) return;

    const updated = [...collectionsData];
    const currentPathIds = updated[selectedCollectionIndex].path_ids || [];
    updated[selectedCollectionIndex].path_ids = currentPathIds.filter(id => id !== pathId);
    setCollectionsData(updated);

    // Auto-save the changes
    try {
      const response = await fetch('/api/admin/settings/collections', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ value: updated }),
      });

      if (response.ok) {
        // Refresh the collection paths display
        await handleCollectionClick(selectedCollectionIndex);
      } else {
        console.error('Failed to save collections');
      }
    } catch (error) {
      console.error('Error auto-saving collections:', error);
    }
  };

  const openAddPathsModal = async () => {
    setLoadingPaths(true);
    try {
      const response = await fetch('/api/paths');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAvailablePaths(data.data || []);
          setShowAddPathsModal(true);
        }
      }
    } catch (error) {
      console.error('Error fetching available paths:', error);
    } finally {
      setLoadingPaths(false);
    }
  };

  const handleAddSelected = () => {
    const selectedPathIds = availablePaths
      .filter(path => path.selected)
      .map(path => path._id);
    
    if (selectedPathIds.length > 0) {
      addSelectedPaths(selectedPathIds);
      setShowAddPathsModal(false);
    }
  };

  // Sortable Collection Item Component
  function SortableCollectionItem({ collection, index }: { collection: any; index: number }) {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: `collection-${index}` });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        className={`p-4 border rounded-lg cursor-pointer hover:bg-gray-50 ${
          selectedCollectionIndex === index ? 'bg-purple-50 border-purple-300' : 'border-gray-200'
        }`}
        onClick={() => handleCollectionClick(index)}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="font-medium text-gray-900">{collection.name}</h3>
            <p className="text-sm text-gray-500">{collection.description}</p>
            <p className="text-xs text-gray-400 mt-1">
              {collection.path_ids?.length || 0} paths
            </p>
          </div>
          <div
            {...attributes}
            {...listeners}
            className="p-3 cursor-grab hover:bg-gray-100 rounded border border-gray-200"
            onClick={(e) => {
              e.stopPropagation(); // Prevent collection click when dragging
            }}
          >
            <FaGripVertical className="h-5 w-5 text-gray-500" />
          </div>
        </div>
      </div>
    );
  }

  // Sortable Path Item Component
  function SortablePathItem({ path, index }: { path: any; index: number }) {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: `path-${index}` });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
    };

    const getStateColor = (state: string) => {
      switch (state) {
        case 'published':
          return 'bg-green-100 text-green-800';
        case 'locked':
          return 'bg-red-100 text-red-800';
        case 'draft':
          return 'bg-purple-100 text-purple-800';
        case 'archived':
          return 'bg-gray-100 text-gray-800';
        default:
          return 'bg-gray-100 text-gray-800';
      }
    };

    return (
      <tr ref={setNodeRef} style={style} className="bg-white">
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center gap-2">
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab hover:bg-gray-100 p-1 rounded"
            >
              <FaGripVertical className="h-4 w-4 text-gray-400" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900">{path.name}</div>
              <div className="text-sm text-gray-500">{path.slug}</div>
            </div>
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStateColor(path.state)}`}>
            {path.state}
          </span>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          {path.owner_name || path.owner_id || '-'}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
          <button
            onClick={() => removePathFromCollection(path._id)}
            className="text-red-600 hover:text-red-900"
          >
            <FaTrash className="h-4 w-4" />
          </button>
        </td>
      </tr>
    );
  }

  // Add Paths Modal Content Component
  function AddPathsModalContent() {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPaths, setSelectedPaths] = useState<string[]>([]);

    const currentPathIds = selectedCollectionIndex !== null ? 
      collectionsData[selectedCollectionIndex]?.path_ids || [] : [];

    const availableToAdd = availablePaths.filter(path => 
      !currentPathIds.includes(path._id) &&
      path.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleTogglePath = (pathId: string) => {
      setSelectedPaths(prev => 
        prev.includes(pathId) ? prev.filter(id => id !== pathId) : [...prev, pathId]
      );
    };

    const handleSelectAll = () => {
      const allIds = availableToAdd.map(path => path._id);
      setSelectedPaths(allIds);
    };

    const handleClearSelection = () => {
      setSelectedPaths([]);
    };

    return (
      <div>
        {/* Search */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search paths..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* Selection Controls */}
        <div className="mb-4 flex justify-between items-center">
          <div className="flex gap-2">
            <button
              onClick={handleSelectAll}
              className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
            >
              Select All
            </button>
            <button
              onClick={handleClearSelection}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            >
              Clear
            </button>
          </div>
          <span className="text-sm text-gray-500">
            {selectedPaths.length} selected
          </span>
        </div>

        {/* Paths List */}
        <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-md">
          {availableToAdd.map((path) => (
            <div
              key={path._id}
              className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                selectedPaths.includes(path._id) ? 'bg-purple-50' : ''
              }`}
              onClick={() => handleTogglePath(path._id)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">{path.name}</div>
                  <div className="text-sm text-gray-500">{path.slug}</div>
                </div>
                <input
                  type="checkbox"
                  checked={selectedPaths.includes(path._id)}
                  onChange={() => handleTogglePath(path._id)}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Add Button */}
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleAddSelected}
            disabled={selectedPaths.length === 0}
            className="px-4 py-2 bg-purple-600 text-white rounded-md text-sm font-medium hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Add Selected Paths ({selectedPaths.length})
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Collections Configuration</h3>
          <p className="text-sm text-gray-500">Manage collections displayed on the home page</p>
        </div>
        <button
          onClick={openCreateCollection}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700"
        >
          <FaPlus className="mr-2 h-4 w-4" />
          Add Collection
        </button>
      </div>

      {/* Collections List */}
      <div className="mb-6">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleCollectionsDragEnd}
        >
          <SortableContext items={collectionsData.map((_, index) => `collection-${index}`)} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {collectionsData.map((collection, index) => (
                <SortableCollectionItem
                  key={`collection-${index}`}
                  collection={collection}
                  index={index}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      {/* Selected Collection Paths */}
      {selectedCollectionIndex !== null && (
        <div className="border-t pt-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h4 className="text-lg font-medium text-gray-900">
                Paths in "{collectionsData[selectedCollectionIndex]?.name}"
              </h4>
              <p className="text-sm text-gray-500">Manage paths in this collection</p>
            </div>
            <button
              onClick={openAddPathsModal}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <FaPlus className="mr-2 h-4 w-4" />
              Add Paths
            </button>
          </div>

          {loadingPaths ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-500">Loading paths...</p>
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
                      State
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Owner
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handlePathsDragEnd}
                >
                  <SortableContext items={collectionPaths.map((_, index) => `path-${index}`)} strategy={verticalListSortingStrategy}>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {collectionPaths.map((path, index) => (
                        <SortablePathItem
                          key={`path-${index}`}
                          path={path}
                          index={index}
                        />
                      ))}
                    </tbody>
                  </SortableContext>
                </DndContext>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Add Paths Modal */}
      {showAddPathsModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Add Paths to Collection</h3>
                <button
                  onClick={() => setShowAddPathsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              <AddPathsModalContent />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { FaPlus, FaTrash, FaGripVertical } from 'react-icons/fa';
import UserBadge from '@/app/components/atom/UserBadge';
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

import { useAuth } from '@/lib/frontend/auth';



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



function AdminPageInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'collections' | 'settings'>('collections');

  const [loading, setLoading] = useState(true);
  const [hasManageUsers, setHasManageUsers] = useState<boolean | null>(null);

  // System Settings state
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [editingSetting, setEditingSetting] = useState<SystemSetting | null>(null);
  const [settingsForm, setSettingsForm] = useState({
    key: '',
    value: '',
    secret: false,
    description: '',
    category: 'general'
  });
  const [includeSecrets, setIncludeSecrets] = useState(false);

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
    if (!isAuthenticated) return;
    // Check permission once authenticated
    (async () => {
      try {
        const res = await fetch('/api/permissions/has-permission?permissions=manageUsers');
        if (!res.ok) throw new Error('Permission check failed');
        const arr = await res.json();
        const allowed = Array.isArray(arr) ? Boolean(arr[0]) : false;
        setHasManageUsers(allowed);
      } catch (e) {
        setHasManageUsers(false);
      }
    })();
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated || !hasManageUsers) return;
    fetchSettings();
    fetchCollectionsSetting();
  }, [isAuthenticated, hasManageUsers, includeSecrets]);



  const fetchSettings = async () => {
    try {
      const url = `/api/admin/settings${includeSecrets ? '?include_secrets=true' : ''}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setSettings(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

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



  const openCreateSetting = () => {
    setEditingSetting(null);
    setSettingsForm({ key: '', value: '', secret: false, description: '', category: 'general' });
    setShowSettingsModal(true);
  };

  const openEditSetting = (setting: SystemSetting) => {
    setEditingSetting(setting);
    setSettingsForm({
      key: setting.key,
      value: typeof setting.value === 'string' ? setting.value : JSON.stringify(setting.value),
      secret: setting.secret,
      description: setting.description || '',
      category: setting.category
    });
    setShowSettingsModal(true);
  };

  // Editing moved to deep editor page



  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!settingsForm.key || settingsForm.value === '') return;

      let parsedValue;
      try {
        parsedValue = JSON.parse(settingsForm.value);
      } catch {
        parsedValue = settingsForm.value;
      }

      const url = editingSetting ? `/api/admin/settings/${editingSetting.key}` : '/api/admin/settings';
      const method = editingSetting ? 'PUT' : 'POST';
      const body = editingSetting
        ? { value: parsedValue, secret: settingsForm.secret, description: settingsForm.description, category: settingsForm.category }
        : { key: settingsForm.key, value: parsedValue, secret: settingsForm.secret, description: settingsForm.description, category: settingsForm.category };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (res.ok) {
        setShowSettingsModal(false);
        setEditingSetting(null);
        fetchSettings();
      }
    } catch (e) {
      console.error('Error saving setting', e);
    }
  };

  const handleDeleteSetting = async (key: string) => {
    try {
      const res = await fetch(`/api/admin/settings/${key}`, { method: 'DELETE' });
      if (res.ok) fetchSettings();
    } catch (e) {
      console.error('Error deleting setting', e);
    }
  };

  const openCollectionsEditor = () => {
    setShowCollectionsModal(true);
  };

  const handleCollectionsSave = async () => {
    try {
      const url = collectionsSetting ? '/api/admin/settings/collections' : '/api/admin/settings';
      const method = collectionsSetting ? 'PUT' : 'POST';
      const body = collectionsSetting
        ? { value: collectionsData }
        : {
          key: 'collections',
          value: collectionsData,
          secret: false,
          description: 'Collections configuration for home page display',
          category: 'ui'
        };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (res.ok) {
        setShowCollectionsModal(false);
        fetchCollectionsSetting();
      }
    } catch (e) {
      console.error('Error saving collections', e);
    }
  };

  const addCollection = () => {
    setCollectionsData([...collectionsData, { name: '', description: '', path_ids: [] }]);
  };

  const updateCollection = (index: number, field: string, value: any) => {
    const updated = [...collectionsData];
    updated[index] = { ...updated[index], [field]: value };
    setCollectionsData(updated);
  };

  const removeCollection = (index: number) => {
    setCollectionsData(collectionsData.filter((_, i) => i !== index));
  };

  const fetchAvailablePaths = async () => {
    try {
      setLoadingPaths(true);
      const res = await fetch('/api/paths');
      const data = await res.json();
      if (data.success) {
        setAvailablePaths(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching paths:', error);
    } finally {
      setLoadingPaths(false);
    }
  };

  const handleCollectionClick = (index: number) => {
    if (selectedCollectionIndex === index) {
      setSelectedCollectionIndex(null);
      setCollectionPaths([]);
    } else {
      setSelectedCollectionIndex(index);
      loadCollectionPaths(index);
    }
  };

  const loadCollectionPaths = async (collectionIndex: number) => {
    try {
      setLoadingPaths(true);
      const collection = collectionsData[collectionIndex];
      const pathIds = collection.path_ids || [];

      if (pathIds.length === 0) {
        setCollectionPaths([]);
        return;
      }

      // Fetch path details for the path IDs in this collection
      const res = await fetch(`/api/paths?ids=${pathIds.join(',')}`);
      const data = await res.json();
      if (data.success) {
        setCollectionPaths(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching collection paths:', error);
      setCollectionPaths([]);
    } finally {
      setLoadingPaths(false);
    }
  };

  const addPathToCollection = (collectionIndex: number, pathId: string) => {
    const updated = [...collectionsData];
    if (!updated[collectionIndex].path_ids) {
      updated[collectionIndex].path_ids = [];
    }
    if (!updated[collectionIndex].path_ids.includes(pathId)) {
      updated[collectionIndex].path_ids.push(pathId);
      setCollectionsData(updated);
    }
  };

  const removePathFromCollection = async (collectionIndex: number, pathId: string) => {
    const updated = [...collectionsData];
    if (updated[collectionIndex].path_ids) {
      updated[collectionIndex].path_ids = updated[collectionIndex].path_ids.filter((id: string) => id !== pathId);
      setCollectionsData(updated);
      // Update the displayed paths
      setCollectionPaths(collectionPaths.filter(path => path._id !== pathId));

      // Auto-save the changes
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

        console.log('Collections auto-saved after removing path');
      } catch (error) {
        console.error('Error auto-saving collections:', error);
      }
    }
  };

  const openAddPathsModal = async () => {
    setShowAddPathsModal(true);
    if (availablePaths.length === 0) {
      await fetchAvailablePaths();
    }
  };

  const addSelectedPaths = async (selectedPathIds: string[]) => {
    if (selectedCollectionIndex === null) return;

    const updated = [...collectionsData];
    const currentPathIds = updated[selectedCollectionIndex].path_ids || [];

    // Add new paths that aren't already in the collection
    const newPathIds = selectedPathIds.filter(id => !currentPathIds.includes(id));
    updated[selectedCollectionIndex].path_ids = [...currentPathIds, ...newPathIds];

    setCollectionsData(updated);
    setShowAddPathsModal(false);

    // Auto-save the changes
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

      console.log('Collections auto-saved after adding paths');
    } catch (error) {
      console.error('Error auto-saving collections:', error);
    }

    // Reload the collection paths to show the new ones
    loadCollectionPaths(selectedCollectionIndex);
  };

  // Drag and drop handlers
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

          console.log('Collections auto-saved after reordering');
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

          console.log('Collections auto-saved after reordering paths');
        } catch (error) {
          console.error('Error auto-saving collections:', error);
        }
      }
    }
  };









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
    const qs = searchParams?.toString();
    const returnTo = encodeURIComponent(`${pathname}${qs ? `?${qs}` : ''}`);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h3 className="mt-2 text-lg font-medium text-gray-900">Authentication Required</h3>
          <p className="mt-1 text-sm text-gray-500">
            You must be logged in to access this page.
          </p>
          <div className="mt-6">
            <Link href={`/login?returnTo=${returnTo}`} className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (hasManageUsers === false) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h3 className="mt-2 text-lg font-medium text-gray-900">Access denied</h3>
          <p className="mt-1 text-sm text-gray-500">You do not have permission to manage users.</p>
        </div>
      </div>
    );
  }

  if (hasManageUsers === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking permissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage users and view all content in the platform.
              </p>
            </div>
            <UserBadge align="right" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('collections')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'collections'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Collections
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'settings'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                System Settings
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Unauthorized state handled by API responses; show CTA if needed */}
            {activeTab === 'collections' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Collections Configuration</h3>
                    <p className="text-sm text-gray-500">Manage collections displayed on the home page</p>
                  </div>
                  <button onClick={openCollectionsEditor} className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
                    <FaPlus className="mr-2 h-4 w-4" /> Edit Collections
                  </button>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h4 className="font-medium text-gray-900 mb-2">Current Collections ({collectionsData.length})</h4>
                  {collectionsData.length === 0 ? (
                    <p className="text-gray-500 text-sm">No collections configured. Click "Edit Collections" to add some.</p>
                  ) : (
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleCollectionsDragEnd}
                    >
                      <SortableContext items={collectionsData.map((_, index) => `collection-${index}`)} strategy={verticalListSortingStrategy}>
                        <div className="space-y-2">
                          {collectionsData.map((collection, index) => (
                            <SortableCollectionItem
                              key={index}
                              collection={collection}
                              index={index}
                              isSelected={selectedCollectionIndex === index}
                              onClick={() => handleCollectionClick(index)}
                            />
                          ))}
                        </div>
                      </SortableContext>
                    </DndContext>
                  )}
                </div>

                {/* Path Management Table */}
                {selectedCollectionIndex !== null && collectionsData[selectedCollectionIndex] && (
                  <div className="mt-6 bg-white rounded-lg">
                    <div className="px-6 py-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="text-lg font-medium text-gray-900">
                            Paths in "{collectionsData[selectedCollectionIndex].name || 'Unnamed Collection'}"
                          </h4>
                        </div>
                        <button
                          onClick={openAddPathsModal}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                        >
                          <FaPlus className="mr-2 h-4 w-4" />
                          Add Paths
                        </button>
                      </div>
                    </div>

                    <div className="p-6">
                      {loadingPaths ? (
                        <div className="text-center py-4">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                          <p className="mt-2 text-sm text-gray-500">Loading paths...</p>
                        </div>
                      ) : collectionPaths.length === 0 ? (
                        <div className="text-center py-8">
                          <div className="text-gray-400 mb-4">
                            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                            </svg>
                          </div>
                          <h3 className="text-sm font-medium text-gray-900 mb-1">No paths in this collection</h3>
                          <p className="text-sm text-gray-500 mb-4">Get started by adding some paths to this collection.</p>
                          <button
                            onClick={openAddPathsModal}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                          >
                            <FaPlus className="mr-2 h-4 w-4" />
                            Add Paths
                          </button>
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Path Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
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
                                      key={path._id}
                                      path={path}
                                      index={index}
                                      onRemove={() => removePathFromCollection(selectedCollectionIndex, path._id)}
                                    />
                                  ))}
                                </tbody>
                              </SortableContext>
                            </DndContext>
                          </table>
                        </div>
                      )}
                    </div>


                  </div>
                )}

              </div>
            )}

            {activeTab === 'settings' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={includeSecrets}
                        onChange={(e) => setIncludeSecrets(e.target.checked)}
                        className="mr-2"
                      />
                      Include secret settings
                    </label>
                  </div>
                  <button
                    onClick={openCreateSetting}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <FaPlus className="mr-2 h-4 w-4" /> Add Setting
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Key</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Secret</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {settings.map((setting) => (
                        <tr key={setting._id}>
                          <td className="px-6 py-4 whitespace-nowrap font-mono text-sm">{setting.key}</td>
                          <td className="px-6 py-4">
                            <div className="max-w-xs truncate">
                              {setting.secret ? (
                                <span className="text-gray-400">••••••••</span>
                              ) : (
                                <span className="font-mono text-sm">
                                  {typeof setting.value === 'string' ? setting.value : JSON.stringify(setting.value)}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              {setting.category}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {setting.secret ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                Secret
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Public
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                            {setting.description || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="flex items-center gap-3 justify-end">
                              <button
                                onClick={() => openEditSetting(setting)}
                                className="text-blue-600 hover:text-blue-900"
                                title="Edit setting"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteSetting(setting.key)}
                                className="text-red-600 hover:text-red-900"
                                title="Delete setting"
                              >
                                <FaTrash />
                              </button>
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


      {showSettingsModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingSetting ? 'Edit Setting' : 'Create Setting'}
              </h3>
              <form onSubmit={handleSettingsSubmit} className="space-y-4">
                {!editingSetting && (
                <div>
                    <label className="block text-sm font-medium text-gray-700">Key *</label>
                    <input
                      type="text"
                      required
                      value={settingsForm.key}
                      onChange={(e) => setSettingsForm({ ...settingsForm, key: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., LLM_APIKEY, PRIMARY_COLOR"
                    />
                </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Value *</label>
                  <textarea
                    value={settingsForm.value}
                    onChange={(e) => setSettingsForm({ ...settingsForm, value: e.target.value })}
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter value (JSON or string)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Category</label>
                  <input
                    type="text"
                    value={settingsForm.category}
                    onChange={(e) => setSettingsForm({ ...settingsForm, category: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., general, ui, api"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    value={settingsForm.description}
                    onChange={(e) => setSettingsForm({ ...settingsForm, description: e.target.value })}
                    rows={2}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Optional description"
                  />
                </div>
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settingsForm.secret}
                      onChange={(e) => setSettingsForm({ ...settingsForm, secret: e.target.checked })}
                      className="mr-2"
                    />
                    <span className="text-sm font-medium text-gray-700">Secret (only admins can view)</span>
                  </label>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowSettingsModal(false)}
                    className="px-4 py-2 bg-gray-200 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md"
                  >
                    {editingSetting ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showCollectionsModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-4/5 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Collections</h3>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {collectionsData.map((collection, index) => (
                  <div key={index} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-medium text-gray-900">Collection {index + 1}</h4>
                      <button
                        onClick={() => removeCollection(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <FaTrash />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                        <input
                          type="text"
                          value={collection.name || ''}
                          onChange={(e) => updateCollection(index, 'name', e.target.value)}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Collection name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <input
                          type="text"
                          value={collection.description || ''}
                          onChange={(e) => updateCollection(index, 'description', e.target.value)}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Collection description"
                        />
                      </div>
                    </div>
                    <div className="mt-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Path IDs (comma-separated)</label>
                      <input
                        type="text"
                        value={Array.isArray(collection.path_ids) ? collection.path_ids.join(', ') : ''}
                        onChange={(e) => updateCollection(index, 'path_ids', e.target.value.split(',').map(id => id.trim()).filter(id => id))}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="path1, path2, path3"
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center mt-4">
                <button
                  onClick={addCollection}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <FaPlus className="mr-2 h-4 w-4" /> Add Collection
                </button>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowCollectionsModal(false)}
                    className="px-4 py-2 bg-gray-200 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCollectionsSave}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md"
                  >
                    Save Collections
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Paths Modal */}
      {showAddPathsModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-4/5 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Add Paths to Collection</h3>
                <button
                  onClick={() => setShowAddPathsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <AddPathsModalContent
                key={`modal-${selectedCollectionIndex || 0}-${selectedCollectionIndex !== null ? collectionsData[selectedCollectionIndex]?.path_ids?.length || 0 : 0}`}
                availablePaths={availablePaths}
                currentPathIds={selectedCollectionIndex !== null ? collectionsData[selectedCollectionIndex]?.path_ids || [] : []}
                onAddPaths={addSelectedPaths}
                onClose={() => setShowAddPathsModal(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Sortable Collection Item Component
function SortableCollectionItem({ 
  collection, 
  index, 
  isSelected, 
  onClick 
}: { 
  collection: any; 
  index: number; 
  isSelected: boolean; 
  onClick: () => void; 
}) {
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
      className={`bg-white rounded border p-3 cursor-pointer transition-colors ${isSelected
          ? 'border-blue-500 bg-blue-50'
          : 'hover:bg-gray-50'
        }`}
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
        >
          <FaGripVertical className="h-4 w-4" />
        </div>
        <div className="flex-1">
          <div className="font-medium text-gray-900">{collection.name || 'Unnamed Collection'}</div>
          <div className="text-sm text-gray-600">{collection.description || 'No description'}</div>
          <div className="text-xs text-gray-500 mt-1">
            {collection.path_ids?.length || 0} path(s)
          </div>
        </div>
        <div className="ml-2">
          {isSelected ? (
            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </div>
      </div>
    </div>
  );
}

// Sortable Path Item Component
function SortablePathItem({ 
  path, 
  index, 
  onRemove 
}: { 
  path: any; 
  index: number; 
  onRemove: () => void; 
}) {
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

  return (
    <tr ref={setNodeRef} style={style} className="bg-white">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-2">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
          >
            <FaGripVertical className="h-4 w-4" />
          </div>
          <div className="flex items-center gap-2">
            <div className="text-sm font-medium text-gray-900">{path.name}</div>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${path.state === 'published'
                ? 'bg-green-100 text-green-800'
                : 'bg-yellow-100 text-yellow-800'
              }`}>
              {path.state === 'published' ? 'Published' : 'Locked'}
            </span>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="text-sm text-gray-900 max-w-xs truncate">
          {path.description || 'No description'}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-center">
        <FaTrash onClick={onRemove} className="mr-1 h-3 w-3 text-black cursor-pointer hover:text-red-600" />
      </td>
    </tr>
  );
}

// Add Paths Modal Content Component
function AddPathsModalContent({
  availablePaths,
  currentPathIds,
  onAddPaths,
  onClose
}: {
  availablePaths: any[];
  currentPathIds: string[];
  onAddPaths: (pathIds: string[]) => void;
  onClose: () => void;
}) {
  const [selectedPaths, setSelectedPaths] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter out paths that are already in the collection
  const availableToAdd = availablePaths.filter(path => !currentPathIds.includes(path._id));

  // Filter paths based on search term
  const filteredPaths = availableToAdd.filter(path =>
    path.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (path.description && path.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handlePathToggle = (pathId: string) => {
    setSelectedPaths(prev =>
      prev.includes(pathId)
        ? prev.filter(id => id !== pathId)
        : [...prev, pathId]
    );
  };

  const handleAddSelected = () => {
    onAddPaths(selectedPaths);
    setSelectedPaths([]);
    setSearchTerm('');
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
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Path List */}
      <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-md">
        {filteredPaths.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">
              {searchTerm ? 'No paths found matching your search.' : 'No paths available to add.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredPaths.map((path) => (
              <div key={path._id} className="p-4 hover:bg-gray-50">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedPaths.includes(path._id)}
                    onChange={() => handlePathToggle(path._id)}
                    className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-medium text-gray-900">{path.name}</div>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${path.state === 'published'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                        }`}>
                        {path.state === 'published' ? 'Published' : 'Locked'}
                      </span>
                    </div>
                    {path.description && (
                      <div className="text-sm text-gray-600 mt-1">{path.description}</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center mt-6">
        <div className="text-sm text-gray-500">
          {selectedPaths.length} path(s) selected
        </div>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleAddSelected}
            disabled={selectedPaths.length === 0}
            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Add Selected Paths ({selectedPaths.length})
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div><p className="mt-4 text-gray-600">Loading admin dashboard...</p></div></div>}>
      <AdminPageInner />
    </Suspense>
  );
}

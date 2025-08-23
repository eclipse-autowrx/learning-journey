// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSearchParams, usePathname } from 'next/navigation';
import { saveAs } from 'file-saver';
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
  FaArrowLeft,
  FaDownload,
  FaUpload,
  FaTree,
  FaFileImport,
  FaTimes,
  FaSave,
  FaUserShield
} from 'react-icons/fa';
import { VscJson } from 'react-icons/vsc';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import 'tippy.js/themes/light.css';
import StateFilter from '@/app/components/atom/StateFilter';
import Btn from '@/app/components/atom/Btn';
import TagEditor from '@/app/components/atom/TagEditor';
import ManageBreadCrumb from '@/app/components/atom/ManageBreadCrumb';
import UserBadge from '@/app/components/atom/UserBadge';
import ImportTreeView from '@/app/components/atom/ImportTreeView';
import ImportContentViewer from '@/app/components/atom/ImportContentViewer';
import { 
  showDeleteConfirm, 
  showBulkDeleteConfirm, 
  showStateChangeConfirm,
  showBulkOperationResult,
  showToast
} from '@/lib/utils/notifications';
import { COLLECTION_STATES, PATH_STATES } from '@/lib/const';
import React, { Suspense } from 'react';
import { useAuth } from '@/lib/frontend/auth';

interface Collection {
  _id: string;
  name: string;
  slug: string;
  description: string;
  owner_id?: string;
  owner_name?: string;
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
  owner_id?: string;
  owner_name?: string;
  category: string;
  state: string;
  total_courses: number;
  created_at: string;
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

interface Lesson {
  _id: string;
  name: string;
  slug: string;
  description: string;
  lesson_type: string;
  state: string;
  duration: number;
  created_at: string;
}

function ManagePageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  
  const [collections, setCollections] = useState<Collection[]>([]);
  const [paths, setPaths] = useState<Path[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'collections' | 'paths' | 'studio'>(searchParams?.get('tab') === 'paths' ? 'paths' : (searchParams?.get('tab') === 'studio' ? 'studio' : 'collections'));

  // Filter states
  const [selectedCollectionStates, setSelectedCollectionStates] = useState<string[]>(COLLECTION_STATES.map(s => s.value));
  const [selectedPathStates, setSelectedPathStates] = useState<string[]>(PATH_STATES.map(s => s.value));

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
  
  // Path modal states
  const [showPathModal, setShowPathModal] = useState(false);
  const [editingPath, setEditingPath] = useState<Path | null>(null);
  const [pathForm, setPathForm] = useState({
    name: '',
    description: '',
    state: 'draft'
  });
  
  // Course modal states
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [courseForm, setCourseForm] = useState({
    name: '',
    description: '',
    state: 'draft'
  });
  
  // Lesson modal states
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [lessonForm, setLessonForm] = useState({
    name: '',
    description: '',
    lesson_type: 'text-markdown',
    state: 'draft'
  });
  
  // Dropdown state
  
  // Bulk action modal state
  const [showBulkActionModal, setShowBulkActionModal] = useState(false);
  const [bulkActionType, setBulkActionType] = useState<'state' | 'delete' | 'download' | null>(null);
  const [bulkNewState, setBulkNewState] = useState<string>('draft');

  // Import Studio states
  const [importedData, setImportedData] = useState<any | null>(null);
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
  const [imageBlobs, setImageBlobs] = useState<Record<string, Blob>>({});
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [selectedTreeItem, setSelectedTreeItem] = useState<any | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const { isAuthenticated, loading: authLoading } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  const fetchData = async () => {
    try {
      console.log('Starting to fetch data...');
      
      // Fetch each API separately to identify which one is failing
      console.log('Fetching collections...');
      const collectionsRes = await fetch('/api/creator/collections');
      console.log('Collections response status:', collectionsRes.status);
      const collectionsData = await collectionsRes.json();
      console.log('Collections data:', collectionsData);
      
      console.log('Fetching paths...');
      const pathsRes = await fetch('/api/creator/paths');
      console.log('Paths response status:', pathsRes.status);
      const pathsData = await pathsRes.json();
      console.log('Paths data:', pathsData);
      
      console.log('Fetching courses...');
      const coursesRes = await fetch('/api/creator/courses');
      console.log('Courses response status:', coursesRes.status);
      const coursesData = await coursesRes.json();
      console.log('Courses data:', coursesData);
      
      console.log('Fetching lessons...');
      const lessonsRes = await fetch('/api/creator/lessons');
      console.log('Lessons response status:', lessonsRes.status);
      const lessonsData = await lessonsRes.json();
      console.log('Lessons data:', lessonsData);

      setCollections(collectionsData.success ? collectionsData.data : []);
      setPaths(pathsData.success ? pathsData.data : []);
      
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
    if (!collectionForm.name) {
      showToast.error('Collection name cannot be empty');
      return;
    }
    try {
      const url = editingCollection 
        ? `/api/creator/collections/${editingCollection.slug}`
        : '/api/creator/collections';
      
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
      const response = await fetch(`/api/creator/collections/${collection.slug}`, {
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

  // Path functions
  const openCreatePath = () => {
    setEditingPath(null);
    setPathForm({
      name: '',
      description: '',
      state: 'draft'
    });
    setShowPathModal(true);
  };

  const openEditPath = (path: Path) => {
    setEditingPath(path);
    setPathForm({
      name: path.name,
      description: path.description || '',
      state: path.state || 'draft',
    });
    setShowPathModal(true);
  };

  const handlePathSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pathForm.name) {
      showToast.error('Path name cannot be empty');
      return;
    }
    try {
      const url = editingPath ? `/api/creator/paths/${editingPath.slug}` : '/api/creator/paths';
      const method = editingPath ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pathForm),
      });

      if (response.ok) {
        showToast.success(editingPath ? 'Path updated successfully' : 'Path created successfully');
        setShowPathModal(false);
        setEditingPath(null);
        fetchData(); // Refresh data
      } else {
        const error = await response.json();
        showToast.error(`Error: ${error.error || (editingPath ? 'Failed to update path' : 'Failed to create path')}`);
      }
    } catch (error) {
      console.error('Error saving path:', error);
      showToast.error(editingPath ? 'Failed to update path' : 'Failed to create path');
    }
  };

  // Course functions
  const openCreateCourse = () => {
    setCourseForm({
      name: '',
      description: '',
      state: 'draft'
    });
    setShowCourseModal(true);
  };

  const handleCourseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/creator/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(courseForm),
      });

      if (response.ok) {
        showToast.success('Course created successfully');
        setShowCourseModal(false);
        fetchData(); // Refresh data
      } else {
        const error = await response.json();
        showToast.error(`Error: ${error.error || 'Failed to create course'}`);
      }
    } catch (error) {
      console.error('Error creating course:', error);
      showToast.error('Failed to create course');
    }
  };

  const handleDeletePath = async (path: Path) => {
    const result = await showDeleteConfirm(path.name);
    if (!result.isConfirmed) {
      return;
    }

    try {
      const response = await fetch(`/api/creator/paths/${path.slug}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        showToast.success(`Path "${path.name}" deleted successfully`);
        fetchData(); // Refresh data
      } else {
        const error = await response.json();
        showToast.error(`Error: ${error.error || 'Failed to delete path'}`);
      }
    } catch (error) {
      console.error('Error deleting path:', error);
      showToast.error('Failed to delete path');
    }
  };

  // Lesson functions
  const openCreateLesson = () => {
    setLessonForm({
      name: '',
      description: '',
      lesson_type: 'text-markdown',
      state: 'draft'
    });
    setShowLessonModal(true);
  };

  const handleLessonSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/creator/lessons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(lessonForm),
      });

      if (response.ok) {
        showToast.success('Lesson created successfully');
        setShowLessonModal(false);
        fetchData(); // Refresh data
      } else {
        const error = await response.json();
        showToast.error(`Error: ${error.error || 'Failed to create lesson'}`);
      }
    } catch (error) {
      console.error('Error creating lesson:', error);
      showToast.error('Failed to create lesson');
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
      const response = await fetch(`/api/creator/${itemType}/bulk`, {
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
      const response = await fetch(`/api/creator/${itemType}/bulk`, {
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

  const handleBulkDownload = async () => {
    const itemType = 'paths';
    const selectedItems = selectedPaths;

    showToast.info(`Preparing download for ${selectedItems.length} path(s)...`);

    try {
      const response = await fetch(`/api/paths/export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ids: selectedItems
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        saveAs(blob, `learning-journey-paths-export-${new Date().toISOString()}.zip`);
        showToast.success('Download started successfully!');
        setSelectedPaths([]);
      } else {
        const error = await response.json();
        showToast.error(`Error: ${error.error || 'Failed to download paths'}`);
      }
    } catch (error) {
      console.error('Error downloading paths:', error);
      showToast.error('Failed to download paths');
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    showToast.info('Reading zip file...');

    try {
      const JSZip = (await import('jszip')).default;
      const zip = await JSZip.loadAsync(file);
      
      const dataFile = zip.file('data.json');
      if (!dataFile) {
        throw new Error('data.json not found in the zip file.');
      }
      const dataContent = await dataFile.async('string');
      const jsonData = JSON.parse(dataContent);
      setImportedData(jsonData);

      const newImageUrls: Record<string, string> = {};
      const newImageBlobs: Record<string, Blob> = {};
      const imagePromises: Promise<void>[] = [];
      zip.folder('images')?.forEach((relativePath, file) => {
        if (!file.dir) {
          const promise = file.async('blob').then(blob => {
            const url = URL.createObjectURL(blob);
            const originalPath = `/images/${relativePath}`;
            newImageUrls[originalPath] = url;
            newImageBlobs[originalPath] = blob;
          });
          imagePromises.push(promise);
        }
      });

      await Promise.all(imagePromises);
      setImageUrls(newImageUrls);
      setImageBlobs(newImageBlobs);

      showToast.success('File imported successfully. Ready for review.');
    } catch (error: any) {
      console.error('Error reading zip file:', error);
      showToast.error(`Failed to read zip file: ${error.message}`);
      setImportedData(null);
      setImageUrls({});
      setImageBlobs({});
    } finally {
      setIsImporting(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleTreeSelect = (item: any, type: string) => {
    setSelectedTreeItem({ item, type });
  };

  const handleTreeDelete = (itemToDelete: any, type: string) => {
    if (!importedData) return;

    const deleteRecursive = (items: any[], id: string) => {
      return items.filter(item => {
        if (item._id === id) return false;
        if (item.courses) {
          item.courses = deleteRecursive(item.courses, id);
        }
        if (item.lessons) {
          item.lessons = deleteRecursive(item.lessons, id);
        }
        return true;
      });
    };

    const newPaths = deleteRecursive(importedData.paths, itemToDelete._id);
    setImportedData({ ...importedData, paths: newPaths });
    
    // If the deleted item was selected, clear the viewer
    if (selectedTreeItem?.item?._id === itemToDelete._id) {
      setSelectedTreeItem(null);
    }

    showToast.success(`"${itemToDelete.name}" removed from import.`);
  };

  const handleImportedItemChange = (updatedItem: any) => {
    if (!importedData) return;

    const updateRecursive = (items: any[]): any[] => {
      return items.map(item => {
        if (item._id === updatedItem._id) {
          return updatedItem;
        }
        if (item.courses) {
          item.courses = updateRecursive(item.courses);
        }
        if (item.lessons) {
          item.lessons = updateRecursive(item.lessons);
        }
        return item;
      });
    };

    const newPaths = updateRecursive(importedData.paths);
    setImportedData({ ...importedData, paths: newPaths });

    // Also update the selected item to avoid stale data in the viewer
    setSelectedTreeItem((prev: any) => (prev ? { ...prev, item: updatedItem } : null));
  };


  const handleSaveImport = async () => {
    if (!importedData) {
      showToast.error("No data to save.");
      return;
    }

    setIsSaving(true);
    showToast.info("Saving imported data to the database...");

    try {
      // We don't need to send images, as they are saved separately if needed,
      // and the backend will handle creating new records.
      const formData = new FormData();
      formData.append('data', JSON.stringify(importedData));
      
      Object.entries(imageBlobs).forEach(([path, blob]) => {
        // Use the original path as the key for the backend to map old to new
        formData.append(path, blob);
      });

      const response = await fetch('/api/paths/import', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        showToast.success(result.message || "Data imported successfully!");
        setImportedData(null);
        setSelectedTreeItem(null);
        setImageUrls({});
        setImageBlobs({});
        fetchData(); // Refresh the main data view
      } else {
        const error = await response.json();
        showToast.error(`Failed to import data: ${error.error}`);
      }
    } catch (error) {
      console.error('Error saving imported data:', error);
      showToast.error('An unexpected error occurred while saving.');
    } finally {
      setIsSaving(false);
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
            <Link
              href={`/login?returnTo=${returnTo}`}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
      <div className="flex items-center justify-between">
        <ManageBreadCrumb items={[]} rightSlot={<UserBadge align="right" variant="transparent" />} />
      </div>
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Management Dashboard</h1>
              <p className="mt-1 text-sm text-gray-500">
                Overview of all content in the platform.
              </p>
            </div>
            <div>
              <Link href="/admin">
                <Btn>
                  <FaUserShield className="mr-2 h-4 w-4" />
                  Admin
                </Btn>
              </Link>
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
              <button
                onClick={() => setActiveTab('studio')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'studio'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Import
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
                      states={COLLECTION_STATES}
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
                  (() => {
                    const filteredCollections = collections.filter(collection => selectedCollectionStates.includes(collection.state));
                    return (
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
                                      filteredCollections.every(c => selectedCollections.includes(c._id))}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setSelectedCollections(filteredCollections.map(c => c._id));
                                      } else {
                                        setSelectedCollections([]);
                                      }
                                    }}
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
                              {filteredCollections.map((collection) => (
                                <tr key={collection._id} className={`hover:bg-gray-50 ${selectedCollections.includes(collection._id) ? 'bg-blue-50' : ''}`}>
                                  <td className="px-6 py-3">
                                    <input
                                      type="checkbox"
                                      checked={selectedCollections.includes(collection._id)}
                                      onChange={() => {
                                        setSelectedCollections(prev => 
                                          prev.includes(collection._id) ? prev.filter(id => id !== collection._id) : [...prev, collection._id]
                                        );
                                      }}
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
                                      {COLLECTION_STATES.find(s => s.value === collection.state)?.label || collection.state}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(collection.created_at).toLocaleDateString()}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex items-center justify-end space-x-2">
                                      <Link 
                                        href={`/manage/collections/${collection.slug}`}
                                        className="text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-2 py-1 rounded transition-colors duration-200"
                                        title="View Collection"
                                      >
                                        <FaArrowRight className="h-4 w-4" />
                                      </Link>
                                      <div className="relative dropdown-container">
                                        <Tippy
                                          content={
                                            <div className="py-1 min-w-max">
                                                <button
                                                  onClick={() => {
                                                    openEditCollection(collection);
                                                  }}
                                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                                                >
                                                  <FaEdit className="h-4 w-4 mr-2" />
                                                  Edit Collection
                                                </button>
                                                <button
                                                  onClick={() => {
                                                    handleDeleteCollection(collection);
                                                  }}
                                                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                                                >
                                                  <FaTrash className="h-4 w-4 mr-2 text-red-600" />
                                                  Delete Collection
                                                </button>
                                            </div>
                                          }
                                          interactive={true}
                                          arrow={true}
                                          placement="bottom-end"
                                          trigger="click"
                                          theme="light"
                                          // Ensure overlay does not get clipped and stays above all
                                          appendTo={() => document.body}
                                          zIndex={9999}
                                        >
                                          <button
                                            className="text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-2 py-1 rounded transition-colors duration-200 cursor-pointer"
                                            title="More options"
                                          >
                                            <FaEllipsisV className="h-4 w-4" />
                                          </button>
                                        </Tippy>
                                      </div>
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
                      states={PATH_STATES}
                      selectedStates={selectedPathStates}
                      onStatesChange={setSelectedPathStates}
                    />
                    <button 
                      onClick={openCreatePath}
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
                  </div>
                ) : (
                  (() => {
                    const filteredPaths = paths.filter(path => selectedPathStates.includes(path.state));
                    return (
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
                                    setBulkActionType('download');
                                    handleBulkDownload();
                                  }}
                                >
                                  <FaDownload className="mr-2 h-3.5 w-3.5" />
                                  Download
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
                                      filteredPaths.every(p => selectedPaths.includes(p._id))}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setSelectedPaths(filteredPaths.map(p => p._id));
                                      } else {
                                        setSelectedPaths([]);
                                      }
                                    }}
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
                              {filteredPaths.map((path) => (
                                <tr key={path._id} className={`hover:bg-gray-50 ${selectedPaths.includes(path._id) ? 'bg-blue-50' : ''}`}>
                                  <td className="px-6 py-3">
                                    <input
                                      type="checkbox"
                                      checked={selectedPaths.includes(path._id)}
                                      onChange={() => {
                                        setSelectedPaths(prev => 
                                          prev.includes(path._id) ? prev.filter(id => id !== path._id) : [...prev, path._id]
                                        );
                                      }}
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
                                      {PATH_STATES.find(s => s.value === path.state)?.label || path.state}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(path.created_at).toLocaleDateString()}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex items-center justify-end space-x-2">
                                      <Link 
                                        href={`/manage/paths/${path.slug}`}
                                        className="text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-2 py-1 rounded transition-colors duration-200"
                                        title="View Path"
                                      >
                                        <FaArrowRight className="h-4 w-4" />
                                      </Link>
                                      <div className="relative dropdown-container">
                                        <Tippy
                                          content={
                                            <div className="py-1 min-w-max">
                                                <button
                                                  onClick={() => {
                                                    openEditPath(path);
                                                  }}
                                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                                                >
                                                  <FaEdit className="h-4 w-4 mr-2" />
                                                  Edit Path
                                                </button>
                                                <button
                                                  onClick={() => {
                                                    handleDeletePath(path);
                                                  }}
                                                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                                                >
                                                  <FaTrash className="h-4 w-4 mr-2 text-red-600" />
                                                  Delete Path
                                                </button>
                                            </div>
                                          }
                                          interactive={true}
                                          arrow={true}
                                          placement="bottom-end"
                                          trigger="click"
                                          theme="light"
                                          // Ensure overlay does not get clipped and stays above all
                                          appendTo={() => document.body}
                                          zIndex={9999}
                                        >
                                          <button
                                            className="text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-2 py-1 rounded transition-colors duration-200 cursor-pointer"
                                            title="More options"
                                          >
                                            <FaEllipsisV className="h-4 w-4" />
                                          </button>
                                        </Tippy>
                                      </div>
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
              </div>
            )}

            {activeTab === 'studio' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Import Studio
                  </h3>
                  <div className="flex items-center space-x-3">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      className="hidden"
                      accept=".zip"
                    />
                    <Btn onClick={handleImportClick} disabled={isImporting}>
                      {isImporting ? 'Importing...' : <><FaFileImport className="mr-2 h-4 w-4" /> Import from Zip</>}
                    </Btn>
                    {importedData && (
                       <Btn onClick={handleSaveImport} disabled={isSaving}>
                        {isSaving ? 'Saving...' : <><FaSave className="mr-2 h-4 w-4" /> Save to DB</>}
                      </Btn>
                    )}
                  </div>
                </div>
                {importedData ? (
                   <div className="flex gap-6">
                    <div className="w-1/3">
                      <div className="p-4 border rounded-lg bg-gray-50 h-[600px] overflow-auto">
                        <h4 className="font-bold mb-2 text-gray-700">Imported Content</h4>
                        <ImportTreeView 
                          data={importedData}
                          onSelect={handleTreeSelect}
                          onDelete={handleTreeDelete}
                          selectedItem={selectedTreeItem}
                        />
                      </div>
                    </div>
                    <div className="w-2/3">
                      <div className="p-4 border rounded-lg bg-white h-[600px] overflow-auto">
                        <ImportContentViewer 
                          selectedItem={selectedTreeItem}
                          imageUrls={imageUrls}
                          onItemChange={handleImportedItemChange}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div 
                    onClick={handleImportClick}
                    className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-gray-50"
                  >
                    <FaUpload className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No file imported</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {isImporting ? 'Processing file...' : 'Click here or use the button above to import a zip file.'}
                    </p>
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
                Change State for {selectedCollections.length > 0 ? `${selectedCollections.length} collections` : `${selectedPaths.length} paths`}
              </h3>
              
              <div className="space-y-2">
                {(activeTab === 'collections'
                  ? COLLECTION_STATES.filter(s => s.value !== 'published')
                  : PATH_STATES.filter(s => s.value !== 'published')
                ).map((state) => (
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

                {editingCollection && (
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
                )}

                {editingCollection && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Tags
                    </label>
                    <TagEditor
                      tags={collectionForm.tags}
                      onChange={(newTags) => setCollectionForm({...collectionForm, tags: newTags})}
                      placeholder="Type and press Enter to add tags..."
                      className="mt-1"
                    />
                  </div>
                )}

                {editingCollection && (
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
                )}

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

      {/* Path Modal */}
      {showPathModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingPath ? 'Edit Path' : 'Create Path'}
              </h3>
              
              <form onSubmit={handlePathSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={pathForm.name}
                    onChange={(e) => setPathForm({...pathForm, name: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Path name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    value={pathForm.description}
                    onChange={(e) => setPathForm({...pathForm, description: e.target.value})}
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Path description"
                  />
                </div>

                {editingPath && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      State
                    </label>
                    <select
                      value={pathForm.state}
                      onChange={(e) => setPathForm({...pathForm, state: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="archived">Archived</option>
                      <option value="locked">Locked</option>
                    </select>
                  </div>
                )}

                <div className="flex justify-end space-x-3 pt-4">
                  <Btn
                    variant="outlined"
                    onClick={() => setShowPathModal(false)}
                  >
                    Cancel
                  </Btn>
                  <Btn
                    type="submit"
                  >
                    {editingPath ? 'Update' : 'Create'}
                  </Btn>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Course Modal */}
      {showCourseModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Create Course
              </h3>
              
              <form onSubmit={handleCourseSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={courseForm.name}
                    onChange={(e) => setCourseForm({...courseForm, name: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Course name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    value={courseForm.description}
                    onChange={(e) => setCourseForm({...courseForm, description: e.target.value})}
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Course description"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <Btn
                    variant="outlined"
                    onClick={() => setShowCourseModal(false)}
                  >
                    Cancel
                  </Btn>
                  <Btn
                    type="submit"
                  >
                    Create
                  </Btn>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Lesson Modal */}
      {showLessonModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Create Lesson
              </h3>
              
              <form onSubmit={handleLessonSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={lessonForm.name}
                    onChange={(e) => setLessonForm({...lessonForm, name: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Lesson name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    value={lessonForm.description}
                    onChange={(e) => setLessonForm({...lessonForm, description: e.target.value})}
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Lesson description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Lesson Type
                  </label>
                  <select
                    value={lessonForm.lesson_type}
                    onChange={(e) => setLessonForm({...lessonForm, lesson_type: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="text-markdown">Text/Markdown</option>
                    <option value="video">Video</option>
                    <option value="quiz">Quiz</option>
                    <option value="interactive">Interactive</option>
                  </select>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <Btn
                    variant="outlined"
                    onClick={() => setShowLessonModal(false)}
                  >
                    Cancel
                  </Btn>
                  <Btn
                    type="submit"
                  >
                    Create
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

export default function ManagePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div><p className="mt-4 text-gray-600">Loading management dashboard...</p></div></div>}>
      <ManagePageInner />
    </Suspense>
  );
}

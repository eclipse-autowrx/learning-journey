"use client";

import { useEffect, useState, Suspense } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { useParams, useRouter, useSearchParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import { FaArrowLeft, FaPlus, FaTrash, FaGripVertical, FaSave } from 'react-icons/fa';
import { useAuth } from '@/lib/frontend/auth';
import StateFilter from '@/app/components/atom/StateFilter';
import { PATH_STATES } from '@/lib/const';

interface PathItem {
  _id: string;
  name: string;
  slug: string;
  state: string;
}

interface CollectionDetail {
  _id: string;
  name: string;
  description?: string;
  category?: string;
  tags?: string[];
  state: string;
  paths: PathItem[];
  path_order?: string[];
}

function AdminCollectionEditorInner() {
  const params = useParams();
  const id = (params as any)?.id as string;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isAuthenticated, loading: authLoading } = useAuth();

  const [collection, setCollection] = useState<CollectionDetail | null>(null);
  const [allPaths, setAllPaths] = useState<PathItem[]>([]);
  const [selectedPathIds, setSelectedPathIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'paths'>('info');
  const [infoForm, setInfoForm] = useState({ name: '', description: '' });
  const [infoSaving, setInfoSaving] = useState(false);
  const [selectedPathStates, setSelectedPathStates] = useState<string[]>(PATH_STATES.map(s => s.value));

  const fetchCollection = async () => {
    const res = await fetch(`/api/admin/collections/${id}`);
    const data = await res.json();
    if (data.success) {
      setCollection(data.data);
      setInfoForm({ name: data.data?.name || '', description: data.data?.description || '' });
    }
  };

  const fetchAllPaths = async () => {
    // Admin should see all paths (any state)
    const res = await fetch('/api/admin/paths');
    const data = await res.json();
    if (data.success) setAllPaths(data.data || []);
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchCollection();
    fetchAllPaths();
  }, [isAuthenticated, id]);

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
          <p className="mt-1 text-sm text-gray-500">You must be logged in to access this page.</p>
          <div className="mt-6">
            <Link href={`/login?returnTo=${returnTo}`} className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">Go to Login</Link>
          </div>
        </div>
      </div>
    );
  }

  const currentOrder = collection?.path_order && collection.path_order.length > 0
    ? collection.path_order
    : (collection?.paths || []).map(p => p._id);

  const orderedPaths = (collection?.paths || []).slice().sort((a, b) => {
    const ai = currentOrder.indexOf(a._id);
    const bi = currentOrder.indexOf(b._id);
    return ai - bi;
  });

  const addPath = async (pathId: string) => {
    if (!collection) return;
    const newIds = Array.from(new Set([...currentOrder, pathId]));
    await saveOrderAndPaths(newIds);
  };

  const removePath = async (pathId: string) => {
    if (!collection) return;
    const newIds = currentOrder.filter(id => id !== pathId);
    await saveOrderAndPaths(newIds);
  };

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    const sourceIndex = result.source.index;
    const destIndex = result.destination.index;
    if (sourceIndex === destIndex) return;
    const reordered = Array.from(orderedPaths);
    const [moved] = reordered.splice(sourceIndex, 1);
    reordered.splice(destIndex, 0, moved);
    const newIds = reordered.map((p) => p._id);
    await saveOrderAndPaths(newIds);
  };

  const saveOrderAndPaths = async (newIds: string[]) => {
    if (!collection) return;
    setSaving(true);
    try {
      // Persist paths and order by setting both fields
      const res = await fetch(`/api/admin/collections/${collection._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paths: newIds, path_order: newIds }),
      });
      if (res.ok) {
        await fetchCollection();
      }
    } finally {
      setSaving(false);
    }
  };

  const availablePaths = allPaths.filter(p => !currentOrder.includes(p._id));
  const filteredAvailablePaths = availablePaths.filter(p => selectedPathStates.includes(p.state));

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-4">
              <button onClick={() => router.push('/admin')} className="text-blue-600 hover:underline inline-flex items-center">
                <FaArrowLeft className="mr-2" /> Back to Admin
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Edit Collection</h1>
            </div>
            <div>
              {saving && <span className="text-sm text-gray-500">Saving...</span>}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                Paths
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'info' && (
              <div className="max-w-xl">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={infoForm.name}
                    onChange={(e) => setInfoForm({ ...infoForm, name: e.target.value })}
                    className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    rows={4}
                    value={infoForm.description}
                    onChange={(e) => setInfoForm({ ...infoForm, description: e.target.value })}
                    className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={async () => {
                      if (!collection) return;
                      setInfoSaving(true);
                      try {
                        const res = await fetch(`/api/admin/collections/${collection._id}`, {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ name: infoForm.name, description: infoForm.description })
                        });
                        if (res.ok) await fetchCollection();
                      } finally {
                        setInfoSaving(false);
                      }
                    }}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <FaSave className="mr-2 h-4 w-4" /> {infoSaving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'paths' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white border rounded-lg p-6">
                  <h2 className="text-lg font-medium mb-4">Paths in Collection</h2>
                  <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="paths-droppable">
                      {(provided) => (
                        <ul className="divide-y" ref={provided.innerRef} {...provided.droppableProps}>
                          {orderedPaths.map((p, index) => (
                            <Draggable key={p._id} draggableId={p._id} index={index}>
                              {(dragProvided) => (
                                <li
                                  className="py-3 flex items-center justify-between"
                                  ref={dragProvided.innerRef}
                                  {...dragProvided.draggableProps}
                                >
                                  <div className="flex items-center gap-3">
                                    <span className="cursor-grab" {...dragProvided.dragHandleProps}>
                                      <FaGripVertical className="text-gray-400" />
                                    </span>
                                    <div>
                                      <div className="font-medium">{p.name}</div>
                                      <div className="text-sm text-gray-500">{p.slug}</div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <button onClick={() => removePath(p._id)} className="px-2 py-1 text-sm border rounded text-red-600">Remove</button>
                                  </div>
                                </li>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </ul>
                      )}
                    </Droppable>
                  </DragDropContext>
                </div>

                <div className="bg-white border rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-medium">Add Paths</h2>
                    <StateFilter
                      states={PATH_STATES}
                      selectedStates={selectedPathStates}
                      onStatesChange={setSelectedPathStates}
                    />
                  </div>
                  {filteredAvailablePaths.length === 0 ? (
                    <p className="text-sm text-gray-500">No more paths to add.</p>
                  ) : (
                    <ul className="divide-y">
                      {filteredAvailablePaths.map((p) => (
                        <li key={p._id} className="py-3 flex items-center justify-between">
                          <div>
                            <div className="font-medium">{p.name}</div>
                            <div className="text-sm text-gray-500">{p.slug}</div>
                          </div>
                          <button onClick={() => addPath(p._id)} className="inline-flex items-center px-3 py-1.5 border rounded bg-blue-600 text-white text-sm">
                            <FaPlus className="mr-2" /> Add
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminCollectionEditorPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div><p className="mt-4 text-gray-600">Loading collection editor...</p></div></div>}>
      <AdminCollectionEditorInner />
    </Suspense>
  );
}

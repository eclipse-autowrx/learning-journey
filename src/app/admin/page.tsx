'use client';

import { useState, useEffect } from 'react';
import { FaPlus, FaTrash, FaUserShield, FaCheckCircle } from 'react-icons/fa';
import { COLLECTION_STATES, PATH_STATES, COURSE_STATES } from '@/lib/const';

interface Content {
  _id: string;
  name: string;
  state: string;
  created_at: string;
  owner_id?: string;
  paths?: Path[];
}

interface Path {
  _id: string;
  name: string;
  state: string;
  courses?: Course[];
}

interface Course {
  _id: string;
  name: string;
  state: string;
  owner_id?: string;
}

interface Admin {
  _id: string;
  user_id: string;
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'collections' | 'admins'>('collections');
  const [collections, setCollections] = useState<Content[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<Content | null>(null);
  const [selectedPath, setSelectedPath] = useState<Path | null>(null);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [newAdminId, setNewAdminId] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (activeTab === 'collections') {
      fetchCollections();
    } else {
      fetchAdmins();
    }
  }, [activeTab]);

  const fetchCollections = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/collections');
      const data = await res.json();
      if (data.success) {
        setCollections(data.data);
        if (selectedCollection) {
          const updatedSelectedCollection = data.data.find(
            (c: Content) => c._id === selectedCollection._id
          );
          if (updatedSelectedCollection) {
            setSelectedCollection(updatedSelectedCollection);
            if (selectedPath) {
              const updatedSelectedPath = updatedSelectedCollection.paths?.find(
                (p: Path) => p._id === selectedPath._id
              );
              setSelectedPath(updatedSelectedPath || null);
            }
          } else {
            setSelectedCollection(null);
            setSelectedPath(null);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching collections:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/admins');
      const data = await res.json();
      if (data.success) {
        setAdmins(data.data);
      }
    } catch (error) {
      console.error('Error fetching admins:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/admins', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: newAdminId }),
      });
      if (res.ok) {
        setNewAdminId('');
        fetchAdmins();
      }
    } catch (error) {
      console.error('Error adding admin:', error);
    }
  };

  const handleDeleteAdmin = async (id: string) => {
    try {
      await fetch(`/api/admin/admins/${id}`, {
        method: 'DELETE',
      });
      fetchAdmins();
    } catch (error) {
      console.error('Error deleting admin:', error);
    }
  };

  const handleStateChange = async (id: string, state: string) => {
    try {
      await fetch(`/api/admin/collections/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ state }),
      });
      fetchCollections();
    } catch (error) {
      console.error('Error updating collection state:', error);
    }
  };

  const handlePathStateChange = async (id: string, state: string) => {
    try {
      await fetch(`/api/admin/paths/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ state }),
      });
      fetchCollections();
    } catch (error) {
      console.error('Error updating path state:', error);
    }
  };

  const handleCourseStateChange = async (id: string, state: string) => {
    try {
      await fetch(`/api/admin/courses/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ state }),
      });
      fetchCollections();
    } catch (error) {
      console.error('Error updating course state:', error);
    }
  };

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
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                Collections
              </button>
              <button
                onClick={() => setActiveTab('admins')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'admins'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Admin Users
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'collections' && (
              <div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Active</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">State</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {collections.map((collection) => (
                        <tr key={collection._id} onClick={() => setSelectedCollection(collection)} className={`cursor-pointer hover:bg-gray-50 ${selectedCollection?._id === collection._id ? 'bg-blue-50' : ''}`}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {selectedCollection?._id === collection._id && (
                              <FaCheckCircle className="text-green-500" />
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">{collection.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{collection.owner_id}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <select
                              value={collection.state}
                              onChange={(e) => {
                                e.stopPropagation();
                                handleStateChange(collection._id, e.target.value);
                              }}
                              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            >
                              {COLLECTION_STATES.map((state) => (
                                <option key={state.value} value={state.value}>
                                  {state.label}
                                </option>
                              ))}
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {selectedCollection && (
                  <div className="mt-8 overflow-x-auto">
                    <h4 className="text-md font-medium text-gray-800 mb-4">Paths in {selectedCollection.name}</h4>
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Active</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">State</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {selectedCollection.paths?.map((path) => (
                          <tr key={path._id} onClick={() => setSelectedPath(path)} className={`cursor-pointer hover:bg-gray-50 ${selectedPath?._id === path._id ? 'bg-blue-50' : ''}`}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {selectedPath?._id === path._id && (
                                <FaCheckCircle className="text-green-500" />
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">{path.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <select
                                value={path.state}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  handlePathStateChange(path._id, e.target.value);
                                }}
                                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                              >
                                {PATH_STATES.map((state) => (
                                  <option key={state.value} value={state.value}>
                                    {state.label}
                                  </option>
                                ))}
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {selectedPath && (
                      <div className="mt-8 overflow-x-auto">
                        <h4 className="text-md font-medium text-gray-800 mb-4">Courses in {selectedPath.name}</h4>
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner ID</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">State</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {selectedPath.courses?.map((course) => (
                              <tr key={course._id}>
                                <td className="px-6 py-4 whitespace-nowrap">{course.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{course.owner_id}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <select
                                    value={course.state}
                                    onChange={(e) => handleCourseStateChange(course._id, e.target.value)}
                                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                  >
                                    {COURSE_STATES.map((state) => (
                                      <option key={state.value} value={state.value}>
                                        {state.label}
                                      </option>
                                    ))}
                                  </select>
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
            )}
            {activeTab === 'admins' && (
              <div>
                <form onSubmit={handleAddAdmin} className="mb-6 flex gap-4">
                  <input
                    type="text"
                    value={newAdminId}
                    onChange={(e) => setNewAdminId(e.target.value)}
                    placeholder="Enter User ID to make admin"
                    className="flex-grow border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    type="submit"
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <FaPlus className="mr-2 h-4 w-4" />
                    Add Admin
                  </button>
                </form>
                <ul>
                  {admins.map((admin) => (
                    <li key={admin._id} className="flex items-center justify-between py-2 border-b">
                      <span>{admin.user_id}</span>
                      <button
                        onClick={() => handleDeleteAdmin(admin._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <FaTrash />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

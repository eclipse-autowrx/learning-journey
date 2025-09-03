'use client';

import { useState, useEffect } from 'react';
import { FaPlus, FaSave, FaTrash } from 'react-icons/fa';
import Editor from '@monaco-editor/react';

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

interface SettingsTabProps {
  hasManageUsers: boolean;
}

export default function SettingsTab({ hasManageUsers }: SettingsTabProps) {
  // System Settings state
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [selectedSetting, setSelectedSetting] = useState<SystemSetting | null>(null);
  const [editorValue, setEditorValue] = useState<string>('');
  const [originalValue, setOriginalValue] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [includeSecrets, setIncludeSecrets] = useState(false);
  
  // Add Setting modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSetting, setNewSetting] = useState({
    key: '',
    value: '',
    secret: false,
    description: '',
    category: 'general'
  });
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (!hasManageUsers) return;
    fetchSettings();
  }, [hasManageUsers, includeSecrets]);

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

  const handleSettingSelect = (setting: SystemSetting) => {
    setSelectedSetting(setting);
    const valueString = typeof setting.value === 'string'
      ? setting.value
      : JSON.stringify(setting.value, null, 2);
    setEditorValue(valueString);
    setOriginalValue(valueString);
  };

  const handleSave = async () => {
    if (!selectedSetting) return;

    setIsSaving(true);
    try {
      let parsedValue;
      try {
        parsedValue = JSON.parse(editorValue);
      } catch {
        parsedValue = editorValue;
      }

      const response = await fetch(`/api/admin/settings/${selectedSetting.key}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          value: parsedValue
        }),
      });

      if (response.ok) {
        // Update the local state
        const updatedSettings = settings.map(setting =>
          setting._id === selectedSetting._id
            ? { ...setting, value: parsedValue, updated_at: new Date().toISOString() }
            : setting
        );
        setSettings(updatedSettings);
        setSelectedSetting({ ...selectedSetting, value: parsedValue });
        // Update original value to match the saved value
        setOriginalValue(editorValue);
      } else {
        const error = await response.json();
        console.error('Error saving setting:', error);
      }
    } catch (error) {
      console.error('Error saving setting:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSetting = async (setting: SystemSetting) => {
    if (!confirm(`Are you sure you want to delete the setting "${setting.key}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/settings/${setting.key}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        const updatedSettings = settings.filter(s => s._id !== setting._id);
        setSettings(updatedSettings);
        if (selectedSetting && selectedSetting._id === setting._id) {
          setSelectedSetting(null);
          setEditorValue('');
          setOriginalValue('');
        }
      } else {
        const error = await response.json();
        console.error('Error deleting setting:', error);
      }
    } catch (error) {
      console.error('Error deleting setting:', error);
    }
  };

  // Check if content has changed
  const hasContentChanged = () => {
    return selectedSetting && editorValue !== originalValue;
  };

  // Handle creating new setting
  const handleCreateSetting = async () => {
    if (!newSetting.key.trim()) {
      alert('Please enter a key for the setting');
      return;
    }

    setIsCreating(true);
    try {
      let parsedValue;
      try {
        parsedValue = JSON.parse(newSetting.value);
      } catch {
        parsedValue = newSetting.value;
      }

      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          key: newSetting.key.trim(),
          value: parsedValue,
          secret: newSetting.secret,
          description: newSetting.description.trim(),
          category: newSetting.category.trim()
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Add the new setting to the list
        setSettings([...settings, data.data]);
        // Select the new setting
        handleSettingSelect(data.data);
        // Close modal and reset form
        setShowAddModal(false);
        setNewSetting({
          key: '',
          value: '',
          secret: false,
          description: '',
          category: 'general'
        });
      } else {
        const error = await response.json();
        alert(`Error creating setting: ${error.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error creating setting:', error);
      alert('Error creating setting');
    } finally {
      setIsCreating(false);
    }
  };

  // Reset form when modal closes
  const handleCloseModal = () => {
    setShowAddModal(false);
    setNewSetting({
      key: '',
      value: '',
      secret: false,
      description: '',
      category: 'general'
    });
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={includeSecrets}
              onChange={(e) => setIncludeSecrets(e.target.checked)}
              className="h-4 w-4 rounded"
              
            />
            <span className="ml-2 text-sm text-neutral-500">Include secret settings</span>
          </label>
        </div>
      </div>

      {/* Split Layout */}
      <div className="flex-1 flex gap-4 min-h-0">
        {/* Left Side - Settings List (1/3) */}
        <div className="w-1/3 shadow rounded-lg overflow-hidden bg-neutral-50">
          <div className="p-4 border-b border-neutral-200 flex justify-between items-center" >
            <h3 className="text-lg font-medium text-neutral-900">Settings</h3>
                         <button
               onClick={() => setShowAddModal(true)}
               className="inline-flex items-center px-4 py-2 text-sm font-bold text-primary-500 cursor-pointer hover:opacity-80"
             >
               <FaPlus className="mr-2 h-4 w-4" />
               Add Setting
             </button>
          </div>
          <div className="overflow-y-auto max-h-96">
            {settings.length === 0 ? (
              <div className="p-4 text-center text-neutral-500">
                No settings found
              </div>
            ) : (
              <ul className="border-neutral-200">
                {settings.map((setting) => (
                  <li key={setting._id} className="border-b border-neutral-200">
                    <div
                      className={`flex items-center ${selectedSetting?._id === setting._id ? 'bg-primary-50 border-l-4 border-primary-200' : ''}`}
                    >
                      <div
                        onClick={() => handleSettingSelect(setting)}
                        className="flex-1 px-4 py-2 text-left cursor-pointer hover:opacity-80"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center">
                            <p className="text-sm font-medium truncate text-neutral-900">
                              {setting.key}
                            </p>
                            {setting.secret && (
                              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-accent-200 text-accent-700 dark:bg-accent-700 dark:text-accent-200">
                                Secret
                              </span>
                            )}
                          </div>
                          <p className="text-xs truncate mt-0 text-neutral-500">
                            {setting.description || 'No description'}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteSetting(setting)}
                        className="px-3 py-3 text-sm hover:opacity-80 text-neutral-500"
                        title="Delete setting"
                      >
                        <FaTrash className="h-4 w-4" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Right Side - Value Editor (2/3) */}
        <div className="w-2/3 shadow rounded-lg overflow-hidden bg-neutral-50">
          {selectedSetting ? (
            <>
              <div className="p-4 border-b border-neutral-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-neutral-900">{selectedSetting.key}</h3>
                    <p className="text-sm mt-1 text-neutral-500">
                      {selectedSetting.description || 'No description'}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-neutral-500">
                      <span>Category: {selectedSetting.category}</span>
                      <span>•</span>
                      <span>Updated: {new Date(selectedSetting.updated_at).toLocaleDateString()}</span>
                      {selectedSetting.secret && (
                        <>
                          <span>•</span>
                          <span className="text-neutral-500">Secret</span>
                        </>
                      )}
                    </div>
                  </div>
                  {hasContentChanged() && (
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="inline-flex items-center px-4 py-2 border border-transparent 
                      rounded-md shadow-sm text-sm font-medium disabled:opacity-50 bg-primary-500 text-white"
                    >
                      <FaSave className="mr-2 h-4 w-4" />
                      {isSaving ? 'Saving...' : 'Save'}
                    </button>
                  )}
                </div>
              </div>
              <div className="flex-1 h-96">
                <Editor
                  height="100%"
                  defaultLanguage="json"
                  value={editorValue}
                  onChange={(value) => setEditorValue(value || '')}
                  options={{
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    fontSize: 14,
                    lineNumbers: 'on',
                    wordWrap: 'on',
                    automaticLayout: true,
                  }}
                />
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-96 text-neutral-500">
              <div className="text-center">
                <p className="text-lg font-medium">Select a setting to edit</p>
                <p className="text-sm mt-2">Choose a setting from the list to view and edit its value</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Setting Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Setting</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Key *
                  </label>
                  <input
                    type="text"
                    value={newSetting.key}
                    onChange={(e) => setNewSetting({...newSetting, key: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., app_name, api_url"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Value *
                  </label>
                  <textarea
                    value={newSetting.value}
                    onChange={(e) => setNewSetting({...newSetting, value: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder='e.g., "My App" or {"key": "value"}'
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    value={newSetting.description}
                    onChange={(e) => setNewSetting({...newSetting, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Brief description of this setting"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={newSetting.category}
                    onChange={(e) => setNewSetting({...newSetting, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="general">General</option>
                    <option value="ui">UI</option>
                    <option value="api">API</option>
                    <option value="security">Security</option>
                    <option value="feature">Feature</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="secret"
                    checked={newSetting.secret}
                    onChange={(e) => setNewSetting({...newSetting, secret: e.target.checked})}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="secret" className="ml-2 text-sm text-gray-700">
                    Secret setting (admin only)
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateSetting}
                  disabled={isCreating}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50"
                >
                  {isCreating ? 'Creating...' : 'Create Setting'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

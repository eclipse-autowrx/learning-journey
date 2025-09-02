'use client';

import { useState, useEffect } from 'react';
import { FaPlus } from 'react-icons/fa';

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

  const openCreateSetting = () => {
    setEditingSetting(null);
    setSettingsForm({
      key: '',
      value: '',
      secret: false,
      description: '',
      category: 'general'
    });
    setShowSettingsModal(true);
  };

  const openEditSetting = (setting: SystemSetting) => {
    setEditingSetting(setting);
    setSettingsForm({
      key: setting.key,
      value: typeof setting.value === 'string' ? setting.value : JSON.stringify(setting.value, null, 2),
      secret: setting.secret,
      description: setting.description || '',
      category: setting.category
    });
    setShowSettingsModal(true);
  };

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
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...settingsForm,
          value: parsedValue
        }),
      });

      if (response.ok) {
        setShowSettingsModal(false);
        setEditingSetting(null);
        fetchSettings();
      } else {
        const error = await response.json();
        console.error('Error saving setting:', error);
      }
    } catch (error) {
      console.error('Error saving setting:', error);
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
        fetchSettings();
      } else {
        const error = await response.json();
        console.error('Error deleting setting:', error);
      }
    } catch (error) {
      console.error('Error deleting setting:', error);
    }
  };

  const getValueDisplay = (value: any) => {
    if (typeof value === 'object') {
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={includeSecrets}
              onChange={(e) => setIncludeSecrets(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">Include secret settings</span>
          </label>
        </div>
        <button
          onClick={openCreateSetting}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          <FaPlus className="mr-2 h-4 w-4" />
          Add Setting
        </button>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {settings.map((setting) => (
            <li key={setting._id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <p className="text-sm font-medium text-blue-600 truncate">
                        {setting.key}
                      </p>
                      {setting.secret && (
                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Secret
                        </span>
                      )}
                    </div>
                    <div className="mt-1">
                      <p className="text-sm text-gray-500">{setting.description}</p>
                    </div>
                    <div className="mt-2">
                      <p className="text-sm text-gray-900 font-mono bg-gray-100 p-2 rounded">
                        {getValueDisplay(setting.value)}
                      </p>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500">
                      <span>Category: {setting.category}</span>
                      <span className="mx-2">•</span>
                      <span>Updated: {new Date(setting.updated_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => openEditSetting(setting)}
                      className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteSetting(setting)}
                      className="text-red-600 hover:text-red-900 text-sm font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingSetting ? 'Edit Setting' : 'Create Setting'}
              </h3>
              
              <form onSubmit={handleSettingsSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Key
                  </label>
                  <input
                    type="text"
                    required
                    value={settingsForm.key}
                    onChange={(e) => setSettingsForm({...settingsForm, key: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Setting key"
                    disabled={!!editingSetting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Value (JSON or string)
                  </label>
                  <textarea
                    required
                    value={settingsForm.value}
                    onChange={(e) => setSettingsForm({...settingsForm, value: e.target.value})}
                    rows={4}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder='{"key": "value"} or simple string'
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <input
                    type="text"
                    value={settingsForm.description}
                    onChange={(e) => setSettingsForm({...settingsForm, description: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Setting description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Category
                  </label>
                  <select
                    value={settingsForm.category}
                    onChange={(e) => setSettingsForm({...settingsForm, category: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="general">General</option>
                    <option value="ui">UI</option>
                    <option value="api">API</option>
                    <option value="security">Security</option>
                    <option value="performance">Performance</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settingsForm.secret}
                    onChange={(e) => setSettingsForm({...settingsForm, secret: e.target.checked})}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-700">
                    Secret setting (admin only)
                  </label>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowSettingsModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                  >
                    {editingSetting ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

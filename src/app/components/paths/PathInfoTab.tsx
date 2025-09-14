// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

'use client';

import { FaSave, FaTimes, FaEdit, FaArrowUp, FaArrowDown, FaEye } from 'react-icons/fa';
import Btn from '@/app/components/atom/Btn';
import TagEditor from '@/app/components/atom/TagEditor';
import ImageEditor from '@/app/components/atom/ImageEditor';
import { PATH_LEVELS } from '@/lib/const';

interface Path {
  _id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  state: string;
  image: string;
  thumb: string;
  valid_from: string;
  valid_to: string;
  configs: any;
  extends: any;
  hiddenContent: any;
  created_by?: string;
  time_to_complete?: number;
  level?: string;
  tags: string[];
  key_points?: { title: string; content: string }[];
}

interface EditForm {
  name: string;
  slug: string;
  description: string;
  image: string | null;
  background_img: string | null;
  thumb: string | null;
  category: string;
  state: string;
  created_by: string;
  time_to_complete: number;
  level: string;
  display_type: string;
  tags: string[];
  valid_from: string;
  valid_to: string;
  configs: {
    display_type: string;
  };
  key_points: { title: string; content: string }[];
}

interface PathInfoTabProps {
  path: Path;
  isEditing: boolean;
  editForm: EditForm;
  onEditFormChange: (form: EditForm) => void;
  onSave: () => void;
  onCancelEdit: () => void;
  onStartEdit: () => void;
  pathSlug: string;
}

export default function PathInfoTab({
  path,
  isEditing,
  editForm,
  onEditFormChange,
  onSave,
  onCancelEdit,
  onStartEdit,
  pathSlug
}: PathInfoTabProps) {
  const handleFieldChange = (field: keyof EditForm, value: any) => {
    onEditFormChange({ ...editForm, [field]: value });
  };

  const handleKeyPointChange = (index: number, field: 'title' | 'content', value: string) => {
    const newKeyPoints = [...(editForm.key_points || [])];
    newKeyPoints[index] = { ...newKeyPoints[index], [field]: value };
    onEditFormChange({ ...editForm, key_points: newKeyPoints });
  };

  const handleKeyPointMove = (index: number, direction: 'up' | 'down') => {
    const newKeyPoints = [...(editForm.key_points || [])];
    if (direction === 'up' && index > 0) {
      [newKeyPoints[index - 1], newKeyPoints[index]] = [newKeyPoints[index], newKeyPoints[index - 1]];
    } else if (direction === 'down' && index < newKeyPoints.length - 1) {
      [newKeyPoints[index + 1], newKeyPoints[index]] = [newKeyPoints[index], newKeyPoints[index + 1]];
    }
    onEditFormChange({ ...editForm, key_points: newKeyPoints });
  };

  const handleKeyPointDelete = (index: number) => {
    const newKeyPoints = (editForm.key_points || []).filter((_, i) => i !== index);
    onEditFormChange({ ...editForm, key_points: newKeyPoints });
  };

  const handleAddKeyPoint = () => {
    onEditFormChange({ 
      ...editForm, 
      key_points: [...(editForm.key_points || []), { title: '', content: '' }] 
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium text-neutral-900">Basic Information</h3>
        <div className="flex items-center space-x-3">
          {isEditing ? (
            <>
              <Btn onClick={onSave}>
                <FaSave className="mr-2 h-4 w-4" />
                Save
              </Btn>
              <Btn variant="outlined" onClick={onCancelEdit}>
                <FaTimes className="mr-2 h-4 w-4" />
                Cancel
              </Btn>
            </>
          ) : (
            <>
              <Btn 
                variant="outlined" 
                onClick={() => window.open(`/path/${pathSlug}`, '_blank')}
              >
                <FaEye className="mr-2 h-4 w-4" />
                Preview
              </Btn>
              <Btn onClick={onStartEdit}>
                <FaEdit className="mr-2 h-4 w-4" />
                Edit Path
              </Btn>
            </>
          )}
        </div>
      </div>
      
      <div className="flex gap-8">
        {/* Basic Information */}
        <div className="flex-1">
          <dl className="space-y-6">
            {/* Row 1: Name (with slug under) and Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <dt className="text-sm font-semibold text-neutral-900 mb-2">Name</dt>
                {isEditing ? (
                  <>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => handleFieldChange('name', e.target.value)}
                      className="block w-full border border-neutral-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                    <p className="mt-1 text-xs text-neutral-500">Slug: <span className="font-mono">{editForm.slug || path.slug}</span></p>
                  </>
                ) : (
                  <>
                    <dd className="text-sm text-neutral-900">{path.name}</dd>
                    <p className="mt-1 text-xs text-neutral-500">Slug: <span className="font-mono">{path.slug}</span></p>
                  </>
                )}
              </div>

              <div>
                <dt className="text-sm font-semibold text-neutral-900 mb-2">Category</dt>
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm.category}
                    onChange={(e) => handleFieldChange('category', e.target.value)}
                    className="block w-full border border-neutral-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                ) : (
                  <dd className="text-sm text-neutral-900">{path.category || '-'}</dd>
                )}
              </div>
            </div>

            {/* Row 2: Level and Time to Complete */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <dt className="text-sm font-semibold text-neutral-900 mb-2">Level</dt>
                {isEditing ? (
                  <select
                    value={editForm.level}
                    onChange={(e) => handleFieldChange('level', e.target.value)}
                    className="block w-full border border-neutral-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  >
                    {PATH_LEVELS.map((level) => (
                      <option key={level.value} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <dd className="text-sm text-neutral-900">
                    {PATH_LEVELS.find(l => l.value === (path.level || '1'))?.label || 'Level 1 - Beginner'}
                  </dd>
                )}
              </div>

              <div>
                <dt className="text-sm font-semibold text-neutral-900 mb-2">Time to complete (hours)</dt>
                {isEditing ? (
                  <input
                    type="number"
                    min={0}
                    step="0.5"
                    value={editForm.time_to_complete ?? 0}
                    onChange={(e) => handleFieldChange('time_to_complete', Number(e.target.value))}
                    className="block w-full border border-neutral-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="e.g. 2"
                  />
                ) : (
                  <dd className="text-sm text-neutral-700">{typeof path.time_to_complete === 'number' ? path.time_to_complete : 0}</dd>
                )}
              </div>
            </div>

            {/* Row 4: Valid From and Valid To */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <dt className="text-sm font-semibold text-neutral-900 mb-2">Valid From</dt>
                {isEditing ? (
                  <input
                    type="date"
                    value={editForm.valid_from}
                    onChange={(e) => handleFieldChange('valid_from', e.target.value)}
                    className="block w-full border border-neutral-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                ) : (
                  <dd className="text-sm text-neutral-700">
                    {path.valid_from ? new Date(path.valid_from).toLocaleDateString() : '-'}
                  </dd>
                )}
              </div>

              <div>
                <dt className="text-sm font-semibold text-neutral-900 mb-2">Valid To</dt>
                {isEditing ? (
                  <input
                    type="date"
                    value={editForm.valid_to}
                    onChange={(e) => handleFieldChange('valid_to', e.target.value)}
                    className="block w-full border border-neutral-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                ) : (
                  <dd className="text-sm text-neutral-700">
                    {path.valid_to ? new Date(path.valid_to).toLocaleDateString() : '-'}
                  </dd>
                )}
              </div>
            </div>

            {/* Row 3: Display Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <dt className="text-sm font-semibold text-neutral-900 mb-2">Display Type</dt>
                {isEditing ? (
                  <select
                    value={editForm.configs?.display_type || 'list'}
                    onChange={(e) => {
                      const value = e.target.value as 'list' | 'canvas';
                      handleFieldChange('display_type', value);
                      handleFieldChange('configs', { ...editForm.configs, display_type: value });
                    }}
                    className="block w-full border border-neutral-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="list">List</option>
                    <option value="canvas">Canvas</option>
                  </select>
                ) : (
                  <dd className="text-sm text-neutral-700 capitalize">{(path.configs?.display_type || 'list')}</dd>
                )}
              </div>
              <div>
                {/* Empty div to maintain grid layout */}
              </div>
            </div>

            <div>
              <dt className="text-sm font-semibold text-neutral-900 mb-2">Description</dt>
              {isEditing ? (
                <textarea
                  value={editForm.description}
                  onChange={(e) => handleFieldChange('description', e.target.value)}
                  rows={4}
                  className="block w-full border border-neutral-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              ) : (
                <dd className="text-sm text-neutral-700">{path.description}</dd>
              )}
            </div>

            {/* Row: Key Points Editor */}
            <div>
              <dt className="text-sm font-semibold text-neutral-900 mb-2">Key Points</dt>
              {isEditing ? (
                <div className="space-y-3">
                  {(editForm.key_points || []).map((kp, idx) => (
                    <div key={idx} className="border rounded-md p-3 bg-neutral-50">
                      <div className="flex items-center gap-2 mb-2">
                        <input
                          type="text"
                          value={kp.title}
                          onChange={(e) => handleKeyPointChange(idx, 'title', e.target.value)}
                          placeholder="Title"
                          className="flex-1 border border-neutral-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        />
                        <div className="flex flex-col">
                          <button
                            type="button"
                            onClick={() => handleKeyPointMove(idx, 'up')}
                            disabled={idx === 0}
                            className="p-1 text-neutral-600 hover:text-black disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Move up"
                          >
                            <FaArrowUp />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleKeyPointMove(idx, 'down')}
                            disabled={idx >= (editForm.key_points || []).length - 1}
                            className="p-1 text-neutral-600 hover:text-black disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Move down"
                          >
                            <FaArrowDown />
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleKeyPointDelete(idx)}
                          className="px-2 py-1 text-sm text-white bg-red-500 rounded hover:bg-red-600"
                        >
                          Delete
                        </button>
                      </div>
                      <textarea
                        value={kp.content}
                        onChange={(e) => handleKeyPointChange(idx, 'content', e.target.value)}
                        rows={3}
                        placeholder="Content"
                        className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={handleAddKeyPoint}
                    className="px-3 py-2 text-sm text-white bg-primary-600 rounded hover:bg-primary-700"
                  >
                    Add Key Point
                  </button>
                </div>
              ) : (
                <dd className="space-y-2 text-neutral-700">
                  {(path.key_points || []).map((kp, idx) => (
                    <div key={idx}>
                      <div className="text-sm font-semibold text-neutral-800">{kp.title}</div>
                      <div className="text-sm text-neutral-700">{kp.content}</div>
                    </div>
                  ))}
                  {(path.key_points || []).length === 0 && (
                    <span className="text-sm text-neutral-500">No key points</span>
                  )}
                </dd>
              )}
            </div>

            {/* Row: Provider (stored in created_by) */}
            <div>
              <dt className="text-sm font-semibold text-neutral-900 mb-2">Provider</dt>
              {isEditing ? (
                <input
                  type="text"
                  value={editForm.created_by || ''}
                  onChange={(e) => handleFieldChange('created_by', e.target.value)}
                  className="block w-full border border-neutral-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Provider organization name"
                />
              ) : (
                <dd className="text-sm text-neutral-700">{path.created_by || '-'}</dd>
              )}
            </div>

            <div>
              <dt className="text-sm font-medium text-neutral-700 mb-2">Tags</dt>
              {isEditing ? (
                <TagEditor
                  tags={editForm.tags}
                  onChange={(newTags) => handleFieldChange('tags', newTags)}
                  placeholder="Type and press Enter to add tags..."
                />
              ) : (
                <dd className="flex flex-wrap gap-2">
                  {path.tags && path.tags.length > 0 ? (
                    path.tags.map((tag, index) => (
                      <span key={index} className="inline-flex px-2 py-1 text-xs font-medium bg-primary-100 text-primary-800 rounded-full">
                        {tag}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-neutral-500">No tags</span>
                  )}
                </dd>
              )}
            </div>

            {/* Configuration Details */}
            {path.configs && Object.keys(path.configs).filter(key => key !== 'display_type').length > 0 && (
              <>
                <div className="pt-4 border-t border-neutral-200">
                  <dt className="text-sm font-medium text-neutral-500 mb-2">Configs</dt>
                  <dd className="mt-1 space-y-2">
                    {Object.entries(path.configs)
                      .filter(([key]) => key !== 'display_type')
                      .map(([key, value]) => (
                        <div key={key} className="flex items-center">
                          <span className="text-sm font-semibold text-neutral-700 w-32 flex-shrink-0 border-r border-neutral-200 pr-3">{key}:</span>
                          <span className="text-sm text-neutral-900 ml-3">{String(value)}</span>
                        </div>
                    ))}
                  </dd>
                </div>
              </>
            )}
            
            {path.extends && Object.keys(path.extends).length > 0 && (
              <>
                <div className="pt-4 border-t border-neutral-200">
                  <dt className="text-sm font-medium text-neutral-500 mb-2">Extends</dt>
                  <dd className="mt-1 space-y-2">
                    {Object.entries(path.extends).map(([key, value]) => (
                      <div key={key} className="flex items-center">
                        <span className="text-sm font-semibold text-neutral-700 w-32 flex-shrink-0 border-r border-neutral-200 pr-3">{key}:</span>
                        <span className="text-sm text-neutral-900 ml-3">{String(value)}</span>
                      </div>
                    ))}
                  </dd>
                </div>
              </>
            )}
            
            {path.hiddenContent && Object.keys(path.hiddenContent).length > 0 && (
              <>
                <div className="pt-4 border-t border-neutral-200">
                  <dt className="text-sm font-medium text-neutral-500 mb-2">Hidden Content</dt>
                  <dd className="mt-1 space-y-2">
                    {Object.entries(path.hiddenContent).map(([key, value]) => (
                      <div key={key} className="flex items-center">
                        <span className="text-sm font-semibold text-neutral-700 w-32 flex-shrink-0 border-r border-neutral-200 pr-3">{key}:</span>
                        <span className="text-sm text-neutral-900 ml-3">{String(value)}</span>
                      </div>
                    ))}
                  </dd>
                </div>
              </>
            )}
          </dl>
        </div>
        <div className="w-[300px] flex-shrink-0 space-y-6">
          <ImageEditor 
            label="Image"
            imageUrl={editForm.image}
            onImageUrlChange={(url) => handleFieldChange('image', url)}
            onUploadComplete={async (url) => {
              try {
                const resp = await fetch(`/api/creator/paths/${pathSlug}`, { 
                  method: 'PUT', 
                  headers: { 'Content-Type': 'application/json' }, 
                  body: JSON.stringify({ image: url }) 
                });
                if (!resp.ok) throw new Error((await resp.json()).error || 'Failed to save image');
              } catch (e) { throw e; }
            }}
            allowDelete={false}
            mode="avatar"
          />
        </div>
      </div>
    </div>
  );
}

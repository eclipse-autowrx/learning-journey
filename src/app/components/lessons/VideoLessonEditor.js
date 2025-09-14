// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

'use client'
import Editor from '@monaco-editor/react';

export default function VideoLessonEditor({ value, onChange }) {
  const v = value || {}
  const update = (patch) => onChange && onChange({ ...v, ...patch })
  const minutes = Math.max(0, Math.floor((v.video_duration || 0) / 60))
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Video URL</label>
        <input
          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
          value={v.video_url || ''}
          onChange={(e) => update({ video_url: e.target.value })}
        />
      </div>
      <div className="flex flex-row gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Provider</label>
          <input
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            value={v.video_provider || ''}
            onChange={(e) => update({ video_provider: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Duration (minutes)</label>
          <input
            type="number"
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            value={minutes}
            min={0}
            onChange={(e) => update({ video_duration: Number(e.target.value) * 60 })}
          />
        </div>
      </div>
     
      <label className="mt-4 block text-sm font-medium text-gray-700">Description</label>
      <div className="border pt-1 border-neutral-300 rounded-md overflow-hidden">
        <Editor
          height="280px"
          language="markdown"
          value={v.markdown_content || ''}
          onChange={(value) => update({ markdown_content: value || '' })}
          options={{
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            fontSize: 14,
            wordWrap: 'on',
          }}
        />
      </div>
    </div>
  )
}



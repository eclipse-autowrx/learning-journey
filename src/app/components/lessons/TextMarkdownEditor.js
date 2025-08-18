// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT
'use client';

import { useState, useEffect } from "react";
import Editor from '@monaco-editor/react';

const TextMarkdownEditor = ({ value, onChange }) => {
  const [markdown, setMarkdown] = useState('');

  useEffect(() => {
    setMarkdown(value?.markdown_content || '');
  }, [value]);

  const update = (newValue) => {
    setMarkdown(newValue);
    onChange({ markdown_content: newValue });
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">Markdown Content</label>
      <div className="border border-gray-300 rounded-md overflow-hidden">
        <Editor
          height="400px"
          language="markdown"
          value={markdown}
          onChange={(value) => update(value || '')}
          options={{
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            fontSize: 14,
            wordWrap: 'on',
          }}
        />
      </div>
    </div>
  );
};

export default TextMarkdownEditor;

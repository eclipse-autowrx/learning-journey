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
import { showToast } from '@/lib/utils/notifications';

const TextMarkdownEditor = ({ value, onChange }) => {
  const [markdown, setMarkdown] = useState('');
  const [isLocalizing, setIsLocalizing] = useState(false);

  useEffect(() => {
    setMarkdown(value?.markdown_content || '');
  }, [value]);

  const update = (newValue) => {
    setMarkdown(newValue);
    onChange({ markdown_content: newValue });
  };

  const handleLocalizeImages = async () => {
    setIsLocalizing(true);
    showToast.info('Finding and localizing external images...');

    const imageUrlRegex = /!\[.*?\]\((https?:\/\/[^\s)]+)\)/g;
    const externalImageUrls = [];
    let match;
    while ((match = imageUrlRegex.exec(markdown)) !== null) {
      if (!match[1].startsWith(window.location.origin)) {
        externalImageUrls.push(match[1]);
      }
    }

    if (externalImageUrls.length === 0) {
      showToast.success('No external images found to localize.');
      setIsLocalizing(false);
      return;
    }

    try {
      const response = await fetch('/api/medias/localize_images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageUrls: externalImageUrls }),
      });

      if (!response.ok) {
        throw new Error('Failed to localize images');
      }

      const { results } = await response.json();
      let updatedMarkdown = markdown;
      let successfulCount = 0;
      results.forEach(result => {
        if (result.newUrl) {
          updatedMarkdown = updatedMarkdown.replace(result.originalUrl, result.newUrl);
          successfulCount++;
        }
      });

      update(updatedMarkdown);
      showToast.success(`${successfulCount} image(s) localized successfully.`);
    } catch (error) {
      console.error('Error localizing images:', error);
      showToast.error('An error occurred while localizing images.');
    } finally {
      setIsLocalizing(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="block text-sm font-medium text-gray-700">Markdown Content</label>
        <button
          onClick={handleLocalizeImages}
          disabled={isLocalizing}
          className="px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
        >
          {isLocalizing ? 'Localizing...' : 'Localize Images'}
        </button>
      </div>
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

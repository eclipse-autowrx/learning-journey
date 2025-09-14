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
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [editorRef, setEditorRef] = useState(null);

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

  const handleDownloadMd = () => {
    const element = document.createElement('a');
    const file = new Blob([markdown], { type: 'text/markdown' });
    element.href = URL.createObjectURL(file);
    element.download = 'lesson-content.md';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    showToast.success('Markdown file downloaded successfully.');
  };

  const handleUploadMd = (event) => {
    const file = event.target.files[0];
    if (file && (file.type === 'text/markdown' || file.name.endsWith('.md'))) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
        update(content);
        showToast.success('Markdown file uploaded and content replaced.');
      };
      reader.readAsText(file);
    } else {
      showToast.error('Please select a valid .md file.');
    }
    event.target.value = '';
  };

  const handleUploadImage = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showToast.error('Please select a valid image file.');
      event.target.value = '';
      return;
    }

    setIsUploadingImage(true);
    showToast.info('Uploading image...');

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/medias/upload_image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const { url } = await response.json();
      
      // Get cursor position from Monaco editor
      let insertPosition = markdown.length;
      if (editorRef) {
        const position = editorRef.getPosition();
        if (position) {
          insertPosition = editorRef.getModel().getOffsetAt(position);
        }
      }

      // Create markdown image syntax
      const imageMarkdown = `![${file.name}](${url})`;
      
      // Insert image at cursor position or at the end
      const beforeCursor = markdown.substring(0, insertPosition);
      const afterCursor = markdown.substring(insertPosition);
      const newMarkdown = beforeCursor + imageMarkdown + (afterCursor ? '\n' + afterCursor : '');
      
      update(newMarkdown);
      showToast.success('Image uploaded and inserted successfully.');
    } catch (error) {
      console.error('Error uploading image:', error);
      showToast.error('An error occurred while uploading the image.');
    } finally {
      setIsUploadingImage(false);
      event.target.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="block text-sm font-medium text-neutral-700">Markdown Content</label>
        <div className="flex gap-2">
          <button
            onClick={handleDownloadMd}
            className="inline-flex items-center px-4 py-1 border border-neutral-500 rounded-md cursor-pointer text-sm
              font-medium text-neutral-700 bg-white hover:bg-neutral-50"
          >
            Download .md
          </button>
          <label className="inline-flex items-center px-4 py-1 border border-neutral-500 rounded-md cursor-pointer text-sm
              font-medium text-neutral-700 bg-white hover:bg-neutral-50">
            Upload .md
            <input
              type="file"
              accept=".md"
              onChange={handleUploadMd}
              className="hidden"
            />
          </label>
          <label className="inline-flex items-center px-4 py-1 border border-neutral-500 rounded-md cursor-pointer text-sm
              font-medium text-neutral-700 bg-white hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed">
            {isUploadingImage ? 'Uploading...' : 'Upload Image'}
            <input
              type="file"
              accept="image/*"
              onChange={handleUploadImage}
              disabled={isUploadingImage}
              className="hidden"
            />
          </label>
          <button
            onClick={handleLocalizeImages}
            disabled={isLocalizing}
            className="inline-flex items-center px-4 py-1 border border-neutral-500 rounded-md cursor-pointer text-sm
              font-medium text-neutral-700 bg-white hover:bg-neutral-50"
          >
            {isLocalizing ? 'Localizing...' : 'Localize Images'}
          </button>
        </div>
      </div>
      <div className="border border-neutral-300 rounded-md overflow-hidden">
        <Editor
          height="400px"
          language="markdown"
          value={markdown}
          onChange={(value) => update(value || '')}
          onMount={(editor) => setEditorRef(editor)}
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

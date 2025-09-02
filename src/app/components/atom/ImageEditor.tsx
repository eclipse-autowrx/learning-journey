// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

'use client';

import { useState, useRef } from 'react';
import { FaUpload, FaTrash, FaSpinner } from 'react-icons/fa';
import { showToast } from '@/lib/utils/notifications';

interface ImageEditorProps {
  label: string;
  imageUrl: string | null;
  onImageUrlChange: (url: string | null) => void;
  allowDelete?: boolean;
  mode?: 'avatar' | 'landscape' | 'cover';
  onUploadComplete?: (url: string) => Promise<void> | void;
}

export default function ImageEditor({ label, imageUrl, onImageUrlChange, allowDelete = false, mode = 'avatar', onUploadComplete }: ImageEditorProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/medias/upload_image', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        onImageUrlChange(data.url);
        try {
          if (onUploadComplete) {
            await onUploadComplete(data.url);
          }
          showToast.success('Image uploaded successfully');
        } catch (e: any) {
          showToast.error(e?.message || 'Failed to save image');
        }
      } else {
        throw new Error(data.error || 'Failed to upload image');
      }
    } catch (error: any) {
      showToast.error(error.message || 'An unexpected error occurred');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    onImageUrlChange(null);
  };

  const modeStyles = {
    avatar: {
      image: 'w-full aspect-square',
      svg: 'h-12 w-12',
    },
    landscape: {
      image: 'w-full h-64',
      svg: 'h-16 w-16',
    },
    cover: {
      image: 'w-full aspect-[16/9]',
      svg: 'h-16 w-16',
    }
  };

  const styles = modeStyles[mode];

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className={`mt-1 flex justify-center p-2 border-2 border-gray-300 border-dashed rounded-md`}>
        <div className="space-y-0 text-center flex flex-col justify-center items-center w-full h-full">
          {imageUrl ? (
            <div className={`relative flex justify-center items-center w-full h-full`}>
              <img src={imageUrl} alt="Preview" 
                  className={`rounded-md object-contain max-w-full max-h-full ${styles.image}`} />
              {allowDelete && (
                <button
                  onClick={handleRemoveImage}
                  className="absolute top-1 right-1 cursor-pointer bg-[#88888844] hover:bg-[#88888866] p-2 rounded-full"
                  title="Remove Image"
                >
                  <FaTrash className="h-3 w-3 text-red-600" />
                </button>
              )}
            </div>
          ) : (
            <svg className={`text-gray-400 ${styles.svg}`} stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}

          <div className="flex text-sm text-neutral-600 justify-center items-center mt-2">
            <label htmlFor={`file-upload-${label}`} className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-700 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500">
              <span>{imageUrl ? 'Change image' : 'Upload an image'}</span>
              <input ref={fileInputRef} id={`file-upload-${label}`} name="file-upload" type="file" className="sr-only" onChange={handleImageUpload} accept="image/*" />
            </label>
            {isUploading && <FaSpinner className="animate-spin ml-2" />}
          </div>
          {!imageUrl && <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>}
        </div>
      </div>
    </div>
  );
}

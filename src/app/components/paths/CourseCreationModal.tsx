// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

'use client';

import Btn from '@/app/components/atom/Btn';

interface CourseForm {
  name: string;
  description: string;
  state: string;
}

interface CourseCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseForm: CourseForm;
  onCourseFormChange: (form: CourseForm) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function CourseCreationModal({
  isOpen,
  onClose,
  courseForm,
  onCourseFormChange,
  onSubmit
}: CourseCreationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-neutral-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-neutral-900 mb-4">
            Add Course to Path
          </h3>
          
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700">
                Name *
              </label>
              <input
                type="text"
                required
                value={courseForm.name}
                onChange={(e) => onCourseFormChange({...courseForm, name: e.target.value})}
                className="mt-1 block w-full border border-neutral-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="Course name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700">
                Description
              </label>
              <textarea
                value={courseForm.description}
                onChange={(e) => onCourseFormChange({...courseForm, description: e.target.value})}
                rows={3}
                className="mt-1 block w-full border border-neutral-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="Course description"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Btn
                variant="outlined"
                onClick={onClose}
              >
                Cancel
              </Btn>
              <Btn
                type="submit"
              >
                Create Course
              </Btn>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

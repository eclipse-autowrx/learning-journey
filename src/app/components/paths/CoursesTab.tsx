// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

'use client';

import { FaPlus, FaGraduationCap, FaTrash } from 'react-icons/fa';
import StateFilter from '@/app/components/atom/StateFilter';
import CourseTable from './CourseTable';
import { COURSE_STATES } from '@/lib/const';

interface Course {
  _id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  state: string;
  total_lessons: number;
  duration: number;
  created_at: string;
}

interface CoursesTabProps {
  courses: Course[];
  selectedCourseStates: string[];
  onSelectedCourseStatesChange: (states: string[]) => void;
  onCreateCourse: () => void;
  selectedCourses: string[];
  onSelectedCoursesChange: (courses: string[]) => void;
  onToggleCourse: (id: string) => void;
  onSelectAllCourses: (checked: boolean) => void;
  onBulkStateChange: () => void;
  onBulkDelete: () => void;
  onClearSelection: () => void;
  onShowBulkActionModal: (type: 'state' | 'delete') => void;
  requiredCourseIds: string[];
  onRequiredCourseToggle: (courseId: string) => void;
  onDeleteCourse: (course: Course) => void;
  courseLessonCounts: Record<string, number>;
  pathSlug: string;
  openDropdown: string | null;
  onOpenDropdownChange: (id: string | null) => void;
  getGhostCourseIds: () => string[];
  onCleanupGhostCourses: () => void;
}

export default function CoursesTab({
  courses,
  selectedCourseStates,
  onSelectedCourseStatesChange,
  onCreateCourse,
  selectedCourses,
  onSelectedCoursesChange,
  onToggleCourse,
  onSelectAllCourses,
  onBulkStateChange,
  onBulkDelete,
  onClearSelection,
  onShowBulkActionModal,
  requiredCourseIds,
  onRequiredCourseToggle,
  onDeleteCourse,
  courseLessonCounts,
  pathSlug,
  openDropdown,
  onOpenDropdownChange,
  getGhostCourseIds,
  onCleanupGhostCourses
}: CoursesTabProps) {
  const ghostCourseIds = getGhostCourseIds();

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg leading-6 font-medium text-neutral-900">
            Courses in this Path ({courses.length})
          </h3>
          <p className="mt-1 text-sm text-neutral-500">
            Mark courses as mandatory to require completion for certificate eligibility.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <StateFilter
            states={COURSE_STATES}
            selectedStates={selectedCourseStates}
            onStatesChange={onSelectedCourseStatesChange}
          />
          <button 
            onClick={onCreateCourse}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
          >
            <FaPlus className="mr-2 h-4 w-4" />
            Add Course
          </button>
        </div>
      </div>

      {/* Ghost Course IDs Warning */}
      {ghostCourseIds.length > 0 && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-yellow-800">
                Invalid Required Course IDs Detected
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>The following course IDs are marked as required but don't exist in the available courses:</p>
                <div className="mt-2">
                  <div className="flex flex-wrap gap-2">
                    {ghostCourseIds.map((courseId, index) => (
                      <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        {courseId}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="mt-3">
                  <button
                    onClick={onCleanupGhostCourses}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-yellow-800 bg-yellow-100 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                  >
                    <FaTrash className="mr-1.5 h-3 w-3" />
                    Remove Invalid IDs
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {courses.length === 0 ? (
        <div className="text-center py-12">
          <FaGraduationCap className="mx-auto h-12 w-12 text-neutral-400" />
          <h3 className="mt-2 text-sm font-medium text-neutral-900">No courses</h3>
          <p className="mt-1 text-sm text-neutral-500">
            This path doesn't have any courses yet.
          </p>
          <div className="mt-6">
            <button 
              onClick={onCreateCourse}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
            >
              <FaPlus className="mr-2 h-4 w-4" />
              Add Course
            </button>
          </div>
        </div>
      ) : (
        <CourseTable
          courses={courses}
          selectedCourseStates={selectedCourseStates}
          selectedCourses={selectedCourses}
          onSelectedCoursesChange={onSelectedCoursesChange}
          onToggleCourse={onToggleCourse}
          onSelectAllCourses={onSelectAllCourses}
          onBulkStateChange={onBulkStateChange}
          onBulkDelete={onBulkDelete}
          onClearSelection={onClearSelection}
          onShowBulkActionModal={onShowBulkActionModal}
          requiredCourseIds={requiredCourseIds}
          onRequiredCourseToggle={onRequiredCourseToggle}
          onDeleteCourse={onDeleteCourse}
          courseLessonCounts={courseLessonCounts}
          pathSlug={pathSlug}
          openDropdown={openDropdown}
          onOpenDropdownChange={onOpenDropdownChange}
        />
      )}
    </div>
  );
}

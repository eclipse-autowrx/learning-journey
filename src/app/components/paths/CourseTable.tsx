// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

'use client';

import Link from 'next/link';
import { FaGraduationCap, FaArrowRight, FaEllipsisV, FaTrash, FaCheck, FaMinus } from 'react-icons/fa';
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

interface CourseTableProps {
  courses: Course[];
  selectedCourseStates: string[];
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
}

export default function CourseTable({
  courses,
  selectedCourseStates,
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
  onOpenDropdownChange
}: CourseTableProps) {
  const getStateColor = (state: string) => {
    switch (state) {
      case 'published':
        return 'bg-secondary-100 text-secondary-800';
      case 'reviewing':
        return 'bg-accent-100 text-accent-800';
      case 'draft':
        return 'bg-primary-100 text-primary-800';
      case 'archived':
        return 'bg-neutral-100 text-neutral-800';
      default:
        return 'bg-neutral-100 text-neutral-800';
    }
  };

  const filteredCourses = courses.filter(course => selectedCourseStates.includes(course.state));

  return (
    <div>
      {/* Bulk Actions Bar */}
      {selectedCourses.length > 0 && (
        <div className="bg-primary-50 border-b border-primary-200 px-6 py-3 mb-4 rounded-t-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm text-primary-700">
              {selectedCourses.length} item{selectedCourses.length > 1 ? 's' : ''} selected
            </span>
            <div className="flex items-center space-x-3">
              <button
                onClick={onClearSelection}
                className="inline-flex items-center px-3 py-1.5 border border-neutral-300 rounded-md text-sm font-medium text-neutral-700 bg-white hover:bg-neutral-50"
              >
                Clear Selection
              </button>
              <button
                onClick={() => onShowBulkActionModal('state')}
                className="inline-flex items-center px-3 py-1.5 border border-primary-300 rounded-md text-sm font-medium text-primary-700 bg-white hover:bg-primary-50"
              >
                Change State
              </button>
              <button
                onClick={() => onShowBulkActionModal('delete')}
                className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700"
              >
                <FaTrash className="mr-2 h-3.5 w-3.5" />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-neutral-200">
          <thead className="bg-neutral-50">
            <tr>
              <th className="px-6 py-3 w-12">
                <input
                  type="checkbox"
                  checked={selectedCourses.length > 0 && 
                    filteredCourses.every(c => selectedCourses.includes(c._id))}
                  onChange={(e) => onSelectAllCourses(e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Course
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Mandatory
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Lessons
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                State
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-neutral-200">
            {filteredCourses.map((course, index) => (
              <tr key={course._id} className={`hover:bg-neutral-50 ${selectedCourses.includes(course._id) ? 'bg-primary-50' : ''}`}>
                <td className="px-6 py-3">
                  <input
                    type="checkbox"
                    checked={selectedCourses.includes(course._id)}
                    onChange={() => onToggleCourse(course._id)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-lg bg-primary-500 flex items-center justify-center">
                        <FaGraduationCap className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <Link 
                        href={`/manage/paths/${pathSlug}/courses/${course.slug}`}
                        className="text-sm font-medium text-neutral-900 hover:text-primary-600"
                      >
                        {course.name}
                      </Link>
                      <div className="text-sm text-neutral-500">
                        {course.slug}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                  {requiredCourseIds.includes(course._id) ? 'Yes' : ''}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                  {courseLessonCounts[course._id] !== undefined 
                    ? courseLessonCounts[course._id] 
                    : (course.total_lessons || 0)
                  }
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStateColor(course.state)}`}>
                    {COURSE_STATES.find(s => s.value === course.state)?.label || course.state}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    <Link 
                      href={`/manage/paths/${pathSlug}/courses/${course.slug}`}
                      className="text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 px-2 py-1 rounded transition-colors duration-200"
                      title="View Course"
                    >
                      <FaArrowRight className="h-4 w-4" />
                    </Link>
                    <div className="relative dropdown-container">
                      <button 
                        onClick={() => onOpenDropdownChange(openDropdown === course._id ? null : course._id)}
                        className="text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 px-2 py-1 rounded transition-colors duration-200 cursor-pointer"
                        title="More options"
                      >
                        <FaEllipsisV className="h-4 w-4" />
                      </button>
                      {openDropdown === course._id && (
                        <div className={`absolute right-0 w-56 bg-white rounded-md shadow-lg z-[9999] border border-neutral-200 ${
                          index === filteredCourses.length - 1 ? 'bottom-full mb-2' : 'mt-2'
                        }`}>
                          <div className="py-1">
                            <button
                              onClick={() => {
                                onRequiredCourseToggle(course._id);
                                onOpenDropdownChange(null);
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 flex items-center"
                            >
                              {requiredCourseIds.includes(course._id) ? (
                                <>
                                  <FaMinus className="h-4 w-4 mr-2 text-orange-600" />
                                  Remove from Mandatory
                                </>
                              ) : (
                                <>
                                  <FaCheck className="h-4 w-4 mr-2 text-green-600" />
                                  Mark as Mandatory
                                </>
                              )}
                            </button>
                            <button
                              onClick={() => {
                                onDeleteCourse(course);
                                onOpenDropdownChange(null);
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                            >
                              <FaTrash className="h-4 w-4 mr-2 text-red-600" />
                              Delete Course
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

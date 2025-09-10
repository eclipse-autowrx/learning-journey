// Copyright (c) 2025 Eclipse Foundation.
//
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

'use client';

import BreadCrumb from "@/app/components/atom/BreadCrumb"
import { notFound } from 'next/navigation'
import CourseScreen from "@/app/components/screen/CourseScreen"
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

const Page = () => {
  const params = useParams();
  const { path_slug, course_slug } = params;
  const [dbPath, setDbPath] = useState(null);
  const [dbCourse, setDbCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!path_slug || !course_slug) {
      notFound();
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch both path and course data in parallel
        const [pathResponse, courseResponse] = await Promise.all([
          fetch(`/api/paths/${path_slug}`),
          fetch(`/api/courses/${course_slug}`)
        ]);

        if (!pathResponse.ok || !courseResponse.ok) {
          throw new Error('Failed to fetch data');
        }

        const pathApiResponse = await pathResponse.json();
        const courseApiResponse = await courseResponse.json();

        // Extract the actual data from API responses
        if (pathApiResponse.success && pathApiResponse.data) {
          setDbPath(pathApiResponse.data);
        } else {
          throw new Error('Invalid path API response structure');
        }

        if (courseApiResponse.success && courseApiResponse.data) {
          setDbCourse(courseApiResponse.data);
        } else {
          throw new Error('Invalid course API response structure');
        }
      } catch (err) {
        console.error('Error fetching path or course:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [path_slug, course_slug]);

  if (loading) {
    return (
      <div className="w-full bg-accent-50 text-neutral-600 text-2xl p-0 pb-1 h-screen flex flex-col">
        <div className="flex justify-center items-center min-h-screen">
          <div>Loading course...</div>
        </div>
      </div>
    );
  }

  if (error || !dbPath || !dbCourse) {
    return (
      <div className="w-full bg-accent-50 text-neutral-600 text-2xl p-0 pb-1 h-screen flex flex-col">
        <div className="flex justify-center items-center min-h-screen">
          <div>Course not found or error loading course.</div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="w-full bg-accent-50 text-neutral-600 text-2xl p-0 pb-1
                h-screen flex flex-col"
    >
      <BreadCrumb items={[
        { label: dbPath?.name || 'Loading...', link: `/path/${path_slug}` },
        { label: dbCourse?.name || 'Loading...', link: `/path/${path_slug}/course/${course_slug}` }
      ]} />

      <div className="w-full grow pt-2 px-4 flex flex-col">
        <CourseScreen course={dbCourse} path_slug={path_slug} />
      </div>
    </div>
  );
}

export default Page;

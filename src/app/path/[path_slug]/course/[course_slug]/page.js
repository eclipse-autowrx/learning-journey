// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT


import BreadCrumb from "@/app/components/atom/BreadCrumb"
import { notFound } from 'next/navigation'
import { fetchPathBySlug } from "@/lib/utils/consume_apis/api_path"
import { fetchCourseBySlug } from "@/lib/utils/consume_apis/api_course"
import CourseScreen from "@/app/components/screen/CourseScreen"
import { cookies, headers } from 'next/headers';
import { LessonService } from '@/lib/services/dataService';

const Page = async ({ params }) => {
  const cookieStore = await cookies();

  const { path_slug, course_slug } = await params;
  if (!path_slug || !course_slug) notFound()

  let dbPath = null
  let dbCourse = null

  try {
    const user_id = cookieStore.get('user_id')?.value || "";
    const token = cookieStore.get('token')?.value || "";

    // Build absolute origin for server-side fetches (mirrors implementation in path page)
    const hdrs = await headers();
    const host = hdrs.get('x-forwarded-host') || hdrs.get('host') || '';
    const proto = hdrs.get('x-forwarded-proto') || 'http';
    const origin = host ? `${proto}://${host}` : (process.env.NEXT_PUBLIC_BASE_URL || undefined);

    dbPath = await fetchPathBySlug(path_slug, user_id, token, origin);
    dbCourse = await fetchCourseBySlug(course_slug, `user_id=${user_id}&token=${token}`, origin);
    
    console.log(`dbCourse`, dbCourse)

  } catch (err) {
    console.error('Error fetching path or course:', err);
  }


  if (!dbPath || !dbCourse) notFound()

  // Ensure data is plain objects before passing to client components
  const plainCourse = JSON.parse(JSON.stringify(dbCourse));
  const plainPath = JSON.parse(JSON.stringify(dbPath));

  return (
    <div
      className="w-full bg-accent-50 text-neutral-600 text-2xl p-0 pb-1
                h-screen flex flex-col"
    >
      <BreadCrumb items={[
        { label: plainPath.name, link: `/path/${path_slug}` },
        { label: plainCourse.name, link: `/path/${path_slug}/course/${course_slug}` }
      ]} />

      <div className="w-full grow pt-2 px-4 flex flex-col">
        <CourseScreen course={plainCourse} path_slug={path_slug} />
      </div>
    </div>
  );
}

export default Page;

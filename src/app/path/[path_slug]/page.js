// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

import PathScreen from "@/app/components/screen/PathScreen"
import { notFound } from 'next/navigation'
import { fetchPathBySlug } from "@/lib/utils/consume_apis/api_path"
import BreadCrumb from "@/app/components/atom/BreadCrumb"

import { cookies } from 'next/headers';

const Page = async ({ params }) => {
  const cookieStore = await cookies();

  const { path_slug } = await params;
  if (!path_slug) notFound()
  let curPath

  try {
    curPath = await fetchPathBySlug(
      path_slug, 
      cookieStore.get('user_id')?.value || "", 
      cookieStore.get('token')?.value || "");
  } catch (err) {
    console.log(err)
  }

  if (!curPath) notFound()

  return (
    <div
      className="bg-slate-100 text-slate-600 text-2xl p-1
            h-full w-full flex flex-col"
    >
      <BreadCrumb items={[
        { label: curPath.name, link: `/path/${curPath.slug}` },
      ]} />
      { curPath && <PathScreen path={curPath} /> }
    </div>
  )
}

export default Page;

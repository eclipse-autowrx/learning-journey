// Copyright (c) 2025 Eclipse Foundation.
//
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

'use client';

import PathScreen from "@/app/components/screen/PathScreen"
import { notFound } from 'next/navigation'
import BreadCrumb from "@/app/components/atom/BreadCrumb"
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

const Page = () => {
  const params = useParams();
  const { path_slug } = params;
  const [curPath, setCurPath] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!path_slug) {
      notFound();
      return;
    }

    const fetchPathData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/paths/${path_slug}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch path data: ${response.status}`);
        }
        const apiResponse = await response.json();

        // Extract the actual path data from the API response
        if (apiResponse.success && apiResponse.data) {
          setCurPath(apiResponse.data);
        } else {
          throw new Error('Invalid API response structure');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPathData();
  }, [path_slug]);

  if (loading) {
    return (
      <div className="bg-neutral-100 text-neutral-600 text-2xl p-1 h-full w-full flex flex-col">
        <div className="flex justify-center items-center min-h-screen">
          <div>Loading path...</div>
        </div>
      </div>
    );
  }

  if (error || !curPath) {
    return (
      <div className="bg-neutral-100 text-neutral-600 text-2xl p-1 h-full w-full flex flex-col">
        <div className="flex justify-center items-center min-h-screen">
          <div>Path not found or error loading path.</div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="bg-neutral-100 text-neutral-600 text-2xl p-1
            h-full w-full flex flex-col"
    >
      <BreadCrumb items={[
        { label: curPath?.name || 'Loading...', link: `/path/${curPath?.slug || path_slug}` },
      ]} />
      { curPath && <PathScreen path={curPath} /> }
    </div>
  )
}

export default Page;

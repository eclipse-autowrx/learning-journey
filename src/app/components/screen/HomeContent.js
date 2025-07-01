// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

'use client'

import { useEffect, useState } from 'react';
import PathList from './PathList';

const HomeContent = ({ }) => {
    const [items, setItems] = useState([]);

    useEffect(() => {
        onLoaded()
    }, [])

    const onLoaded = async () => {
        // Get all query fields of the current URL
        const queryParams = {};
        if (typeof window !== "undefined") {
            const searchParams = new URLSearchParams(window.location.search);
            for (const [key, value] of searchParams.entries()) {
                queryParams[key] = value;
            }
            // console.log("Query Params:", queryParams);
        }

        if (queryParams.user_id) {
            await auth(queryParams.user_id, queryParams.token)
        }

        await fetchPaths()
    }

    /*

    const fetchProgressForCourses = async (course_ids) => {
        if (!course_ids) return null
        try {
      
          const res = await fetch(`/api/progress/courses/bulk/${course_ids}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json"
            }
          });
          if (!res.ok) {
            const error = await res.json();
            throw new Error(error.error || "Failed to update lesson state");
          }
          return await res.json();
        } catch (err) {
          console.error("Error saving lesson finish state:", err);
          return null;
        }
    }
    */

    const applyProgressForCollections = async (collections) => {
        // TODO: must  fetch course progress by course_ids
        try {
            collections.forEach(collection => {
                if(collection.paths) {
                    collection.paths.forEach(path => {
                        if(path.courses) {
                            path.courses.forEach(course => {
                                if(course.progress) {
                                    course.context = {
                                        state: course.progress.state,
                                        progress: course.progress
                                    }
                                }
                            })
                        }
                    })
                }
            })
        } catch(err) {
            console.log(err)
        }
    }

    const fetchPaths = async () => {
        try {
            const response = await fetch("/api/collections")
            const data = await response.json();
            if (data && data.success) {
                let collections = data.data
                await applyProgressForCollections(collections)
                setItems(collections)
            } else {
                setItems([])
            }
        } catch (error) {
            console.log(error)
            setItems([])
        }
    }

    const auth = async (user_id, token) => {
        try {
            await fetch(`/api/user/auth?user_id=${encodeURIComponent(user_id)}&token=${encodeURIComponent(token)}`, {
                method: "POST"
            });
        } catch (error) {
            console.log("Learning auth fail")
        }
    }

    return (
        <div className="w-full px-2 py-4" >
            <div className='text-center'>
                <div id="pathList" className="text-2x lg:text-4xl text-gray-800">Follow our <b>Paths</b></div>
                <div className="px-4 text-center text-base lg:text-xl text-gray-700 font-base mt-1">
                    Paths are a series of fun coding and prototyping that will help you gain new skills in SDV.
                </div>
            </div>

            {items.map((collection, gIndex) => (
                <div key={gIndex} className="my-4">
                    <PathList paths={collection.paths} title={collection.name} description={collection.description} titleTag={collection.titleTag} />
                </div>
            ))}
        </div>
    );
}
export default HomeContent;
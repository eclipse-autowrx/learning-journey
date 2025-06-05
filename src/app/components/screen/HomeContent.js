'use client'

import { useEffect, useState } from 'react';
import PathList from './PathList';
import { genQueryParamsForRequest } from '@/lib/frontend/utils';

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
        }

        if (queryParams.user_id) {
            localStorage.setItem('user_id', queryParams.user_id);
            localStorage.setItem('token', queryParams.token || '');
            await auth()
        }

        await fetchPaths()
    }


    const fetchProgressForCourses = async (course_ids) => {
        if (!course_ids) return null
        try {
      
          const res = await fetch(`/api/progress/courses/bulk/${course_ids}?${genQueryParamsForRequest()}`, {
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

    const applyProgressForCollections = async (collections) => {
        // TODO: must  fetch course progress by course_ids
        try {
            const allCourseIds = collections.reduce((acc, collection) => {
                if (collection.paths) {
                    collection.paths.forEach(path => {
                        if (path.course_ids) {
                            acc.push(...path.course_ids);
                        }
                    });
                }
                return acc;
            }, []);
            // return allCourseIds;
            const courseProgresses = await fetchProgressForCourses(allCourseIds.join(','));
            if (courseProgresses && courseProgresses.success && courseProgresses.data) {
                const progresses = courseProgresses.data;
                collections.forEach(collection => {
                    if (collection.paths) {
                        collection.paths.forEach(path => {
                            if (path.courses) {
                                path.courses.forEach(course => {
                                    const matchProgress = progresses.find(p => p.course_id === course._id);
                                    if (matchProgress) {
                                        course.context = {
                                            state: matchProgress.state,
                                            progress: matchProgress
                                        };
                                    }
                                });
                            }
                        });
                    }
                });
            }
        } catch (err) {
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

    const auth = async () => {
        try {
            await fetch(`/api/user/auth?${genQueryParamsForRequest()}`, {
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
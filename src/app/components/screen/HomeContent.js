// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ProgressIndicator from '../ProgressIndicator';
import { genQueryParamsForRequest } from '@/lib/frontend/utils';
import { useAuth } from '../../../lib/frontend/auth';


const HomeContent = ({ }) => {
    const [items, setItems] = useState([]);
    const [imageErrors, setImageErrors] = useState(new Set());
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const { isAuthenticated, loading: authLoading, refreshAuth } = useAuth();

    useEffect(() => {
        // Wait for authentication to complete before loading data
        if (!authLoading) {
            onLoaded();
        }
    }, [authLoading])

    const onLoaded = async () => {
        // Get all query fields of the current URL
        const queryParams = {};
        if (typeof window !== "undefined") {
            const searchParams = new URLSearchParams(window.location.search);
            for (const [key, value] of searchParams.entries()) {
                queryParams[key] = value;
            }
        }

        // Priority 1: Try authentication with query params first
        if (queryParams.user_id) {
            try {
                await auth(queryParams.user_id, queryParams.token || '')
                
                // Refresh auth state to update UI components like UserBadge
                await refreshAuth()
            } catch (error) {
                // Authentication failed, continue with existing auth state
            }
            
            // Clean up URL by removing user_id and token from query params
            // This prevents multiple authentication attempts
            if (typeof window !== "undefined") {
                const url = new URL(window.location);
                url.searchParams.delete('user_id');
                url.searchParams.delete('token');
                window.history.replaceState({}, '', url.toString());
            }
        }
        await fetchPaths()
    }


    const fetchProgressForCourses = async (course_ids) => {
        if (!course_ids) return null
        
        // Split course_ids into batches of 
        const courseIdArray = course_ids.split(',').filter(id => id.trim());
        const batchSize = 30;
        const batches = [];
        
        for (let i = 0; i < courseIdArray.length; i += batchSize) {
            batches.push(courseIdArray.slice(i, i + batchSize));
        }
        
        try {
            const allProgressData = [];
            
            // Process each batch sequentially to avoid overwhelming the server
            for (const batch of batches) {
                const batchCourseIds = batch.join(',');
                const res = await fetch(`/api/progress/courses/bulk/${batchCourseIds}?${genQueryParamsForRequest()}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json"
                    }
                });
                
                if (!res.ok) {
                    const error = await res.json();
                    throw new Error(error.error || "Failed to fetch course progress");
                }
                
                const batchData = await res.json();
                if (batchData && batchData.success && batchData.data) {
                    allProgressData.push(...batchData.data);
                }
            }
            
            // Return the combined data in the same format as the original API
            return {
                success: true,
                data: allProgressData
            };
        } catch (err) {
            console.error("Error fetching course progress:", err);
            return null;
        }
    }

    const applyProgressForCollections = async (collections) => {
        // Only fetch progress data for authenticated users
        if (!isAuthenticated) {
            return;
        }

        try {
            const allCourseIds = collections.reduce((acc, collection) => {
                if (collection.paths) {
                    collection.paths.forEach(path => {
                        // Extract course IDs from both course_ids array and courses array
                        if (path.course_ids) {
                            acc.push(...path.course_ids);
                        }
                        if (path.courses) {
                            path.courses.forEach(course => {
                                acc.push(course._id);
                            });
                        }
                    });
                }
                return acc;
            }, []);

            if (allCourseIds.length === 0) {
                return;
            }

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
                                    } else {
                                        // No progress record found, set as not started
                                        course.context = {
                                            state: 'not_started'
                                        };
                                    }
                                });
                                // Set course icons based on progress state
                                // addMediaUrlForCourses(path, path.courses);
                            }
                        });
                    }
                });
            }
        } catch (err) {
            // Error fetching progress
        }
    }

    const fetchPaths = async () => {
        try {
            setIsLoading(true);
            const response = await fetch("/api/collections/settings")
            const data = await response.json();
            if (data && data.success) {
                let collections = data.data
                await applyProgressForCollections(collections)
                setItems(collections)
            } else {
                setItems([])
            }
        } catch (error) {
            setItems([])
        } finally {
            setIsLoading(false);
        }
    }

    const auth = async (user_id, token) => {
        try {
            const response = await fetch(`/api/user/auth?user_id=${encodeURIComponent(user_id)}&token=${encodeURIComponent(token)}`, {
                method: "POST"
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Authentication failed with status ${response.status}`);
            }
            
            return true; // Authentication successful
        } catch (error) {
            throw error; // Re-throw to be caught by the caller
        }
    }



    const getDifficultyClass = (level) => {
        // Convert to number if it's a string
        const numLevel = parseInt(level);
        
        switch(numLevel) {
            case 1: return 'bg-accent-400'; // Level 1
            case 2: return 'bg-accent-500'; // Level 2
            case 3: return 'bg-accent-600'; // Level 3
            case 4: return 'bg-accent-700'; // Level 4
            default: return 'bg-accent-400'; // Default to Level 1
        }
    };

    const handleImageError = (pathId) => {
        setImageErrors(prev => new Set([...prev, pathId]));
    };

    const isImageError = (pathId) => {
        return imageErrors.has(pathId);
    };

    const handlePathClick = (path) => {
        // Check if path is locked - don't navigate if locked
        if (path.state === "locked") {
            return;
        }

        // Check if path has external link - open in new tab
        if (path.extends?.external_link) {
            window.open(path.extends.external_link, '_blank');
            return;
        }

        // Navigate to path page using the slug
        if (path.slug) {
            router.push(`/path/${path.slug}`);
        }
    };

    return (
        <div id='pathList' className="bg-white text-center min-h-screen">
            
            <div className="max-w-[1515px] mx-auto px-2 sm:px-6 lg:px-12 py-8">
                <div className="mb-8">
                    <h1 className="font-bold text-[40px] 
                        leading-[1.2] text-neutral-600">
                        Follow our Paths</h1>
                </div>

                {isLoading && (
                    <div className="flex flex-col items-center justify-center py-16">
                            <div className="relative">
                            <div className="w-16 h-16 border-4 rounded-full animate-spin" style={{borderColor: 'var(--primary-lighter)', borderTopColor: 'var(--primary)'}}></div>
                            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent rounded-full animate-spin" style={{borderTopColor: 'var(--primary-darker)', animationDirection: 'reverse', animationDuration: '0.8s'}}></div>
                        </div>
                        <p className="mt-4 font-medium text-lg" style={{color: 'var(--primary-dark)'}}>Loading learning paths...</p>
                    </div>
                )}

                {!isLoading && (
                    <div className="space-y-16">
                        {items.map((collection, gIndex) => (
                        <div key={gIndex} id={collection.id || collection.slug || collection.name} 
                            className="space-y-3 bg-primary-50 rounded-lg px-2 sm:px-6 py-4 sm:py-6">
                            
                            <div className="space-y-0 w-full">
                                <div className="py-0 block items-center justify-center">
                                    <span className="font-bold text-[28px] leading-[1.33] tracking-[-0.03em] text-primary-700">
                                        {collection.titleTag || collection.name}
                                    </span>
                                </div>
                                <p className="font-regular text-lg leading-tight tracking-[-0.03em] text-neutral-700 max-w-[680px] mx-auto">
                                    {collection.description}
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                                {collection.paths?.map((path, pathIndex) => (
                                    <div 
                                        key={pathIndex} 
                                        className={`bg-white rounded-lg shadow-lg text-left flex flex-col h-[380px] 
                                                cursor-pointer overflow-x-hidden ${
                                            path.state === 'locked' ? 'opacity-80' : ''
                                        }`}
                                        onClick={() => handlePathClick(path)}
                                    >
                                        <div className="w-full h-[200px] min-h-[200px] relative overflow-hidden rounded-t-lg">
                                            {isImageError(path._id) ? (
                                                <div className="absolute top-0 left-0 w-full h-full rounded-t-lg transition-transform duration-300 ease-in-out hover:scale-110" 
                                                    style={{background: 'linear-gradient(to bottom right, var(--color-neutral-500), var(--color-neutral-400), var(--color-neutral-200))'}}></div>
                                            ) : (
                                                <img 
                                                    src={path.image || '/images/playground.png'} 
                                                    alt={path.name || 'Path Image'}
                                                    className="absolute top-0 left-0 w-full h-full object-cover rounded-t-lg transition-transform duration-300 ease-in-out hover:scale-110"
                                                    onError={() => handleImageError(path._id)}
                                                />
                                            )}
                                            <div className={`absolute bottom-2 left-2 shadow-md rounded-lg px-2 py-1 ${getDifficultyClass(path.level || path.difficulty || 1)}`}>
                                                <div className="font-medium text-base leading-none text-center p-0 m-0" style={{color: 'var(--text-inverse)'}}>
                                                    Level {path.level || path.difficulty || 1}
                                                </div>
                                            </div>
                                        
                                            {path.state === 'locked' && (
                                                <div className="absolute top-2 right-2 bg-black bg-opacity-50 rounded-full p-2">
                                                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div className="flex-1 flex flex-col justify-between p-4">
                                            <div className="flex flex-col gap-1">
                                                <h3 className="font-semibold text-base md:text-lg xl:text-xl line-clamp-1
                                                    leading-tight tracking-[-0.02em] text-neutral-800">
                                                    {path.name || 'No Name'}
                                                </h3>
                                                <p className="font-regular text-sm ellipsis-2 text-secondary
                                                    line-clamp-4">
                                                    {path.description || ''}
                                                </p>
                                            </div>

                                             {isAuthenticated && path.courses && path.courses.length > 0 && (
                                                 <div className="flex items-center gap-1 mt-2">
                                                     <div className="flex items-center">
                                                         <svg className="w-5 h-5 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                         </svg>
                                                     </div>
                                                     <ProgressIndicator courses={path.courses} />
                                                 </div>
                                             )}

                                             {!isAuthenticated && !authLoading && path.courses && path.courses.length > 0 && (
                                                 <div className="flex items-center gap-1 mt-2">
                                                     <div className="flex items-center">
                                                         <svg className="w-5 h-5 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                         </svg>
                                                     </div>
                                                     <ProgressIndicator courses={path.courses} />
                                                 </div>
                                             )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
export default HomeContent;
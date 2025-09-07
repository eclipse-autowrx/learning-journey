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
    const { isAuthenticated, loading: authLoading } = useAuth();

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

        if (queryParams.user_id) {
            await auth(queryParams.user_id, queryParams.token || '')
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
        // Only fetch progress data for authenticated users
        if (!isAuthenticated) {
            console.log('User not authenticated, skipping progress fetch');
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
                                    }
                                });
                            }
                        });
                    }
                });
            }
        } catch (err) {
            console.log('Error fetching progress:', err)
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
            console.log(error)
            setItems([])
        } finally {
            setIsLoading(false);
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
            console.log('Path is locked, navigation prevented:', path.name);
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
        } else {
            console.error('Path slug is missing:', path);
        }
    };

    const getProgressData = (path) => {
        // For unauthenticated users, show no progress
        if (!isAuthenticated) {
            return {
                totalSteps: path.courses?.length || 5,
                completedSteps: 0,
                activeStep: 1
            };
        }

        // Get real progress data from path courses
        if (path.courses && path.courses.length > 0) {
            const totalCourses = path.courses.length;
            let completedCourses = 0;
            let activeCourse = 0;

            path.courses.forEach((course, index) => {
                if (course.context && course.context.state === 'completed') {
                    completedCourses++;
                } else if (course.context && course.context.state === 'active') {
                    activeCourse = index + 1;
                }
            });

            return {
                totalSteps: totalCourses,
                completedSteps: completedCourses,
                activeStep: activeCourse || completedCourses + 1
            };
        }

        // Fallback for authenticated users with no course data
        return {
            totalSteps: 5,
            completedSteps: 0,
            activeStep: 1
        };
    };

    return (
        <div id='pathList' className="bg-white min-h-screen text-center">
            <div className="max-w-[1515px] mx-auto px-8 md:px-24 py-8">
                {/* Main Title - Exact Figma Layout */}
                <div className="mb-8">
                    <h1 className="font-bold text-[40px] 
                        leading-[1.2] tracking-[-0.03em] text-neutral-600">
                        Follow our Paths</h1>
                </div>

                {/* Loading Indicator */}
                {isLoading && (
                    <div className="flex flex-col items-center justify-center py-16">
                        <div className="relative">
                            {/* Spinning circle */}
                            <div className="w-16 h-16 border-4 rounded-full animate-spin" style={{borderColor: 'var(--primary-lighter)', borderTopColor: 'var(--primary)'}}></div>
                            {/* Inner pulse */}
                            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent rounded-full animate-spin" style={{borderTopColor: 'var(--primary-darker)', animationDirection: 'reverse', animationDuration: '0.8s'}}></div>
                        </div>
                        <p className="mt-4 font-medium text-lg" style={{color: 'var(--primary-dark)'}}>Loading learning paths...</p>
                    </div>
                )}

                {/* Collections - Exact Figma Structure */}
                {!isLoading && (
                    <div className="space-y-16">
                        {items.map((collection, gIndex) => (
                        <div key={gIndex} id={collection.id || collection.slug || collection.name} className="space-y-3 bg-neutral-100 rounded-lg px-6 py-6">
                            {/* Collection Header - Exact Figma Layout */}
                            <div className="space-y-0 w-full">
                                <div className="py-0 block items-center justify-center">
                                    <span className="font-bold text-[28px] leading-[1.33] tracking-[-0.03em] text-primary-800">
                                        {collection.titleTag || collection.name}
                                    </span>
                                </div>
                                <p className="font-regular text-lg leading-tight tracking-[-0.03em] text-neutral-500 max-w-[680px] mx-auto">
                                    {collection.description}
                                </p>
                            </div>

                            {/* Course Cards Grid - Responsive Layout */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {collection.paths?.map((path, pathIndex) => (
                                    <div 
                                        key={pathIndex} 
                                        className={`bg-white rounded-lg shadow-lg text-left flex flex-col h-[380px] cursor-pointer overflow-x-hidden ${
                                            path.state === 'locked' ? 'opacity-80' : ''
                                        }`}
                                        onClick={() => handlePathClick(path)}
                                    >
                                        <div className="w-full h-[200px] min-h-[200px] relative overflow-hidden rounded-t-lg">
                                            {/* Show gradient if image failed to load */}
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
                                            
                                            {/* Lock icon for locked paths */}
                                            {path.state === 'locked' && (
                                                <div className="absolute top-2 right-2 bg-black bg-opacity-50 rounded-full p-2">
                                                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                        
                                        {/* Course Content - Exact Figma Layout */}
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

                                            {/* Progress Section - Only show for authenticated users */}
                                            {isAuthenticated && (
                                                <div className="flex items-center gap-2 mt-2">
                                                    <p className="font-medium text-sm leading-[1.4] text-neutral-600">Progress</p>
                                                    <ProgressIndicator
                                                        steps={getProgressData(path).totalSteps}
                                                        completedSteps={getProgressData(path).completedSteps}
                                                        activeStep={getProgressData(path).activeStep}
                                                    />
                                                </div>
                                            )}

                                            {/* Show "Not Started" for unauthenticated users */}
                                            {!isAuthenticated && !authLoading && (
                                                <div className="flex items-center gap-2 mt-2">
                                                    <p className="font-medium text-sm leading-[1.4] text-neutral-500">Not Started</p>
                                                    <ProgressIndicator
                                                        steps={getProgressData(path).totalSteps}
                                                        completedSteps={0}
                                                        activeStep={1}
                                                    />
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
// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

"use client"

import { useEffect, useState, useRef } from 'react';
import QuizLesson from '../lessons/QuizLesson';
import TextMarkdownLesson from '../lessons/TextMarkdownLesson';
import { STATE_COMPLETED, STATE_IN_PROGRESS, STATE_NOT_STARTED } from "@/lib/const";

import { useRouter, useSearchParams } from "next/navigation";

import { genQueryParamsForRequest } from '@/lib/frontend/utils';
import InteractiveLesson from '../lessons/InteractiveLesson';
import { saveStateCourseStarted } from "@/lib/frontend/course";
import VideoLesson from '../lessons/VideoLesson';
import { showToast } from '@/lib/utils/notifications';

const saveStateLessonFinish = async (course, lesson_slug, data) => {
    if (!course || !course._id || !lesson_slug) return null

    try {

        let payload = {
            course_id: course._id,
            state: STATE_COMPLETED,
            record: {
                action: 'Finish lesson',
                data: data,
                refId: '',
                refType: '',
            }
        }


        const res = await fetch(`/api/progress/courses/${course._id}/lessons/${lesson_slug}?${genQueryParamsForRequest()}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
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

const saveStateLessonStart = async (course, lesson_slug, data) => {
    if (!course || !course._id || !lesson_slug) return null
    try {
        let payload = {
            course_id: course._id,
            state: STATE_IN_PROGRESS,
            record: {
                action: 'Start lesson',
                data: data || {},
                refId: '',
                refType: '',
            }
        }
        const res = await fetch(`/api/progress/courses/${course._id}/lessons/${lesson_slug}?${genQueryParamsForRequest()}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.error || "Failed to update lesson state");
        }
        return await res.json();
    } catch (err) {
        console.error("Error saving lesson start state:", err);
        return null;
    }
}

const LessonListItem = ({ lesson, isActive, onActive, index }) => {
    return <div
        className={`px-1 py-1 flex items-center cursor-pointer hover:item-border-active

            ${isActive ? 'item-border-active' : 'item-border'}`}
        onClick={() => {
            if (lesson.lock) return
            if (onActive) {
                onActive()
            }
        }}>
        <div className={`w-[42px] min-w-[42px] ${isActive && 'light-box' } aspect-square rounded-lg grid place-items-center`}>
            {lesson.lesson_type === 'quiz' && <img className='w-8 h-8' src='/imgs/bare/lesson_quiz.svg' alt='lesson_video'/>}
            {lesson.lesson_type === 'video' && <img className='w-8 h-8' src='/imgs/bare/lesson_video.svg' alt='lesson_video'/>}
            {lesson.lesson_type === 'text-markdown' && <img className='w-8 h-8' src='/imgs/bare/lesson_book.svg' alt='lesson_markdown'/>}
            {lesson.lesson_type === 'interactive' && <img className='w-10 h-10' src='/imgs/bare/lesson_interactive.svg' alt='lesson_interractive'/>}
        </div>
        <div className='grow pl-3 py-0 flex flex-col h-full w-full items-start'>
            <div className='w-full txt-sub-title text-sm line-clamp-2 flex items-start justify-between space-x-1'>
                 {`${index+1}. ${lesson.name}`}
                {lesson.context?.state == STATE_COMPLETED && <img src='/imgs/bare/icon_checked.svg'/>}
            </div>
            <div className='text-xs pl-5 line-clamp-1 leading-tight'>{lesson.description}</div>
        </div>
    </div>
}

const CourseScreen = ({ course, path_slug }) => {
    const router = useRouter();
    const searchParams = useSearchParams();

    if (!course) return <></>

    const [activeLessonIndex, setActiveLessonIndex] = useState(0)
    const [activeLesson, setActiveLesson] = useState()
    const [lessonsTable, setLessonsTable] = useState([])
    const [isCourseFinished, setIsCourseFinished] = useState(false);

    const toastCountRef = useRef(0)
    const lastToastTimeRef = useRef(0)
    const scrollContainerRef = useRef(null)
    const isUserInteractionRef = useRef(false)
    const lastProcessedLessonParamRef = useRef(null)
    const hasProcessedInitialUrlRef = useRef(false)
    const lastCourseIdRef = useRef(null)

    // Function to limit toast notifications (max 3 per 30 seconds)
    const showLimitedToast = (type, message) => {
        const now = Date.now();
        const timeSinceLastToast = now - lastToastTimeRef.current;

        // Reset counter if more than 30 seconds have passed
        if (timeSinceLastToast > 30000) {
            toastCountRef.current = 0;
        }

        // Only show toast if under the limit
        if (toastCountRef.current < 3) {
            showToast[type](message);
            toastCountRef.current += 1;
            lastToastTimeRef.current = now;
        }
    };

    // Function to update URL with lesson parameter
    const updateLessonUrl = (lessonSlug) => {
        const currentUrl = new URL(window.location.href);
        const currentLessonParam = currentUrl.searchParams.get('lesson');

        // Only update if the lesson parameter is actually different
        if (lessonSlug !== currentLessonParam) {
            if (lessonSlug) {
                currentUrl.searchParams.set('lesson', lessonSlug);
            } else {
                currentUrl.searchParams.delete('lesson');
            }
            router.replace(currentUrl.pathname + currentUrl.search, { scroll: false });
        }
    };

    // Function to handle lesson selection from UI
    const selectLesson = (lessonIndex) => {
        isUserInteractionRef.current = true;
        setActiveLessonIndex(lessonIndex);
        // Reset the processed lesson param ref since user is manually selecting
        lastProcessedLessonParamRef.current = null;
        hasProcessedInitialUrlRef.current = true; // Mark as processed to prevent URL override

        // Update URL immediately for user selection
        if (lessonsTable && lessonsTable[lessonIndex]) {
            updateLessonUrl(lessonsTable[lessonIndex].slug);
            lastProcessedLessonParamRef.current = lessonsTable[lessonIndex].slug;
        }

        // Reset the flag after a short delay to allow effects to complete
        setTimeout(() => {
            isUserInteractionRef.current = false;
        }, 100);
    };



    useEffect(() => {
        if (!course || !course.lessons) {
            setLessonsTable([]);
            return;
        }

        // Only reset URL processing flags if this is a different course
        if (course._id !== lastCourseIdRef.current) {
            hasProcessedInitialUrlRef.current = false;
            lastProcessedLessonParamRef.current = null;
            lastCourseIdRef.current = course._id;
        }

        const lessonsWithProgress = course.lessons.map(lesson => {
            const progress = course.context?.progress?.lessons?.[lesson.slug];
            if (progress) {
                return {
                    ...lesson,
                    context: {
                        state: progress.state,
                        progress: progress
                    }
                };
            }
            return lesson;
        });
        

        setLessonsTable(lessonsWithProgress);

    }, [course]);

    // Handle URL lesson parameter first - this should run before other effects
    useEffect(() => {
        if (lessonsTable && lessonsTable.length > 0) {
            // Check if there's a lesson parameter in the URL
            const lessonParam = searchParams.get('lesson');


            if (lessonParam) {
                // Find the lesson with this slug
                const lessonIndex = lessonsTable.findIndex(lesson => lesson.slug === lessonParam);
                if (lessonIndex >= 0) {
                    // Only set if we haven't processed the initial URL yet or if it's different from current
                    if (!hasProcessedInitialUrlRef.current || lessonIndex !== activeLessonIndex) {
                        setActiveLessonIndex(lessonIndex);
                        lastProcessedLessonParamRef.current = lessonParam;
                        hasProcessedInitialUrlRef.current = true;
                    }
                } else if (!hasProcessedInitialUrlRef.current) {
                    // Lesson parameter not found, default to first lesson
                    setActiveLessonIndex(0);
                    lastProcessedLessonParamRef.current = null;
                    hasProcessedInitialUrlRef.current = true;
                }
            } else if (!hasProcessedInitialUrlRef.current) {
                // No lesson parameter and we haven't processed initial URL - default to first lesson
                setActiveLessonIndex(0);
                lastProcessedLessonParamRef.current = null;
                hasProcessedInitialUrlRef.current = true;
            }
        }
    }, [lessonsTable, searchParams])

    useEffect(() => {
        if (!lessonsTable || lessonsTable.length === 0) return;
        try {
            const lesson = lessonsTable[activeLessonIndex];
            setActiveLesson(lesson);
            // Update URL when lesson changes (but not during user interaction or if already processed)
            if (lesson && !isUserInteractionRef.current && lesson.slug !== lastProcessedLessonParamRef.current) {
                updateLessonUrl(lesson.slug);
                lastProcessedLessonParamRef.current = lesson.slug;
            }
        } catch (err) {
            setActiveLesson(null);
        }
    }, [activeLessonIndex, lessonsTable]);

    // Always reset scroll to top-left when the active lesson changes
    useEffect(() => {
        try {
            if (typeof window !== 'undefined') {
                window.scrollTo(0, 0);
            }
            const el = scrollContainerRef.current;
            if (el && typeof el.scrollTo === 'function') {
                el.scrollTo({ top: 0, left: 0, behavior: 'auto' });
            } else if (el) {
                el.scrollTop = 0;
                el.scrollLeft = 0;
            }
        } catch (_) {}
    }, [activeLesson?.slug]);
    
    useEffect(() => {
        // When switching to a lesson that has not started, mark as in_progress
        try {
            if (course && activeLesson && activeLesson?.context?.state === STATE_NOT_STARTED) {
                saveStateLessonStart(course, activeLesson.slug).then((res) => {
                    if (res && res.success) {
                        applyNewProgressToCourse(res.data)
                    }
                }).catch(() => {})
            }
        } catch(_) {}
    }, [activeLesson, activeLessonIndex])



    // Mark course as started when entering if not started yet
    useEffect(() => {
        if (!course) return;
        if (course?.context?.state === STATE_NOT_STARTED) {
            try { saveStateCourseStarted(course); } catch(_) {}
        }
    }, [course?._id]);

    const gotoNextLesson = () => {
        if (activeLessonIndex < lessonsTable.length - 1) {
            const nextIndex = activeLessonIndex + 1;
            setActiveLessonIndex(nextIndex);
            // Reset processed lesson param since we're navigating programmatically
            lastProcessedLessonParamRef.current = null;
            hasProcessedInitialUrlRef.current = true;
            // Update URL immediately for programmatic navigation
            if (lessonsTable && lessonsTable[nextIndex]) {
                updateLessonUrl(lessonsTable[nextIndex].slug);
                lastProcessedLessonParamRef.current = lessonsTable[nextIndex].slug;
            }
        } else {
            setIsCourseFinished(true);
            setActiveLessonIndex(-1);
            // Clear lesson parameter when course is finished
            updateLessonUrl(null);
            lastProcessedLessonParamRef.current = null;
            hasProcessedInitialUrlRef.current = true;
        }
    }

    const applyNewProgressToCourse = async (progress) => {
        if (!progress || !progress.lessons) return;

        const updatedLessons = lessonsTable.map(lesson => {
            const matchProgress = progress.lessons[lesson.slug];
            if (matchProgress) {
                return {
                    ...lesson,
                    context: {
                        state: matchProgress.state,
                        progress: matchProgress
                    }
                };
            }
            return lesson;
        });

        setLessonsTable(updatedLessons);
    }


    // Handle case when there are no lessons
    if (lessonsTable.length === 0) {
        return <div className='w-full h-full flex flex-col'>
            <div className='flex w-full h-full text-base items-center justify-center'>
                <div className='text-center space-y-4'>
                    <div className='text-2xl font-bold text-neutral-800'>
                        No Lessons Available
                    </div>
                    <div className='text-neutral-600'>
                        This course doesn't have any lessons yet.
                    </div>
                    <button
                        onClick={() => router.push(`/path/${path_slug}`)}
                        className='px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors'
                    >
                        Back to Path
                    </button>
                </div>
            </div>
        </div>
    }

    return <div className='w-full h-full flex flex-col'>


        <div className={`flex w-full h-full text-base ${lessonsTable.length === 1 ? 'justify-center' : 'space-x-4'} overflow-auto`}>
            {/* Only show lesson list if there are more than 1 lessons */}
            {lessonsTable.length > 1 && (
                <div className='w-1/4 min-w-[400px] px-0 rounded flex flex-col space-y-2'>
                    <div className='w-full flex flex-col pb-2'>
                        <div className='text-xl leading-tight font-bold text-neutral-900'>
                            {course.name}
                        </div>
                        { course.description && <div className='text-sm text-neutral-600 leading-tight'>
                            {course.description}
                        </div> }
                    </div>
                    {lessonsTable.map((lesson, lIndex) => <LessonListItem key={lIndex}
                        index={lIndex}
                        lesson={lesson}
                        isActive={lIndex == activeLessonIndex}
                        onActive={() => {
                            selectLesson(lIndex)
                        }}
                    />)}
                </div>
            )}

            <div className={`${lessonsTable.length === 1 ? 'w-full max-w-6xl' : 'grow'} border border-neutral-200 bg-white rounded flex flex-col relative`}
                style={{ maxHeight: 'calc(100vh - 40px)' }}>
                <div ref={scrollContainerRef} className='absolue w-full h-full top-0 left-0 bottom-0 right-0 overflow-y-auto'>
                    {isCourseFinished ? (
                        <div className='w-full h-full flex flex-col items-center justify-center text-center p-8'>
                            <div className='text-2xl font-bold text-neutral-800 mb-4'>
                                Congratulations!
                            </div>
                            <div className='text-neutral-600 mb-8'>
                                You have completed the course "{course.name}".
                            </div>
                            <button
                                onClick={() => router.push(`/path/${path_slug}`)}
                                className='px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors'
                            >
                                Back to Path
                            </button>
                        </div>
                    ) : (
                        activeLesson && <div className='w-full h-full'>
                            {activeLesson.lesson_type === 'quiz' && <QuizLesson lesson={activeLesson}
                                onCloseRequest={() => {
                                    gotoNextLesson()
                                }}
                                onSubmitLesson={async (data) => {
                                    const res = await saveStateLessonFinish(course, activeLesson.slug, data || {})
                                    if (res && res.success) {
                                    }
                                    let newCourseProgress = res.data
                                    applyNewProgressToCourse(newCourseProgress)
                                }}
                            />}
                            
                            {activeLesson.lesson_type === 'video' && <VideoLesson lesson={activeLesson}
                                onCloseRequest={() => {
                                    gotoNextLesson()
                                }}
                                onSumbitLesson={async (data) => {
                                    let lessonInTable = lessonsTable.find(l => l.slug == activeLesson.slug)
                                    if (lessonInTable && lessonInTable.context?.state != 'completed') {
                                        try {
                                        const res = await saveStateLessonFinish(course, activeLesson.slug, data || {})
                                            let newCourseProgress = res.data
                                            applyNewProgressToCourse(newCourseProgress)
                                        } catch (e) { }
                                    }
                                }}
                            />}

                            {activeLesson.lesson_type === 'text-markdown' && <TextMarkdownLesson lesson={activeLesson}
                                onCloseRequest={() => {
                                    gotoNextLesson()
                                }}
                                onSumbitLesson={async (data) => {
                                    let lessonInTable = lessonsTable.find(l => l.slug == activeLesson.slug)
                                    if (lessonInTable && lessonInTable.context?.state != 'completed') {
                                        try {
                                            const res = await saveStateLessonFinish(course, activeLesson.slug, data || {})
                                            let newCourseProgress = res.data
                                            applyNewProgressToCourse(newCourseProgress)
                                        } catch (e) { }
                                    }

                                }}
                            />}

                            {activeLesson.lesson_type === 'interactive' && <InteractiveLesson lesson={activeLesson}
                                onCloseRequest={() => {
                                    gotoNextLesson()
                                }}
                                onSumbitLesson={async (data) => {
                                    let lessonInTable = lessonsTable.find(l => l.slug == activeLesson.slug)
                                    if (lessonInTable && lessonInTable.context?.state != 'completed') {
                                        const res = await saveStateLessonFinish(course, activeLesson.slug, data || {})
                                        let newCourseProgress = res.data
                                        applyNewProgressToCourse(newCourseProgress)
                                    }
                                }}
                            />}
                        </div>
                    )}
                </div>
            </div>
        </div>
    </div>
}

export default CourseScreen;
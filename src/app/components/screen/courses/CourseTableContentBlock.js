// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

"use client"
import Link from "next/link";
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RiVideoLine } from "react-icons/ri";
import { FiFileText } from "react-icons/fi";
import { MdOutlineQuiz } from "react-icons/md";

const LessonIcon = ({lessonType, forceIcon}) => {
    const LESSON_ICON_SIZE  = "h-10 w-10 text-slate-500"
    const getIcon = () => {
        switch(lessonType) {
            case "video":
                return <RiVideoLine className={LESSON_ICON_SIZE} />
            case "text":
                return <FiFileText className={LESSON_ICON_SIZE}  />
            case "quiz":
                return <MdOutlineQuiz className={LESSON_ICON_SIZE}  />
            default:
                return <img src={forceIcon} alt="custom" className={LESSON_ICON_SIZE}  />
        }
    }

    return (
        <div className='square h-16 w-16 bg-transparent rounded-xl flex items-center justify-center'>
            {forceIcon ? <img src={forceIcon} alt="custom" className={LESSON_ICON_SIZE} /> : getIcon()}
        </div>
    )
}


const CourseTableContentBlock= ({course}) => {

    if(!course || !course.lessons) return <div 
        className='text-slate-500 text-sm italic mt-2 ml-8 flex flex-row items-center space-x-4'>
            No content available
    </div>

    return <div>
        {course.lessons.map((lesson, index) => (
            <Link href={window.location.href || `${window.location.href}/lesson/${lesson.slug}`} key={index}>
                <div className='mt-3 pl-2 pr-2 py-2 flex items-start border-2 border-gray-400 rounded-xl
                    hover:border-black hover:opacity-80 cursor-pointer'>
                    <LessonIcon lessonType={lesson.lesson_type} forceIcon={lesson.icon} />
                    <div className='flex flex-col pl-4 pr-2 space-x-2 text-slate-800 text-base leading-tight'>
                        <div className='font-semibold'>{`${index+1}`}. {lesson.name}</div>
                        <div className='mt-1 flex flex-row'>
                            <div className='line-clamp-1 text-sm italic text-slate-500'>
                                {lesson.shortDescription}
                            </div>
                        </div>
                    </div>
                </div>
            </Link>
        ))}
    </div>
}

export default CourseTableContentBlock;
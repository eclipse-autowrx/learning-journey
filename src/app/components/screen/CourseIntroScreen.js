// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

"use client";

import React, { useEffect } from 'react';
import CourseIntroBlock  from './courses/CourseIntroBlock';
import CourseTableContentBlock  from './courses/CourseTableContentBlock';

const CourseIntroScreen = ({course}) => {

    const [activeTab, setActiveTab] = React.useState("intro");

    useEffect(() => {
    }, [])

    // TODO:
    // Provide machanism to update style from site 
    const borderColor = "border-slate-600"
    

    return <div className='h-fit w-full px-2'>
            <div className='text-2xl font-bold text-black'>
                {course.name}
            </div>

            <div className='mt-2 flex flex-row font-semibold text-slate-500'>
                <div className={`border-b-2 ${borderColor} w-2`}></div>
                <button onClick={() => setActiveTab("intro")} 
                    className={`cursor-pointer hover:underline text-lg px-4 py-2 rounded-t-xl border-t-2 border-l-2 border-r-2 ${borderColor} 
                        ${activeTab === "intro" ? "text-slate-700" : "border-b-2"}`}>
                        Introduction</button>

                <div className={`border-b-2 ${borderColor} w-2`}></div>

                <button onClick={() => setActiveTab("content")} 
                    className={`cursor-pointer hover:underline text-lg px-4 py-2 rounded-t-xl border-t-2 border-l-2 border-r-2 ${borderColor}
                        ${activeTab === "content" ? "text-slate-700" : "border-b-2"}`}>
                        Course Content</button>

                <div className={`border-b-2 ${borderColor} grow`}></div>
            </div>

            <div className='mt-4'>
                {activeTab === "intro" && <CourseIntroBlock course={course} />}
                {activeTab === "content" && <CourseTableContentBlock course={course} />}
            </div>
    </div>
}

export default CourseIntroScreen;
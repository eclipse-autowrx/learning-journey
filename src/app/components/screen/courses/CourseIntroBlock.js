// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

"use client"
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BsDot } from "react-icons/bs";
import { CiTimer } from "react-icons/ci";
import dayjs from 'dayjs';
import Btn from '../../atom/Btn';

const CourseIntroBlock = ({course}) => {
    return <div className='mt-4'>
            {/* Short Description */}
            <div className='text-slate-800 text-base'>
                {course.shortDescription}
            </div>

            {/* Created by and created date */}
            <div className='text-slate-500 text-sm  mt-1 flex items-center'>
                <CiTimer size={22} className='mr-1'/>
                <div> Latest updated  {dayjs(course.created_at).format('MMM DD, YYYY')}</div>

                <BsDot size={30} className='ml-8'/>
                <div>Created by</div>
                <div className='font-semibold ml-2'>{course.created_by}</div>
            </div>

            {/* Statictics */}
            <div className='text-slate-500 text-sm italic mt-1 ml-[-12px] flex flex-row items-center space-x-4'>
                <div className='flex flex-row items-center'> 
                    <BsDot size={30}/>
                    {course.num_learners} learners  </div>

                <div className='flex flex-row items-center'> 
                    <BsDot size={30}/>
                    {course.num_certified_learners} learners got certification  </div>
            </div>
            

            {/* Action and process */}
            <div className='mt-1 flex items-center space-x-2'>
                { course.context?.state == 'finished' && <Btn variant="default">
                    Review
                </Btn> }

                { course.context?.state == 'inprogress' &&  <Btn variant="default">
                    Continue learning
                </Btn> }

                { course.context?.state == 'ready' &&   <Btn variant="default">
                    Enroll course
                </Btn> }
            </div>

            {/* Long description of the course goes here. */}

            <div className='mt-4 pt-4 border-t border-gray-300 text-slate-800 text-base leading-tight'>
                {course.description}
            </div>
        </div>
}

export default CourseIntroBlock;
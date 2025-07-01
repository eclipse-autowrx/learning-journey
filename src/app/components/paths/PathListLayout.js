// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

'use client'

import { MdCheckBoxOutlineBlank, MdLock, MdOutlineCheckBox } from "react-icons/md"
import { IoCheckbox } from "react-icons/io5";
import { PiCertificateBold } from "react-icons/pi";
import { MdOutlineExplore, MdOutlineChecklist } from "react-icons/md";
import { useRouter } from "next/navigation";
import CertificateScreen from "../atom/CertificateScreen";
import { useEffect, useState } from "react";
import { FaLinkedin } from "react-icons/fa6";
import { FaFacebookSquare } from "react-icons/fa";
import BtnFullRounded from "../atom/BtnFullRounded";
import { IoClose } from "react-icons/io5";

import { saveStateCourseStarted, saveStateCourseCompleted } from "@/lib/frontend/course"
import Popup from "../atom/Popup";

const LaunchCourseBtn = ({path, course}) => {
    const router = useRouter();
    const [popupExternalLaunch, setPopupExternalLaunch] = useState(false)

    const launchCourse = () => {
        if (course.extends?.external_link) {
            window.open(course.extends?.external_link, '_blank')
            window.location.reload()
            return
        }
        router.push(`/path/${path.slug}/course/${course.slug}`)
    }

    return <>   
        {/* <div className="text-xs">{course?.context?.state }</div> */}
            { popupExternalLaunch && <Popup>
                <div className="pl-4 pr-2 py-2 flex justify-between items-center text-xl font-bold text-black border-b border-slate-200">
                    Launch External Site

                    <IoClose size={30} className="cursor-pointer hover:scale-110 text-black" 
                        onClick={() => setPopupExternalLaunch(false)} />
                </div>
                <div className="flex text-sm items-center justify-center mt-2 px-8 py-4">
                    <p className="text-gray-600 text-center">
                        <span><i>You are about to be redirected to an external course at: </i></span>
                        <div className="mt-2 text-black-600 break-all text-base text-black">
                            {course.extends?.external_link}
                        </div>
                    </p>
                </div>
                <div className="mt-4 mb-2 py-2 px-4 flex items-center justify-between">
                    <div></div>
                    <BtnFullRounded onClick={async () => {
                        if(!course?.context?.state || course?.context?.state == 'not_started') {
                            await saveStateCourseStarted(course)
                        }
                        launchCourse()
                        setPopupExternalLaunch(false)
                    }}>
                        Launch
                    </BtnFullRounded>
                </div>
            </Popup> }

        { (!course?.context?.state  || course?.context?.state == 'not_started') && <BtnFullRounded
            onClick={async () => { 
                if(course.extends?.external_link) {
                    setPopupExternalLaunch(true) 
                    return
                }
                await saveStateCourseStarted(course)
                launchCourse()
            }}
            >Start</BtnFullRounded>}

        { course?.context?.state == 'in_progress' &&<> 
            <BtnFullRounded
            onClick={() => { 
                if(course.extends?.external_link) {
                    setPopupExternalLaunch(true) 
                    return
                }
                launchCourse()
            }}
            >Continue</BtnFullRounded>

            {
                course.extends?.external_link && <BtnFullRounded
                onClick={async () => { 
                    await saveStateCourseCompleted(course)
                    window.location.reload()
                }}
                >Confirm completed</BtnFullRounded>
            }
            </>}

        { course?.context?.state == 'completed' && <BtnFullRounded
            onClick={() => { 
                if(course.extends?.external_link) {
                    setPopupExternalLaunch(true) 
                    return
                }
                launchCourse()
            }}
        >Revisit</BtnFullRounded>}
    </>
}

const CourseBlock = ({ path, course, index }) => {
    const router = useRouter();
    const [showCert, setShowCert] = useState(false)

    if(!path || !course) return <></>

    return <div className="flex flex-col items-center w-full">

        {index == 0 &&
            <div className="rounded-full text-[20px] font-light flex items-center justify-center px-8 py-1 border-4 border-[#41B452] bg-white">
                <MdOutlineExplore size={32} />
                <span className="ml-2 mr-1 text-[30px] font-bold">Explore</span> - get new skills
            </div>
        }

        {/* { course?.config?.pre_block && 
                        <div className="rounded-full  flex items-center justify-center px-8 py-1 border-4 border-[#41B452] bg-white">
                            <span className="text-xl font-bold">{course?.config?.pre_block.type} - </span> {course?.config?.pre_block.content}
                        </div>
                    } */}

        {course?.type == 'final-test' && <>
            <div className="h-8 w-1 border-l-4 border-dashed border-[#41B452]" />
            <div className="rounded-full text-black text-[20px] font-light flex items-center justify-center px-8 py-1 border-4 border-[#41B452] bg-white">
                <MdOutlineChecklist size={32} />
                <span className="ml-2 mr-1 text-[30px] font-bold">Final test </span> - Prove your skill mastery
            </div>
        </>
        }

        {course?.type == 'award' && <>
            <div className="h-8 w-1 border-l-4 border-dashed border-[#41B452]" />
            <div className="rounded-full text-black text-[20px] font-light flex items-center justify-center px-8 py-1 border-4 border-[#41B452] bg-white">
                <PiCertificateBold size={32} />
                <span className="ml-2 mr-1 text-[30px] font-bold">Certificate </span> - Earn your recognition
            </div>
        </>
        }


        <div className="h-8 w-1 border-l-4 border-dashed border-[#41B452]" />

        <div className="w-full min-h-32 bg-white rounded-sm shadow-md flex flex-col">
            <div className="border-b border-slate-200 min-h-[40px] 
                                        px-4 md:px-4 py-2 
                                        flex items-center">

                <div className="text-slate-300">
                    {course?.context?.state === 'completed' && <IoCheckbox size={32} className="text-[#41B452]" />}
                    {course?.context?.state !== 'completed' && <MdCheckBoxOutlineBlank size={34} />}
                </div>
                <div className="ml-2 text-xl md:text-2xl font-semibold text-gray-900">{course.name}</div>
            </div>

            <div className="grow grid grid-cols-2 min-h-[120px] ">
                <div className="px-4 pt-2 pb-4 flex flex-col">
                    <div className="grow text-base text-gray-800">
                        {course.description}
                    </div>
                    <div className="flex space-x-4 justify-between">
                        {course.type == "award" && <>
                            <div className={`bg-black rounded-full px-4 py-2 text-lg font-bold text-white w-fit
                                            flex items-center
                                            ${course?.context?.state === 'completed' && 'cursor-pointer hover:scale-110'}`}
                                onClick={() => {
                                    if(course?.context?.state !== 'completed') return
                                    setShowCert(true)
                                }}>
                                {course?.context?.state !== 'completed' && <MdLock className="mr-2" />}
                                View
                            </div>

                            <div className="flex items-center text-lg text-black space-x-2">
                                Share: 
                                {course?.context?.state !== 'completed' && <div className="ml-1 text-sm text-slate-400 italic">
                                    Finish this course to unlock</div>}
                                {
                                    course?.context?.state === 'completed'&& <>
                                            <FaLinkedin className="ml-1 text-blue-700 cursor-pointer hover:scale-110" 
                                                size={30}
                                                onClick={() => {
                                                window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href+"/cert")}`, '_blank');
                                            }}
                                        />
                                        <FaFacebookSquare className=" text-blue-700 cursor-pointer hover:scale-110"
                                            size={30}
                                            onClick={() => {
                                                window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href+"/cert")}`, '_blank');
                                            }}
                                        />
                                    </>
                                }
                                
                            </div>
                            {/* <div className={`bg-black rounded-full px-4 py-2 text-lg font-bold text-white w-fit
                                            flex items-center
                                            ${course?.context?.state === 'completed' && 'cursor-pointer hover:scale-110'}`}>
                                {course?.context?.state !== 'completed' && <MdLock className="mr-2" />}
                                Share
                            </div> */}

                            { showCert && <CertificateScreen image={course.image} requestClose={() => { setShowCert(false) }} /> }
                        </>}

                        {["lesson", "final-test"].includes(course.type) && <LaunchCourseBtn path={path} course={course} />}
                    </div>
                </div>
                <div className="p-2 h-full">
                    <img className={`w-full min-h-[120px] max-h-[160px] ${course.type === 'award' ? 'object-contain' : 'object-cover'} rounded-lg`}
                        src={course.image || course.top_icon} />
                </div>
            </div>
        </div>
    </div>
}

const PathListLayout = ({ path, courses, onRequestUpdateProgress }) => {
    const router = useRouter();

    // useEffect(() => {
    //     console.log(courses)
    // }, [courses])

    return <div className="w-full">
        <div className="mt-4 bg-slate-200 min-h-[800px] flex flex-col justify-begin items-center px-4 py-8">
            <div className="max-w-[780px] w-full flex flex-col items-center">
                {courses && courses.length>0 && courses.map((course, cIndex) => <CourseBlock key={cIndex} index={cIndex} course={course} path={path} />)}
            </div>
        </div>
    </div>
}

export default PathListLayout;
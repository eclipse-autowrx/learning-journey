// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { BiSignal1, BiSignal2, BiSignal3, BiSignal4 } from "react-icons/bi";
import { MdLock } from "react-icons/md";
import { FaCheck } from "react-icons/fa";
import { useRouter } from "next/navigation";

const PathLevel = ({ path }) => {
    return <div className="flex flex-row items-center justify-center bg-black text-white font-semibold rounded-lg px-2 py-0.5">
        <div className="relative w-8 h-4 mr-1">
            {path?.level == "1" && <BiSignal1 size={22} className="absolute top-[-5px] scale-x-200 left-2 z-10 text-white" />}
            {path?.level == "2" && <BiSignal2 size={22} className="absolute top-[-5px] scale-x-200 left-2 z-10 text-white" />}
            {path?.level == "3" && <BiSignal3 size={22} className="absolute top-[-5px] scale-x-200 left-2 z-10 text-white" />}
            {path?.level == "4" && <BiSignal4 size={22} className="absolute top-[-5px] scale-x-200 left-2 z-10 text-white" />}
            <BiSignal4 size={22} className="absolute top-[-5px] scale-x-200 left-2 z-0 text-slate-500" />
        </div>
        <div className="pr-2text-[14px] font-semibold ">Level-{path.level || "1"} </div>
    </div>
}

const PathList = ({ paths, title, titleTag, description }) => {
    const router = useRouter();

    return <div id={titleTag||null} className="bg-white w-full pt-4 pb-8 flex justify-center items-center">
        <div className="container rounded-xl bg-[#F8F296] text-slate-600 p-0 pb-8 flex flex-col pt-4 items-center">
            <div className="text-[20px] lg:text-[26px] font-bold text-gray-800">{title}</div>
            <div className="px-4 text-center text-base lg:text-lg text-gray-700 font-base mt-1">
                {description}</div>

            {(!paths || paths.length === 0) && <div
                className="w-full text-slate-500 italic text-lg font-light grid place-items-center h-[120px]">
                No paths available</div>}

            <div className="mt-4 max-w-[1120px] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 xl:gap-8 w-full px-10 xl:px-20">
                {paths && paths.map((path, index) => (
                    <div key={index} onClick={() => {
                        if (path.state === "locked") return
                        if (path.extends?.external_link) {
                            window.open(path.extends?.external_link, '_blank')
                            return
                        }
                        router.push(`/path/${path.slug}`)
                    }}
                        className={`w-full bg-white text-slate-600 text-lg rounded-xl 
                                cursor-pointer flex flex-col justify-center px-0 overflow-hidden
                                ${path.state === 'locked' && 'opacity-80'}`}>
                        <img src={path.thumb}
                            className="w-full h-[200px] object-cover rounded-t-xl hover:scale-110" />
                        <div className="grow px-4 pt-4 pb-2">
                            <div className="mt-2 mb-2 text-left flex items-center justify-between">
                                <PathLevel path={path} />
                                <div className="flex items-center">
                                    {path.extends?.est_release_date && <span className="text-xs italic font-light text-gray-700 pr-1">
                                        Est. {path.extends?.est_release_date} </span>}
                                    {path.state === 'locked' && <MdLock className="text-black" size={30} />}
                                </div>
                            </div>

                            <div className="flex items-center justify-center mb-2">
                                <div className="text-base h-[40px] lg:text-xl lg:h-[50px] 
                                                        line-clamp-2 font-semibold leading-tight text-black grow">
                                    {path.name}</div>
                                {/* <MdOutlineArrowForwardIos size={24} className="min-w-8 text-black hover:scale-130 ml-2"/> */}
                            </div>

                            <div className="text-sm xl:text-base text-slate-500 leading-tight 
                                                    h-[68px] xl:h-[100px] line-clamp-5">
                                {path.description}</div>

                            <div className="flex items-center justify-center mt-4">
                                {path.courses && path.courses.length > 0 && <>
                                    <div className="w-18 text-base">Progress:</div>
                                    <div className="grow flex items-center">
                                        {path.courses && path.courses.length > 0 && path.courses.filter(c => c.type !== 'award')
                                            .map((c, cIndex) => <>
                                            {cIndex > 0 && <div key={cIndex*2} className="grow h-[2px] bg-black"></div>}
                                            <div key={(cIndex*2)+1}>
                                                {c.context?.state === 'completed' && <div
                                                    className="rounded-full w-4 h-4 border-black border-2 bg-black grid place-items-center">
                                                    <FaCheck size={10} className="text-white" />
                                                </div>}
                                                {c.context?.state === 'in_progress' && <div
                                                    className="rounded-full w-4 h-4 border-black border-2 flex">
                                                    <div className="flex-1 bg-black"></div>
                                                    <div className="flex-1"></div>
                                                </div>}
                                                {!['completed', 'in_progress'].includes(c.context?.state) && <div
                                                    className="rounded-full w-4 h-4 border-black border-2 bg-white"></div>}
                                            </div>
                                        </>)}
                                    </div>
                                </>}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
}


export default PathList

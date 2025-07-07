'use client'

import { useEffect, useState } from "react"
import BtnFullRounded from "../atom/BtnFullRounded";
import MarkdownRender from "../atom/MarkdownRender";


const VideoLesson = ({ lesson, onCloseRequest, onSumbitLesson }) => {

    if (!lesson) return <></>

    useEffect(() => {
        setTimeout(() => {
            if (onSumbitLesson) {
                onSumbitLesson({})
            }
        }, [3000])
    }, [])

    return <div className="w-full px-2 lg:px-4">
        <div className="my-2">
            <div className="text-xl font-bold text-black">{lesson.name}</div>
            <div className="mt-0 text-gray-500 text-sm leading-tight">{lesson.description}</div>
        </div>

        <img className="w-full h-[6px] opacity-30" src="/imgs/bare/horizontal_line.svg"/>

        <div className="mt-2 min-h-[480px] grid place-items-center bg-white">
            <iframe
                width="100%"
                height="600"
                src={lesson.video_url}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                allowFullScreen
            ></iframe>

            {lesson.markdown_content && <div className="my-4">
                <MarkdownRender>
                    {lesson.markdown_content}
                </MarkdownRender>
            </div>}
        </div>

        <img className="w-full h-[6px] opacity-30" src="/imgs/bare/horizontal_line.svg"/>

        <div className="py-2 flex items-center space-x-2">
            <div className="grow"></div>

            <BtnFullRounded
                onClick={() => {
                    if (onCloseRequest) {
                        onCloseRequest({})
                    }
                }}>
                Next Lesson
            </BtnFullRounded>

        </div>
    </div>
}

export default VideoLesson
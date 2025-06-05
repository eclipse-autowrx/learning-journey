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

    return <div className="w-full px-2">
        <div className="my-2 pb-2 border-b border-slate-600">
            <div className="text-xl font-bold text-black">{lesson.name}</div>
            <div className="mt-2 text-gray-500 text-sm leading-tight">{lesson.description}</div>
        </div>

        <div className="mt-6 px-4 lg:px-8 min-h-[480px] grid place-items-center">
            <iframe
                width="100%"
                height="600"
                src={lesson.video_url}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
            ></iframe>
        </div>

        {lesson.markdown_content && <div className="my-4">
            <MarkdownRender>
                {lesson.markdown_content}
            </MarkdownRender>

            <div className="mt-2 px-2 py-2 border-t border-gray-500 flex items-center space-x-2">
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

        </div>}
    </div>
}

export default VideoLesson
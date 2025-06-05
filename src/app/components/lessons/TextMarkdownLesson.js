'use client'

import { useEffect, useState, useRef } from "react"
import BtnFullRounded from "../atom/BtnFullRounded";
import ViewportVisibleDetect from "../atom/ViewPortVisibleDetect";
import MarkdownRender from "../atom/MarkdownRender";


const TextMarkdownLesson = ({ lesson, onCloseRequest, onSumbitLesson }) => {

    if (!lesson) return <></>

    return <div className="w-full">
        {/* <div className="px-2 py-2">
            <div className="text-xl font-bold text-black">{lesson.name}</div>
            { lesson.description && <div className="mt-2 text-gray-500 text-sm leading-tight">{lesson.description}</div> }
        </div>
        <img className="w-full" src="/imgs/bare/horizontal_line.svg"/> */}

        <div className="max-w-none px-2 py-1 lg:px-6 min-h-[300px] bg-white">
            <MarkdownRender> 
                {lesson.markdown_content}
            </MarkdownRender>

            <ViewportVisibleDetect onVisible={() => {
                console.log("onVisible")
                onSumbitLesson && onSumbitLesson({})
            }}/>
        </div>

        {/* <img className="w-full" src="/imgs/bare/horizontal_line.svg"/> */}

        <div className="px-4 py-4 flex items-center space-x-2">
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

export default TextMarkdownLesson
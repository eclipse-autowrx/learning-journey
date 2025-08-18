// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

'use client'

import { useEffect, useState } from "react"
import BtnFullRounded from "../atom/BtnFullRounded";
import Markdown from 'react-markdown'

const components = {
    // Headings
    h1: ({ node, ...props }) => (
        <h1 className="text-4xl font-extrabold mt-8 mb-4 text-gray-900 dark:text-gray-100 border-b pb-2 border-gray-200 dark:border-gray-700" {...props} />
    ),
    h2: ({ node, ...props }) => (
        <h2 className="text-3xl font-bold mt-6 mb-3 text-gray-800 dark:text-gray-200" {...props} />
    ),
    h3: ({ node, ...props }) => (
        <h3 className="text-2xl font-semibold mt-5 mb-2 text-gray-700 dark:text-gray-300" {...props} />
    ),
    h4: ({ node, ...props }) => (
        <h4 className="text-xl font-semibold mt-4 mb-1 text-gray-600 dark:text-gray-400" {...props} />
    ),
    h5: ({ node, ...props }) => (
        <h5 className="text-lg font-medium mt-3 text-gray-600 dark:text-gray-400" {...props} />
    ),
    h6: ({ node, ...props }) => (
        <h6 className="text-base font-medium mt-2 text-gray-500 dark:text-gray-500" {...props} />
    ),

    // Paragraph
    p: ({ node, ...props }) => (
        <p className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300" {...props} />
    ),

    // Links
    a: ({ node, ...props }) => (
        <a
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 underline transition-colors duration-200"
            target="_blank" // Often good practice for external links
            rel="noopener noreferrer" // Security best practice
            {...props}
        />
    ),

    // Lists
    ul: ({ node, ...props }) => (
        <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300" {...props} />
    ),
    ol: ({ node, ...props }) => (
        <ol className="list-decimal pl-6 mb-4 text-gray-700 dark:text-gray-300" {...props} />
    ),
    li: ({ node, ...props }) => (
        <li className="mb-2 leading-relaxed" {...props} />
    ),

    // Blockquote
    blockquote: ({ node, ...props }) => (
        <blockquote className="border-l-4 border-gray-400 pl-4 py-2 my-4 italic text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded" {...props} />
    ),

    // Code
    code: ({ inline, node, ...props }) => (
        <code
            className={`font-mono text-sm ${inline
                    ? 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-1 py-0.5 rounded'
                    : 'block bg-gray-800 text-gray-200 p-4 rounded-md overflow-x-auto my-4'
                }`}
            {...props}
        />
    ),
    // For preformatted blocks (like code blocks)
    pre: ({ node, ...props }) => (
        <pre className="bg-gray-800 text-gray-200 p-4 rounded-md overflow-x-auto my-4" {...props} />
    ),


    // Tables
    table: ({ node, ...props }) => (
        <table className="w-full border-collapse my-4 text-gray-700 dark:text-gray-300" {...props} />
    ),
    thead: ({ node, ...props }) => (
        <thead className="bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600" {...props} />
    ),
    th: ({ node, ...props }) => (
        <th className="px-4 py-2 text-left font-semibold text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-600" {...props} />
    ),
    tbody: ({ node, ...props }) => (
        <tbody {...props} />
    ),
    tr: ({ node, ...props }) => (
        <tr className="border-b border-gray-100 dark:border-gray-700 last:border-b-0 even:bg-gray-50 dark:even:bg-gray-800" {...props} />
    ),
    td: ({ node, ...props }) => (
        <td className="px-4 py-2 border border-gray-200 dark:border-gray-600" {...props} />
    ),

    // Images
    img: ({ node, ...props }) => (
        <img className="max-w-full h-auto mx-auto my-4 rounded-lg shadow-md" {...props} />
    ),

    // Horizontal Rule
    hr: ({ node, ...props }) => (
        <hr className="my-8 border-t-2 border-gray-200 dark:border-gray-700" {...props} />
    ),

    // Strong and Emphasis
    strong: ({ node, ...props }) => (
        <strong className="font-bold text-gray-900 dark:text-gray-100" {...props} />
    ),
    em: ({ node, ...props }) => (
        <em className="italic" {...props} />
    ),

    // Other less common but useful elements
    del: ({ node, ...props }) => (
        <del className="line-through text-gray-500 dark:text-gray-400" {...props} />
    ),
    // Keyboard input
    kbd: ({ node, ...props }) => (
        <kbd className="inline-block px-1.5 py-0.5 text-xs font-semibold text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm" {...props} />
    ),
};


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

        {/* Video Player */}
        <div className="relative bg-black">
          {lesson.video_url ? (
            lesson.video_provider === 'youtube' ? (
              <iframe
                className="w-full h-96"
                src={getVideoEmbedUrl(lesson.video_url, 'youtube')}
                title={lesson.name}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            ) : (
              <video
                id="lesson-video"
                className="w-full h-96 object-contain"
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                controls
              >
                <source src={lesson.video_url} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            )
          ) : (
            <div className="w-full h-96 flex items-center justify-center bg-gray-900">
              <div className="text-center text-white">
                <p className="text-lg mb-4">Video content not available</p>
                <p className="text-sm text-gray-400">Please check the video URL configuration</p>
              </div>
            </div>
          )}

          {/* Custom Controls Overlay - Hide for YouTube */}
          {lesson.video_provider !== 'youtube' && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
              <div className="flex items-center justify-between">
                <button
                  onClick={togglePlayPause}
                  className="text-white hover:text-gray-300 transition-colors"
                >
                  {isPlaying ? <FaPause size={20} /> : <FaPlay size={20} />}
                </button>
                
                <div className="flex-1 mx-4">
                  <div className="w-full bg-gray-600 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
                
                <button
                  onClick={toggleFullscreen}
                  className="text-white hover:text-gray-300 transition-colors"
                >
                  {isFullscreen ? <FaCompress size={20} /> : <FaExpand size={20} />}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="p-4 bg-gray-50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Lesson Info */}
        <div className="p-6">
          <div className="flex flex-wrap gap-2 mb-4">
            {lesson.tags?.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
          
          {lesson.completion_criteria && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 mb-2">Completion Criteria</h3>
              <p className="text-blue-800 text-sm">
                {lesson.completion_criteria === 'view' && 'Watch the video to complete this lesson'}
                {lesson.completion_criteria === 'complete' && 'Complete the entire video to finish this lesson'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
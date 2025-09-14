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
import { FaPlay, FaPause, FaExpand, FaCompress } from 'react-icons/fa';
import MarkdownRender from "../atom/MarkdownRender";



const VideoLesson = ({ lesson, onCloseRequest, onSumbitLesson, showNextButton = true }) => {

  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!lesson) return <></>

  useEffect(() => {
    setTimeout(() => {
      if (onSumbitLesson) {
        onSumbitLesson({})
      }
    }, [3000])
  }, [])

  const handleTimeUpdate = (e) => {
    const video = e.target;
    setProgress((video.currentTime / video.duration) * 100);
  };

  const handleLoadedMetadata = (e) => {
    // You might want to do something when video metadata is loaded
  };

  const togglePlayPause = () => {
    const video = document.getElementById('lesson-video');
    if (video) {
      video.paused ? video.play() : video.pause();
    }
  };

  const toggleFullscreen = () => {
    const video = document.getElementById('lesson-video');
    if (!document.fullscreenElement) {
      video.requestFullscreen().catch(err => {
        alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const getVideoEmbedUrl = (url, provider) => {
    if (provider === 'youtube') {
      let videoId;
      try {
        const urlObj = new URL(url);
        if (urlObj.hostname === 'youtu.be') {
          videoId = urlObj.pathname.slice(1);
        } else {
          videoId = urlObj.searchParams.get('v');
        }
      } catch (e) {
        // Fallback for invalid URLs
        const match = url.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
        videoId = match && match[1];
      }

      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
    }
    return url;
  };


  return <div className="w-full px-2">
    <div className="my-2 pb-2 border-b border-neutral-600">
      <div className="text-xl font-bold text-neutral-900">{lesson.name}</div>
      <div className="mt-2 text-neutral-500 text-sm leading-tight">{lesson.description}</div>
    </div>

    {/* Video Player */}
    <div className="relative bg-neutral-900">
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
        <div className="w-full h-96 flex items-center justify-center bg-neutral-900">
          <div className="text-center text-white">
            <p className="text-lg mb-4">Video content not available</p>
            <p className="text-sm text-neutral-400">Please check the video URL configuration</p>
          </div>
        </div>
      )}

      {/* Custom Controls Overlay - Hide for YouTube */}
      {/* {lesson.video_provider !== 'youtube' && (
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
          )} */}
    </div>

    {/* Progress Bar */}
    {lesson.video_provider !== 'youtube' &&
      <div className="p-4 bg-neutral-50">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-neutral-700">Progress</span>
          <span className="text-sm text-neutral-500">{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-neutral-200 rounded-full h-2">
          <div
            className="bg-secondary-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    }

    {/* Lesson Info */}
    <div className="p-6">
      <div className="flex flex-wrap gap-2 mb-4">
        {lesson.tags?.map((tag, index) => (
          <span
            key={index}
            className="px-3 py-1 bg-primary-100 text-primary-800 text-sm rounded-full"
          >
            {tag}
          </span>
        ))}
      </div>

      { lesson.markdown_content && <div className="max-w-none px-2 py-1 lg:px-6 min-h-[12px] bg-white">
          <MarkdownRender> 
              {lesson.markdown_content}
          </MarkdownRender>
      </div>}

      {/* {lesson.completion_criteria && (
            <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
              <h3 className="font-medium text-primary-900 mb-2">Completion Criteria</h3>
              <p className="text-primary-800 text-sm">
                {lesson.completion_criteria === 'view' && 'Watch the video to complete this lesson'}
                {lesson.completion_criteria === 'complete' && 'Complete the entire video to finish this lesson'}
              </p>
            </div>
          )} */}
    </div>

    <div className="px-4 py-4 flex items-center space-x-2">
      <div className="grow"></div>

    {showNextButton && <BtnFullRounded
        onClick={() => {
          if (onCloseRequest) {
            onCloseRequest({})
          }
        }}>
        Next Lesson
      </BtnFullRounded>
    }
    </div>
  </div>
} 
export default VideoLesson;
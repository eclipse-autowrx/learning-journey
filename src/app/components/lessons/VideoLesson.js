'use client';

import { useState, useEffect } from 'react';
import { FaPlay, FaPause, FaExpand, FaCompress } from 'react-icons/fa';

export default function VideoLesson({ lesson, onComplete }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hasWatched, setHasWatched] = useState(false);

  useEffect(() => {
    // Check if user has already watched this lesson
    const watchedLessons = JSON.parse(localStorage.getItem('watchedLessons') || '{}');
    if (watchedLessons[lesson.slug]) {
      setHasWatched(true);
      setProgress(100);
    }
  }, [lesson.slug]);

  const handleTimeUpdate = (event) => {
    const video = event.target;
    const currentProgress = (video.currentTime / video.duration) * 100;
    setProgress(currentProgress);
    
    // Mark as complete if watched more than 80%
    if (currentProgress >= 80 && !hasWatched) {
      setHasWatched(true);
      const watchedLessons = JSON.parse(localStorage.getItem('watchedLessons') || '{}');
      watchedLessons[lesson.slug] = true;
      localStorage.setItem('watchedLessons', JSON.stringify(watchedLessons));
      
      if (onComplete) {
        onComplete(lesson.slug);
      }
    }
  };

  const handleLoadedMetadata = (event) => {
    setDuration(event.target.duration);
  };

  const togglePlayPause = () => {
    const video = document.getElementById('lesson-video');
    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const toggleFullscreen = () => {
    const video = document.getElementById('lesson-video');
    if (!isFullscreen) {
      if (video.requestFullscreen) {
        video.requestFullscreen();
      } else if (video.webkitRequestFullscreen) {
        video.webkitRequestFullscreen();
      } else if (video.msRequestFullscreen) {
        video.msRequestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getVideoEmbedUrl = (url, provider) => {
    if (provider === 'youtube') {
      const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1];
      return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
    }
    return url;
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Video Header */}
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{lesson.name}</h1>
          <p className="text-gray-600 mb-4">{lesson.description}</p>
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span>Duration: <b>{formatTime(lesson.video_duration || 0)} minutes</b></span>
            <span>Provider: <b>{lesson.video_provider}</b></span>
            {hasWatched && (
              <span className="text-green-600 font-medium">✓ Completed</span>
            )}
          </div>
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
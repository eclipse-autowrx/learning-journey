// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

'use client';

import { useState, useRef, useEffect } from 'react';
import { FaGraduationCap, FaTrash, FaSave, FaImage } from 'react-icons/fa';
import { showToast } from '@/lib/utils/notifications';

interface Course {
  _id: string;
  name: string;
  slug: string;
}

interface MapItem {
  course_id?: string; // Optional for course items
  certificate_id?: string; // Optional for certificate items
  x: string;
  y: string;
}

interface Path {
  background_img?: string;
  maps: MapItem[];
  courses: Course[];
}

interface PathCanvasEditorProps {
  path: Path;
  onSave: (maps: MapItem[]) => void;
  onBackgroundImageUpdate: (url: string) => void;
}

const PathCanvasEditor = ({ path, onSave, onBackgroundImageUpdate }: PathCanvasEditorProps) => {
  const [maps, setMaps] = useState<MapItem[]>(path.maps || []);
  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/medias/upload_image', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        onBackgroundImageUpdate(result.url);
        showToast.success('Background image uploaded successfully.');
      } else {
        showToast.error('Failed to upload image.');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      showToast.error('An error occurred while uploading the image.');
    }
  };

  const [draggingItem, setDraggingItem] = useState<MapItem | null>(null);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const courseId = e.dataTransfer.getData('courseId');
    const certificateId = e.dataTransfer.getData('certificateId');

    if (canvasRef.current) {
      const canvasRect = canvasRef.current.getBoundingClientRect();
      const x = ((e.clientX - canvasRect.left) / canvasRect.width) * 100;
      const y = ((e.clientY - canvasRect.top) / canvasRect.height) * 100;

      if (courseId) {
        const newMapItem: MapItem = {
          course_id: courseId,
          x: `${x.toFixed(2)}%`,
          y: `${y.toFixed(2)}%`,
        };
        setMaps(prev => [...prev.filter(item => item.course_id !== courseId), newMapItem]);
      } else if (certificateId) {
        const newMapItem: MapItem = {
          certificate_id: certificateId,
          x: `${x.toFixed(2)}%`,
          y: `${y.toFixed(2)}%`,
        };
        setMaps(prev => [...prev.filter(item => item.certificate_id !== certificateId), newMapItem]);
      }
    }
    setDraggingItem(null);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleRemove = (itemId: string, isCertificate: boolean = false) => {
    if (isCertificate) {
      setMaps(prev => prev.filter(item => item.certificate_id !== itemId));
    } else {
      setMaps(prev => prev.filter(item => item.course_id !== itemId));
    }
  };
  
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, item: MapItem) => {
    setDraggingItem(item);
    if (item.course_id) {
      e.dataTransfer.setData('courseId', item.course_id);
    } else if (item.certificate_id) {
      e.dataTransfer.setData('certificateId', item.certificate_id);
    }
  };

  const availableCourses = path.courses.filter(
    (course) => !maps.some((mapItem) => mapItem.course_id === course._id)
  );
  
  // Check if certificate is already placed on canvas
  const isCertificatePlaced = maps.some((mapItem) => mapItem.certificate_id === 'certificate');

  return (
    <div className="flex flex-col gap-4">
        <div className="px-2 flex justify-between items-center">
            <div className="text-lg font-semibold">Available Courses</div>
            <div className="flex items-center gap-2">
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    className="hidden"
                    accept="image/*"
                />
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                    <FaImage className="mr-2 h-4 w-4" />
                    Change Background
                </button>
                <button
                    onClick={() => onSave(maps)}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                    <FaSave className="mr-2 h-4 w-4" />
                    Save Canvas
                </button>
            </div>
        </div>

        <div className="w-full bg-gray-50 rounded-lg px-4 py-1">
            <div className="flex gap-2 overflow-x-auto overflow-y-hidden h-[110px]">
                {/* Certificate Item */}
                {!isCertificatePlaced && (
                    <div
                        draggable
                        onDragStart={(e) => e.dataTransfer.setData('certificateId', 'certificate')}
                        className="flex flex-col items-center cursor-pointer flex-shrink-0"
                        style={{ width: "11vw" }}
                    >
                        <div className="relative" style={{
                            width: "5vw",
                            height: "5vw",
                        }}>
                            <div className="h-full w-full bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                                <FaGraduationCap className="text-white text-2xl" />
                            </div>
                        </div>
                        <div
                            className="mt-0 text-slate-700 text-[12px] font-semibold text-center leading-none"
                            style={{
                                maxWidth: "11vw",
                            }}
                        >
                            Certificate
                        </div>
                    </div>
                )}
                
                {/* Available Courses */}
                {path.courses.length === 0 ? (
                    <div className="w-full flex items-center justify-center">
                        <p className="text-gray-500 text-sm italic">There are no courses in this path. You can add them in the 'Courses' tab.</p>
                    </div>
                ) : availableCourses.length === 0 ? (
                    <div className="w-full flex items-center justify-center">
                        <p className="text-gray-500 text-sm italic">All courses have been placed on the canvas.</p>
                    </div>
                ) : (
                    availableCourses.map((course) => (
                        <div
                            key={course._id}
                            draggable
                            onDragStart={(e) => e.dataTransfer.setData('courseId', course._id)}
                            className="flex flex-col items-center cursor-pointer flex-shrink-0"
                            style={{ width: "11vw" }}
                        >
                            <div className="relative" style={{
                                width: "5vw",
                                height: "5vw",
                            }}>
                                <img
                                    src="/imgs/bare/course-notyet.png"
                                    className="h-full w-full object-contain"
                                />
                            </div>
                            <div
                                className="mt-0 text-slate-700 text-[12px] font-semibold text-center leading-none"
                                style={{
                                    maxWidth: "11vw",
                                }}
                            >
                                {course.name}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
      
        <div className="flex-grow min-h-[400px]">
            <div
                ref={canvasRef}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className="relative w-full h-[560px] rounded-sm border-2 border-dashed border-gray-300"
                style={{
                    backgroundImage: `url(${path.background_img})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            >
                <div className="absolute inset-0 bg-white opacity-50 z-0"></div>
                {maps.map((item) => {
                    if (item.course_id) {
                        // Render course item
                        const course = path.courses.find(c => c._id === item.course_id);
                        return (
                            <div
                                key={`course-${item.course_id}`}
                                draggable
                                onDragStart={(e) => handleDragStart(e, item)}
                                className="absolute flex flex-col items-center cursor-pointer group hover:scale-110 transform transition-transform origin-center z-20"
                                style={{
                                    top: item.y,
                                    left: item.x,
                                    width: "11vw",
                                    transform: 'translate(-50%, -50%)',
                                }}
                            >
                                <div className="relative" style={{
                                    width: "6.5vw",
                                    height: "6.5vw",
                                }}>
                                    <img
                                        src="/imgs/bare/course-notyet.png"
                                        className="absolute h-full w-full top-0 left-0 z-0 object-contain"
                                    />
                                    <button
                                        onClick={() => handleRemove(item.course_id!, false)}
                                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                        aria-label="Remove course"
                                    >
                                        <FaTrash size={12} />
                                    </button>
                                </div>
                            
                                <div
                                    className="mt-0 text-slate-700 text-[10px] lg:text:[10px] xl:text-base font-semibold text-center leading-none"
                                    style={{
                                        maxWidth: "11vw",
                                    }}
                                >
                                    {course?.name || 'Unknown Course'}
                                </div>
                            </div>
                        );
                    } else if (item.certificate_id) {
                        // Render certificate item
                        return (
                            <div
                                key={`certificate-${item.certificate_id}`}
                                draggable
                                onDragStart={(e) => handleDragStart(e, item)}
                                className="absolute flex flex-col items-center cursor-pointer group hover:scale-110 transform transition-transform origin-center z-20"
                                style={{
                                    top: item.y,
                                    left: item.x,
                                    width: "11vw",
                                    transform: 'translate(-50%, -50%)',
                                }}
                            >
                                <div className="relative p-2" style={{
                                    width: "6.5vw",
                                    height: "6.5vw",
                                }}>
                                    <div className="h-full w-full bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                                        <FaGraduationCap className="text-white text-3xl" />
                                    </div>
                                    <button
                                        onClick={() => handleRemove(item.certificate_id!, true)}
                                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                        aria-label="Remove certificate"
                                    >
                                        <FaTrash size={12} />
                                    </button>
                                </div>
                            
                                <div
                                    className="mt-0 text-slate-700 text-[10px] lg:text:[10px] xl:text-base font-semibold text-center leading-none"
                                    style={{
                                        maxWidth: "11vw",
                                    }}
                                >
                                    Certificate
                                </div>
                            </div>
                        );
                    }
                    return null;
                })}
            </div>
        </div>
    </div>
  );
};

export default PathCanvasEditor;

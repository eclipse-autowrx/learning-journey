// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

'use client'

import { useRouter } from "next/navigation";
import CertificateScreen from "../atom/CertificateScreen";
import { useState } from "react"
import Popup from "../atom/Popup";
import { IoClose } from "react-icons/io5";
import BtnFullRounded from "../atom/BtnFullRounded";
import { FaLock, FaGraduationCap} from "react-icons/fa";
import MarkdownRender from "../atom/MarkdownRender";

import { saveStateCourseStarted } from "@/lib/frontend/course"

// Helper function to determine if path is completed
const isPathCompleted = (path, maps) => {
  if (!path?.required_course_ids || path.required_course_ids.length === 0) {
    return false;
  }

  // Get all mandatory courses with their names
  const mandatoryCourses = path.required_course_ids.map(courseId => {
    const mapItem = maps.find(map => map.course_id === courseId);
    const course = path.courses?.find(c => c._id === courseId);
    return {
      id: courseId,
      name: course?.name || 'Unknown Course',
      foundInMaps: !!mapItem,
      state: mapItem?.course?.context?.state || 'not_found'
    };
  });

  // Check completion status and collect unfinished courses
  const unfinishedCourses = [];
  const result = path.required_course_ids.every(courseId => {
    const course = path.courses?.find(c => c._id === courseId);
    
    if (!course) {
      unfinishedCourses.push({ id: courseId, name: 'Not found in path.courses', reason: 'not_in_path_courses' });
      return false;
    }
    const isCompleted = course.context?.state === 'completed';
    if (!isCompleted) {
      unfinishedCourses.push({
        id: courseId,
        name: course?.name || 'Unknown Course',
        currentState: course.context?.state || 'not_started',
        reason: 'not_completed'
      });
    }
    return isCompleted;
  });

  return result;
};



const PathCanvasLayout = ({ path, maps, onRequestUpdateProgress }) => {
  const router = useRouter();
  const [showCert, setShowCert] = useState(false)
  const [popupExternalLaunch, setPopupExternalLaunch] = useState(false)
  const [showMarkdownPopup, setShowMarkdownPopup] = useState(false)
  const [currentItem, setCurrentItem] = useState(null)

  const pathCompleted = isPathCompleted(path, maps);

  // Function to handle certificate click
  const handleCertificateClick = () => {
    if (pathCompleted) {
      setShowCert(true);
    }
  };

  return <div className="px-2 lg:px-4">
    <div className="relative w-full h-[560px] rounded-sm border-2 border-neutral-200"
      style={{
        backgroundImage: `url(${path.background_img})`,
        backgroundSize: "cover",
        backgroundPosition: "center"
      }}>

      <div className="z-0 w-full h-full left-0 top-0 opacity-50 bg-white"></div>

      {/* <div className="absolute top-6 left-6 z-20">
        <Link href="/">
          <TfiHome size={30} className="text-slate-700 hover:scale-110" />
        </Link>
      </div> */}

      <div className="absolute top-0 left-0 right-0 bottom-0 opacity-10 bg-white z-10"></div>

      {/* Certificate Screen */}
      {showCert && <CertificateScreen 
        requestClose={() => setShowCert(false)} 
      />}

      {/* External Launch Popup */}
      {popupExternalLaunch && currentItem && <Popup>
        <div className="pl-4 pr-2 py-2 flex justify-between items-center text-xl font-bold text-neutral-900 border-b border-neutral-200">
          Launch External Site

          <IoClose size={30} className="cursor-pointer hover:scale-110 text-neutral-900"
            onClick={() => setPopupExternalLaunch(false)} />
        </div>
        <div className="flex text-sm items-center justify-center mt-2 px-8 py-4">
          <p className="text-neutral-600 text-center">
            <span><i>You are about to be redirected to an external course at: </i></span>
            <div className="mt-2 text-neutral-900 break-all text-base">
              {currentItem.course?.extends?.external_link}
            </div>
          </p>
        </div>
        <div className="mt-4 mb-2 py-2 px-4 flex items-center justify-between">
          <div></div>
          <BtnFullRounded onClick={async () => {
            setPopupExternalLaunch(false)
            window.open(currentItem.course?.extends?.external_link, "_blank");
            if (onRequestUpdateProgress) onRequestUpdateProgress()

            if (currentItem.course?.state != 'completed') {
              await saveStateCourseStarted(currentItem.course)
              // Removed toast notification for path page
            }
          }}>
            Launch
          </BtnFullRounded>
        </div>
      </Popup>}

      {/* Markdown Popup */}
      {showMarkdownPopup && currentItem && <Popup>
        <div className="pl-4 pr-2 py-1 flex justify-between items-center text-lg font-bold text-neutral-700 border-b border-neutral-200">
          Content

          <IoClose size={24} className="cursor-pointer hover:scale-110 text-neutral-700"
            onClick={() => setShowMarkdownPopup(false)} />
        </div>
         <div className="p-4 max-h-96 overflow-y-auto">
           <MarkdownRender>
             {currentItem.popup_markdown_content || currentItem.markdown_content || 'No content available'}
           </MarkdownRender>
         </div>
      </Popup>}

      {maps && maps.map((item) => {
        if (item.course_id) {
          // Render course item
          const course = path.courses.find(c => c._id === item.course_id);
          return (
             <div
               key={`course-${item.course_id}`}
               className={`absolute flex flex-col items-center cursor-pointer hover:shadow-xl transform transition-all origin-center z-40
                 ${["locked"].includes(item.course?.state) && "opacity-50"}
                 ${["locked-highlight"].includes(item.course?.state) && "opacity-70"}
                 `}
               style={{
                 top: item.y,
                 left: item.x,
                 width: "11vw",
               }}
              onClick={async () => {
                if (item.course?.state === "locked") {
                  return;
                }

                if (item.course?.type == 'award') {
                  if (item.course?.context?.state === 'completed') {
                    setCurrentItem(item);
                    setShowCert(true);
                  }
                  return
                }

                if (item.course?.extends?.external_link) {
                  setCurrentItem(item);
                  setPopupExternalLaunch(true)
                  return;
                }

                if (!item.course || !item.course?.slug) {
                  // Removed toast notification for path page
                  return;
                }

                // Start the course if not already started
                if (!item.course?.context?.state || item.course?.context?.state === 'not_started') {
                  await saveStateCourseStarted(item.course)
                  // Removed toast notification for path page
                }
                router.push(
                  `/path/${path.slug}/course/${item.course?.slug}`
                );
              }}
            >
              <div className="relative" style={{
                width: "5.5vw",
                height: "5.5vw",
              }}>
                <img
                  src={item.course?.icon}
                  className="absolute h-full w-full top-0 left-0 z-40 object-contain"
                />
                {item.course?.top_icon && <img src={item.course?.top_icon}
                  className="absolute top-[32%] left-[35%] z-50 w-[30%] h-[30%]" />}
              </div>

              <div
                className="mt-0 text-slate-700 text-[clamp(11px,0.8vw,16px)] font-semibold text-center leading-[1.05]"
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
               className="absolute flex flex-col items-center cursor-pointer hover:shadow-xl transform transition-all origin-center z-50"
               style={{
                 top: item.y,
                 left: item.x,
                 width: "11vw",
               }}
               onClick={handleCertificateClick}
             >
              <div className="relative p-2" style={{
                width: "5.5vw",
                height: "5.5vw",
              }}>
                <div className={`h-full w-full bg-gradient-to-br from-accent-400 to-accent-600 rounded-full
                  flex items-center justify-center relative ${pathCompleted ? "" : "opacity-30"}`}>
                  <div className="text-white text-3xl">
                    {pathCompleted ? <FaGraduationCap className="text-white text-[2.2vw]" /> : <FaLock className="text-white text-2xl" />}
                  </div>
                </div>
              </div>

              <div
                className="mt-0 text-slate-700 text-[clamp(11px,0.8vw,16px)] font-semibold text-center leading-none"
                style={{
                  maxWidth: "11vw",
                }}
              >
                Certificate
              </div>
            </div>
          );
        } else if (item.type === 'text_markdown') {
          // Render text_markdown item
          return (
             <div
               key={`markdown-${item.id || item.x}-${item.y}`}
               className="absolute cursor-pointer transform transition-all origin-center z-10"
               style={{
                 top: item.y,
                 left: item.x,
                 backgroundColor: item.background_color || 'transparent',
                 padding: '0px 8px',
                 borderRadius: '4px',
                 width: item.width || '200px',
                 maxWidth: item.width || '200px',
                 minHeight: item.height || 'auto',
                 border: item.border_style === 'none' ? 'none' : 
                         item.border_style === 'solid' ? '2px solid #6b728066' :
                         item.border_style === 'dash' ? '2px dashed #6b728066' :
                         item.border_style === 'dot' ? '2px dotted #6b728066' : 'none',
               }}
               onClick={() => {
                 // setCurrentItem(item);
                 // setShowMarkdownPopup(true);
               }}
               title="Markdown Node"
             >
              <div className="text-sm text-gray-800">
                <MarkdownRender>
                  {item.markdown_content || 'Markdown content'}
                </MarkdownRender>
              </div>
            </div>
          );
        } else if (item.type === 'icon') {
          // Render icon item
          return (
             <div
               key={`icon-${item.id || item.x}-${item.y}`}
               className="absolute cursor-pointer transform transition-all origin-center z-[100]"
               style={{
                 top: item.y,
                 left: item.x,
               }}
               onClick={() => {
                 if (item.link_url) {
                   window.open(item.link_url, "_blank");
                 } else if (item.popup_markdown_content) {
                   setCurrentItem(item);
                   setShowMarkdownPopup(true);
                 }
               }}
               title={item.hover_content || 'Content'}
             >
              <div
                className="relative"
                style={{
                  width: item.width || '40px',
                  height: item.height || '40px',
                }}
              >
                {item.icon_url ? (
                  <img
                    src={item.icon_url}
                    alt={item.hover_content || 'Icon'}
                    className="w-full h-full object-contain hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-300 rounded flex items-center justify-center text-gray-600 text-xs">
                    Icon
                  </div>
                )}
              </div>
            </div>
          );
        }
        return null;
      })}
    </div>
  </div>
}

export default PathCanvasLayout
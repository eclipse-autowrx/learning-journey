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
import { FaLock } from "react-icons/fa";

import { saveStateCourseStarted, saveStateCourseCompleted } from "@/lib/frontend/course"
import { showToast } from "@/lib/utils/notifications";

// Helper function to determine if path is completed
const isPathCompleted = (path, maps) => {
  if (!path?.required_course_ids || path.required_course_ids.length === 0) {
    return false;
  }
  
  // Check if all required courses are completed
  return path.required_course_ids.every(courseId => {
    const mapItem = maps.find(map => map.course_id === courseId);
    if (!mapItem?.course) return false;
    return mapItem.course.context?.state === 'completed';
  });
};

const CourseNode = ({ path, item, onRequestUpdateProgress, maps }) => {
  const router = useRouter();
  const [showCert, setShowCert] = useState(false)
  const [popupExternalLaunch, setPopupExternalLaunch] = useState(false)

  if (!path || !item) return <></>
  
  // Check if this is a certificate item
  const isCertificate = item.certificate_id;
  const pathCompleted = isPathCompleted(path, maps);
  
  return <>
    {showCert && <CertificateScreen image={item.course?.image} requestClose={() => setShowCert(false)} />}

    {popupExternalLaunch && <Popup>
      <div className="pl-4 pr-2 py-2 flex justify-between items-center text-xl font-bold text-black border-b border-slate-200">
        Launch External Site

        <IoClose size={30} className="cursor-pointer hover:scale-110 text-black"
          onClick={() => setPopupExternalLaunch(false)} />
      </div>
      <div className="flex text-sm items-center justify-center mt-2 px-8 py-4">
        <p className="text-gray-600 text-center">
          <span><i>You are about to be redirected to an external course at: </i></span>
          <div className="mt-2 text-black-600 break-all text-base text-black">
            {item.course?.extends?.external_link}
          </div>
        </p>
      </div>
      <div className="mt-4 mb-2 py-2 px-4 flex items-center justify-between">
        <div></div>
        <BtnFullRounded onClick={async () => {
          setPopupExternalLaunch(false)
          window.open(item.course?.extends?.external_link, "_blank");
          if (onRequestUpdateProgress) onRequestUpdateProgress()

          if (item.course?.state != 'completed') {
            await saveStateCourseStarted(item.course)
            showToast.success(`Course "${item.course?.name}" marked as completed!`)
          }
        }}>
          Launch
        </BtnFullRounded>
      </div>
    </Popup>}

    <div
      className={`absolute flex flex-col items-center cursor-pointer hover:scale-110 z-20 
            ${["locked"].includes(item.course?.state) && "opacity-50"}
            ${["locked-highlight"].includes(item.course?.state) && "opacity-70"}
            `}
      style={{
        top: item.y,
        left: item.x,
        width: "11vw",
        transform: "translate(-50%, -50%)",
      }}
      onClick={async () => {
        // Handle certificate items
        if (isCertificate) {
          if (pathCompleted) {
            setShowCert(true);
          } else {
            showToast.info("Complete all required courses to unlock the certificate!");
          }
          return;
        }

        if (item.course?.state === "locked") {
          return;
        }

        if (item.course?.type == 'award') {
          if (item.course?.context?.state === 'completed') {
            setShowCert(true);
          }
          return
        }

        if (item.course?.extends?.external_link) {
          setPopupExternalLaunch(true)
          return;
        }

        if (!item.course || !item.course?.slug) {
          showToast.warning("Course is not available now!");
          return;
        }

        // Start the course if not already started
        if (!item.course?.context?.state || item.course?.context?.state === 'not_started') {
          await saveStateCourseStarted(item.course)
          showToast.info(`Started course: ${item.course?.name}`)
        }
        router.push(
          `/path/${path.slug}/course/${item.course?.slug}`
        );
      }}
    >

      <div className="relative" style={{
        width: "6.5vw",
        height: "6.5vw",
      }}>
        {isCertificate ? (
          // Certificate item
          <div className="h-full w-full bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center relative">
            <div className="text-white text-3xl">
              🎓
            </div>
            {/* Lock icon overlay when path is not completed */}
            {!pathCompleted && (
              <div className="absolute inset-0 bg-black bg-opacity-60 rounded-full flex items-center justify-center">
                <FaLock className="text-white text-2xl" />
              </div>
            )}
          </div>
        ) : (
          // Course item
          <>
            <img
              src={item.course?.icon}
              className="absolute h-full w-full top-0 left-0 z-0 object-contain"
            />
            {item.course?.top_icon && <img src={item.course?.top_icon}
              className="absolute top-[32%] left-[35%] z-10 w-[30%] h-[30%]" />}
          </>
        )}
      </div>

      <div
        className="mt-0 text-slate-700 text-[10px] lg:text:[10px] xl:text-base 
                      font-semibold text-center leading-none"
        style={{
          maxWidth: "11vw",
        }}
      >
        {isCertificate ? "Certificate" : item.course?.name}
      </div>
    </div>
  </>
}

const PathCanvasLayout = ({ path, maps, onRequestUpdateProgress }) => {
  const router = useRouter();

  return <div className="px-2 lg:px-4">
    <div className="relative w-full h-[560px] rounded-sm border-2 border-gray-200"
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
      {maps && maps.map((item, index) => <CourseNode key={index} path={path} item={item} onRequestUpdateProgress={onRequestUpdateProgress} maps={maps} />)}
    </div>
  </div>
}

export default PathCanvasLayout
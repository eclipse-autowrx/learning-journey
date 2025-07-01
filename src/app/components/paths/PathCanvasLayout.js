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

import { saveStateCourseStarted, saveStateCourseCompleted } from "@/lib/frontend/course"

const CourseNode = ({ path, item, onRequestUpdateProgress }) => {
  const router = useRouter();
  const [showCert, setShowCert] = useState(false)
  const [popupExternalLaunch, setPopupExternalLaunch] = useState(false)

  if (!path || !item) return <></>
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
            await saveStateCourseCompleted(item.course)
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
        width: "11wv",
      }}
      onClick={async () => {

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

        router.push(
          `/path/${path.slug}/course/${item.course?.slug}`
        );
      }}
    >

      <div className="relative" style={{
        width: "6.5vw",
        height: "6.5vw",
      }}>

        <img
          src={item.course?.icon}
          className="absolute h-full w-full top-0 left-0 z-0 object-contain"
        />
        {item.course?.top_icon && <img src={item.course?.top_icon}
          className="absolute top-[32%] left-[35%] z-10 w-[30%] h-[30%]" />}
      </div>

      <div
        className="mt-0 text-slate-700 text-[9px] lg:text:[10px] xl:text-base 
                      font-semibold text-center leading-none"
        style={{
          maxWidth: "11vw",
        }}
      >
        {item.course?.name}
      </div>
    </div>
  </>
}

const PathCanvasLayout = ({ path, maps, onRequestUpdateProgress }) => {
  const router = useRouter();

  return <div className="px-2 lg:px-4">
    <div className="relative w-full h-[560px] rounded-sm border-6 border-gray-200"
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
      {maps && maps.map((item, index) => <CourseNode key={index} path={path} item={item} onRequestUpdateProgress={onRequestUpdateProgress} />)}
    </div>
  </div>
}

export default PathCanvasLayout
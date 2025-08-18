// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

import HomeContent from "./components/screen/HomeContent";
import PathList from "./components/screen/PathList";
import { FaDiamond } from "react-icons/fa6";

const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    // new winston.transports.Console(), // Output to console
    new winston.transports.File({ filename: 'server.log' }), // Output to a file
  ],
});

export default async function Home() {
  return (
    <div className="bg-white text-slate-600 text-2xl p-0
        h-full w-full flex flex-col gap-4">

      <div className="w-full bg-[#46499E] text-white flex flex-col items-center justify-center pt-8 pb-8 px-6 lg:px-12">
        <div className="container h-full flex sm:flex-row flex-col gap-6">
          <div className="flex-3 px-2">
            <div className="text-2xl sm:text-2xl lg:text-4xl font-bold  pt-8 text-left">
              Your SDV journey starts here.
            </div>
            <div className="text-sm sm:text-md leading-tight font-bold text-left pt-4 mt-4 flex flex-col gap-2">
              <div className="flex items-center">
                <FaDiamond size={20} className="mr-8 text-[#EF60A3] min-w-4" /> 
                From zero to hero</div>
              <div className="flex items-center">
                <FaDiamond size={20} className="mr-8 text-[#EF60A3] min-w-4" /> 
                Practice in our virtual lab and seamlessly transition to physical kit</div>
              <div className="flex items-center">
                <FaDiamond size={20} className="mr-8 text-[#EF60A3] min-w-4" /> 
                Track your progress and get certificates</div>
              <div className="flex items-center">
                <FaDiamond size={20} className="mr-8 text-[#EF60A3] min-w-4" /> 
                Stay in the loop with our community</div>
            </div>
          </div>

          <div className="flex-2 px-2 grid place-items-center">
            <img className="w-[60vw] sm:w-[40vw]" src="/imgs/sdv.png" />
          </div>

        </div>

        <div className="container h-full flex flex-col gap-2 mt-8">
          <div className="w-full text-center">How do you want to start?</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-2 text-xs sm:text-sm lg:text-md xl:text-lg text-center leading-tight">
            <a href="#pathList">
              <div className="flex-1 rounded-lg bg-white flex flex-col items-center justify-center px-2 py-2 cursor-pointer hover:scale-105">
                <img className="h-28 p-4" src="/imgs/learning_path_icon.png" />
                <div className="text-[#46499E] font-bold px-4 py-1">I want to follow a guided path</div>
              </div>
            </a>

            <div className="flex-1 rounded-lg bg-white flex flex-col items-center justify-center px-2 py-2 cursor-pointer hover:scale-105">
              <img className="h-28" src="/imgs/edit_path_icon.jpg" />
              <div className="text-[#46499E] font-bold px-4 py-1">I want to design a new path</div>
            </div>

            <div className="flex-1 rounded-lg bg-white flex flex-col items-center justify-center px-2 py-2 cursor-pointer hover:scale-105">
              <img className="h-28" src="/imgs/hackathon.png" />
              <div className="text-[#46499E] font-bold px-4 py-1">I want to plan a hackathon</div>
            </div>

            <a href="#dreamkit">
              <div className="flex-1 rounded-lg bg-white flex flex-col items-center justify-center px-2 py-2 cursor-pointer hover:scale-105">
                <img className="h-28" src="/imgs/dreamKit.png" />
                <div className="text-[#46499E] font-bold px-4 py-1">I want to work with dreamKIT</div>
              </div>
            </a>
          </div>
        </div>

      </div>

      <div>
        {/* <PathList/> */}
        <HomeContent />
      </div>

    </div>
  );
}



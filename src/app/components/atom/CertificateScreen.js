// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

import { IoClose } from "react-icons/io5";
import { FaLinkedin } from "react-icons/fa6";
import { FaFacebookSquare } from "react-icons/fa";

const CertificateScreen = ({image, path, requestClose}) => {
  return (
    <div className="!fixed !top-0 !left-0 !right-0 !bottom-0 bg-[#00000088] shadow-lg rounded-lg p-4 z-50 grid place-items-center">
        <div className="w-[90vw] max-w-[1024px] flex flex-col items-center justify-center p-4">
            <div className="w-full flex items-center mb-2">
                <div className="grow flex items-center text-lg text-white space-x-2">
                    Share: 
                    <FaLinkedin className="ml-1 text-white cursor-pointer hover:scale-110" 
                        size={30}
                        onClick={() => {
                        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href+"/cert")}`, '_blank');
                    }} />

                    <FaFacebookSquare className="text-white cursor-pointer hover:scale-110" 
                        size={30}
                        onClick={() => {
                            window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href+"/cert")}`, '_blank');
                        }}
                        />

                </div>
                <IoClose size={30} className="cursor-pointer hover:scale-110 text-white" onClick={requestClose} />
            </div>
            <img className="w-full" src={image} alt="Certificate" />
        </div>
    </div>
  );
}

export default CertificateScreen;
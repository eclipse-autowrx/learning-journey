// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

import { IoClose } from "react-icons/io5";
import { FaSpinner } from "react-icons/fa";

const CertificateScreen = ({requestClose}) => {
  return (
    <div className="!fixed !top-0 !left-0 !right-0 !bottom-0 bg-[#00000088] shadow-lg rounded-lg p-4 z-[100] grid place-items-center">
        <div className="w-[90vw] max-w-[600px] flex flex-col items-center justify-center p-4">
            <div className="w-full flex items-center mb-6">
                <div className="grow"></div>
                <IoClose size={30} className="cursor-pointer hover:scale-110 text-white" onClick={requestClose} />
            </div>
            
            <div className="flex flex-col items-center justify-center p-8 bg-white rounded-lg">
                <FaSpinner className="animate-spin text-4xl text-secondary-600 mb-4" />
                <p className="text-xl text-gray-700 mb-2 font-semibold">Certificate Processing</p>
                <p className="text-sm text-gray-500 text-center">
                    Your certificate is being processed. We will notify you later when it's ready.
                </p>
                <button 
                    onClick={requestClose}
                    className="mt-6 px-6 py-2 bg-secondary-600 text-white rounded hover:bg-secondary-700 transition-colors"
                >
                    Close
                </button>
            </div>
        </div>
    </div>
  );
}

export default CertificateScreen;
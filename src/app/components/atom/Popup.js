// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

'use client'

import { useState, useEffect } from "react"

const Popup = ({children}) => {
    return <div className="fixed w-screen h-screen z-50 left-0 top-0 bg-[#00000048] grid place-items-center">
        <div className="bg-white rounded-xl shadow-lg drop-shadow-lg w-fit h-fit min-w-[360px] min-h-[200px]">
            {children}
        </div>
    </div>
}

export default Popup
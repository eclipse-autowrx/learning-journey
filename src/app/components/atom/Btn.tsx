// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

// Create button component with solid and outline variant tailwind style

interface ButtonProps {
    children?: any
    variant?: string    // default is solid, outlined, 
  }

export default function Btn({ children, variant }: ButtonProps) {
    return (
        <button
            className={`inline-flex items-center px-4 py-2 hover:opacity-70
                rounded-xl shadow-sm text-lg font-bold text-white bg-[#004F70]
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-600
                border-2 border-gray-800
                 ${variant === "outlined" ? "!bg-transparent !text-[#004F70] !border-[#004F70]" : ""}
                 ${variant === "disabled" ? "!bg-gray-300 !text-gray-400 !border-gray-400 cursor-default hover:opacity-100" : ""}
                `
            }
        >
            {children}
        </button>
    );
}
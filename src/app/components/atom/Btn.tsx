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
    variant?: string    // default is solid, outlined, disabled, link
    onClick?: () => void
    type?: 'button' | 'submit' | 'reset'
    disabled?: boolean
  }

export default function Btn({ children, variant="solid", onClick, type="button", disabled=false }: ButtonProps) {
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`inline-flex items-center px-4 py-2 hover:opacity-70
                rounded-lg shadow-none text-sm font-semibold text-white bg-primary-600
                !cursor-pointer
                 ${variant === "solid" ? "bg-primary-600 border-none text-white !cursor-pointer" : ""}
                 ${variant === "outlined" ? "!bg-transparent !text-primary-600 !border-primary-600" : ""}
                 ${(variant === "disabled" || disabled) ? "!bg-neutral-300 !text-neutral-400 !border-neutral-400 !cursor-default hover:opacity-100" : ""}
                 ${variant === "link" ? "!bg-transparent rounded !text-primary-600 !border-transparent !shadow-none hover:!text-primary-700 hover:!bg-primary-50 !text-sm !py-1 hover:!underline" : ""}
                `
            }
        >
            {children}
        </button>
    );
}
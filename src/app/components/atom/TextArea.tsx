// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

// Create react textarea component with tailwind style
import Label from "./Label";

interface TextAreaProps {
    label?: string;
    placeholder?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void; // Specify the event type
}

export default function TextArea({ label, placeholder, value, onChange }: TextAreaProps) {
    return (
        <div className="w-full">
            {label && <Label>{label}</Label>}
            <textarea
                placeholder={placeholder}
                value={value}
                onChange={onChange} // This will now have the correct type
                className="min-h-[100px] block w-full px-3 py-2 border border-gray-300 
                    rounded-md shadow-sm focus:outline-none focus:ring-primary-500 
                    focus:border-primary-500 sm:text-sm"
            />
        </div>
    );
}

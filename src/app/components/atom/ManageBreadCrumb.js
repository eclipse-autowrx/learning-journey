// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT
import Link from "next/link";
import UserBadge from '@/app/components/atom/UserBadge';

const ManageBreadCrumb = ({ items, rightSlot }) => {
    const processLabel = (label) => {
        if (!label) return 'unname';
        const max_char = 50;
        if (label.length > max_char) {
            return label.slice(0, max_char) + '...';
        }
        return label;
    };

    return (
        <div className="px-6 py-2 w-full flex flex-row items-center text-white text-sm font-semibold bg-green-600">
            <div className="flex flex-row items-center">
                <Link href="/" className="hover:underline">Home</Link>
                <span className="mx-2">/</span>
                <Link href="/manage" className="hover:underline">Management</Link>
                {items && items.map((item, index) => (
                    <div key={index} className="flex flex-row items-center">
                        <span className="mx-2">/</span>
                        {item.link ? (
                            <Link href={item.link} className="hover:underline">{processLabel(item.label)}</Link>
                        ) : (
                            <span className="font-normal">{processLabel(item.label)}</span>
                        )}
                    </div>
                ))}
            </div>
            <div className="ml-auto">
                {rightSlot ?? (<UserBadge align="right" variant="transparent" />)}
            </div>
        </div>
    );
};

export default ManageBreadCrumb;

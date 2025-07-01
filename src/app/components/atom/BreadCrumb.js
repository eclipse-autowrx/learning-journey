// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

/*
    Admin can change the label of the home link in the breadcrumb via BREADCRUMB_CONFIG
    Example:
    config: {
        "HOME_LABEL": "Your Journey"
    }
*/

import Link from "next/link";

const BreadCrumb = async ({ items }) => {

    let config = {
        "HOME_LABEL": "Home"
    }

    try {
        // TODO: implement later
        // config = getSiteConfig('BREADCRUMB_CONFIG')
    } catch (error) {
        console.log('Error fetching BREADCRUMB_CONFIG:', error)
    }

    const processLabel = (label) => {
        if (!label) return 'unname'
        const max_char = 50
        if (label.length > max_char) {
            return label.slice(0, max_char) + '...'
        }
        return label
    }

    return (
        <div className="px-4 py-1 w-full flex flex-row items-center text-white text-sm font-semibold bg-[#58823C]">
            <div className="flex flex-row items-center">
                <Link href="/" className="hover:underline">{(config && config["HOME_LABEL"]) || 'Home'}</Link>
                {items && items.map((item, index) => (
                    <div key={index} className="flex flex-row items-center">
                        <span className="mx-2">/</span>
                        <Link href={item.link || ''} className="hover:underline">{processLabel(item.label)}</Link>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default BreadCrumb;
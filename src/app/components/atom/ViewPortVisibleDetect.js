// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT


'use client'

import { useEffect, useRef } from "react"

const ViewportVisibleDetect = ({ onVisible, children }) => {
    const ref = useRef(null);

    useEffect(() => {
        const handleIntersection = (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    if (onVisible) {
                        onVisible();
                    }
                }
            });
        };

        const observer = new IntersectionObserver(handleIntersection, {
            root: null,
            threshold: 0.8
        });

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => {
            if (ref.current) {
                observer.unobserve(ref.current);
            }
        };
    }, [onVisible]);

    return <div ref={ref}>{children}</div>;
};

export default ViewportVisibleDetect
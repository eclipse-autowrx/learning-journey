
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
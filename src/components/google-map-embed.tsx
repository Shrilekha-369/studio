'use client';

import { useState, useEffect } from 'react';
import { Skeleton } from './ui/skeleton';

export function GoogleMapEmbed() {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        return <Skeleton className="w-full h-full" />;
    }

    return (
        <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3887.793212820604!2d77.67344066609483!3d12.985073995684935!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae11af6c4fcc29%3A0xc4727cddd5407567!2sOne%20Fitness%20Studio!5e0!3m2!1sen!2sin!4v1762072846866!5m2!1sen!2sin" 
            width="100%" 
            height="100%" 
            style={{ border: 0 }} 
            allowFullScreen={true}
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
    )
}

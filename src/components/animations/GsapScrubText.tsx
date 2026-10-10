'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface GsapScrubTextProps {
  text: string;
  className?: string;
}

export default function GsapScrubText({ text, className = '' }: GsapScrubTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const words = gsap.utils.toArray('.scrub-word');
      
      gsap.fromTo(
        words,
        { opacity: 0.1, color: '#94a3b8' }, // Start dim
        {
          opacity: 1,
          color: '#0f172a', // End bright/dark
          stagger: 0.1,
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 80%',
            end: 'bottom 50%',
            scrub: true,
            markers: false
          }
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, [text]);

  return (
    <div ref={containerRef} className={`flex flex-wrap ${className}`}>
      {text.split(' ').map((word, i) => (
        <span key={i} className="scrub-word mr-2 md:mr-3 mb-1 inline-block transition-colors">
          {word}
        </span>
      ))}
    </div>
  );
}

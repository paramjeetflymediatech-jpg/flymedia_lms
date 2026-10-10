'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface GsapParallaxTextProps {
  text: string;
  className?: string;
  direction?: 'left' | 'right';
  speed?: number;
}

export default function GsapParallaxText({ 
  text, 
  className = '', 
  direction = 'left',
  speed = 1
}: GsapParallaxTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const moveDistance = direction === 'left' ? -200 * speed : 200 * speed;
      
      gsap.to(textRef.current, {
        xPercent: moveDistance,
        ease: 'none',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
        }
      });
    }, containerRef);

    return () => ctx.revert();
  }, [direction, speed]);

  return (
    <div ref={containerRef} className={`overflow-hidden whitespace-nowrap pointer-events-none select-none ${className}`}>
      <div ref={textRef} className="inline-block will-change-transform font-black tracking-tighter opacity-5">
        {text} {text} {text} {text}
      </div>
    </div>
  );
}

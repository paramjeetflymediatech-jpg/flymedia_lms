'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface GsapHorizontalScrollProps {
  children: React.ReactNode;
}

export default function GsapHorizontalScroll({ children }: GsapHorizontalScrollProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const container = containerRef.current;
      const scrollWrapper = scrollWrapperRef.current;
      if (!container || !scrollWrapper) return;

      // Get total width to scroll
      function getScrollAmount() {
        let containerWidth = scrollWrapper?.scrollWidth || 0;
        return -(containerWidth - window.innerWidth);
      }

      const tween = gsap.to(scrollWrapper, {
        x: getScrollAmount,
        ease: 'none',
        scrollTrigger: {
          trigger: container,
          start: 'top top',
          end: () => `+=${getScrollAmount() * -1}`,
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
        }
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="overflow-hidden w-full bg-slate-950">
      <div 
        ref={scrollWrapperRef} 
        className="flex w-fit items-center h-screen"
      >
        {children}
      </div>
    </div>
  );
}

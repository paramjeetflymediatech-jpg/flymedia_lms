'use client';

import { ReactNode, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface GsapRevealProps {
  children: ReactNode;
  className?: string;
  animation?: 'slideUp' | 'slideLeft' | 'slideRight' | 'zoomIn' | 'fade';
  delay?: number;
  duration?: number;
}

export default function GsapReveal({
  children,
  className = '',
  animation = 'slideUp',
  delay = 0,
  duration = 0.8
}: GsapRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let fromVars: gsap.TweenVars = { opacity: 0 };
    
    switch (animation) {
      case 'slideUp':
        fromVars = { ...fromVars, y: 50 };
        break;
      case 'slideLeft':
        fromVars = { ...fromVars, x: -50 };
        break;
      case 'slideRight':
        fromVars = { ...fromVars, x: 50 };
        break;
      case 'zoomIn':
        fromVars = { ...fromVars, scale: 0.8 };
        break;
      case 'fade':
      default:
        // just opacity
        break;
    }

    gsap.fromTo(
      el,
      fromVars,
      {
        opacity: 1,
        x: 0,
        y: 0,
        scale: 1,
        duration: duration,
        delay: delay,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play none none none',
          // markers: false,
        },
      }
    );

    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, [animation, delay, duration]);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
}

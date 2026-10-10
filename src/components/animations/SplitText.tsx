'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface SplitTextProps {
  text: string;
  className?: string;
  delay?: number;
  type?: 'chars' | 'words' | 'lines';
}

export default function SplitText({ text, className = '', delay = 0, type = 'words' }: SplitTextProps) {
  const containerRef = useRef<HTMLSpanElement>(null);
  
  // Simple word/char split
  const elements = type === 'chars' ? text.split('') : text.split(' ');

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Find all the child spans (words or chars)
      const targets = gsap.utils.toArray('.split-element');
      
      gsap.fromTo(
        targets,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: 'power3.out',
          stagger: type === 'chars' ? 0.02 : 0.05,
          delay: delay,
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 90%',
            toggleActions: 'play none none none',
          }
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, [text, type, delay]);

  return (
    <span
      ref={containerRef}
      className={`flex flex-wrap justify-center ${className}`}
    >
      {elements.map((element, index) => (
        <span
          key={index}
          className={`split-element inline-block ${type === 'chars' ? '' : 'mr-[0.25em]'}`}
          style={{ opacity: 0 }} // Start hidden to prevent flash of unstyled content
        >
          {element === ' ' ? '\u00A0' : element}
        </span>
      ))}
    </span>
  );
}

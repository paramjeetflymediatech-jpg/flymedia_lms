'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface ScrollRevealProps {
  children: ReactNode;
  animation?: 'fade' | 'slideUp' | 'slideLeft' | 'slideRight' | 'scaleUp';
  duration?: number;
  delay?: number;
  className?: string;
  viewportAmount?: number | 'some' | 'all';
}

export default function ScrollReveal({
  children,
  animation = 'slideUp',
  duration = 0.6,
  delay = 0,
  className = '',
  viewportAmount = 0.2
}: ScrollRevealProps) {
  const getVariants = () => {
    switch (animation) {
      case 'slideUp':
        return {
          hidden: { opacity: 0, y: 50 },
          visible: { opacity: 1, y: 0 }
        };
      case 'slideLeft':
        return {
          hidden: { opacity: 0, x: -50 },
          visible: { opacity: 1, x: 0 }
        };
      case 'slideRight':
        return {
          hidden: { opacity: 0, x: 50 },
          visible: { opacity: 1, x: 0 }
        };
      case 'scaleUp':
        return {
          hidden: { opacity: 0, scale: 0.8 },
          visible: { opacity: 1, scale: 1 }
        };
      case 'fade':
      default:
        return {
          hidden: { opacity: 0 },
          visible: { opacity: 1 }
        };
    }
  };

  return (
    <motion.div
      variants={getVariants()}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: viewportAmount as any }}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

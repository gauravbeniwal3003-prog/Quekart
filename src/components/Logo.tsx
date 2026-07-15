import React from 'react';
import { motion } from 'motion/react';

interface LogoProps {
  animated?: boolean;
  className?: string;
  width?: number | string;
  height?: number | string;
}

export default function Logo({ animated = true, className = '', width = 48, height = 48 }: LogoProps) {
  const blue = "#17436B";
  const gold = "#C49B48";

  const cartAnimationProps = animated ? {
    animate: { y: [-2, 2, -2] },
    transition: { duration: 3, ease: "easeInOut", repeat: Infinity }
  } : {};
  
  const innerContent = (
    <>
      {/* Left Side (Blue) */}
      <g stroke={blue} strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none">
        {/* Handle & Main Frame Left */}
        <path d="M 12 22 L 25 22 L 32 52 L 50 52" />
        <path d="M 32 52 C 32 64, 16 64, 25 70 L 50 70" />
        {/* Basket Top Left */}
        <path d="M 27 32 L 50 32" />
        {/* Vertical Lines Left */}
        <path d="M 35 32 L 38 52" />
        <path d="M 43 32 L 44 52" />
        {/* Horizontal Lines Left */}
        <path d="M 29 39 L 50 39" />
        <path d="M 30 46 L 50 46" />
        {/* Wheel Left */}
        <circle cx="32" cy="82" r="5" fill={blue} stroke="none" />
        <circle cx="32" cy="82" r="2" fill="white" stroke="none" />
      </g>

      {/* Right Side (Gold) */}
      <g stroke={gold} strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none">
        {/* Main Frame Right */}
        <path d="M 50 52 L 72 52 L 79 32 L 50 32" />
        <path d="M 50 70 L 68 70" />
        {/* Vertical Lines Right */}
        <path d="M 57 32 L 56 52" />
        <path d="M 65 32 L 64 52" />
        {/* Horizontal Lines Right */}
        <path d="M 50 39 L 76 39" />
        <path d="M 50 46 L 74 46" />
        {/* Wheel Right */}
        <circle cx="64" cy="82" r="5" fill={gold} stroke="none" />
        <circle cx="64" cy="82" r="2" fill="white" stroke="none" />
      </g>
      
      {/* Arrow (Gold) with white stroke for cutout effect */}
      <g>
        <path d="M 42 62 Q 62 52 82 28" fill="none" stroke="white" strokeWidth="10" strokeLinecap="round" />
        <path d="M 42 62 Q 62 52 82 28" fill="none" stroke={gold} strokeWidth="5.5" strokeLinecap="round" />
        <polygon points="72,28 92,18 85,38" fill="white" stroke="white" strokeWidth="4" strokeLinejoin="round" />
        <polygon points="74,27 90,20 84,36" fill={gold} stroke={gold} strokeWidth="2" strokeLinejoin="round" />
      </g>
    </>
  );

  return (
    <svg 
      width={width} 
      height={height} 
      viewBox="0 0 100 100" 
      className={className} 
      xmlns="http://www.w3.org/2000/svg"
    >
      {animated ? (
        <motion.g {...cartAnimationProps} style={{ originX: 0.5, originY: 0.5 }}>
          {innerContent}
        </motion.g>
      ) : (
        <g>
          {innerContent}
        </g>
      )}
    </svg>
  );
}

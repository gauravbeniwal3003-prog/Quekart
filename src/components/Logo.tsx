import React from 'react';
import { motion } from 'motion/react';

export const LOGO_IMAGE_URL = "https://i.ibb.co/Rt6vbFm/file-0000000005187206b6cd29703bc3b791.png";

interface LogoProps {
  animated?: boolean;
  className?: string;
  width?: number | string;
  height?: number | string;
}

export default function Logo({ animated = true, className = '', width, height }: LogoProps) {
  const innerContent = (
    <img 
      src={LOGO_IMAGE_URL}
      alt="Quekart Logo"
      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
      referrerPolicy="no-referrer"
    />
  );

  return (
    <div style={{ width, height, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }} className={className}>
      {animated ? (
        <motion.div
          animate={{ scale: [0.98, 1.02, 0.98] }}
          transition={{ duration: 4, ease: "easeInOut", repeat: Infinity }}
          style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          {innerContent}
        </motion.div>
      ) : (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {innerContent}
        </div>
      )}
    </div>
  );
}

interface QueKartLogoTextProps {
  className?: string;
  sizeClassName?: string;
}

export function QueKartLogoText({ className = '', sizeClassName = 'text-lg sm:text-xl md:text-2xl' }: QueKartLogoTextProps) {
  return (
    <span className={`font-display font-semibold tracking-normal flex items-center select-none ${sizeClassName} ${className}`}>
      <span style={{ color: '#143C6B' }}>Que</span>
      <span style={{ color: '#C89D1F' }}>Kart</span>
    </span>
  );
}

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animated?: boolean;
  className?: string;
  onClick?: () => void;
  layout?: 'row' | 'col';
  showText?: boolean;
  textClassName?: string;
  id?: string;
}

export function BrandLogo({
  size = 'md',
  animated = true,
  className = '',
  onClick,
  layout = 'row',
  showText = true,
  textClassName = '',
  id
}: BrandLogoProps) {
  const iconSizeClasses = {
    sm: 'h-7 w-7',
    md: 'h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10',
    lg: 'h-10 w-10 sm:h-11 sm:w-11 md:h-12 md:w-12',
    xl: 'h-14 w-14 sm:h-16 sm:w-16 md:h-20 md:w-20'
  }[size];

  const textSizeClasses = {
    sm: 'text-base sm:text-lg',
    md: 'text-lg sm:text-xl md:text-2xl',
    lg: 'text-2xl sm:text-2.5xl md:text-3xl font-extrabold',
    xl: 'text-3xl sm:text-4xl md:text-5xl font-black'
  }[size];

  return (
    <div
      id={id}
      onClick={onClick}
      className={`flex ${layout === 'col' ? 'flex-col items-center justify-center gap-1.5' : 'flex-row items-center gap-2 sm:gap-2.5 justify-center'} ${onClick ? 'cursor-pointer select-none' : ''} ${className}`}
    >
      <Logo
        className={`${iconSizeClasses} flex-shrink-0 transition-transform duration-200 ${onClick ? 'hover:scale-105 active:scale-95' : ''}`}
        animated={animated}
      />
      {showText && (
        <QueKartLogoText sizeClassName={`${textSizeClasses} ${textClassName}`} />
      )}
    </div>
  );
}


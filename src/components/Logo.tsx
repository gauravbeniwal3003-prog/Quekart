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
    md: 'h-9 w-9 sm:h-10 sm:w-10 md:h-11 md:w-11 lg:h-12 lg:w-12',
    lg: 'h-12 w-12 sm:h-14 sm:w-14',
    xl: 'h-16 w-16 sm:h-20 sm:w-20'
  }[size];

  const textSizeClasses = {
    sm: 'text-base sm:text-lg',
    md: 'text-lg sm:text-xl md:text-2xl',
    lg: 'text-2xl sm:text-3xl',
    xl: 'text-3xl sm:text-4xl'
  }[size];

  return (
    <div
      id={id}
      onClick={onClick}
      className={`flex ${layout === 'col' ? 'flex-col items-center justify-center gap-1.5' : 'flex-row items-center gap-1.5 sm:gap-2 justify-center md:justify-start'} ${onClick ? 'cursor-pointer select-none' : ''} ${className}`}
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


import React from 'react';

export const LOGO_IMAGE_URL = "https://i.ibb.co/Rt6vbFm/file-0000000005187206b6cd29703bc3b791.png";

interface LogoProps {
  animated?: boolean;
  className?: string;
  width?: number | string;
  height?: number | string;
}

export default function Logo({ animated = false, className = '', width, height }: LogoProps) {
  return (
    <div 
      style={{ width, height, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }} 
      className={`${className} ${animated ? 'animate-pulse' : ''}`}
    >
      <img 
        src={LOGO_IMAGE_URL}
        alt="Quekart Logo"
        className="w-full h-full object-contain pointer-events-none"
        referrerPolicy="no-referrer"
        loading="eager"
      />
    </div>
  );
}

interface QueKartLogoTextProps {
  className?: string;
  sizeClassName?: string;
}

export function QueKartLogoText({ className = '', sizeClassName = 'text-lg sm:text-xl md:text-2xl' }: QueKartLogoTextProps) {
  return (
    <span className={`font-display font-bold tracking-normal inline-flex items-center select-none whitespace-nowrap flex-shrink-0 min-w-max ${sizeClassName} ${className}`}>
      <span style={{ color: '#143C6B' }}>Que</span>
      <span style={{ color: '#C89D1F' }}>Kart</span>
    </span>
  );
}

interface BrandLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
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
  animated = false,
  className = '',
  onClick,
  layout = 'row',
  showText = true,
  textClassName = '',
  id
}: BrandLogoProps) {
  const iconSizeClasses = {
    xs: 'h-5 w-5',
    sm: 'h-6 w-6 sm:h-7 sm:w-7',
    md: 'h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10',
    lg: 'h-10 w-10 sm:h-11 sm:w-11 md:h-12 md:w-12',
    xl: 'h-14 w-14 sm:h-16 sm:w-16 md:h-20 md:w-20'
  }[size];

  const textSizeClasses = {
    xs: 'text-sm font-bold',
    sm: 'text-sm sm:text-base font-bold',
    md: 'text-lg sm:text-xl md:text-2xl font-bold',
    lg: 'text-2xl sm:text-2.5xl md:text-3xl font-extrabold',
    xl: 'text-3xl sm:text-4xl md:text-5xl font-black'
  }[size];

  const gapClasses = {
    xs: 'gap-1',
    sm: 'gap-1.5 sm:gap-2',
    md: 'gap-2 sm:gap-2.5',
    lg: 'gap-2.5 sm:gap-3',
    xl: 'gap-3 sm:gap-4'
  }[size];

  return (
    <div
      id={id}
      onClick={onClick}
      className={`inline-flex flex-shrink-0 min-w-max ${layout === 'col' ? 'flex-col items-center justify-center gap-1.5' : `flex-row items-center ${gapClasses} justify-center`} ${onClick ? 'cursor-pointer select-none' : ''} ${className}`}
    >
      <Logo
        className={`${iconSizeClasses} flex-shrink-0 transition-transform duration-150 ${onClick ? 'hover:scale-105 active:scale-95' : ''}`}
        animated={animated}
      />
      {showText && (
        <QueKartLogoText sizeClassName={`${textSizeClasses} ${textClassName}`} />
      )}
    </div>
  );
}



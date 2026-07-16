import React from 'react';
import { motion } from 'motion/react';

interface LogoProps {
  animated?: boolean;
  className?: string;
  width?: number | string;
  height?: number | string;
}

export default function Logo({ animated = true, className = '', width, height }: LogoProps) {
  const innerContent = (
    <img 
      src="https://i.ibb.co/Rt6vbFm/file-0000000005187206b6cd29703bc3b791.png"
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

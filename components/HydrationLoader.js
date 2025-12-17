'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

export default function HydrationLoader() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  if (!isLoading) return null;

  return (
    <div 
      className="fixed inset-0 z-[9999] bg-white flex items-center justify-center"
      style={{ 
        animation: 'fadeOut 0.3s ease-out forwards',
        animationDelay: '0.2s'
      }}
    >
      <Image 
        src="/logo.png" 
        alt="FarmTech" 
        width={64} 
        height={64}
        priority
        style={{ width: 'auto', height: 'auto' }}
      />

      <style jsx>{`
        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; visibility: hidden; }
        }
      `}</style>
    </div>
  );
}

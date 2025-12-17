'use client';

import Image from 'next/image';

export default function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center py-12">
      <Image 
        src="/logo.png" 
        alt="Loading" 
        width={48} 
        height={48}
        priority
        className="animate-pulse"
        style={{ width: 'auto', height: 'auto' }}
      />
    </div>
  );
}

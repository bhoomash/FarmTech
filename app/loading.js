import Image from 'next/image';

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-amber-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        {/* Animated Logo */}
        <div className="relative">
          <div className="absolute inset-0 bg-green-400 rounded-full blur-2xl opacity-30 animate-pulse" />
          <div className="relative animate-bounce">
            <Image 
              src="/logo.png" 
              alt="FarmTech Loading" 
              width={80} 
              height={80}
              priority
              className="drop-shadow-lg"
              style={{ width: 'auto', height: 'auto' }}
            />
          </div>
        </div>

        {/* Brand Name */}
        <div className="flex flex-col items-center gap-1">
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
            FARMTECH
          </h1>
          <p className="text-xs text-neutral-500 font-medium tracking-wider uppercase">
            Agriculture
          </p>
        </div>

        {/* Loading Spinner */}
        <div className="flex gap-2">
          <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
          <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
          <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
        </div>

        {/* Loading Text */}
        <p className="text-sm text-neutral-600 font-medium animate-pulse">
          Loading...
        </p>
      </div>
    </div>
  );
}

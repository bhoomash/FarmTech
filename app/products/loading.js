import Image from 'next/image';

export default function ProductsLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-yellow-50 to-amber-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
          {/* Animated Logo */}
          <div className="relative">
            <div className="absolute inset-0 bg-green-400 rounded-full blur-2xl opacity-30 animate-pulse" />
            <div className="relative animate-bounce">
              <Image 
                src="/logo.png" 
                alt="Loading Products" 
                width={64} 
                height={64}
                priority
                className="drop-shadow-lg"
                style={{ width: 'auto', height: 'auto' }}
              />
            </div>
          </div>

          {/* Loading Text */}
          <div className="flex flex-col items-center gap-2">
            <p className="text-lg font-medium text-neutral-800">
              Loading Products...
            </p>
            <div className="flex gap-2">
              <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
              <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
              <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

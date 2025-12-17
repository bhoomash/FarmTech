'use client';

import { useEffect } from 'react';
import { cleanupLocalStorageCache } from '@/lib/prefetch';

export default function CacheCleanup() {
  useEffect(() => {
    // Clean up stale cache entries on app start
    cleanupLocalStorageCache();
  }, []);

  return null;
}

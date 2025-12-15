'use client';

import { useAuth } from '@/context/AuthContext';
import AuthModal from './AuthModal';

export default function AuthModalWrapper() {
  const { authModalOpen, authModalMode, closeAuthModal } = useAuth();

  return (
    <AuthModal 
      isOpen={authModalOpen} 
      onClose={closeAuthModal}
      defaultMode={authModalMode}
    />
  );
}

// Shared in-memory storage for pending signups
// Uses global variable to persist across module reloads in development
// Note: For production serverless environments, consider using Redis or database

const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes
const isDev = process.env.NODE_ENV === 'development';

// Use global variable to persist across hot reloads in development
const globalForPending = globalThis;

if (!globalForPending.pendingSignups) {
  globalForPending.pendingSignups = new Map();
}

const pendingSignups = globalForPending.pendingSignups;

// Cleanup expired entries
function cleanupExpiredSignups() {
  const now = Date.now();
  for (const [email, data] of pendingSignups.entries()) {
    if (now > data.expiresAt) {
      pendingSignups.delete(email);
    }
  }
}

// Get pending signup data
function getPendingSignup(email) {
  const normalizedEmail = email.toLowerCase();
  const data = pendingSignups.get(normalizedEmail);
  
  if (!data) {
    if (isDev) {
      console.log('[PendingSignups] No pending signup found for:', normalizedEmail);
    }
    return null;
  }
  
  // Check if expired
  if (Date.now() > data.expiresAt) {
    if (isDev) {
      console.log('[PendingSignups] Pending signup expired for:', normalizedEmail);
    }
    pendingSignups.delete(normalizedEmail);
    return null;
  }
  
  if (isDev) {
    console.log('[PendingSignups] Found pending signup for:', normalizedEmail);
  }
  return data;
}

// Set pending signup data
function setPendingSignup(email, data) {
  const normalizedEmail = email.toLowerCase();
  pendingSignups.set(normalizedEmail, {
    ...data,
    email: normalizedEmail,
    expiresAt: Date.now() + OTP_EXPIRY_MS,
  });
  
  if (isDev) {
    console.log('[PendingSignups] Stored pending signup for:', normalizedEmail);
  }
  
  // Cleanup old entries periodically
  if (pendingSignups.size > 100) {
    cleanupExpiredSignups();
  }
}

// Remove pending signup
function removePendingSignup(email) {
  const normalizedEmail = email.toLowerCase();
  pendingSignups.delete(normalizedEmail);
  if (isDev) {
    console.log('[PendingSignups] Removed pending signup for:', normalizedEmail);
  }
}

export { 
  pendingSignups, 
  getPendingSignup, 
  setPendingSignup, 
  removePendingSignup,
  OTP_EXPIRY_MS 
};

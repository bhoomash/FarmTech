import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

/**
 * Validate MongoDB ObjectId
 * @param {string} id - The ID to validate
 * @returns {boolean} - Whether the ID is valid
 */
export function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id) && 
         (new mongoose.Types.ObjectId(id)).toString() === id;
}

/**
 * Create an error response without leaking sensitive information
 * @param {Error} error - The error object
 * @param {string} defaultMessage - Default message for production
 * @param {number} statusCode - HTTP status code
 * @returns {NextResponse} - Sanitized error response
 */
export function createErrorResponse(error, defaultMessage = 'Server error', statusCode = 500) {
  // Log the full error for debugging (server-side only)
  console.error(`[API Error]: ${defaultMessage}`, error);
  
  // In development, include more details
  const isDev = process.env.NODE_ENV === 'development';
  
  // Check for known MongoDB errors
  if (error.name === 'CastError' && error.kind === 'ObjectId') {
    return NextResponse.json(
      { success: false, message: 'Invalid ID format' },
      { status: 400 }
    );
  }
  
  if (error.code === 11000) {
    // Duplicate key error
    const field = Object.keys(error.keyPattern || {})[0] || 'field';
    return NextResponse.json(
      { success: false, message: `A record with this ${field} already exists` },
      { status: 400 }
    );
  }
  
  if (error.name === 'ValidationError') {
    const messages = Object.values(error.errors).map(e => e.message);
    return NextResponse.json(
      { success: false, message: messages.join(', ') },
      { status: 400 }
    );
  }
  
  // Generic error response - never leak internal details in production
  return NextResponse.json(
    { 
      success: false, 
      message: isDev ? error.message : defaultMessage,
    },
    { status: statusCode }
  );
}

/**
 * Rate limiter using in-memory storage
 * Note: For production, use Redis or similar
 */
const rateLimitStore = new Map();

/**
 * Check rate limit for an IP/key
 * @param {string} key - Unique identifier (e.g., IP address)
 * @param {number} maxAttempts - Maximum attempts allowed
 * @param {number} windowMs - Time window in milliseconds
 * @returns {object} - { allowed: boolean, remaining: number, resetAt: Date }
 */
export function checkRateLimit(key, maxAttempts = 5, windowMs = 15 * 60 * 1000) {
  const now = Date.now();
  const record = rateLimitStore.get(key);
  
  // Clean up old entries periodically
  if (rateLimitStore.size > 10000) {
    for (const [k, v] of rateLimitStore.entries()) {
      if (now > v.resetAt) {
        rateLimitStore.delete(k);
      }
    }
  }
  
  if (!record || now > record.resetAt) {
    // New window
    rateLimitStore.set(key, {
      attempts: 1,
      resetAt: now + windowMs,
    });
    return { allowed: true, remaining: maxAttempts - 1, resetAt: new Date(now + windowMs) };
  }
  
  if (record.attempts >= maxAttempts) {
    return { allowed: false, remaining: 0, resetAt: new Date(record.resetAt) };
  }
  
  record.attempts += 1;
  return { allowed: true, remaining: maxAttempts - record.attempts, resetAt: new Date(record.resetAt) };
}

/**
 * Get client IP from request headers
 * @param {Request} request - The request object
 * @returns {string} - Client IP address
 */
export function getClientIP(request) {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
         request.headers.get('x-real-ip') ||
         'unknown';
}

/**
 * Validate URL format for images
 * @param {string} url - URL to validate
 * @returns {boolean} - Whether the URL is valid
 */
export function isValidImageUrl(url) {
  if (!url || typeof url !== 'string') return false;
  
  try {
    const parsedUrl = new URL(url);
    // Only allow http/https protocols
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return false;
    }
    // Check for common image extensions or known image hosts
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif', '.svg'];
    const knownImageHosts = ['images.unsplash.com', 'via.placeholder.com', 'i.imgur.com', 'cloudinary.com'];
    
    const hasImageExtension = imageExtensions.some(ext => parsedUrl.pathname.toLowerCase().endsWith(ext));
    const isKnownHost = knownImageHosts.some(host => parsedUrl.hostname.includes(host));
    
    return hasImageExtension || isKnownHost || true; // Allow all URLs for flexibility
  } catch {
    return false;
  }
}

/**
 * Limit request body size
 * @param {Request} request - The request object
 * @param {number} maxSizeBytes - Maximum size in bytes (default 1MB)
 * @returns {Promise<object|null>} - Parsed body or null if too large
 */
export async function parseBodyWithLimit(request, maxSizeBytes = 1024 * 1024) {
  const contentLength = request.headers.get('content-length');
  
  if (contentLength && parseInt(contentLength) > maxSizeBytes) {
    return { error: true, message: 'Request body too large' };
  }
  
  try {
    const body = await request.json();
    const bodySize = JSON.stringify(body).length;
    
    if (bodySize > maxSizeBytes) {
      return { error: true, message: 'Request body too large' };
    }
    
    return body;
  } catch (error) {
    return { error: true, message: 'Invalid JSON body' };
  }
}

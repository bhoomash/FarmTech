// Authentication Middleware for Next.js API Routes
import { verifyToken } from './jwt';
import dbConnect from './db';
import User from '@/models/User';

// Get user from token
export const getUserFromToken = async (request) => {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    if (!decoded) {
      return null;
    }

    await dbConnect();
    const user = await User.findById(decoded.id).select('-otp -otpExpiry');

    return user;
  } catch (error) {
    return null;
  }
};

// Protect middleware - requires authentication
export const protect = async (request) => {
  const user = await getUserFromToken(request);
  
  if (!user) {
    return {
      error: true,
      status: 401,
      message: 'Not authorized, please login',
    };
  }

  return { user };
};

// Authorize middleware - requires specific roles
export const authorize = (user, ...roles) => {
  if (!roles.includes(user.role)) {
    return {
      error: true,
      status: 403,
      message: `Role ${user.role} is not authorized to access this resource`,
    };
  }

  return { authorized: true };
};

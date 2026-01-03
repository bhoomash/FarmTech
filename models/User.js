import mongoose from 'mongoose';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Please provide a valid email',
      ],
    },
    password: {
      type: String,
      select: false,
    },
    phone: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    otp: {
      type: String,
      select: false,
    },
    otpExpiry: {
      type: Date,
      select: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance (email index already created by unique: true)
userSchema.index({ role: 1 });
userSchema.index({ createdAt: -1 });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

// Generate OTP - hash before storing
userSchema.methods.generateOTP = async function () {
  const otp = crypto.randomInt(100000, 999999).toString();
  // Hash OTP before storing (like password)
  this.otp = await bcrypt.hash(otp, 10);
  this.otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
  return otp; // Return plain OTP to send via email
};

// Verify OTP using bcrypt compare
userSchema.methods.verifyOTP = async function (otp) {
  if (!this.otp || !this.otpExpiry) {
    return false;
  }
  if (this.otpExpiry < new Date()) {
    return false;
  }
  return await bcrypt.compare(otp, this.otp);
};

export default mongoose.models.User || mongoose.model('User', userSchema);

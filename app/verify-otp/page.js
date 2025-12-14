'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { validateData, otpSchema } from '@/utils/validators';

export default function VerifyOTPPage() {
  const router = useRouter();
  const { verifyOTP } = useAuth();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const pendingEmail = localStorage.getItem('pendingEmail');
    if (!pendingEmail) {
      router.push('/login');
      return;
    }
    setEmail(pendingEmail);
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    // Validate
    const validation = validateData(otpSchema, { email, otp });
    if (!validation.success) {
      setErrors(validation.errors);
      return;
    }

    setLoading(true);
    const result = await verifyOTP(email, otp);
    setLoading(false);

    if (result.success) {
      localStorage.removeItem('pendingEmail');
      // Redirect to landing page
      window.location.href = '/';
    } else {
      setErrors({ general: result.message });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 py-12 px-4">
      <div className="max-w-md w-full card p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <Image 
              src="/logo.png" 
              alt="FarmTech Logo" 
              width={40} 
              height={40}
            />
            <div className="text-left">
              <h2 className="text-2xl font-bold text-neutral-900">FarmTech</h2>
              <p className="text-xs text-neutral-500">Farm Solutions</p>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">Verify OTP</h1>
          <p className="text-neutral-600">Enter the OTP sent to</p>
          <p className="text-primary-600 font-medium mt-1">{email}</p>
        </div>
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">📧</div>
          <h1 className="text-3xl font-bold text-gray-900">Verify OTP</h1>
          <p className="text-gray-600 mt-2">
            We've sent a 6-digit code to
          </p>
          <p className="text-primary-600 font-semibold">{email}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter OTP
            </label>
            <input
              type="text"
              value={otp}
              onChange={(e) => {
                setOtp(e.target.value);
                setErrors({});
              }}
              placeholder="000000"
              maxLength={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-2xl tracking-widest focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            {errors.otp && (
              <p className="text-red-500 text-sm mt-1">{errors.otp}</p>
            )}
          </div>

          {/* General error */}
          {errors.general && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {errors.general}
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 transition disabled:bg-gray-400"
          >
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => router.push('/login')}
            className="text-primary-600 hover:underline text-sm"
          >
            Back to Login
          </button>
        </div>

        <div className="mt-4 text-center text-sm text-gray-600">
          <p>OTP valid for 5 minutes</p>
        </div>
      </div>
    </div>
  );
}

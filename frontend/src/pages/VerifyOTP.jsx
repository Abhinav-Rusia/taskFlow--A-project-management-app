import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const VerifyOTP = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [validationError, setValidationError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  const { verifyOTP, register, loading, error, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get email from navigation state
  const email = location.state?.email;

  useEffect(() => {
    // Redirect if no email provided
    if (!email) {
      navigate('/register');
      return;
    }
    clearError();
  }, [email, navigate, clearError]);

  // Start resend cooldown
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleOtpChange = (index, value) => {
    // Only allow numbers
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Clear validation error
    if (validationError) {
      setValidationError('');
    }

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newOtp = [...otp];
    
    for (let i = 0; i < 6; i++) {
      newOtp[i] = pastedData[i] || '';
    }
    
    setOtp(newOtp);
    
    // Focus the last filled input or first empty one
    const lastFilledIndex = pastedData.length - 1;
    const targetIndex = Math.min(lastFilledIndex + 1, 5);
    document.getElementById(`otp-${targetIndex}`)?.focus();
  };

  const validateOtp = () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setValidationError('Please enter the complete 6-digit OTP');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateOtp()) {
      return;
    }

    const otpString = otp.join('');
    const result = await verifyOTP(email, otpString);
    
    if (result.success) {
      navigate('/login');
    }
  };

  const handleResendOTP = async () => {
    if (resendCooldown > 0) return;

    // Extract user data from email (you might want to store this differently)
    const result = await register({ email, resend: true });
    
    if (result.success) {
      setResendCooldown(60); // 60 seconds cooldown
      setOtp(['', '', '', '', '', '']); // Clear current OTP
    }
  };

  if (!email) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl mb-6 shadow-lg shadow-violet-500/25">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Check your email</h1>
          <p className="text-slate-500 text-sm mb-2">
            We've sent a 6-digit verification code to
          </p>
          <p className="text-slate-700 font-semibold text-sm">{email}</p>
        </div>

        {/* Form Card */}
        <div className="bg-white/70 backdrop-blur-sm border border-white/20 rounded-3xl p-8 shadow-xl shadow-slate-200/50">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Global Error */}
            {error && (
              <div className="bg-red-50/80 border border-red-100 text-red-600 px-4 py-3 rounded-2xl text-sm font-medium">
                {error}
              </div>
            )}

            {/* Validation Error */}
            {validationError && (
              <div className="bg-red-50/80 border border-red-100 text-red-600 px-4 py-3 rounded-2xl text-sm font-medium">
                {validationError}
              </div>
            )}

            {/* OTP Input */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 block text-center">
                Enter verification code
              </label>
              <div className="flex justify-center space-x-3">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={index === 0 ? handlePaste : undefined}
                    className={`w-12 h-12 text-center text-xl font-bold bg-slate-50/50 border-2 rounded-2xl text-slate-800 transition-all duration-200 focus:outline-none focus:bg-white ${
                      validationError 
                        ? 'border-red-300 focus:border-red-400' 
                        : 'border-slate-200 focus:border-violet-400 focus:shadow-lg focus:shadow-violet-500/10'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-semibold py-3.5 px-6 rounded-2xl transition-all duration-200 shadow-lg shadow-violet-500/25 hover:shadow-xl hover:shadow-violet-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                  Verifying...
                </div>
              ) : (
                'Verify Email'
              )}
            </button>

            {/* Resend OTP */}
            <div className="text-center">
              <p className="text-sm text-slate-600 mb-3">
                Didn't receive the code?
              </p>
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={resendCooldown > 0 || loading}
                className="text-sm font-semibold text-violet-600 hover:text-violet-700 transition-colors disabled:text-slate-400 disabled:cursor-not-allowed"
              >
                {resendCooldown > 0 
                  ? `Resend code in ${resendCooldown}s` 
                  : 'Resend verification code'
                }
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-slate-500">Wrong email?</span>
            </div>
          </div>

          {/* Back to Register */}
          <div className="text-center">
            <Link
              to="/register"
              className="inline-flex items-center justify-center w-full py-3.5 px-6 border-2 border-slate-200 hover:border-slate-300 text-slate-700 font-semibold rounded-2xl transition-all duration-200 hover:bg-slate-50"
            >
              Back to registration
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-xs text-slate-400">
            Check your spam folder if you don't see the email
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;

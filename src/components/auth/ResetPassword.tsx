import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { validatePassword } from '../../utils/authValidation';

export const ResetPassword: React.FC = () => {
  const { updateUserPassword } = useAuth();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [validation, setValidation] = useState({
    hasMinLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecialChar: false,
  });

  useEffect(() => {
    const result = validatePassword(password);
    setValidation({
      hasMinLength: result.hasMinLength,
      hasUppercase: result.hasUppercase,
      hasLowercase: result.hasLowercase,
      hasNumber: result.hasNumber,
      hasSpecialChar: result.hasSpecialChar,
    });
  }, [password]);

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const valResult = validatePassword(password);
    if (!valResult.isValid) {
      setError('Please meet all password strength requirements.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const { error: resetError } = await updateUserPassword(password);
      if (resetError) {
        setError(resetError.message);
      } else {
        setSuccess(true);
        setTimeout(() => {
          navigate('/dashboard');
        }, 3000);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to update password. Link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl text-center space-y-6">
        <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto text-2xl animate-bounce">
          ✓
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-extrabold text-white">Password Updated</h2>
          <p className="text-xs text-slate-400 leading-relaxed px-4">
            Your password has been successfully updated. You are being redirected to your workspace dashboard...
          </p>
        </div>
        <div className="pt-4 border-t border-slate-800">
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-semibold rounded-xl text-xs shadow-lg inline-block transition-all cursor-pointer"
          >
            Go to Dashboard Now
          </button>
        </div>
      </div>
    );
  }

  const isPasswordValid = Object.values(validation).every(Boolean);

  return (
    <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl relative">
      <div className="space-y-1.5 text-left mb-6">
        <h2 className="text-xl font-extrabold text-white">Set New Password</h2>
        <p className="text-xs text-slate-400">
          Create a secure password to re-access your carbon diagnostic workspace.
        </p>
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs p-3 rounded-xl mb-4 text-left font-medium animate-fadeIn">
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handleResetSubmit} className="space-y-4 text-left">
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">New Password</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-950 text-slate-200 border border-slate-800 rounded-xl p-3 pr-10 text-xs focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs focus:outline-none"
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        {/* Dynamic Password Strength Indicator Checklist */}
        <div className="p-3 bg-slate-950/50 border border-slate-850 rounded-xl space-y-1.5 text-[10px]">
          <div className="text-slate-500 font-bold uppercase tracking-wider text-[8px] mb-1">
            New Password Requirements:
          </div>
          
          <div className="flex items-center gap-2">
            <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-bold ${validation.hasMinLength ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-900 text-slate-600'}`}>
              {validation.hasMinLength ? '✓' : '•'}
            </span>
            <span className={validation.hasMinLength ? 'text-slate-300' : 'text-slate-500'}>
              At least 8 characters
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-bold ${validation.hasUppercase ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-900 text-slate-600'}`}>
              {validation.hasUppercase ? '✓' : '•'}
            </span>
            <span className={validation.hasUppercase ? 'text-slate-300' : 'text-slate-500'}>
              At least 1 uppercase letter (A-Z)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-bold ${validation.hasLowercase ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-900 text-slate-600'}`}>
              {validation.hasLowercase ? '✓' : '•'}
            </span>
            <span className={validation.hasLowercase ? 'text-slate-300' : 'text-slate-500'}>
              At least 1 lowercase letter (a-z)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-bold ${validation.hasNumber ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-900 text-slate-600'}`}>
              {validation.hasNumber ? '✓' : '•'}
            </span>
            <span className={validation.hasNumber ? 'text-slate-300' : 'text-slate-500'}>
              At least 1 number (0-9)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-bold ${validation.hasSpecialChar ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-900 text-slate-600'}`}>
              {validation.hasSpecialChar ? '✓' : '•'}
            </span>
            <span className={validation.hasSpecialChar ? 'text-slate-300' : 'text-slate-500'}>
              At least 1 special character (e.g., ! @ # $ % & *)
            </span>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Confirm Password</label>
          <input
            type="password"
            required
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full bg-slate-950 text-slate-200 border border-slate-800 rounded-xl p-3 text-xs focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !isPasswordValid || password !== confirmPassword}
          className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-semibold rounded-xl text-xs shadow-lg hover:shadow-emerald-500/10 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          ) : (
            'Reset Password'
          )}
        </button>
      </form>
    </div>
  );
};

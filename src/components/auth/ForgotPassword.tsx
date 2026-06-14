import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { validateEmail } from '../../utils/authValidation';

export const ForgotPassword: React.FC = () => {
  const { resetPasswordForEmail } = useAuth();
  
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);

    try {
      const { error: resetError } = await resetPasswordForEmail(email);
      if (resetError) {
        setError(resetError.message);
      } else {
        setSuccess(true);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl text-center space-y-6">
        <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto text-2xl animate-bounce">
          🔑
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-extrabold text-white">Reset Email Sent</h2>
          <p className="text-xs text-slate-400 leading-relaxed px-4">
            If an account exists for <strong className="text-slate-200">{email}</strong>, we have sent a password reset recovery link.
            Please check your inbox.
          </p>
        </div>
        <div className="pt-4 border-t border-slate-800">
          <Link
            to="/login"
            className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-semibold rounded-xl text-xs shadow-lg inline-block transition-all"
          >
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl relative">
      <div className="space-y-1.5 text-left mb-6">
        <h2 className="text-xl font-extrabold text-white">Forgot Password?</h2>
        <p className="text-xs text-slate-400">
          Enter your email address to receive a secured password reset link.
        </p>
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs p-3 rounded-xl mb-4 text-left font-medium animate-fadeIn">
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handleForgotSubmit} className="space-y-4 text-left">
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
          <input
            type="email"
            required
            placeholder="name@domain.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-slate-950 text-slate-200 border border-slate-800 rounded-xl p-3 text-xs focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-semibold rounded-xl text-xs shadow-lg hover:shadow-emerald-500/10 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          ) : (
            'Send Password Reset Link'
          )}
        </button>
      </form>

      <div className="mt-6 pt-4 border-t border-slate-800/80 text-center text-xs">
        <Link
          to="/login"
          className="text-emerald-400 hover:text-emerald-300 font-bold underline transition-colors"
        >
          Return to Login Page
        </Link>
      </div>
    </div>
  );
};

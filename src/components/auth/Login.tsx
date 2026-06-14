import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { validateEmail } from '../../utils/authValidation';

export const Login: React.FC = () => {
  const { signIn, loginDemo } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);

    const isNetworkError = (msg: string) => {
      const m = String(msg).toLowerCase();
      return m.includes('fetch') || m.includes('network') || m.includes('failed');
    };

    try {
      const { error: signInError } = await signIn(email, password);
      if (signInError) {
        if (isNetworkError(signInError.message)) {
          console.log('Network error encountered. Switching to offline demo session.');
          loginDemo(email);
          navigate('/dashboard');
          return;
        }
        setError(signInError.message);
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      const msg = err?.message || '';
      if (isNetworkError(msg)) {
        console.log('Caught network exception. Switching to offline demo session.');
        loginDemo(email);
        navigate('/dashboard');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLaunchDemo = () => {
    loginDemo('demo@ecopulse.org');
    navigate('/dashboard');
  };

  return (
    <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl relative">
      <div className="space-y-1.5 text-left mb-6">
        <h2 className="text-xl font-extrabold text-white">Access Dashboard</h2>
        <p className="text-xs text-slate-400">
          Sign in to access your secure carbon analytics workspace.
        </p>
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs p-3 rounded-xl mb-4 text-left font-medium animate-fadeIn space-y-2">
          <div>⚠️ {error}</div>
          {error.toLowerCase().includes('fetch') && (
            <div className="pt-1.5 border-t border-rose-500/10">
              <button
                type="button"
                onClick={() => {
                  loginDemo(email || 'demo@ecopulse.org');
                  navigate('/dashboard');
                }}
                className="text-emerald-400 hover:text-emerald-300 font-bold underline cursor-pointer transition-colors text-[10px]"
              >
                💡 Network Issue? Continue in Offline Demo Mode ➜
              </button>
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleLoginSubmit} className="space-y-4 text-left">
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

        <div className="space-y-1 relative">
          <div className="flex justify-between items-center">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Password</label>
            <Link
              to="/forgot-password"
              className="text-[10px] text-emerald-400 hover:text-emerald-300 font-semibold"
            >
              Forgot Password?
            </Link>
          </div>
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

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-semibold rounded-xl text-xs shadow-lg hover:shadow-emerald-500/10 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          ) : (
            'Access Private Dashboard'
          )}
        </button>
      </form>

      <div className="relative flex py-2.5 items-center">
        <div className="flex-grow border-t border-slate-800"></div>
        <span className="flex-shrink mx-3 text-[9px] text-slate-500 font-mono tracking-wider">OR</span>
        <div className="flex-grow border-t border-slate-800"></div>
      </div>

      <button
        type="button"
        onClick={handleLaunchDemo}
        className="w-full py-3 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white font-semibold rounded-xl text-xs shadow-md active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
      >
        ⚡ Launch Demo Mode (Offline)
      </button>

      <div className="mt-6 pt-4 border-t border-slate-800/80 text-center text-xs">
        <span className="text-slate-500">New to the platform? </span>
        <Link
          to="/signup"
          className="text-emerald-400 hover:text-emerald-300 font-bold underline transition-colors"
        >
          Register Account
        </Link>
      </div>
    </div>
  );
};

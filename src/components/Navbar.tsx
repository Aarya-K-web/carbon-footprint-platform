import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { validatePassword } from '../utils/authValidation';

export const Navbar: React.FC = () => {
  const { user, signOut, updateUserPassword } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Change Password Modal States
  const [modalOpen, setModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [modalError, setModalError] = useState('');
  const [modalSuccess, setModalSuccess] = useState('');
  const [modalLoading, setModalLoading] = useState(false);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOutClick = async () => {
    setDropdownOpen(false);
    await signOut();
  };

  const [validation, setValidation] = useState({
    hasMinLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecialChar: false,
  });

  useEffect(() => {
    const result = validatePassword(newPassword);
    setValidation({
      hasMinLength: result.hasMinLength,
      hasUppercase: result.hasUppercase,
      hasLowercase: result.hasLowercase,
      hasNumber: result.hasNumber,
      hasSpecialChar: result.hasSpecialChar,
    });
  }, [newPassword]);

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError('');
    setModalSuccess('');

    const valResult = validatePassword(newPassword);
    if (!valResult.isValid) {
      setModalError('Please meet all password strength requirements.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setModalError('Passwords do not match.');
      return;
    }

    setModalLoading(true);

    try {
      const { error } = await updateUserPassword(newPassword);
      if (error) {
        setModalError(error.message);
      } else {
        setModalSuccess('Password updated successfully!');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => {
          setModalOpen(false);
          setModalSuccess('');
        }, 2000);
      }
    } catch (err: any) {
      setModalError(err?.message || 'Failed to update password. Please try again.');
    } finally {
      setModalLoading(false);
    }
  };

  if (!user) return null;

  // Extract initials for Avatar fallback
  const userInitials = user.email
    ? user.email.substring(0, 2).toUpperCase()
    : 'US';

  const isPasswordValid = Object.values(validation).every(Boolean);
  const isDemoUser = (user as any).isDemo;
  const navigate = useNavigate();

  return (
    <>
      <nav className="w-full flex items-center justify-between px-4 bg-slate-950/40 border border-slate-900 rounded-2xl py-3 backdrop-blur-md relative z-40">
        {/* Left branding */}
        <div className="flex items-center gap-2">
          <span className="text-emerald-500 text-lg">🌱</span>
          <span className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
            EcoPulse
          </span>
          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono uppercase font-bold shrink-0">
            Workspace
          </span>
          {isDemoUser && (
            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono uppercase font-bold shrink-0 animate-pulse">
              Offline Mode
            </span>
          )}
        </div>

        {/* Right user profile & actions */}
        <div className="flex items-center gap-3 relative" ref={dropdownRef}>
          <div className="text-right hidden sm:block">
            <div className="text-[10px] text-slate-400 font-bold leading-none truncate max-w-[150px]">
              {user.email}
            </div>
            <span className="text-[8px] text-slate-500 font-mono tracking-wide">
              {isDemoUser ? 'Offline Demo Session' : 'Secured Session'}
            </span>
          </div>

          {/* Profile Dropdown Toggle */}
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 hover:border-emerald-500/50 flex items-center justify-center text-xs font-bold text-emerald-400 shadow-md transition-all cursor-pointer overflow-hidden"
          >
            {userProfile?.avatar_url ? (
              <img src={userProfile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              userInitials
            )}
          </button>

          {/* Dropdown Menu list card */}
          {dropdownOpen && (
            <div className="absolute right-0 top-10 w-48 bg-slate-950/95 backdrop-blur-md border border-slate-800 rounded-xl p-2 shadow-2xl z-50 animate-fadeIn text-left">
              <div className="px-3 py-2 border-b border-slate-900 sm:hidden">
                <p className="text-[10px] font-bold text-slate-400 truncate">{user.email}</p>
                <p className="text-[8px] text-slate-500 font-mono">{isDemoUser ? 'Offline Session' : 'Secured Session'}</p>
              </div>

              <button
                onClick={() => {
                  setDropdownOpen(false);
                  navigate('/profile');
                }}
                className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-900 rounded-lg transition-colors cursor-pointer flex items-center gap-2"
              >
                👤 Edit Profile
              </button>

              {!isDemoUser && (
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    setModalOpen(true);
                  }}
                  className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-900 rounded-lg transition-colors cursor-pointer flex items-center gap-2"
                >
                  🔒 Change Password
                </button>
              )}

              <button
                onClick={handleSignOutClick}
                className="w-full text-left px-3 py-2 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer flex items-center gap-2"
              >
                ↩ Sign Out
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Change Password Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4 text-left">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">🔒 Update Password</h3>
              <button
                onClick={() => {
                  setModalOpen(false);
                  setNewPassword('');
                  setConfirmPassword('');
                  setModalError('');
                  setModalSuccess('');
                }}
                className="text-slate-500 hover:text-slate-300 text-xs focus:outline-none"
              >
                ✕
              </button>
            </div>

            {modalError && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs p-3 rounded-xl mb-4 font-medium animate-fadeIn">
                ⚠️ {modalError}
              </div>
            )}

            {modalSuccess && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs p-3 rounded-xl mb-4 font-medium animate-fadeIn">
                ✓ {modalSuccess}
              </div>
            )}

            <form onSubmit={handleChangePasswordSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">New Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-slate-950 text-slate-200 border border-slate-800 rounded-xl p-3 text-xs focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                />
              </div>

              {/* Password strength tracker */}
              <div className="p-3 bg-slate-950/50 border border-slate-850 rounded-xl space-y-1.5 text-[9px]">
                <div className="text-slate-500 font-bold uppercase tracking-wider text-[7px] mb-0.5">
                  Password Strength Requirements:
                </div>
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full flex items-center justify-center text-[7px] font-bold ${validation.hasMinLength ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-900 text-slate-600'}`}>
                    {validation.hasMinLength ? '✓' : '•'}
                  </span>
                  <span className={validation.hasMinLength ? 'text-slate-300' : 'text-slate-500'}>At least 8 characters</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full flex items-center justify-center text-[7px] font-bold ${validation.hasUppercase ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-900 text-slate-600'}`}>
                    {validation.hasUppercase ? '✓' : '•'}
                  </span>
                  <span className={validation.hasUppercase ? 'text-slate-300' : 'text-slate-500'}>At least 1 uppercase (A-Z)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full flex items-center justify-center text-[7px] font-bold ${validation.hasLowercase ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-900 text-slate-600'}`}>
                    {validation.hasLowercase ? '✓' : '•'}
                  </span>
                  <span className={validation.hasLowercase ? 'text-slate-300' : 'text-slate-500'}>At least 1 lowercase (a-z)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full flex items-center justify-center text-[7px] font-bold ${validation.hasNumber ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-900 text-slate-600'}`}>
                    {validation.hasNumber ? '✓' : '•'}
                  </span>
                  <span className={validation.hasNumber ? 'text-slate-300' : 'text-slate-500'}>At least 1 digit (0-9)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full flex items-center justify-center text-[7px] font-bold ${validation.hasSpecialChar ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-900 text-slate-600'}`}>
                    {validation.hasSpecialChar ? '✓' : '•'}
                  </span>
                  <span className={validation.hasSpecialChar ? 'text-slate-300' : 'text-slate-500'}>At least 1 special char</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Confirm Password</label>
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
                disabled={modalLoading || !isPasswordValid || newPassword !== confirmPassword}
                className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-semibold rounded-xl text-xs shadow-lg hover:shadow-emerald-500/10 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed"
              >
                {modalLoading ? (
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  'Change Password'
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

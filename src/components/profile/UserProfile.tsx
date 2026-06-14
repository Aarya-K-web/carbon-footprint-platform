import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { updateProfile, uploadAvatar } from '../../lib/profileService';

export const UserProfile: React.FC = () => {
  const { user, userProfile, setUserProfile } = useAuth();

  const [fullName, setFullName] = useState('');
  const [goal, setGoal] = useState<'low-carbon' | 'carbon-neutral' | 'zero-waste' | 'eco-guardian'>('low-carbon');
  const [reductionTarget, setReductionTarget] = useState(15);
  
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Sync state with profile contexts
  useEffect(() => {
    if (userProfile) {
      setFullName(userProfile.full_name || '');
      setGoal(userProfile.sustainability_goal || 'low-carbon');
      setReductionTarget(userProfile.target_carbon_reduction || 15);
      setAvatarPreview(userProfile.avatar_url || '');
    }
  }, [userProfile]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && user) {
      if (file.size > 2 * 1024 * 1024) {
        setError('Image must be under 2MB.');
        return;
      }
      setAvatarFile(file);
      setError('');
      setSuccess('');
      setUploading(true);

      try {
        if (!(user as any).isDemo) {
          const { publicUrl, error: uploadError } = await uploadAvatar(user.id, file);
          if (uploadError) throw uploadError;
          if (publicUrl) {
            setAvatarPreview(publicUrl);
            setUserProfile((prev: any) => ({
              ...prev,
              avatar_url: publicUrl,
            }));
            setSuccess('Avatar updated successfully!');
          }
        } else {
          // Mock avatar preview for demo session
          const localUrl = URL.createObjectURL(file);
          setAvatarPreview(localUrl);
          setUserProfile((prev: any) => ({
            ...prev,
            avatar_url: localUrl,
          }));
          setSuccess('Avatar updated successfully (Demo Mode)!');
        }
      } catch (err: any) {
        setError(err?.message || 'Failed to upload avatar image.');
      } finally {
        setUploading(false);
      }
    }
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const updates = {
        full_name: fullName,
        sustainability_goal: goal,
        target_carbon_reduction: reductionTarget,
      };

      if (!(user as any).isDemo) {
        const { data, error: updateError } = await updateProfile(user.id, updates);
        if (updateError) throw updateError;
        if (data) {
          setUserProfile(data);
        }
      } else {
        setUserProfile((prev: any) => ({
          ...prev,
          ...updates,
        }));
      }

      setSuccess('Profile updated successfully!');
    } catch (err: any) {
      setError(err?.message || 'Failed to update profile details.');
    } finally {
      setLoading(false);
    }
  };

  const goalLabels = {
    'low-carbon': '🌱 Low-Carbon Advocate',
    'carbon-neutral': '⚖️ Carbon Neutral Journey',
    'zero-waste': '♻️ Zero-Waste Defender',
    'eco-guardian': '🛡️ Eco Guardian',
  };

  return (
    <div className="space-y-6 text-slate-100 text-left">
      {/* Title */}
      <div className="text-center pb-2 border-b border-slate-800/60">
        <span className="text-3xl" role="img" aria-label="profile">👤</span>
        <h2 className="text-2xl font-bold text-white mt-1">Profile Settings</h2>
        <p className="text-slate-400 text-xs mt-1">
          Manage your sustainability targets, goals, and account details.
        </p>
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs p-3 rounded-xl mb-4 font-medium animate-fadeIn">
          ⚠️ {error}
        </div>
      )}

      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs p-3 rounded-xl mb-4 font-medium animate-fadeIn">
          ✓ {success}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Card: Avatar & Stats */}
        <div className="bg-slate-900/30 border border-slate-800/80 rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-24 h-24 rounded-full border-2 border-emerald-500/20 bg-slate-950 flex items-center justify-center overflow-hidden relative group">
            {avatarPreview ? (
              <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-4xl text-slate-600">👤</span>
            )}
            {uploading && (
              <div className="absolute inset-0 bg-slate-950/70 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-emerald-500/20 border-t-emerald-400 rounded-full animate-spin" />
              </div>
            )}
          </div>

          <div className="space-y-1">
            <input
              type="file"
              id="avatar-update-input"
              accept="image/*"
              disabled={uploading}
              onChange={handleFileChange}
              className="hidden"
            />
            <label
              htmlFor="avatar-update-input"
              className={`px-3 py-1.5 border border-slate-800 bg-slate-950 hover:bg-slate-900 text-slate-300 hover:text-white rounded-xl text-[10px] font-bold cursor-pointer transition-colors inline-block ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Upload Photo
            </label>
            <p className="text-[8px] text-slate-500">Max size: 2MB (PNG, JPG)</p>
          </div>

          <div className="w-full border-t border-slate-800/60 pt-4 space-y-3">
            <div>
              <span className="text-[8px] font-bold text-slate-500 uppercase tracking-wider block">Sustainability Score</span>
              <span className="text-xl font-extrabold text-emerald-400 font-mono tracking-tight">
                {userProfile?.sustainability_score || 0} <span className="text-[10px] font-bold text-slate-400">pts</span>
              </span>
            </div>
            <div>
              <span className="text-[8px] font-bold text-slate-500 uppercase tracking-wider block">Registered Account</span>
              <span className="text-[10px] text-slate-300 font-medium truncate max-w-full block">
                {user?.email}
              </span>
            </div>
          </div>
        </div>

        {/* Right Card: Profile Edit Form */}
        <div className="bg-slate-900/30 border border-slate-800/80 rounded-2xl p-6 md:col-span-2">
          <form onSubmit={handleProfileSave} className="space-y-4">
            
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Full Name</label>
              <input
                type="text"
                required
                placeholder="Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-slate-950 text-slate-200 border border-slate-800 rounded-xl p-3 text-xs focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Sustainability Goal</label>
              <select
                value={goal}
                onChange={(e) => setGoal(e.target.value as any)}
                className="w-full bg-slate-950 text-slate-200 border border-slate-800 rounded-xl p-3 text-xs focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all cursor-pointer"
              >
                {(Object.keys(goalLabels) as Array<keyof typeof goalLabels>).map((g) => (
                  <option key={g} value={g} className="bg-slate-950">
                    {goalLabels[g]}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2 pt-2">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Reduction Target</label>
                <span className="text-xs font-mono font-bold text-emerald-400">{reductionTarget}% reduction</span>
              </div>
              <input
                type="range"
                min="5"
                max="80"
                step="5"
                value={reductionTarget}
                onChange={(e) => setReductionTarget(Number(e.target.value))}
                className="w-full h-1 bg-slate-950 border border-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-semibold rounded-xl text-xs shadow-lg shadow-emerald-500/10 transition-all cursor-pointer flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Save Profile</span>
                )}
              </button>
            </div>

          </form>
        </div>

      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { updateProfile, uploadAvatar } from '../../lib/profileService';

export const Onboarding: React.FC = () => {
  const { user, userProfile, setUserProfile } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState(userProfile?.full_name || '');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [avatarUrl, setAvatarUrl] = useState(userProfile?.avatar_url || '');
  const [goal, setGoal] = useState<'low-carbon' | 'carbon-neutral' | 'zero-waste' | 'eco-guardian'>('low-carbon');
  const [reductionTarget, setReductionTarget] = useState(15);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError('Image file must be under 2MB.');
        return;
      }
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const handleNextStep = async () => {
    setError('');
    if (step === 1) {
      if (!fullName.trim()) {
        setError('Please enter your full name.');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
  };

  const handlePrevStep = () => {
    setStep((prev) => Math.max(1, prev - 1));
  };

  const handleSubmitOnboarding = async () => {
    if (!user) return;
    setLoading(true);
    setError('');

    try {
      let finalAvatarUrl = avatarUrl;

      // 1. Upload avatar file if selected (only for non-demo users)
      if (avatarFile && !(user as any).isDemo) {
        const { publicUrl, error: uploadError } = await uploadAvatar(user.id, avatarFile);
        if (uploadError) {
          throw uploadError;
        }
        if (publicUrl) {
          finalAvatarUrl = publicUrl;
        }
      } else if (avatarFile && (user as any).isDemo) {
        // Mock upload url for demo
        finalAvatarUrl = avatarPreview;
      }

      // 2. Push profile changes to the Supabase database
      const profileUpdates = {
        full_name: fullName,
        avatar_url: finalAvatarUrl,
        sustainability_goal: goal,
        target_carbon_reduction: reductionTarget,
        onboarding_completed: true,
      };

      if (!(user as any).isDemo) {
        const { data, error: updateError } = await updateProfile(user.id, profileUpdates);
        if (updateError) throw updateError;
        if (data) {
          setUserProfile(data);
        }
      } else {
        // Sync local demo profile context
        setUserProfile((prev: any) => ({
          ...prev,
          ...profileUpdates,
        }));
      }

      // 3. Move to workspace dashboard
      navigate('/dashboard');
    } catch (err: any) {
      setError(err?.message || 'Failed to complete profile onboarding. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const goalDescriptions = {
    'low-carbon': {
      title: 'Low-Carbon Advocate',
      icon: '🌱',
      desc: 'Focus on small, daily reductions such as recycling, conserving household electricity, and carpooling.',
    },
    'carbon-neutral': {
      title: 'Carbon Neutral Journey',
      icon: '⚖️',
      desc: 'Strive to balance emissions entirely through switching to renewable energy tariffs and carbon offsets.',
    },
    'zero-waste': {
      title: 'Zero-Waste Defender',
      icon: '♻️',
      desc: 'Prioritize circularity, composting, refusing plastics, and choosing reusable alternatives.',
    },
    'eco-guardian': {
      title: 'Eco Guardian',
      icon: '🛡️',
      desc: 'Commit to full lifestyle adjustments including electric vehicles, plant-based diets, and smart energy.',
    },
  };

  return (
    <div className="w-full max-w-lg bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl relative text-slate-100">
      {/* Step Header */}
      <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white uppercase tracking-wider">Set Up Eco-Profile</h2>
          <p className="text-[10px] text-slate-400">Step {step} of 3</p>
        </div>
        <div className="flex gap-1">
          <span className={`w-6 h-1 rounded-full ${step >= 1 ? 'bg-emerald-500' : 'bg-slate-800'}`} />
          <span className={`w-6 h-1 rounded-full ${step >= 2 ? 'bg-emerald-500' : 'bg-slate-800'}`} />
          <span className={`w-6 h-1 rounded-full ${step >= 3 ? 'bg-emerald-500' : 'bg-slate-800'}`} />
        </div>
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs p-3 rounded-xl mb-4 text-left font-medium animate-fadeIn">
          ⚠️ {error}
        </div>
      )}

      {/* STEP 1: Personal Details */}
      {step === 1 && (
        <div className="space-y-6 text-left">
          <div className="space-y-2 text-center py-2">
            <p className="text-xs text-slate-400">Welcome! Let’s start by setting up your public profile identity.</p>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Full Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Aarya K"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-slate-950 text-slate-200 border border-slate-800 rounded-xl p-3 text-xs focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Profile Photo (Optional)</label>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full border border-slate-800 bg-slate-950 flex items-center justify-center overflow-hidden shrink-0 relative">
                {avatarPreview || avatarUrl ? (
                  <img src={avatarPreview || avatarUrl} alt="Avatar Preview" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xl">👤</span>
                )}
              </div>
              <div className="space-y-1">
                <input
                  type="file"
                  id="avatar-upload"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="avatar-upload"
                  className="px-3 py-1.5 border border-slate-800 bg-slate-950 hover:bg-slate-900 text-slate-300 hover:text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors inline-block"
                >
                  Choose File
                </label>
                <p className="text-[9px] text-slate-500">Max size: 2MB (PNG, JPG, or SVG)</p>
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              onClick={handleNextStep}
              className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-semibold rounded-xl text-xs shadow-md transition-all cursor-pointer"
            >
              Continue ➔
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Eco Goals */}
      {step === 2 && (
        <div className="space-y-6 text-left">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Choose Sustainability Goal</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1.5">
              {(Object.keys(goalDescriptions) as Array<keyof typeof goalDescriptions>).map((g) => {
                const item = goalDescriptions[g];
                const isSelected = goal === g;
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGoal(g)}
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-500/[0.03] border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                        : 'bg-slate-950/40 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{item.icon}</span>
                      <span className="text-xs font-bold text-white">{item.title}</span>
                    </div>
                    <p className="text-[9px] text-slate-400 mt-2 leading-relaxed">{item.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Target Carbon Reduction</label>
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
            <p className="text-[9px] text-slate-500">
              The percentage of carbon emissions you commit to reducing this year compared to your calculated baseline.
            </p>
          </div>

          <div className="pt-4 flex justify-between">
            <button
              onClick={handlePrevStep}
              className="px-4 py-2.5 border border-slate-800 hover:border-slate-700 hover:bg-slate-900 text-slate-400 hover:text-slate-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              ↩ Back
            </button>
            <button
              onClick={handleNextStep}
              className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-semibold rounded-xl text-xs shadow-md transition-all cursor-pointer"
            >
              Continue ➔
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Summary & Launch */}
      {step === 3 && (
        <div className="space-y-6 text-left">
          <div className="space-y-2 text-center py-2">
            <p className="text-xs text-slate-400">All set! Let’s review your eco-goals before launching your ledger.</p>
          </div>

          <div className="bg-slate-950/50 border border-slate-850 rounded-xl p-4 space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full border border-slate-800 bg-slate-900 flex items-center justify-center overflow-hidden shrink-0">
                {avatarPreview || avatarUrl ? (
                  <img src={avatarPreview || avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-lg">👤</span>
                )}
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">{fullName}</h4>
                <p className="text-[9px] text-slate-500">EcoPulse Member</p>
              </div>
            </div>

            <div className="border-t border-slate-900 pt-3 grid grid-cols-2 gap-4">
              <div>
                <span className="text-[8px] font-bold text-slate-500 uppercase tracking-wider block">Active Goal</span>
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 mt-0.5">
                  {goalDescriptions[goal].icon} {goalDescriptions[goal].title}
                </span>
              </div>
              <div>
                <span className="text-[8px] font-bold text-slate-500 uppercase tracking-wider block">Carbon Target</span>
                <span className="text-xs font-bold text-white mt-0.5 block">
                  {reductionTarget}% Reduction
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-between">
            <button
              disabled={loading}
              onClick={handlePrevStep}
              className="px-4 py-2.5 border border-slate-800 hover:border-slate-700 hover:bg-slate-900 text-slate-400 hover:text-slate-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
            >
              ↩ Back
            </button>
            <button
              disabled={loading}
              onClick={handleSubmitOnboarding}
              className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-semibold rounded-xl text-xs shadow-lg shadow-emerald-500/10 transition-all cursor-pointer flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  <span>Configuring Profile...</span>
                </>
              ) : (
                <>
                  <span>Begin Eco-Journey 🚀</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

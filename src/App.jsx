import React, { useState } from 'react';
import { useCalculator } from './context/CalculatorContext';
import { supabase } from './lib/supabaseClient';
import { WelcomeScreen } from './components/WelcomeScreen';
import { DietScreen } from './components/DietScreen';
import { TransportScreen } from './components/TransportScreen';
import { HouseholdScreen } from './components/HouseholdScreen';
import { ResultsScreen } from './components/ResultsScreen';

function App() {
  const { state, setStep, resetCalculator, loginDemoUser } = useCalculator();
  const { currentStep } = state.ui;
  const { user, loadingAuth } = state;

  // Local Auth UI States
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Auth Handler
  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    const isNetworkError = (msg) => {
      const m = String(msg).toLowerCase();
      return m.includes('fetch') || m.includes('network') || m.includes('failed');
    };

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) {
          if (isNetworkError(error.message)) {
            console.log('Network error during signup. Activating Offline Mode.');
            loginDemoUser(email);
            return;
          }
          setAuthError(error.message);
        } else {
          alert('Check your email for a confirmation link to complete registration!');
          setEmail('');
          setPassword('');
          setIsSignUp(false);
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          if (isNetworkError(error.message)) {
            console.log('Network error during login. Activating Offline Mode.');
            loginDemoUser(email);
            return;
          }
          setAuthError(error.message);
        }
      }
    } catch (err) {
      const msg = err?.message || '';
      if (isNetworkError(msg)) {
        console.log('Caught network exception. Activating Offline Mode.');
        loginDemoUser(email);
      } else {
        setAuthError('An unexpected authentication error occurred.');
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      if (user && user.id !== 'demo-user-id') {
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.warn('Network error during Supabase signOut. Proceeding with local signout.');
    } finally {
      resetCalculator();
    }
  };

  // Simple steps list for stepper UI
  const steps = [
    { id: 'welcome', label: 'Welcome' },
    { id: 'diet', label: 'Diet' },
    { id: 'transport', label: 'Transport' },
    { id: 'household', label: 'Energy' },
    { id: 'results', label: 'Results' }
  ];

  // Helper to find step index
  const currentStepIndex = steps.findIndex(s => s.id === currentStep);

  // Programmatic switch for internal onboarding views
  const renderStepContent = () => {
    switch (currentStep) {
      case 'welcome':
        return <WelcomeScreen />;
      case 'diet':
        return <DietScreen />;
      case 'transport':
        return <TransportScreen />;
      case 'household':
        return <HouseholdScreen />;
      case 'results':
        return <ResultsScreen />;
      default:
        return null;
    }
  };

  // 1. Loading Auth State Shell
  if (loadingAuth) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-400 rounded-full animate-spin" />
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider animate-pulse">
            Establishing Secured Session...
          </p>
        </div>
      </div>
    );
  }

  // 2. Route Case A: Unauthenticated Marketing Landing & Auth Switch
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-zinc-950 text-slate-100 flex flex-col items-center justify-between p-4 relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-[100px] -z-10" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/5 rounded-full blur-[100px] -z-10" />

        {/* Header Navigation */}
        <header className="max-w-5xl w-full flex items-center justify-between py-4 px-2 border-b border-slate-900">
          <div className="flex items-center gap-2">
            <span className="text-emerald-500 text-xl">🌱</span>
            <span className="text-2xl font-black bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent tracking-tight">
              EcoPulse
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
            <span>SECURE GATEWAY</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>
        </header>

        {/* Main Hero & Auth Split Grid */}
        <main className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 my-auto py-10 items-center">
          {/* Left Column: Product Information (7/12 width) */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wide">
              Sprint 3 Completed
            </div>
            
            <h1 className="text-4xl sm:text-5xl font-black text-white leading-tight tracking-tight">
              Track Your Impact.<br />
              <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                Change the Future.
              </span>
            </h1>
            
            <p className="text-slate-400 text-sm sm:text-base max-w-lg leading-relaxed">
              EcoPulse is an elite carbon diagnostic ledger that helps you compute, simulate, and check off sustainable goals. Sign in to sync your achievements and build a net-zero streak.
            </p>

            {/* Features Micro Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="bg-slate-900/30 border border-slate-800 p-3 rounded-xl">
                <span className="text-lg">📊</span>
                <h3 className="text-xs font-bold text-slate-200 mt-1.5 uppercase tracking-wider">Quiz Baseline</h3>
                <p className="text-[10px] text-slate-500 mt-1 leading-normal">
                  Calculate per-capita footprints across Diet, Commutes, and Utilities.
                </p>
              </div>

              <div className="bg-slate-900/30 border border-slate-800 p-3 rounded-xl">
                <span className="text-lg">🏆</span>
                <h3 className="text-xs font-bold text-slate-200 mt-1.5 uppercase tracking-wider">Active Ledger</h3>
                <p className="text-[10px] text-slate-500 mt-1 leading-normal">
                  Log daily habits, accumulate streaks, and earn sustainability badges.
                </p>
              </div>

              <div className="bg-slate-900/30 border border-slate-800 p-3 rounded-xl">
                <span className="text-lg">🔬</span>
                <h3 className="text-xs font-bold text-slate-200 mt-1.5 uppercase tracking-wider">Sandbox Mode</h3>
                <p className="text-[10px] text-slate-500 mt-1 leading-normal">
                  Simulate future lifestyles via sliders to project carbon reductions.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Login/SignUp Panel (5/12 width) */}
          <div className="lg:col-span-5 w-full bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl relative">
            <div className="space-y-1.5 text-left mb-6">
              <h2 className="text-xl font-extrabold text-white">
                {isSignUp ? 'Create Eco-Account' : 'Access Dashboard'}
              </h2>
              <p className="text-xs text-slate-400">
                {isSignUp ? 'Register to sync diagnostic scores and unlock streaks.' : 'Sign in to access your dashboard ledger workspace.'}
              </p>
            </div>

            {/* Error alerts */}
            {authError && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs p-3 rounded-xl mb-4 text-left font-medium animate-fadeIn space-y-2">
                <div>⚠️ {authError}</div>
                {authError.toLowerCase().includes('fetch') && (
                  <div className="pt-1.5 border-t border-rose-500/10">
                    <button
                      type="button"
                      onClick={() => loginDemoUser(email || 'demo@ecopulse.org')}
                      className="text-emerald-400 hover:text-emerald-300 font-bold underline cursor-pointer transition-colors text-[10px]"
                    >
                      💡 Network Issue? Continue in Offline Demo Mode ➜
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Auth Form */}
            <form onSubmit={handleAuth} className="space-y-4 text-left">
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

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950 text-slate-200 border border-slate-800 rounded-xl p-3 text-xs focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-semibold rounded-xl text-xs shadow-lg hover:shadow-emerald-500/10 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
              >
                {authLoading ? (
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : isSignUp ? (
                  'Create Secure Account'
                ) : (
                  'Access Private Dashboard'
                )}
              </button>
            </form>

            {!isSignUp && (
              <>
                <div className="relative flex py-2.5 items-center">
                  <div className="flex-grow border-t border-slate-800"></div>
                  <span className="flex-shrink mx-3 text-[9px] text-slate-500 font-mono tracking-wider">OR</span>
                  <div className="flex-grow border-t border-slate-800"></div>
                </div>

                <button
                  type="button"
                  onClick={() => loginDemoUser('demo@ecopulse.org')}
                  className="w-full py-3 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white font-semibold rounded-xl text-xs shadow-md active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  ⚡ Launch Demo Mode (Offline)
                </button>
              </>
            )}

            {/* Switch Mode Toggle */}
            <div className="mt-6 pt-4 border-t border-slate-800/80 text-center text-xs">
              <span className="text-slate-500">
                {isSignUp ? 'Already have an account? ' : "New to the platform? "}
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setAuthError('');
                }}
                className="text-emerald-400 hover:text-emerald-300 font-bold underline cursor-pointer transition-colors"
              >
                {isSignUp ? 'Sign In Here' : 'Register Account'}
              </button>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="py-4 text-xs text-slate-600 border-t border-slate-900 w-full max-w-5xl text-center">
          © 2026 EcoPulse Carbon Diagnostics Inc. Encrypted user sessions.
        </footer>
      </div>
    );
  }

  // 3. Route Case B: Authenticated User Protected Dashboard Workspace
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-zinc-950 text-slate-100 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] -z-10 animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-[100px] -z-10" />

      {/* Protected Workspace Layout */}
      <div className="max-w-2xl w-full flex flex-col gap-6">
        
        {/* Header Workspace Navbar */}
        <div className="flex items-center justify-between px-2 bg-slate-950/40 border border-slate-900 rounded-2xl py-3 px-4 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="text-emerald-500 text-lg">🌱</span>
            <span className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              EcoPulse
            </span>
            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono uppercase font-bold shrink-0">
              Workspace
            </span>
            {user.id === 'demo-user-id' && (
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono uppercase font-bold shrink-0">
                Offline Mode
              </span>
            )}
          </div>
          
          {/* User Profile Info & Sign Out */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-[10px] text-slate-400 font-bold leading-none truncate max-w-[150px]">
                {user.email}
              </div>
              <span className="text-[8px] text-slate-500 font-mono tracking-wide">
                {user.id === 'demo-user-id' ? 'Offline Demo Session' : 'Secured Session'}
              </span>
            </div>
            
            <button
              onClick={handleSignOut}
              className="px-3 py-1.5 border border-slate-800 bg-slate-900/60 hover:bg-slate-850 hover:border-slate-700 text-slate-400 hover:text-white font-medium text-[10px] uppercase font-bold tracking-wide rounded-xl active:scale-95 transition-all cursor-pointer flex items-center gap-1 shrink-0"
              title="Sign Out"
            >
              Sign Out ↩
            </button>
          </div>
        </div>

        {/* Stepper Navigation Indicator */}
        {currentStep !== 'welcome' && (
          <div className="w-full bg-slate-900/40 border border-slate-800/80 rounded-xl px-6 py-4 flex justify-between items-center relative overflow-hidden backdrop-blur-md">
            {/* Connecting line */}
            <div className="absolute top-1/2 left-[12%] right-[12%] h-0.5 bg-slate-800 -translate-y-1/2 -z-10" />
            <div 
              className="absolute top-1/2 left-[12%] h-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 -translate-y-1/2 -z-10 transition-all duration-300 ease-in-out" 
              style={{
                width: `${Math.max(0, currentStepIndex - 1) * 33.333}%`
              }}
            />

            {steps.slice(1).map((step, idx) => {
              const stepNum = idx + 1;
              const isCompleted = stepNum < currentStepIndex;
              const isActive = step.id === currentStep;
              
              return (
                <div key={step.id} className="flex flex-col items-center gap-1.5 z-10">
                  <button
                    disabled={stepNum > currentStepIndex}
                    onClick={() => setStep(step.id)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                      isActive 
                        ? 'bg-emerald-500 text-slate-950 ring-4 ring-emerald-500/20 scale-110 shadow-[0_0_15px_rgba(16,185,129,0.4)] font-extrabold'
                        : isCompleted
                          ? 'bg-gradient-to-br from-emerald-600 to-teal-600 text-white cursor-pointer hover:brightness-110'
                          : 'bg-slate-900 border border-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    {isCompleted ? '✓' : stepNum}
                  </button>
                  <span className={`text-[10px] font-medium transition-colors duration-300 ${
                    isActive ? 'text-emerald-400 font-bold' : isCompleted ? 'text-slate-300' : 'text-slate-500'
                  }`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Center protected diagnostic view layout */}
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl shadow-2xl p-6 sm:p-8 transition-all duration-300 ease-in-out">
          {renderStepContent()}
        </div>

        {/* Footer info */}
        <div className="text-center text-xs text-slate-600">
          Authenticated Workspace Session. Science-backed default coefficients.
        </div>
      </div>
    </div>
  );
}

export default App;

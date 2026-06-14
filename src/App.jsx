import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { useCalculator } from './context/CalculatorContext';

// Import Auth screens and wrappers
import { Login } from './components/auth/Login';
import { Signup } from './components/auth/Signup';
import { ForgotPassword } from './components/auth/ForgotPassword';
import { ResetPassword } from './components/auth/ResetPassword';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Navbar } from './components/Navbar';

// Import Onboarding steps
import { WelcomeScreen } from './components/WelcomeScreen';
import { DietScreen } from './components/DietScreen';
import { TransportScreen } from './components/TransportScreen';
import { HouseholdScreen } from './components/HouseholdScreen';
import { ResultsScreen } from './components/ResultsScreen';

// 1. Shared Layout for Guest Auth Pages
const AuthLayout = ({ children }) => {
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
        {/* Left Column: Product Information */}
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

        {/* Right Column: Injected Auth Forms */}
        <div className="lg:col-span-5 w-full flex justify-center">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-xs text-slate-600 border-t border-slate-900 w-full max-w-5xl text-center">
        © 2026 EcoPulse Carbon Diagnostics Inc. Encrypted user sessions.
      </footer>
    </div>
  );
};

// 2. Shared Layout for Protected Dashboard
const DashboardLayout = () => {
  const { state, setStep } = useCalculator();
  const { currentStep } = state.ui;

  const steps = [
    { id: 'welcome', label: 'Welcome' },
    { id: 'diet', label: 'Diet' },
    { id: 'transport', label: 'Transport' },
    { id: 'household', label: 'Energy' },
    { id: 'results', label: 'Results' }
  ];

  const currentStepIndex = steps.findIndex(s => s.id === currentStep);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-zinc-950 text-slate-100 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] -z-10 animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-[100px] -z-10" />

      {/* Protected Workspace Layout */}
      <div className="max-w-2xl w-full flex flex-col gap-6">
        {/* Global Navbar */}
        <Navbar />

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
};

// 3. App Core Router Configuration
function App() {
  const { user, loading } = useAuth();

  if (loading) {
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

  return (
    <Routes>
      {/* Guest Paths */}
      <Route
        path="/login"
        element={
          user ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <AuthLayout>
              <Login />
            </AuthLayout>
          )
        }
      />
      <Route
        path="/signup"
        element={
          user ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <AuthLayout>
              <Signup />
            </AuthLayout>
          )
        }
      />
      <Route
        path="/forgot-password"
        element={
          user ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <AuthLayout>
              <ForgotPassword />
            </AuthLayout>
          )
        }
      />
      <Route
        path="/reset-password"
        element={
          <AuthLayout>
            <ResetPassword />
          </AuthLayout>
        }
      />

      {/* Protected Workspace Path */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      />

      {/* Wildcard Fallback Paths */}
      <Route
        path="/"
        element={<Navigate to={user ? "/dashboard" : "/login"} replace />}
      />
      <Route
        path="*"
        element={<Navigate to={user ? "/dashboard" : "/login"} replace />}
      />
    </Routes>
  );
}

export default App;

import React from 'react';
import { useCalculator } from './context/CalculatorContext';
import { WelcomeScreen } from './components/WelcomeScreen';
import { DietScreen } from './components/DietScreen';
import { TransportScreen } from './components/TransportScreen';
import { HouseholdScreen } from './components/HouseholdScreen';
import { ResultsScreen } from './components/ResultsScreen';

function App() {
  const { state, setStep, resetCalculator } = useCalculator();
  const { currentStep } = state.ui;

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

  // Quick internal templates for each step
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

      {/* Main Container */}
      <div className="max-w-2xl w-full flex flex-col gap-6">
        
        {/* Header Branding */}
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              EcoTrace
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono">
              hackathon v1.0
            </span>
          </div>
          
          <div className="text-xs text-slate-500 font-medium">
            Carbon Footprint Awareness
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

        {/* Center Card Wrapper */}
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl shadow-2xl p-8 transition-all duration-300 ease-in-out">
          {renderStepContent()}
        </div>

        {/* Footer info */}
        <div className="text-center text-xs text-slate-600">
          Built with React, Vite, and Tailwind CSS. Science-backed default coefficients.
        </div>
      </div>
    </div>
  );
}

export default App;

import React from 'react';
import { useCalculator } from '../context/CalculatorContext';

export const WelcomeScreen: React.FC = () => {
  const { setStep } = useCalculator();

  return (
    <div className="text-center py-4 flex flex-col items-center">
      {/* Dynamic Status Badge */}
      <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-6 tracking-wide uppercase shadow-[0_0_15px_rgba(16,185,129,0.05)]">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
        Carbon Diagnostic Engine
      </div>

      {/* Hero Headings */}
      <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight max-w-lg mb-4">
        Track Your Impact.<br />
        <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
          Change the Future.
        </span>
      </h1>
      
      {/* Underline Copy */}
      <p className="text-slate-400 text-sm sm:text-base max-w-md mx-auto mb-10 leading-relaxed">
        Our fast 3-step diagnostic calculates your annual CO₂ footprint across diet, transportation, and energy habits to deliver actionable, personalized reduction strategies.
      </p>

      {/* Micro-Metrics Diagnostic Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-xl mb-10 text-left">
        {/* Diet Card */}
        <div className="bg-slate-900/40 border border-slate-800 p-4 rounded-xl hover:border-emerald-500/30 transition-all duration-350 group hover:-translate-y-0.5">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-3 group-hover:bg-emerald-500/20 group-hover:scale-105 transition-all">
            <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c-1.2 0-2.4.4-3.4 1.2A9 9 0 004 12c0 4.4 3.6 8 8 8s8-3.6 8-8a9 9 0 00-4.6-7.8c-1-.8-2.2-1.2-3.4-1.2z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c2.5 0 4.5 1 5.5 3M12 12c-2.5 0-4.5 1-5.5 3" />
            </svg>
          </div>
          <h3 className="text-sm font-semibold text-white mb-1">1. Consumption</h3>
          <p className="text-xs text-slate-500 leading-normal">
            Analyze the impact of your daily dietary profile and food habits.
          </p>
        </div>

        {/* Mobility Card */}
        <div className="bg-slate-900/40 border border-slate-800 p-4 rounded-xl hover:border-teal-500/30 transition-all duration-350 group hover:-translate-y-0.5">
          <div className="w-10 h-10 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center mb-3 group-hover:bg-teal-500/20 group-hover:scale-105 transition-all">
            <svg className="w-5 h-5 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </div>
          <h3 className="text-sm font-semibold text-white mb-1">2. Mobility</h3>
          <p className="text-xs text-slate-500 leading-normal">
            Measure weekly vehicle commutes and annual flight ranges.
          </p>
        </div>

        {/* Utilities Card */}
        <div className="bg-slate-900/40 border border-slate-800 p-4 rounded-xl hover:border-cyan-500/30 transition-all duration-350 group hover:-translate-y-0.5">
          <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-3 group-hover:bg-cyan-500/20 group-hover:scale-105 transition-all">
            <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </div>
          <h3 className="text-sm font-semibold text-white mb-1">3. Utilities</h3>
          <p className="text-xs text-slate-500 leading-normal">
            Track household electricity usage and home heating fuels.
          </p>
        </div>
      </div>

      {/* Interactive CTA Button */}
      <button
        onClick={() => setStep('diet')}
        className="group relative inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-semibold rounded-xl shadow-lg shadow-emerald-950/20 hover:shadow-emerald-500/35 active:scale-[0.98] transition-all duration-200"
      >
        Begin Carbon Assessment
        <svg 
          className="w-5 h-5 transition-transform duration-250 group-hover:translate-x-1" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor" 
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
      </button>
    </div>
  );
};

import React from 'react';
import { useCalculator } from '../context/CalculatorContext';

export const ResultsScreen: React.FC = () => {
  const { state, resetCalculator } = useCalculator();
  const { dietAnnualCO2e, transportAnnualCO2e, householdAnnualCO2e, totalAnnualCO2e } = state.results;

  // Helper to format numbers with commas
  const formatNumber = (num: number): string => {
    return Math.round(num).toLocaleString();
  };

  // Calculate percentage contributions safely
  const getPercentage = (value: number): number => {
    if (totalAnnualCO2e === 0) return 0;
    return (value / totalAnnualCO2e) * 100;
  };

  const dietPercentage = getPercentage(dietAnnualCO2e);
  const transportPercentage = getPercentage(transportAnnualCO2e);
  const householdPercentage = getPercentage(householdAnnualCO2e);

  // Generate dynamic environmental insights based on results
  const insights = [];

  if (dietAnnualCO2e > 1500) {
    insights.push({
      type: 'diet',
      icon: '🌱',
      color: 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400',
      title: 'Optimize Diet Footprint',
      text: 'Transitioning to more plant-based meals (like Vegetarian or Low-Meat) can slash food-related emissions by up to 50% and reduce global agricultural resource demand.',
    });
  }

  if (transportAnnualCO2e > 2000) {
    insights.push({
      type: 'transport',
      icon: '🚗',
      color: 'border-teal-500/20 bg-teal-500/5 text-teal-400',
      title: 'Reduce Transit Emissions',
      text: 'Optimize daily commutes by carpooling, opting for public transit, or cycling when possible. If options allow, consider switching to an Electric Vehicle (EV) to lower travel emissions.',
    });
  }

  if (householdAnnualCO2e > 1500 && !state.habits.household.electricity.isRenewableTariff) {
    insights.push({
      type: 'energy',
      icon: '⚡',
      color: 'border-cyan-500/20 bg-cyan-500/5 text-cyan-400',
      title: 'Switch to Green Energy',
      text: 'Enrolling in a certified 100% Green/Renewable Energy Tariff reduces grid electricity coefficients from 0.38 to 0.02 kg CO₂e/kWh, eliminating most of your electricity impact.',
    });
  }

  // Base fallback if footprint is very low
  if (insights.length === 0) {
    insights.push({
      type: 'general',
      icon: '✨',
      color: 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400',
      title: 'Excellent Sustainable Baseline',
      text: 'Your carbon footprint is remarkably low and aligns with global climate targets. Share your diagnostic link with others to promote carbon reduction awareness!',
    });
  }

  const isBelowTarget = totalAnnualCO2e <= 4000;

  return (
    <div className="space-y-6">
      {/* Visual Header */}
      <div className="text-center pb-2 border-b border-slate-800/60">
        <span className="text-3xl" role="img" aria-label="analytics">📊</span>
        <h2 className="text-2xl font-bold text-white mt-1">Carbon Analytics Dashboard</h2>
        <p className="text-slate-400 text-xs mt-1">
          Detailed impact analysis and personalized reduction pathways.
        </p>
      </div>

      {/* Master KPI Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800/80 rounded-2xl p-6 text-center shadow-inner relative overflow-hidden">
        <div className="absolute inset-0 bg-emerald-500/[0.02] pointer-events-none" />
        
        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">
          Estimated Annual Emissions
        </p>
        
        <div className="text-3xl sm:text-4xl font-extrabold text-white font-mono tracking-tight">
          {formatNumber(totalAnnualCO2e)}{' '}
          <span className="text-sm font-medium text-slate-400">kg CO₂e / year</span>
        </div>

        {/* Global Target Comparison Badge */}
        <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border bg-slate-950/80">
          <span className={`w-2 h-2 rounded-full ${isBelowTarget ? 'bg-emerald-400' : 'bg-amber-400'}`} />
          <span className="text-slate-400">
            {isBelowTarget 
              ? 'Below standard target of 4,000 kg CO₂e/yr' 
              : `Above standard target by ${formatNumber(totalAnnualCO2e - 4000)} kg CO₂e/yr`
            }
          </span>
        </div>
      </div>

      {/* 3-Category Breakdown Grid */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Habit Breakdown</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          {/* Diet Card */}
          <div className="bg-slate-900/20 border border-slate-800 p-4 rounded-xl flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Diet</span>
                <div className="text-lg font-bold text-white font-mono mt-0.5">
                  {formatNumber(dietAnnualCO2e)} <span className="text-[10px] text-slate-500">kg</span>
                </div>
              </div>
              <span className="text-emerald-400 text-sm">🌱</span>
            </div>
            <div className="mt-4 space-y-1.5">
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>Contribution</span>
                <span className="font-mono font-semibold">{dietPercentage.toFixed(1)}%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
                  style={{ width: `${dietPercentage}%` }}
                />
              </div>
            </div>
          </div>

          {/* Transport Card */}
          <div className="bg-slate-900/20 border border-slate-800 p-4 rounded-xl flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Transport</span>
                <div className="text-lg font-bold text-white font-mono mt-0.5">
                  {formatNumber(transportAnnualCO2e)} <span className="text-[10px] text-slate-500">kg</span>
                </div>
              </div>
              <span className="text-teal-400 text-sm">🚗</span>
            </div>
            <div className="mt-4 space-y-1.5">
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>Contribution</span>
                <span className="font-mono font-semibold">{transportPercentage.toFixed(1)}%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-teal-500 rounded-full transition-all duration-500" 
                  style={{ width: `${transportPercentage}%` }}
                />
              </div>
            </div>
          </div>

          {/* Household Card */}
          <div className="bg-slate-900/20 border border-slate-800 p-4 rounded-xl flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Utilities</span>
                <div className="text-lg font-bold text-white font-mono mt-0.5">
                  {formatNumber(householdAnnualCO2e)} <span className="text-[10px] text-slate-500">kg</span>
                </div>
              </div>
              <span className="text-cyan-400 text-sm">⚡</span>
            </div>
            <div className="mt-4 space-y-1.5">
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>Contribution</span>
                <span className="font-mono font-semibold">{householdPercentage.toFixed(1)}%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-cyan-500 rounded-full transition-all duration-500" 
                  style={{ width: `${householdPercentage}%` }}
                />
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Dynamic Recommendation Panel */}
      <div className="space-y-3 border-t border-slate-800/60 pt-4">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
          Personalized Reduction Plan
        </h3>
        
        <div className="space-y-2.5 max-h-[180px] overflow-y-auto pr-1 custom-scrollbar">
          {insights.map((insight, index) => (
            <div 
              key={index}
              className={`flex items-start gap-3 p-3.5 rounded-xl border border-slate-800/60 bg-slate-950/40`}
            >
              <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-sm shrink-0">
                {insight.icon}
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-slate-200">
                  {insight.title}
                </h4>
                <p className="text-[11px] text-slate-400 leading-normal">
                  {insight.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Administrative Control Actions */}
      <div className="flex justify-center pt-4 border-t border-slate-800/80">
        <button
          onClick={resetCalculator}
          className="group inline-flex items-center gap-1.5 px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl transition-all duration-200 active:scale-95 text-sm"
        >
          <svg className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H17" />
          </svg>
          Retake Assessment
        </button>
      </div>
    </div>
  );
};

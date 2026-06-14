import React from 'react';
import { useCalculator, MITIGATION_TASKS } from '../context/CalculatorContext';

export const ResultsScreen: React.FC = () => {
  const { state, resetCalculator, toggleTaskCompletion } = useCalculator();
  
  const { 
    dietAnnualCO2e, 
    transportAnnualCO2e, 
    householdAnnualCO2e, 
    totalAnnualCO2e,
    mitigationCO2eSavings,
    reducedAnnualCO2e
  } = state.results;

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

  // Filter dynamic mitigation tasks matched to active categories
  const activeTasks = MITIGATION_TASKS.filter(task => 
    state.mitigation.activeTaskIds.includes(task.id)
  );

  // Evaluate net adjusted target status
  const isBelowTarget = reducedAnnualCO2e <= 4000;

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

      {/* Dynamic Master KPI Banner Upgrade */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800/80 rounded-2xl p-6 text-center shadow-inner relative overflow-hidden">
        <div className="absolute inset-0 bg-emerald-500/[0.01] pointer-events-none" />
        
        <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-2">
          Carbon Impact Summary
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 py-2">
          {/* Baseline Footprint */}
          <div className="text-center sm:text-right">
            <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">Baseline Footprint</span>
            <span className="text-xl sm:text-2xl font-bold text-slate-400 font-mono tracking-tight">
              {formatNumber(totalAnnualCO2e)} <span className="text-xs font-normal">kg</span>
            </span>
          </div>

          {/* Transition Indicator */}
          <div className="text-slate-600 rotate-90 sm:rotate-0 text-xl font-bold">
            ➔
          </div>

          {/* Net Adjusted Footprint */}
          <div className="text-center sm:text-left">
            <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider block">Net Footprint</span>
            <span className="text-3xl sm:text-4xl font-extrabold text-emerald-400 font-mono tracking-tight drop-shadow-[0_0_15px_rgba(52,211,153,0.15)] animate-pulse">
              {formatNumber(reducedAnnualCO2e)} <span className="text-xs font-semibold">kg CO₂e/yr</span>
            </span>
          </div>
        </div>

        {/* Global Target Comparison & Dynamic Impact Badges */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold border bg-slate-950/80 border-slate-800">
            <span className={`w-2 h-2 rounded-full ${isBelowTarget ? 'bg-emerald-400' : 'bg-amber-400'}`} />
            <span className="text-slate-400">
              {isBelowTarget 
                ? 'Below standard target of 4,000 kg CO₂e/yr' 
                : `Above standard target by ${formatNumber(reducedAnnualCO2e - 4000)} kg CO₂e/yr`
              }
            </span>
          </div>

          {mitigationCO2eSavings > 0 && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold border bg-emerald-500/10 border-emerald-500/20 text-emerald-400 animate-fadeIn">
              <span>🎉 Impact Created: Mitigated {formatNumber(mitigationCO2eSavings)} kg/yr!</span>
            </div>
          )}
        </div>
      </div>

      {/* 3-Category Breakdown Grid */}
      <div className="space-y-3">
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

      {/* Personalized Mitigation Checklist Section */}
      <div className="space-y-3 border-t border-slate-800/60 pt-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Your Personalized Eco-Action Plan
          </h3>
          <span className="text-[10px] text-slate-500 font-medium">
            Select items to simulate carbon reduction
          </span>
        </div>
        
        <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-1 custom-scrollbar">
          {activeTasks.map((task) => {
            const isCompleted = state.mitigation.completedTaskIds.includes(task.id);
            return (
              <label 
                key={task.id}
                className={`flex items-start gap-4 p-4 rounded-xl border transition-all duration-200 cursor-pointer select-none ${
                  isCompleted
                    ? 'bg-emerald-500/5 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.05)]'
                    : 'bg-slate-900/20 border-slate-800/80 hover:border-slate-700 hover:-translate-y-0.5'
                }`}
              >
                {/* Custom Checkbox */}
                <div className="mt-0.5">
                  <input
                    type="checkbox"
                    checked={isCompleted}
                    onChange={() => toggleTaskCompletion(task.id)}
                    className="sr-only"
                  />
                  <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all duration-200 ${
                    isCompleted ? 'border-emerald-500 bg-emerald-500 text-slate-950 scale-105 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'border-slate-700 bg-slate-950'
                  }`}>
                    {isCompleted && (
                      <svg className="w-3.5 h-3.5 font-bold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>

                {/* Task Title & Description */}
                <div className="flex-1 min-w-0 text-left">
                  <h4 className={`text-xs font-bold transition-all duration-200 ${
                    isCompleted ? 'text-slate-500 line-through' : 'text-slate-200'
                  }`}>
                    {task.title}
                  </h4>
                  <p className={`text-[10px] leading-relaxed transition-all duration-200 mt-0.5 ${
                    isCompleted ? 'text-slate-600 line-through' : 'text-slate-400'
                  }`}>
                    {task.description}
                  </p>
                </div>

                {/* Impact Badge */}
                <div className="shrink-0 pl-2">
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                    isCompleted 
                      ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-extrabold' 
                      : 'border-slate-800 bg-slate-900/50 text-slate-400'
                  }`}>
                    -{task.annualCO2eSaved} kg/yr
                  </span>
                </div>
              </label>
            );
          })}
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

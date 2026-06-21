import React from 'react';
import { useCalculator, MITIGATION_TASKS, HABIT_DICTIONARY } from '../context/CalculatorContext';
import { REGIONAL_COMPARISONS } from '../types/calculator';
import { AnimatedEcoIcon } from './eco-ui/AnimatedEcoIcon';

export const ResultsScreen: React.FC = () => {
  const { 
    state, 
    resetCalculator, 
    toggleTaskCompletion, 
    addActivityLog, 
    removeActivityLog,
    updateSandbox 
  } = useCalculator();
  
  const { 
    dietAnnualCO2e, 
    transportAnnualCO2e, 
    householdAnnualCO2e, 
    totalAnnualCO2e,
    mitigationCO2eSavings,
    reducedAnnualCO2e,
    equivalencies,
    sandboxProjectedCO2e
  } = state.results;

  const { veganDaysPerWeekSim, carKmReductionSim } = state.sandbox;

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

  // Combine static regional comparison data with user net footprint, then sort descending
  const comparisonItems = [
    ...REGIONAL_COMPARISONS,
    { 
      region: 'user' as const, 
      label: 'Your Net Footprint (Adjusted)', 
      annualCO2e: reducedAnnualCO2e 
    }
  ].sort((a, b) => b.annualCO2e - a.annualCO2e);

  // Scaling base divisor is the max comparison score (to ensure proper percentage widths)
  const maxComparisonVal = Math.max(16000, reducedAnnualCO2e);

  // Evaluate net adjusted target status
  const isBelowTarget = reducedAnnualCO2e <= 4000;

  // Dynamically resolve badges (unlocked badges state + auto consistency unlock at >=2 days streak)
  const unlockedBadges = [...state.gamification.unlockedBadges];
  if (state.gamification.currentStreakDays >= 2) {
    unlockedBadges.push('badge-consistency');
  }

  // Predefined badge details list
  const badgesList = [
    {
      id: 'badge-first-step',
      title: 'First Milestone',
      description: 'Logged your first habit tracker entry.',
      icon: '🌱',
    },
    {
      id: 'badge-consistency',
      title: 'Consistency Champion',
      description: 'Maintained a multi-day eco-streak.',
      icon: '⚡',
    },
    {
      id: 'badge-eco-guardian',
      title: 'Eco Guardian',
      description: 'Saved more than 20kg of daily carbon.',
      icon: '🏆',
    },
  ];

  const sandboxSavings = reducedAnnualCO2e - sandboxProjectedCO2e;

  return (
    <div className="max-w-6xl mx-auto w-full space-y-8 text-slate-100">
      {/* Visual Header */}
      <div className="text-center pb-2 border-b border-slate-800/60">
        <span className="text-3xl" role="img" aria-label="analytics">📊</span>
        <h2 className="text-2xl font-bold text-white mt-1">Carbon Analytics Dashboard</h2>
        <p className="text-slate-400 text-xs mt-1">
          Detailed impact analysis and personalized reduction pathways.
        </p>
      </div>

      {/* Gamified Streak & Badge Showcase Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Left Block: Streak Counter */}
          <div className="bg-amber-500/[0.02] border border-amber-500/20 rounded-xl p-4 flex flex-col justify-center items-center text-center relative overflow-hidden">
          
          <div className="w-20 h-20 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-2 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
            <AnimatedEcoIcon name="flame" size={80} intensity="epic" trigger="always" glowColor="#f59e0b" />
          </div>
          
          <div className="text-3xl font-extrabold text-amber-400 font-mono tracking-tight leading-none">
            {state.gamification.currentStreakDays}
          </div>
          <div className="text-sm font-semibold text-amber-400 uppercase tracking-widest mt-1.5 font-display">
            Day Eco-Streak
          </div>
          
          <div className="text-xs text-slate-500 mt-1 font-body">
            Personal Record: {state.gamification.highestStreakDays} days
          </div>
        </div>

        {/* Right Block: Unlocked Badges Grid */}
        <div className="bg-slate-900/10 border border-slate-800/80 rounded-xl p-4 md:col-span-2 flex flex-col justify-between">
          <div className="text-sm font-semibold text-slate-300 uppercase tracking-widest font-display mb-2 text-left">
            Earned Achievement Badges
          </div>
          
          <div className="grid grid-cols-3 gap-2 flex-1">
            {badgesList.map((badge) => {
              const isUnlocked = unlockedBadges.includes(badge.id);
              return (
                <div 
                  key={badge.id}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all duration-350 text-center ${
                    isUnlocked
                      ? 'bg-emerald-500/[0.03] border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.06)]'
                      : 'bg-slate-900/10 border-slate-800/40 opacity-40 grayscale select-none'
                  }`}
                  title={badge.description}
                >
                  <span className={`text-xl ${isUnlocked ? 'scale-110 drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]' : ''}`}>
                    {badge.icon}
                  </span>
                  <span className="text-[9px] font-bold text-white tracking-wide mt-1.5 line-clamp-1">
                    {badge.title}
                  </span>
                  <span className="text-[8px] text-slate-500 mt-0.5 line-clamp-1 leading-none">
                    {isUnlocked ? 'Unlocked' : 'Locked'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Dynamic Master KPI Banner */}
      <div className="bg-slate-950 border border-emerald-500/20 rounded-xl p-4 text-center shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.02] to-teal-500/[0.02] pointer-events-none" />
        
        <p className="text-sm font-semibold text-slate-300 uppercase tracking-widest font-display mb-2">
          Carbon Impact Summary
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 py-2">
          {/* Baseline Footprint */}
          <div className="text-center sm:text-right">
            <span className="text-sm font-semibold text-slate-400 uppercase tracking-widest font-display block">Baseline Footprint</span>
            <span className="text-4xl sm:text-5xl font-extrabold text-slate-300 font-mono tracking-tight">
              {formatNumber(totalAnnualCO2e)} <span className="text-2xl text-slate-500 font-medium">kg</span>
            </span>
          </div>

          {/* Transition Indicator */}
          <div className="text-emerald-500/40 rotate-90 sm:rotate-0 text-xl font-bold">
            ➔
          </div>

          {/* Net Adjusted Footprint */}
          <div className="text-center sm:text-left">
            <span className="text-sm font-semibold text-emerald-400 uppercase tracking-widest font-display block">Net Footprint</span>
            <span className="text-5xl sm:text-6xl font-extrabold text-emerald-400 font-mono tracking-tight drop-shadow-[0_0_15px_rgba(52,211,153,0.25)]">
              {formatNumber(reducedAnnualCO2e)} <span className="text-2xl font-semibold text-emerald-400/70">kg CO₂e/yr</span>
            </span>
          </div>
        </div>

        {/* Global Target Comparison & Dynamic Impact Badges */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold border bg-slate-900/80 border-slate-800">
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

      {/* Visual Carbon Equivalents Matrix (The Emotional Hook) */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-widest font-display">
          Your Footprint in the Real World
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Tree Sequestration Card */}
          <div className="bg-slate-900/30 border border-slate-800 p-4 rounded-xl flex items-start gap-4 hover:border-emerald-500/20 transition-all">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18M5 12h14M12 8c2.5 0 4.5 1 5.5 3M12 12c-2.5 0-4.5 1-5.5 3" />
              </svg>
            </div>
            <div className="text-left space-y-1">
              <div className="text-4xl font-extrabold text-white font-mono leading-none">
                {equivalencies.treesRequiredCount.toFixed(1)}
              </div>
              <h4 className="text-xs font-semibold text-slate-300 font-display">Mature Trees Required</h4>
              <p className="text-[10px] text-slate-500 leading-relaxed">
                Number of mature trees needed to absorb your annual carbon emissions in one year.
              </p>
            </div>
          </div>

          {/* ICE Driving Equivalent Card */}
          <div className="bg-slate-900/30 border border-slate-800 p-4 rounded-xl flex items-start gap-4 hover:border-teal-500/20 transition-all">
            <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center shrink-0">
              <svg className="w-6 h-6 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div className="text-left space-y-1">
              <div className="text-4xl font-extrabold text-white font-mono leading-none">
                {formatNumber(equivalencies.iceCarDistanceEquivalentKm)} <span className="text-xl text-slate-500 font-medium">km</span>
              </div>
              <h4 className="text-xs font-semibold text-slate-300 font-display">Driving Kilometer Equivalent</h4>
              <p className="text-[10px] text-slate-500 leading-relaxed">
                Equivalent travel distance in a standard internal combustion engine passenger car.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3-Category Breakdown Grid */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-widest font-display">Habit Breakdown</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          {/* Diet Card */}
          <div className="bg-slate-900/20 border border-slate-800 p-4 rounded-xl flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-sm font-semibold text-slate-300 uppercase tracking-widest font-display">Diet</span>
                <div className="text-3xl sm:text-4xl font-extrabold text-white font-mono mt-1 leading-none">
                  {formatNumber(dietAnnualCO2e)} <span className="text-lg text-slate-500 font-medium">kg</span>
                </div>
              </div>
              <span className="text-emerald-400 text-xl">🌱</span>
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
                <span className="text-sm font-semibold text-slate-300 uppercase tracking-widest font-display">Transport</span>
                <div className="text-3xl sm:text-4xl font-extrabold text-white font-mono mt-1 leading-none">
                  {formatNumber(transportAnnualCO2e)} <span className="text-lg text-slate-500 font-medium">kg</span>
                </div>
              </div>
              <span className="text-teal-400 text-xl">🚗</span>
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
                <span className="text-sm font-semibold text-slate-300 uppercase tracking-widest font-display">Utilities</span>
                <div className="text-3xl sm:text-4xl font-extrabold text-white font-mono mt-1 leading-none">
                  {formatNumber(householdAnnualCO2e)} <span className="text-lg text-slate-500 font-medium">kg</span>
                </div>
              </div>
              <span className="text-cyan-400 text-xl">⚡</span>
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

      {/* Native Global Context Comparison Chart */}
      <div className="space-y-3 border-t border-slate-800/60 pt-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-widest font-display">
            Your Footprint vs. The World
          </h3>
          <span className="text-[10px] text-slate-500 font-medium font-mono">
            values in kg CO₂e/year
          </span>
        </div>
        
        {/* Dynamic Leaderboard Comparison Container */}
        <div className="space-y-3 bg-slate-900/10 border border-slate-800/80 p-4 rounded-xl">
          {comparisonItems.map((item, index) => {
            const isUser = item.region === 'user';
            const isTarget = item.region === 'target';
            const widthPct = (item.annualCO2e / maxComparisonVal) * 100;
            
            return (
              <div key={index} className="grid grid-cols-[150px_1fr_auto] items-center gap-x-4 animate-fadeIn">
                <span className={`text-xs font-semibold text-right truncate ${isUser ? 'text-emerald-400 font-bold' : isTarget ? 'text-teal-400' : 'text-slate-400'}`}>
                  {item.label} {isUser && '👈'}
                </span>
                <div className="h-3.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800/40">
                  <div 
                    className={`h-full rounded-full transition-all duration-700 ease-out ${
                      isUser
                        ? 'bg-gradient-to-r from-emerald-400 to-teal-400 shadow-[0_0_10px_rgba(52,211,153,0.35)]'
                        : isTarget
                          ? 'bg-teal-500/70 border-r border-teal-400/30'
                          : 'bg-slate-700/80'
                    }`}
                    style={{ width: `${widthPct}%` }}
                  />
                </div>
                <span className={`text-xs font-mono flex-shrink-0 ${isUser ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}>
                  {formatNumber(item.annualCO2e)} kg
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Personalized Mitigation Checklist Section */}
      <div className="space-y-3 border-t border-slate-800/60 pt-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-widest font-display">
            Your Personalized Eco-Action Plan
          </h3>
          <span className="text-[10px] text-slate-500 font-medium">
            Select items to simulate carbon reduction
          </span>
        </div>
        
        <div className="space-y-2.5 max-h-[200px] overflow-y-auto pr-1 custom-scrollbar">
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

      {/* Daily Habit Action & Logging Ledger Module */}
      <div className="space-y-3 border-t border-slate-800/60 pt-4 text-left">
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-widest font-display">
          Daily Sustainable Habit Logger
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 bg-slate-900/20 border border-slate-800/80 p-4 rounded-xl">
          {/* Left Side: Habit Action Matrix Buttons (3/5 width) */}
          <div className="lg:col-span-3 space-y-2.5">
            <div className="text-sm font-semibold text-slate-300 uppercase tracking-widest font-display mb-1">
              Select Action to Log
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {HABIT_DICTIONARY.map((habit) => (
                <button
                  key={habit.id}
                  type="button"
                  onClick={() => addActivityLog(habit.id)}
                  className="group flex items-center justify-between p-3 bg-slate-950 border border-slate-800 hover:border-emerald-500/30 hover:bg-slate-900/60 rounded-xl transition-all hover:-translate-y-0.5"
                >
                  <div className="flex items-center gap-2.5 text-left min-w-0">
                    <span className="text-base shrink-0">{habit.icon}</span>
                    <div className="min-w-0">
                      <div className="text-[10px] font-bold text-slate-200 tracking-wide truncate group-hover:text-emerald-400 transition-colors">
                        {habit.title.replace('Log a ', '').replace('Choice', '').replace('Cycle', '')}
                      </div>
                      <div className="text-[8px] text-slate-500 truncate mt-0.5">
                        {habit.description}
                      </div>
                    </div>
                  </div>
                  <span className="text-[9px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded-md shrink-0 ml-1.5">
                    -{habit.carbonSavedKg.toFixed(1)} kg
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Right Side: Chronological Activity Feed (2/5 width) */}
          <div className="lg:col-span-2 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-slate-800/80 pt-4 lg:pt-0 lg:pl-4">
            <div className="text-sm font-semibold text-slate-300 uppercase tracking-widest font-display mb-2.5">
              Activity Ledger Logs ({state.activityLogs.length})
            </div>
            
            <div className="flex-1 max-h-[140px] overflow-y-auto pr-1 custom-scrollbar space-y-2">
              {state.activityLogs.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center py-6 text-center">
                  <AnimatedEcoIcon name="flame" size={48} intensity="bold" trigger="always" glowColor="#10b981" />
                  <p className="text-[9px] text-slate-500 max-w-[150px] leading-normal mt-3">
                    No tactical habits logged yet today. Tap an action button to begin tracking impact!
                  </p>
                </div>
              ) : (
                [...state.activityLogs]
                  .sort((a, b) => b.timestamp - a.timestamp)
                  .map((log) => {
                    const timeStr = new Date(log.timestamp).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit',
                      second: '2-digit'
                    });
                    return (
                      <div key={log.id} className="flex items-center justify-between bg-slate-950/60 border border-slate-850 p-2 rounded-lg gap-2 animate-fadeIn">
                        <div className="min-w-0">
                          <div className="text-[9px] font-bold text-slate-200 truncate">
                            {log.title}
                          </div>
                          <div className="text-[8px] text-slate-500 font-mono mt-0.5">
                            Logged at {timeStr}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[9px] font-mono font-bold text-emerald-400">
                            -{log.carbonSavedKg.toFixed(1)} kg
                          </span>
                          
                          <button
                            type="button"
                            onClick={() => removeActivityLog(log.id)}
                            className="p-1 border border-slate-850 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-md transition-all"
                            title="Remove log entry"
                          >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sprint 3: "What-If" Sandbox Simulator */}
      <div className="space-y-3 border-t border-slate-800/60 pt-4 text-left">
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-widest font-display">
          🔬 Climate Action "What-If" Simulator Sandbox
        </h3>
        
        <div className="bg-slate-900/20 border border-slate-800 p-4 rounded-xl space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Slider 1: Vegan Days per Week */}
            <div className="space-y-2 bg-slate-950 border border-slate-850 p-4 rounded-xl">
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-slate-300">Simulate Vegan Days / Week</span>
                <span className="text-emerald-400 font-mono">{veganDaysPerWeekSim} Days</span>
              </div>
              <input
                type="range"
                min="0"
                max="7"
                value={veganDaysPerWeekSim}
                onChange={(e) => updateSandbox('veganDaysPerWeekSim', parseInt(e.target.value, 10))}
                className="w-full h-1.5 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="flex justify-between text-[8px] text-slate-600 font-mono">
                <span>0 days (None)</span>
                <span>7 days (Full)</span>
              </div>
            </div>

            {/* Slider 2: Commute Reduction */}
            <div className="space-y-2 bg-slate-950 border border-slate-850 p-4 rounded-xl">
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-slate-300">Reduce Solo Car Commute</span>
                <span className="text-emerald-400 font-mono">{carKmReductionSim} km/wk</span>
              </div>
              <input
                type="range"
                min="0"
                max="500"
                value={carKmReductionSim}
                onChange={(e) => updateSandbox('carKmReductionSim', parseInt(e.target.value, 10))}
                className="w-full h-1.5 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="flex justify-between text-[8px] text-slate-600 font-mono">
                <span>0 km/wk</span>
                <span>500 km/wk</span>
              </div>
            </div>

          </div>

          {/* Real-time Comparative Projections */}
          <div className="bg-slate-950/80 border border-slate-850 p-4 rounded-xl text-center space-y-3">
            <div className="text-sm font-semibold text-slate-300 uppercase tracking-widest font-display">
              Projected Carbon Outcome
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 py-1">
              <div className="text-center">
                <span className="text-[9px] text-slate-500 uppercase tracking-wider block">Current Adjusted</span>
                <span className="text-sm font-semibold text-slate-400 font-mono">
                  {formatNumber(reducedAnnualCO2e)} kg
                </span>
              </div>
              <div className="text-slate-700 font-bold text-sm select-none">➔</div>
              <div className="text-center">
                <span className="text-[9px] text-emerald-400 uppercase tracking-wider block">Simulated Potential</span>
                <span className="text-lg font-black text-emerald-400 font-mono drop-shadow-[0_0_8px_rgba(52,211,153,0.2)]">
                  {formatNumber(sandboxProjectedCO2e)} kg CO₂e/yr
                </span>
              </div>
            </div>

            {/* Action Encouragement Badge */}
            {sandboxSavings > 0 && (
              <div className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 py-2.5 px-3 rounded-lg text-center font-medium animate-fadeIn">
                💡 Making these changes would drop your carbon load by an additional{' '}
                <span className="font-bold font-mono">{formatNumber(sandboxSavings)}</span> kg/year!
              </div>
            )}
          </div>
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

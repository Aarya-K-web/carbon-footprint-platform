import React from 'react';
import { useCalculator } from '../context/CalculatorContext';

interface DietOption {
  id: 'vegan' | 'vegetarian' | 'pescatarian' | 'low-meat' | 'high-meat';
  title: string;
  description: string;
  dailyCoeff: number;
  icon: string;
}

const dietOptions: DietOption[] = [
  {
    id: 'vegan',
    title: 'Vegan',
    description: '100% plant-based foods. Completely free of meat, dairy, eggs, or animal derivatives.',
    dailyCoeff: 1.5,
    icon: '🌱',
  },
  {
    id: 'vegetarian',
    title: 'Vegetarian',
    description: 'Plant-focused diet supplemented with dairy and eggs. No poultry, beef, pork, or seafood.',
    dailyCoeff: 2.5,
    icon: '🥛',
  },
  {
    id: 'pescatarian',
    title: 'Pescatarian',
    description: 'Vegetarian diet supplemented with fish and seafood. No red meat, pork, or poultry.',
    dailyCoeff: 3.8,
    icon: '🐟',
  },
  {
    id: 'low-meat',
    title: 'Low-Meat / Flexitarian',
    description: 'Primarily plant-based foods with infrequent or small portions of chicken or fish.',
    dailyCoeff: 4.7,
    icon: '🥗',
  },
  {
    id: 'high-meat',
    title: 'High-Meat / Heavy Eater',
    description: 'Frequent and large portions of meat, including regular intake of beef, pork, and lamb.',
    dailyCoeff: 7.2,
    icon: '🥩',
  },
];

export const DietScreen: React.FC = () => {
  const { state, updateHabits, setStep } = useCalculator();
  const selectedDiet = state.habits.diet.type;

  const handleSelect = (id: typeof selectedDiet) => {
    updateHabits('diet', { type: id });
  };

  return (
    <div className="space-y-6">
      {/* Visual High-Fidelity Micro Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs">
          <span className="text-emerald-400 font-semibold uppercase tracking-wider">Step 1 of 3: Diet Analysis</span>
          <span className="text-slate-500 font-mono">33% Completed</span>
        </div>
        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full w-1/3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500" />
        </div>
      </div>

      {/* Screen Title */}
      <div className="border-b border-slate-800/60 pb-3">
        <h2 className="text-2xl font-bold text-white">Select Your Diet Profile</h2>
        <p className="text-slate-400 text-sm mt-1">
          Food choices account for up to 30% of global greenhouse emissions. Choose the profile that matches your daily habits.
        </p>
      </div>

      {/* Choice Card Grid */}
      <div className="space-y-3.5 max-h-[380px] overflow-y-auto pr-1 custom-scrollbar">
        {dietOptions.map((option) => {
          const isSelected = selectedDiet === option.id;
          return (
            <button
              key={option.id}
              onClick={() => handleSelect(option.id)}
              className={`w-full text-left flex items-start gap-4 p-4 rounded-xl border transition-all duration-250 group ${
                isSelected
                  ? 'bg-emerald-500/5 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.08)]'
                  : 'bg-slate-900/20 border-slate-800 hover:border-slate-700 hover:bg-slate-900/40 hover:-translate-y-0.5'
              }`}
            >
              {/* Radio Indicator */}
              <div className="mt-1">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition-colors ${
                  isSelected ? 'border-emerald-500 bg-emerald-500' : 'border-slate-700 group-hover:border-slate-600'
                }`}>
                  {isSelected && (
                    <svg className="w-3.5 h-3.5 text-slate-950 font-bold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </div>

              {/* Icon & Description Text */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-lg" role="img" aria-label={option.title}>
                    {option.icon}
                  </span>
                  <h3 className="text-sm font-semibold text-white tracking-wide">
                    {option.title}
                  </h3>
                </div>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {option.description}
                </p>
              </div>

              {/* Real-time Indicator (Daily impact) */}
              <div className="text-right flex flex-col items-end shrink-0 pl-2">
                <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Daily Baseline</span>
                <span className={`text-xs font-bold font-mono mt-0.5 ${
                  isSelected ? 'text-emerald-400' : 'text-slate-400'
                }`}>
                  {option.dailyCoeff.toFixed(1)} kg CO₂e
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Navigation Cluster */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-800/80">
        <button
          onClick={() => setStep('welcome')}
          className="group inline-flex items-center gap-1.5 px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl transition-all duration-200 active:scale-95 text-sm"
        >
          <svg className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </button>

        <button
          disabled={!selectedDiet}
          onClick={() => setStep('transport')}
          className={`group inline-flex items-center gap-1.5 px-6 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 shadow-md ${
            selectedDiet
              ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white hover:shadow-emerald-500/15 active:scale-95 cursor-pointer'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-800/50'
          }`}
        >
          Continue to Mobility
          <svg className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      </div>
    </div>
  );
};

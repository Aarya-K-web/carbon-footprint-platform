import React from 'react';
import { useCalculator } from '../context/CalculatorContext';
import { CommuteEntry } from '../types/calculator';

const transportModes = [
  { id: 'ev', label: 'Electric Vehicle (EV)' },
  { id: 'hybrid', label: 'Hybrid Vehicle' },
  { id: 'gas-small', label: 'Gas Car (Small/Med)' },
  { id: 'gas-large', label: 'Gas Car (Large/SUV)' },
  { id: 'motorcycle', label: 'Motorcycle' },
  { id: 'public-transit', label: 'Public Transit (Bus/Train)' },
  { id: 'active', label: 'Active (Bike/Walk)' },
];

export const TransportScreen: React.FC = () => {
  const { state, updateHabits, setStep } = useCalculator();
  
  const commutes = state.habits.transport.commutes;
  const flights = state.habits.transport.flights;

  const generateId = (): string => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return Math.random().toString(36).substring(2, 11);
  };

  // Commute Handlers
  const addCommute = () => {
    const newCommutes = [
      ...commutes,
      { id: generateId(), mode: '' as any, distancePerWeekKm: null }
    ];
    updateHabits('transport', { commutes: newCommutes });
  };

  const removeCommute = (id: string) => {
    const newCommutes = commutes.filter(c => c.id !== id);
    updateHabits('transport', { commutes: newCommutes });
  };

  const updateCommute = (id: string, updates: Partial<CommuteEntry>) => {
    const newCommutes = commutes.map(c => {
      if (c.id === id) {
        return { ...c, ...updates };
      }
      return c;
    });
    updateHabits('transport', { commutes: newCommutes });
  };

  // Safe numeric parsing that preserves null for empty strings
  const handleNumericChange = (val: string): number | null => {
    if (val.trim() === '') return null;
    const num = parseFloat(val);
    return isNaN(num) ? null : num;
  };

  // Flight Handlers
  const updateFlights = (field: 'shortHaulKmPerYear' | 'longHaulKmPerYear', value: number | null) => {
    updateHabits('transport', {
      flights: {
        ...flights,
        [field]: value
      }
    });
  };

  // Validation: Check if any active commute row doesn't have a mode selected
  const hasEmptyCommuteMode = commutes.some(c => c.mode === '');

  return (
    <div className="space-y-6">
      {/* Step Header & Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs">
          <span className="text-emerald-400 font-semibold uppercase tracking-wider">Step 2 of 3: Mobility Analysis</span>
          <span className="text-slate-500 font-mono">66% Completed</span>
        </div>
        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full w-2/3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500" />
        </div>
      </div>

      {/* Screen Title */}
      <div className="border-b border-slate-800/60 pb-3">
        <h2 className="text-2xl font-bold text-white">Track Your Mobility Footprint</h2>
        <p className="text-slate-400 text-sm mt-1">
          Transportation accounts for nearly a quarter of global energy-related carbon emissions. Map your transit habits below.
        </p>
      </div>

      {/* Dynamic Commutes Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Weekly Commuting</h3>
          <button
            type="button"
            onClick={addCommute}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 text-emerald-400 hover:text-emerald-300 text-xs font-semibold rounded-lg transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add Commute Mode
          </button>
        </div>

        {commutes.length === 0 ? (
          <div className="text-center py-6 border border-dashed border-slate-800 rounded-xl bg-slate-900/10">
            <span className="text-2xl" role="img" aria-label="car">🚗</span>
            <p className="text-xs text-slate-500 mt-2">No weekly commute modes added yet.</p>
            <p className="text-[10px] text-slate-600 mt-0.5">Click "Add Commute Mode" to log your transport habits.</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
            {commutes.map((commute) => (
              <div key={commute.id} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-slate-900/30 border border-slate-800/80 p-3 rounded-xl">
                {/* Mode Selector */}
                <div className="flex-1 min-w-[150px]">
                  <select
                    value={commute.mode}
                    onChange={(e) => updateCommute(commute.id, { mode: e.target.value as any })}
                    className="w-full bg-slate-950 text-slate-100 border border-slate-800 rounded-lg p-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                  >
                    <option value="" disabled>Select Transit Mode...</option>
                    {transportModes.map(m => (
                      <option key={m.id} value={m.id}>{m.label}</option>
                    ))}
                  </select>
                </div>

                {/* Distance Input */}
                <div className="w-full sm:w-[160px] flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-lg px-2 text-xs focus-within:ring-1 focus-within:ring-emerald-500 focus-within:border-emerald-500 transition-all">
                  <input
                    type="number"
                    min="0"
                    placeholder="Distance"
                    value={commute.distancePerWeekKm === null ? '' : commute.distancePerWeekKm}
                    onChange={(e) => updateCommute(commute.id, { distancePerWeekKm: handleNumericChange(e.target.value) })}
                    className="w-full bg-transparent text-slate-100 border-none outline-none py-2 text-xs"
                  />
                  <span className="text-slate-500 font-semibold uppercase tracking-wider shrink-0 text-[10px]">km/wk</span>
                </div>

                {/* Remove Row Button */}
                <button
                  type="button"
                  onClick={() => removeCommute(commute.id)}
                  className="p-2 border border-slate-800/60 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg hover:border-rose-500/20 transition-all self-end sm:self-auto"
                  aria-label="Remove commute"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Annual Aviation Inputs */}
      <div className="space-y-3.5 border-t border-slate-800/60 pt-4">
        <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Annual Air Travel</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Short Haul */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
              Short-Haul Flights (&lt; 1,500 km)
            </label>
            <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-lg px-3 text-xs focus-within:ring-1 focus-within:ring-emerald-500 focus-within:border-emerald-500 transition-all">
              <input
                type="number"
                min="0"
                placeholder="Total annual distance"
                value={flights.shortHaulKmPerYear === null ? '' : flights.shortHaulKmPerYear}
                onChange={(e) => updateFlights('shortHaulKmPerYear', handleNumericChange(e.target.value))}
                className="w-full bg-transparent text-slate-100 border-none outline-none py-2.5 text-xs"
              />
              <span className="text-slate-500 font-semibold uppercase tracking-wider shrink-0 text-[10px]">km/yr</span>
            </div>
          </div>

          {/* Long Haul */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
              Long-Haul Flights (&ge; 1,500 km)
            </label>
            <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-lg px-3 text-xs focus-within:ring-1 focus-within:ring-emerald-500 focus-within:border-emerald-500 transition-all">
              <input
                type="number"
                min="0"
                placeholder="Total annual distance"
                value={flights.longHaulKmPerYear === null ? '' : flights.longHaulKmPerYear}
                onChange={(e) => updateFlights('longHaulKmPerYear', handleNumericChange(e.target.value))}
                className="w-full bg-transparent text-slate-100 border-none outline-none py-2.5 text-xs"
              />
              <span className="text-slate-500 font-semibold uppercase tracking-wider shrink-0 text-[10px]">km/yr</span>
            </div>
          </div>
          
        </div>
      </div>

      {/* Navigation Cluster */}
      <div className="flex flex-col gap-2 pt-4 border-t border-slate-800/80">
        {hasEmptyCommuteMode && (
          <p className="text-xs text-rose-400 font-medium text-center bg-rose-500/5 py-1 px-3 border border-rose-500/10 rounded-lg animate-pulse">
            ⚠️ Please specify a transit mode for all added commutes.
          </p>
        )}
        
        <div className="flex items-center justify-between">
          <button
            onClick={() => setStep('diet')}
            className="group inline-flex items-center gap-1.5 px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl transition-all duration-200 active:scale-95 text-sm"
          >
            <svg className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Diet
          </button>

          <button
            disabled={hasEmptyCommuteMode}
            onClick={() => setStep('household')}
            className={`group inline-flex items-center gap-1.5 px-6 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 shadow-md ${
              !hasEmptyCommuteMode
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white hover:shadow-emerald-500/15 active:scale-95 cursor-pointer'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-800/50'
            }`}
          >
            Continue to Utilities
            <svg className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

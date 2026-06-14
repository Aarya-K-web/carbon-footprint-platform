import React, { useEffect } from 'react';
import { useCalculator } from '../context/CalculatorContext';

export const HouseholdScreen: React.FC = () => {
  const { state, updateHabits, setStep } = useCalculator();
  const household = state.habits.household;

  // Safe numeric parsing that preserves null for empty strings
  const handleNumericChange = (val: string): number | null => {
    if (val.trim() === '') return null;
    const num = parseFloat(val);
    return isNaN(num) ? null : num;
  };

  const handleHouseholdMembersChange = (val: string) => {
    let num = parseInt(val, 10);
    if (isNaN(num) || num < 1) {
      num = 1;
    }
    updateHabits('household', { householdMembers: num });
  };

  // Adjust unit dynamically if the fuel type changes
  const handleFuelTypeChange = (fuel: typeof household.heating.fuelType) => {
    let defaultUnit: typeof household.heating.unit = '';
    if (fuel === 'natural-gas') defaultUnit = 'm3';
    else if (fuel === 'heating-oil') defaultUnit = 'liters';
    else if (fuel === 'biomass') defaultUnit = 'kg';

    updateHabits('household', {
      heating: {
        fuelType: fuel,
        monthlyValue: null,
        unit: defaultUnit,
      }
    });
  };

  const updateHeatingValue = (value: number | null) => {
    updateHabits('household', {
      heating: {
        ...household.heating,
        monthlyValue: value,
      }
    });
  };

  const updateHeatingUnit = (unit: typeof household.heating.unit) => {
    updateHabits('household', {
      heating: {
        ...household.heating,
        unit,
      }
    });
  };

  const showHeatingGrid = household.heating.fuelType && household.heating.fuelType !== 'none';

  return (
    <div className="space-y-6">
      {/* Visual High-Fidelity Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs">
          <span className="text-emerald-400 font-semibold uppercase tracking-wider">Step 3 of 3: Household Utilities</span>
          <span className="text-slate-500 font-mono">100% Completed</span>
        </div>
        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full w-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500" />
        </div>
      </div>

      {/* Screen Title */}
      <div className="border-b border-slate-800/60 pb-3">
        <h2 className="text-2xl font-bold text-white">Log Household Resource Consumption</h2>
        <p className="text-slate-400 text-sm mt-1">
          Household electricity and heating systems account for nearly 20% of urban greenhouse gas emissions.
        </p>
      </div>

      <div className="space-y-4">
        {/* Resource Divisor Input */}
        <div className="bg-slate-900/30 border border-slate-800 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-0.5">
            <h3 className="text-sm font-semibold text-white">Household Occupancy</h3>
            <p className="text-xs text-slate-500">
              We divide energy emissions by members to compute your personal footprint share.
            </p>
          </div>
          <div className="w-full sm:w-[130px] flex items-center bg-slate-950 border border-slate-800 rounded-lg px-3 focus-within:ring-1 focus-within:ring-emerald-500 focus-within:border-emerald-500 transition-all shrink-0">
            <input
              type="number"
              min="1"
              value={household.householdMembers}
              onChange={(e) => handleHouseholdMembersChange(e.target.value)}
              className="w-full bg-transparent text-slate-100 border-none outline-none py-2 text-xs font-semibold text-center"
            />
            <span className="text-slate-500 text-[10px] uppercase font-semibold pl-2">Members</span>
          </div>
        </div>

        {/* Electricity Section */}
        <div className="space-y-3 bg-slate-900/10 border border-slate-800/80 p-4 rounded-xl">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Electricity Consumption</h3>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <label className="text-xs text-slate-400">Average Monthly Electricity Usage</label>
            <div className="w-full sm:w-[160px] flex items-center bg-slate-950 border border-slate-800 rounded-lg px-3 text-xs focus-within:ring-1 focus-within:ring-emerald-500 focus-within:border-emerald-500 transition-all">
              <input
                type="number"
                min="0"
                placeholder="0"
                value={household.electricity.monthlyKwh === null ? '' : household.electricity.monthlyKwh}
                onChange={(e) => updateHabits('household', {
                  electricity: {
                    ...household.electricity,
                    monthlyKwh: handleNumericChange(e.target.value)
                  }
                })}
                className="w-full bg-transparent text-slate-100 border-none outline-none py-2 text-xs"
              />
              <span className="text-slate-500 font-semibold uppercase tracking-wider shrink-0 text-[10px]">kWh/mo</span>
            </div>
          </div>

          {/* Renewable Tariff Checkbox/Toggle */}
          <label className="flex items-start gap-3 mt-3 p-3 bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/10 hover:border-emerald-500/20 rounded-lg cursor-pointer transition-all">
            <input
              type="checkbox"
              checked={household.electricity.isRenewableTariff}
              onChange={(e) => updateHabits('household', {
                electricity: {
                  ...household.electricity,
                  isRenewableTariff: e.target.checked
                }
              })}
              className="mt-0.5 rounded border-slate-800 bg-slate-950 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-900 w-4 h-4"
            />
            <div className="flex-1">
              <div className="text-xs font-semibold text-emerald-400">100% Renewable Energy Tariff</div>
              <p className="text-[10px] text-slate-500 leading-normal mt-0.5">
                Reduces grid emission coefficient to a low-carbon lifecycle baseline of 0.02 kg CO₂e/kWh.
              </p>
            </div>
          </label>
        </div>

        {/* Heating Fuel Section */}
        <div className="space-y-3 bg-slate-900/10 border border-slate-800/80 p-4 rounded-xl">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Heating & Secondary Fuels</h3>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <label className="text-xs text-slate-400">Primary Heating Fuel Source</label>
            <select
              value={household.heating.fuelType}
              onChange={(e) => handleFuelTypeChange(e.target.value as any)}
              className="w-full sm:w-[180px] bg-slate-950 text-slate-100 border border-slate-800 rounded-lg p-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
            >
              <option value="" disabled>Select Heating Fuel...</option>
              <option value="none">None / Heat Pump Only</option>
              <option value="natural-gas">Natural Gas</option>
              <option value="heating-oil">Heating Oil</option>
              <option value="biomass">Biomass / Wood Pellets</option>
            </select>
          </div>

          {/* Conditional Heating Grid */}
          {showHeatingGrid && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-800/50 mt-3 animate-fadeIn">
              
              {/* Monthly Value */}
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">
                  Monthly Consumption
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="Usage value"
                  value={household.heating.monthlyValue === null ? '' : household.heating.monthlyValue}
                  onChange={(e) => updateHeatingValue(handleNumericChange(e.target.value))}
                  className="w-full bg-slate-950 text-slate-100 border border-slate-800 rounded-lg p-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                />
              </div>

              {/* Unit Selector */}
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">
                  Physical Unit Metric
                </label>
                <select
                  value={household.heating.unit}
                  onChange={(e) => updateHeatingUnit(e.target.value as any)}
                  className="w-full bg-slate-950 text-slate-100 border border-slate-800 rounded-lg p-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                >
                  {household.heating.fuelType === 'natural-gas' && (
                    <>
                      <option value="m3">Cubic Meters (m³)</option>
                      <option value="kwh">Kilowatt-hours (kWh)</option>
                    </>
                  )}
                  {household.heating.fuelType === 'heating-oil' && (
                    <>
                      <option value="liters">Liters</option>
                      <option value="kwh">Kilowatt-hours (kWh)</option>
                    </>
                  )}
                  {household.heating.fuelType === 'biomass' && (
                    <>
                      <option value="kg">Kilograms (kg)</option>
                      <option value="kwh">Kilowatt-hours (kWh)</option>
                    </>
                  )}
                </select>
              </div>

            </div>
          )}
        </div>
      </div>

      {/* Navigation Cluster */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-800/80">
        <button
          onClick={() => setStep('transport')}
          className="group inline-flex items-center gap-1.5 px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl transition-all duration-200 active:scale-95 text-sm"
        >
          <svg className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Mobility
        </button>

        <button
          onClick={() => setStep('results')}
          className="group inline-flex items-center gap-1.5 px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-semibold rounded-xl hover:shadow-emerald-500/15 transition-all duration-200 active:scale-95 text-sm shadow-md"
        >
          Calculate Footprint ✨
        </button>
      </div>
    </div>
  );
};

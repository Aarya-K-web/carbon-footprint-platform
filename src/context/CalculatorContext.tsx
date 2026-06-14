import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CalculatorState, CommuteEntry } from '../types/calculator';

export interface CalculatorContextType {
  state: CalculatorState;
  setState: React.Dispatch<React.SetStateAction<CalculatorState>>;
  setStep: (step: CalculatorState['ui']['currentStep']) => void;
  updateHabits: <C extends keyof CalculatorState['habits']>(
    category: C,
    data: Partial<CalculatorState['habits'][C]> | ((prev: CalculatorState['habits'][C]) => CalculatorState['habits'][C])
  ) => void;
  setValidationErrors: (errors: Record<string, string>) => void;
  setIsSubmitting: (isSubmitting: boolean) => void;
  resetCalculator: () => void;
}

const CalculatorContext = createContext<CalculatorContextType | undefined>(undefined);

const initialState: CalculatorState = {
  habits: {
    diet: {
      type: '',
    },
    transport: {
      commutes: [],
      flights: {
        shortHaulKmPerYear: null,
        longHaulKmPerYear: null,
      },
    },
    household: {
      householdMembers: 1,
      electricity: {
        monthlyKwh: null,
        isRenewableTariff: false,
      },
      heating: {
        fuelType: '',
        monthlyValue: null,
        unit: '',
      },
    },
  },
  ui: {
    currentStep: 'welcome',
    isSubmitting: false,
    validationErrors: {},
  },
  results: {
    dietAnnualCO2e: 0,
    transportAnnualCO2e: 0,
    householdAnnualCO2e: 0,
    totalAnnualCO2e: 0,
  },
};

// Pure mathematical engine for emission calculations
const calculateResults = (habits: CalculatorState['habits']): CalculatorState['results'] => {
  // 1. Diet Calculation (daily footprint * 365.25 days)
  let dietCoeff = 0;
  switch (habits.diet.type) {
    case 'vegan': dietCoeff = 1.5; break;
    case 'vegetarian': dietCoeff = 2.5; break;
    case 'pescatarian': dietCoeff = 3.8; break;
    case 'low-meat': dietCoeff = 4.7; break;
    case 'high-meat': dietCoeff = 7.2; break;
    default: dietCoeff = 0;
  }
  const dietAnnualCO2e = dietCoeff * 365.25;

  // 2. Transport Calculation
  // A. Commutes (weekly distance * 52.177 weeks * mode coefficient)
  const commutesAnnualCO2e = habits.transport.commutes.reduce((sum, commute) => {
    if (!commute.mode || commute.distancePerWeekKm === null) return sum;
    
    let modeCoeff = 0;
    switch (commute.mode) {
      case 'ev': modeCoeff = 0.05; break;
      case 'hybrid': modeCoeff = 0.12; break;
      case 'gas-small': modeCoeff = 0.18; break;
      case 'gas-large': modeCoeff = 0.27; break;
      case 'motorcycle': modeCoeff = 0.10; break;
      case 'public-transit': modeCoeff = 0.04; break;
      case 'active': modeCoeff = 0.00; break;
      default: modeCoeff = 0;
    }
    return sum + (commute.distancePerWeekKm * 52.177 * modeCoeff);
  }, 0);

  // B. Flights (annual passenger-km * flight tier coefficient)
  const shortHaulKm = habits.transport.flights.shortHaulKmPerYear || 0;
  const longHaulKm = habits.transport.flights.longHaulKmPerYear || 0;
  const flightsAnnualCO2e = (shortHaulKm * 0.15) + (longHaulKm * 0.11);

  const transportAnnualCO2e = commutesAnnualCO2e + flightsAnnualCO2e;

  // 3. Household Calculation
  // A. Electricity (monthly kWh * 12 months * electricity tariff coefficient)
  const electricityKwh = habits.household.electricity.monthlyKwh || 0;
  const electricityCoeff = habits.household.electricity.isRenewableTariff ? 0.02 : 0.38;
  const electricityAnnualCO2e = electricityKwh * 12 * electricityCoeff;

  // B. Heating (monthly fuel * 12 months * heating unit coefficient)
  let heatingCoeff = 0;
  const heatingVal = habits.household.heating.monthlyValue || 0;
  const heatingUnit = habits.household.heating.unit;
  
  switch (habits.household.heating.fuelType) {
    case 'natural-gas':
      heatingCoeff = heatingUnit === 'kwh' ? 0.18 : 2.02;
      break;
    case 'heating-oil':
      heatingCoeff = heatingUnit === 'kwh' ? 0.26 : 2.68;
      break;
    case 'biomass':
      heatingCoeff = heatingUnit === 'kwh' ? 0.015 : 0.07;
      break;
    default:
      heatingCoeff = 0;
  }
  const heatingAnnualCO2e = heatingVal * 12 * heatingCoeff;

  // C. Household Allocation (division-by-zero protection: enforce min divisor of 1)
  const divisor = Math.max(1, habits.household.householdMembers);
  const householdAnnualCO2e = (electricityAnnualCO2e + heatingAnnualCO2e) / divisor;

  // 4. Grand Total
  const totalAnnualCO2e = dietAnnualCO2e + transportAnnualCO2e + householdAnnualCO2e;

  return {
    dietAnnualCO2e,
    transportAnnualCO2e,
    householdAnnualCO2e,
    totalAnnualCO2e,
  };
};

export const CalculatorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<CalculatorState>(initialState);

  // Automatically recalculate emissions whenever user habits state changes
  useEffect(() => {
    const calculatedResults = calculateResults(state.habits);
    
    // Prevent infinite loop by checking if the calculated numbers actually changed
    setState(prev => {
      const resultsChanged =
        prev.results.dietAnnualCO2e !== calculatedResults.dietAnnualCO2e ||
        prev.results.transportAnnualCO2e !== calculatedResults.transportAnnualCO2e ||
        prev.results.householdAnnualCO2e !== calculatedResults.householdAnnualCO2e ||
        prev.results.totalAnnualCO2e !== calculatedResults.totalAnnualCO2e;

      if (!resultsChanged) {
        return prev;
      }

      return {
        ...prev,
        results: calculatedResults,
      };
    });
  }, [state.habits]);

  // UI Step transition controller
  const setStep = (step: CalculatorState['ui']['currentStep']) => {
    setState(prev => ({
      ...prev,
      ui: {
        ...prev.ui,
        currentStep: step,
      },
    }));
  };

  // Generic and flexible updater for habits categories
  const updateHabits = <C extends keyof CalculatorState['habits']>(
    category: C,
    data: Partial<CalculatorState['habits'][C]> | ((prev: CalculatorState['habits'][C]) => CalculatorState['habits'][C])
  ) => {
    setState(prev => {
      const currentCategoryState = prev.habits[category];
      const newCategoryState = typeof data === 'function'
        ? (data as Function)(currentCategoryState)
        : { ...currentCategoryState, ...data };

      return {
        ...prev,
        habits: {
          ...prev.habits,
          [category]: newCategoryState,
        },
      };
    });
  };

  // Set form validation errors
  const setValidationErrors = (errors: Record<string, string>) => {
    setState(prev => ({
      ...prev,
      ui: {
        ...prev.ui,
        validationErrors: errors,
      },
    }));
  };

  // Set submitting state
  const setIsSubmitting = (submitting: boolean) => {
    setState(prev => ({
      ...prev,
      ui: {
        ...prev.ui,
        isSubmitting: submitting,
      },
    }));
  };

  // Reset to initial baseline
  const resetCalculator = () => {
    setState(initialState);
  };

  return (
    <CalculatorContext.Provider
      value={{
        state,
        setState,
        setStep,
        updateHabits,
        setValidationErrors,
        setIsSubmitting,
        resetCalculator,
      }}
    >
      {children}
    </CalculatorContext.Provider>
  );
};

export const useCalculator = (): CalculatorContextType => {
  const context = useContext(CalculatorContext);
  if (context === undefined) {
    throw new Error('useCalculator must be used within a CalculatorProvider');
  }
  return context;
};

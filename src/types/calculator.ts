export interface CommuteEntry {
  id: string;
  mode: 'ev' | 'hybrid' | 'gas-small' | 'gas-large' | 'motorcycle' | 'public-transit' | 'active' | '';
  distancePerWeekKm: number | null;
}

export interface CalculatorState {
  // Raw and processed user habits inputs
  habits: {
    diet: {
      type: 'vegan' | 'vegetarian' | 'pescatarian' | 'low-meat' | 'high-meat' | '';
    };
    transport: {
      commutes: CommuteEntry[];
      flights: {
        shortHaulKmPerYear: number | null;
        longHaulKmPerYear: number | null;
      };
    };
    household: {
      householdMembers: number; // Divisor for per-capita impact
      electricity: {
        monthlyKwh: number | null;
        isRenewableTariff: boolean;
      };
      heating: {
        fuelType: 'natural-gas' | 'heating-oil' | 'biomass' | 'none' | '';
        monthlyValue: number | null;
        unit: 'kwh' | 'm3' | 'liters' | 'kg' | '';
      };
    };
  };

  // Module B: Mitigation tasks tracker
  mitigation: {
    activeTaskIds: string[];    // Dynamic task IDs matching high-emission categories
    completedTaskIds: string[]; // Task IDs checked off by the user
  };

  // UI/UX state management
  ui: {
    currentStep: 'welcome' | 'diet' | 'transport' | 'household' | 'results';
    isSubmitting: boolean;
    validationErrors: Record<string, string>; // Maps input paths to message
  };

  // Live calculated results (kg CO2e/year)
  results: {
    dietAnnualCO2e: number;
    transportAnnualCO2e: number;
    householdAnnualCO2e: number; // Per-capita allocated
    totalAnnualCO2e: number;
    
    // Module B live mitigation outcomes
    mitigationCO2eSavings: number; // Total savings from checked actions
    reducedAnnualCO2e: number;     // Net footprint (total - savings)
  };
}

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
  
  // Module B action handlers
  toggleTaskCompletion: (taskId: string) => void;
}

export interface CommuteEntry {
  id: string;
  mode: 'ev' | 'hybrid' | 'gas-small' | 'gas-large' | 'motorcycle' | 'public-transit' | 'active' | '';
  distancePerWeekKm: number | null;
}

export interface CalculatorState {
  // Raw and processed user inputs
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

  // UI/UX state management
  ui: {
    currentStep: 'welcome' | 'diet' | 'transport' | 'household' | 'results';
    isSubmitting: boolean;
    validationErrors: Record<string, string>; // Maps input path (e.g., 'habits.household.householdMembers') to message
  };

  // Live calculated results (kg CO2e/year)
  results: {
    dietAnnualCO2e: number;
    transportAnnualCO2e: number;
    householdAnnualCO2e: number; // Per-capita allocated
    totalAnnualCO2e: number;
  };
}

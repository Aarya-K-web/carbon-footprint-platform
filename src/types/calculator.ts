export interface CommuteEntry {
  id: string;
  mode: 'ev' | 'hybrid' | 'gas-small' | 'gas-large' | 'motorcycle' | 'public-transit' | 'active' | '';
  distancePerWeekKm: number | null;
}

export interface RegionalFootprint {
  region: 'global' | 'us' | 'eu' | 'india' | 'target';
  label: string;
  annualCO2e: number;
}

export const REGIONAL_COMPARISONS: RegionalFootprint[] = [
  { region: 'us', label: 'United States Average', annualCO2e: 16000 },
  { region: 'eu', label: 'European Union Average', annualCO2e: 6400 },
  { region: 'global', label: 'Global Average', annualCO2e: 4500 },
  { region: 'target', label: 'Sustainable Goal (1.5°C Limit)', annualCO2e: 2000 },
  { region: 'india', label: 'India Average', annualCO2e: 1900 },
];

export interface LogEntry {
  id: string;
  timestamp: number;
  activityId: string;
  title: string;
  category: 'diet' | 'transport' | 'household' | 'waste';
  carbonSavedKg: number;
}

export interface GamificationState {
  currentStreakDays: number;
  highestStreakDays: number;
  unlockedBadges: string[];
}

export interface SandboxState {
  veganDaysPerWeekSim: number;
  carKmReductionSim: number;
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

  // Sprint 2: Core Tracking & Smart Budget Ledger
  activityLogs: LogEntry[];
  gamification: GamificationState;

  // Sprint 3: "What-If" Sandbox Simulator
  sandbox: SandboxState;

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

    // Sprint 1 environmental equivalency offsets
    equivalencies: {
      treesRequiredCount: number;         // Mature trees required to absorb net annual carbon
      iceCarDistanceEquivalentKm: number; // Equivalent distance driven in km (standard gasoline car)
    };

    // Sprint 3 sandbox projected emissions
    sandboxProjectedCO2e: number;
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

  // Sprint 2 action handlers
  addActivityLog: (habitId: string) => void;
  removeActivityLog: (logId: string) => void;

  // Sprint 3 action handlers
  updateSandbox: (field: keyof SandboxState, value: number) => void;
}

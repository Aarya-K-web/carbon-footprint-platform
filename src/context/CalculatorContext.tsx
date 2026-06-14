import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CalculatorState, CommuteEntry, CalculatorContextType, LogEntry } from '../types/calculator';
import { supabase } from '../lib/supabaseClient';

export interface MitigationTask {
  id: string;
  title: string;
  category: 'diet' | 'transport' | 'household';
  description: string;
  annualCO2eSaved: number;
}

export interface HabitItem {
  id: string;
  title: string;
  category: 'diet' | 'transport' | 'household' | 'waste';
  description: string;
  carbonSavedKg: number;
  icon: string;
}

export const MITIGATION_TASKS: MitigationTask[] = [
  {
    id: 'mit-diet-meatless',
    title: 'Meatless Mondays',
    category: 'diet',
    description: 'Swap animal proteins for plant-based meals 1 day per week.',
    annualCO2eSaved: 150,
  },
  {
    id: 'mit-diet-compost',
    title: 'Zero-Waste Composting',
    category: 'diet',
    description: 'Compost organic waste to prevent anaerobic landfill methane emissions.',
    annualCO2eSaved: 80,
  },
  {
    id: 'mit-trans-transit',
    title: 'Public Transit Shift',
    category: 'transport',
    description: 'Replace 80 km/week of driving a gasoline car with rail/bus commuting.',
    annualCO2eSaved: 450,
  },
  {
    id: 'mit-trans-flight',
    title: 'Rail-over-Flight Choice',
    category: 'transport',
    description: 'Swap one short-haul flight (1,000 km) for rail or a local staycation.',
    annualCO2eSaved: 110,
  },
  {
    id: 'mit-house-thermostat',
    title: 'Smart Thermostat Adjust',
    category: 'household',
    description: 'Lower winter heating by 1°C and raise summer cooling by 1°C.',
    annualCO2eSaved: 180,
  },
  {
    id: 'mit-house-laundry',
    title: 'Natural Air-Drying',
    category: 'household',
    description: 'Hang-dry laundry instead of running an electric tumble dryer 3 times a week.',
    annualCO2eSaved: 120,
  },
];

export const HABIT_DICTIONARY: HabitItem[] = [
  {
    id: 'habit-carpool',
    title: 'Log a Carpool Commute',
    category: 'transport',
    description: 'Share a vehicle commute with colleagues instead of driving solo.',
    carbonSavedKg: 4.0,
    icon: '🚗',
  },
  {
    id: 'habit-plastic',
    title: 'Avoid Single-use Plastic',
    category: 'waste',
    description: 'Refuse plastic grocery bags, bottles, or packaging throughout the day.',
    carbonSavedKg: 1.0,
    icon: '🥤',
  },
  {
    id: 'habit-meal',
    title: 'Plant-Based Meal Choice',
    category: 'diet',
    description: 'Substitute meat or poultry for a fully vegan lunch or dinner.',
    carbonSavedKg: 2.0,
    icon: '🥗',
  },
  {
    id: 'habit-coldwash',
    title: 'Cold Water Laundry Cycle',
    category: 'household',
    description: 'Wash a load of clothing on cold settings to bypass water heating.',
    carbonSavedKg: 1.5,
    icon: '🧼',
  },
];

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
  mitigation: {
    activeTaskIds: [],
    completedTaskIds: [],
  },
  activityLogs: [],
  gamification: {
    currentStreakDays: 0,
    highestStreakDays: 0,
    unlockedBadges: [],
  },
  sandbox: {
    veganDaysPerWeekSim: 0,
    carKmReductionSim: 0,
  },
  user: null,
  loadingAuth: true,
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
    mitigationCO2eSavings: 0,
    reducedAnnualCO2e: 0,
    equivalencies: {
      treesRequiredCount: 0,
      iceCarDistanceEquivalentKm: 0,
    },
    sandboxProjectedCO2e: 0,
  },
};

// Pure mathematical engine for emission calculations
const calculateResults = (
  habits: CalculatorState['habits'],
  completedTaskIds: string[],
  activityLogs: LogEntry[],
  sandbox: CalculatorState['sandbox']
): CalculatorState['results'] => {
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

  // 5. Module B & Sprint 2: Mitigation calculations
  // Sum structural checklist tasks savings
  const checklistSavings = completedTaskIds.reduce((sum, taskId) => {
    const task = MITIGATION_TASKS.find(t => t.id === taskId);
    return sum + (task ? task.annualCO2eSaved : 0);
  }, 0);

  // Sum dynamic ledger log savings
  const ledgerSavings = activityLogs.reduce((sum, log) => {
    return sum + log.carbonSavedKg;
  }, 0);

  const mitigationCO2eSavings = checklistSavings + ledgerSavings;

  // Enforce boundary rule protecting net footprint from dipping below zero
  const reducedAnnualCO2e = Math.max(0, totalAnnualCO2e - mitigationCO2eSavings);

  // 6. Sprint 1: Carbon Equivalency Calculations
  const treesRequiredCount = reducedAnnualCO2e / 22;
  const iceCarDistanceEquivalentKm = reducedAnnualCO2e / 0.20;

  // 7. Sprint 3: Sandbox Projected Carbon Emissions
  const sandboxDietSavings = sandbox.veganDaysPerWeekSim * (2.6 - 1.5) * 52.177;
  const sandboxTransitSavings = sandbox.carKmReductionSim * 0.18 * 52.177;
  const sandboxProjectedCO2e = Math.max(0, reducedAnnualCO2e - sandboxDietSavings - sandboxTransitSavings);

  return {
    dietAnnualCO2e,
    transportAnnualCO2e,
    householdAnnualCO2e,
    totalAnnualCO2e,
    mitigationCO2eSavings,
    reducedAnnualCO2e,
    equivalencies: {
      treesRequiredCount,
      iceCarDistanceEquivalentKm,
    },
    sandboxProjectedCO2e,
  };
};

export const CalculatorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<CalculatorState>(initialState);

  // Set up active Supabase auth subscription listeners
  useEffect(() => {
    // Check local storage for a demo session first
    const demoSession = localStorage.getItem('ecopulse_demo_session');
    if (demoSession) {
      try {
        const parsed = JSON.parse(demoSession);
        setState(prev => ({
          ...prev,
          user: parsed,
          loadingAuth: false,
        }));
      } catch (e) {
        localStorage.removeItem('ecopulse_demo_session');
      }
    } else {
      // Check active session on initial load
      supabase.auth.getSession().then(({ data: { session } }) => {
        setState(prev => ({
          ...prev,
          user: session?.user ?? null,
          loadingAuth: false,
        }));
      }).catch(() => {
        setState(prev => ({
          ...prev,
          loadingAuth: false,
        }));
      });
    }

    // Listen for auth state transitions (Sign In, Sign Out, Token Refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (localStorage.getItem('ecopulse_demo_session')) {
        return; // Ignore auth change during active demo session
      }
      setState(prev => ({
        ...prev,
        user: session?.user ?? null,
        loadingAuth: false,
      }));
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Automatically recalculate emissions, update active tasks, and check gamification milestones
  useEffect(() => {
    const calculatedResults = calculateResults(
      state.habits, 
      state.mitigation.completedTaskIds,
      state.activityLogs,
      state.sandbox
    );
    
    // Threshold validation system based on blueprint triggers
    const highDiet = calculatedResults.dietAnnualCO2e > 1200;
    const highTransport = calculatedResults.transportAnnualCO2e > 1500;
    const highHousehold = calculatedResults.householdAnnualCO2e > 1200;

    let activeTaskIds: string[] = [];
    if (highDiet) {
      activeTaskIds.push(...MITIGATION_TASKS.filter(t => t.category === 'diet').map(t => t.id));
    }
    if (highTransport) {
      activeTaskIds.push(...MITIGATION_TASKS.filter(t => t.category === 'transport').map(t => t.id));
    }
    if (highHousehold) {
      activeTaskIds.push(...MITIGATION_TASKS.filter(t => t.category === 'household').map(t => t.id));
    }

    // Fallback: if no categories exceed thresholds, activate all tasks by default
    if (activeTaskIds.length === 0) {
      activeTaskIds = MITIGATION_TASKS.map(t => t.id);
    }

    // Gamification Milestone evaluation
    const unlockedBadges: string[] = [];
    if (state.activityLogs.length > 0) {
      unlockedBadges.push('badge-first-step');
    }
    const totalLedgerSavings = state.activityLogs.reduce((sum, log) => sum + log.carbonSavedKg, 0);
    if (totalLedgerSavings >= 20) {
      unlockedBadges.push('badge-eco-guardian');
    }

    // Prevent infinite loop by checking if values actually changed
    setState(prev => {
      const resultsChanged =
        prev.results.dietAnnualCO2e !== calculatedResults.dietAnnualCO2e ||
        prev.results.transportAnnualCO2e !== calculatedResults.transportAnnualCO2e ||
        prev.results.householdAnnualCO2e !== calculatedResults.householdAnnualCO2e ||
        prev.results.totalAnnualCO2e !== calculatedResults.totalAnnualCO2e ||
        prev.results.mitigationCO2eSavings !== calculatedResults.mitigationCO2eSavings ||
        prev.results.reducedAnnualCO2e !== calculatedResults.reducedAnnualCO2e ||
        prev.results.sandboxProjectedCO2e !== calculatedResults.sandboxProjectedCO2e ||
        prev.results.equivalencies.treesRequiredCount !== calculatedResults.equivalencies.treesRequiredCount ||
        prev.results.equivalencies.iceCarDistanceEquivalentKm !== calculatedResults.equivalencies.iceCarDistanceEquivalentKm;

      const activeTasksChanged = 
        prev.mitigation.activeTaskIds.length !== activeTaskIds.length ||
        prev.mitigation.activeTaskIds.some((id, idx) => id !== activeTaskIds[idx]);

      const badgesChanged =
        prev.gamification.unlockedBadges.length !== unlockedBadges.length ||
        prev.gamification.unlockedBadges.some((id, idx) => id !== unlockedBadges[idx]);

      if (!resultsChanged && !activeTasksChanged && !badgesChanged) {
        return prev;
      }

      return {
        ...prev,
        results: calculatedResults,
        mitigation: {
          ...prev.mitigation,
          activeTaskIds,
        },
        gamification: {
          ...prev.gamification,
          unlockedBadges,
        },
      };
    });
  }, [state.habits, state.mitigation.completedTaskIds, state.activityLogs, state.sandbox]);

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

  // Toggle mitigation task completion state
  const toggleTaskCompletion = (taskId: string) => {
    setState(prev => {
      const completed = prev.mitigation.completedTaskIds;
      const isCompleted = completed.includes(taskId);
      const newCompleted = isCompleted
        ? completed.filter(id => id !== taskId)
        : [...completed, taskId];

      return {
        ...prev,
        mitigation: {
          ...prev.mitigation,
          completedTaskIds: newCompleted,
        },
      };
    });
  };

  // Add a daily activity log entry and evaluate streaks
  const addActivityLog = (habitId: string) => {
    const habit = HABIT_DICTIONARY.find(h => h.id === habitId);
    if (!habit) return;

    const now = Date.now();
    const newLog: LogEntry = {
      id: Math.random().toString(36).substring(2, 11),
      timestamp: now,
      activityId: habitId,
      title: habit.title,
      category: habit.category,
      carbonSavedKg: habit.carbonSavedKg,
    };

    setState(prev => {
      const newLogs = [...prev.activityLogs, newLog];
      
      let currentStreak = prev.gamification.currentStreakDays;
      let highestStreak = prev.gamification.highestStreakDays;

      if (prev.activityLogs.length === 0) {
        currentStreak = 1;
      } else {
        // Sort logs to find the most recent entry
        const sortedLogs = [...prev.activityLogs].sort((a, b) => b.timestamp - a.timestamp);
        const lastLogTime = sortedLogs[0].timestamp;
        
        const diffMs = now - lastLogTime;
        const diffHours = diffMs / (1000 * 60 * 60);

        const lastLogDate = new Date(lastLogTime).toDateString();
        const currentDate = new Date(now).toDateString();

        if (lastLogDate !== currentDate) {
          // If logged on a consecutive day within 36 hours, increment streak
          if (diffHours <= 36) {
            currentStreak += 1;
          } else {
            // Streak broken, reset
            currentStreak = 1;
          }
        }
        // Same-day logging preserves current streak
      }

      highestStreak = Math.max(highestStreak, currentStreak);

      return {
        ...prev,
        activityLogs: newLogs,
        gamification: {
          ...prev.gamification,
          currentStreakDays: currentStreak,
          highestStreakDays: highestStreak,
        },
      };
    });
  };

  // Remove a daily activity log entry
  const removeActivityLog = (logId: string) => {
    setState(prev => ({
      ...prev,
      activityLogs: prev.activityLogs.filter(log => log.id !== logId),
    }));
  };

  // Update sandbox simulator sliders state
  const updateSandbox = (field: keyof CalculatorState['sandbox'], value: number) => {
    setState(prev => ({
      ...prev,
      sandbox: {
        ...prev.sandbox,
        [field]: value,
      },
    }));
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
    localStorage.removeItem('ecopulse_demo_session');
    setState(prev => ({
      ...initialState,
      loadingAuth: false,
    }));
  };

  // Login a demo user for offline mode bypass
  const loginDemoUser = (emailAddress?: string) => {
    const mockUser = {
      id: 'demo-user-id',
      email: emailAddress || 'demo@ecopulse.org',
      email_confirmed_at: new Date().toISOString(),
      role: 'authenticated',
    };
    localStorage.setItem('ecopulse_demo_session', JSON.stringify(mockUser));
    setState(prev => ({
      ...prev,
      user: mockUser as any,
    }));
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
        toggleTaskCompletion,
        addActivityLog,
        removeActivityLog,
        updateSandbox,
        loginDemoUser,
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

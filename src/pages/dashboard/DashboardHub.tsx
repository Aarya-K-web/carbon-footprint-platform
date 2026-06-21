import { motion } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import { useCalculator } from '@/context/CalculatorContext'
import { ClientOnly } from '@/components/ClientOnly'
import { Navbar } from '@/components/Navbar'
import { WelcomeScreen } from '@/components/WelcomeScreen'
import { DietScreen } from '@/components/DietScreen'
import { TransportScreen } from '@/components/TransportScreen'
import { HouseholdScreen } from '@/components/HouseholdScreen'
import { ResultsScreen } from '@/components/ResultsScreen'
import { IdentityTierRail } from '@/components/eco-ui/IdentityTierRail'
import { SpotlightKPICard } from '@/components/eco-ui/SpotlightKPICard'
import { AnimatedEcoIcon } from '@/components/eco-ui/AnimatedEcoIcon'
import { FluidGlassPanel } from '@/components/eco-ui/FluidGlassPanel'
import { EcoLineWaves } from '@/components/eco-ui/EcoLineWaves'

const KPI_DATA = [
  { variant: 'baseline' as const, value: 8.5, label: 'Baseline Footprint', prefix: '', suffix: ' tCO\u2082e', decimals: 1, icon: 'planet' as const },
  { variant: 'footprint' as const, value: 6.2, label: 'Net Footprint', prefix: '', suffix: ' tCO\u2082e', decimals: 1, icon: 'impact' as const },
  { variant: 'saved' as const, value: 2.3, label: 'Emissions Saved', prefix: '', suffix: ' kg', decimals: 1, icon: 'leaf' as const },
  { variant: 'streak' as const, value: 12, label: 'Day Streak', prefix: '', suffix: '', decimals: 0, icon: 'flame' as const, badge: 'On Fire!' },
]

export default function DashboardHub() {
  const { userProfile } = useAuth()
  const { state, setStep } = useCalculator()
  const { currentStep } = state.ui

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-400 rounded-full animate-spin" />
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider animate-pulse">
            Loading Profile...
          </p>
        </div>
      </div>
    )
  }

  const steps = [
    { id: 'welcome', label: 'Welcome' },
    { id: 'diet', label: 'Diet' },
    { id: 'transport', label: 'Transport' },
    { id: 'household', label: 'Energy' },
    { id: 'results', label: 'Results' },
  ]

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep)

  const renderStepContent = () => {
    switch (currentStep) {
      case 'welcome':
        return <WelcomeScreen />
      case 'diet':
        return <DietScreen />
      case 'transport':
        return <TransportScreen />
      case 'household':
        return <HouseholdScreen />
      case 'results':
        return <ResultsScreen />
      default:
        return null
    }
  }

  return (
    <div className="relative min-h-screen overflow-y-auto overflow-x-hidden bg-transparent">
      <ClientOnly>
        <EcoLineWaves
          vibrancy="medium"
          intensity="medium"
          pageVariant="dashboard"
          overlayOpacity={0.03}
        />
      </ClientOnly>

      <div className="relative z-10 flex flex-col items-center min-h-screen py-8 px-4">
        <div className="w-full max-w-5xl mb-6">
          <Navbar />
        </div>

        <div className="w-full max-w-5xl space-y-10 pb-20">
          <div>
            <FluidGlassPanel fluid noise variant="neutral" className="p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-4">
                <AnimatedEcoIcon name="trophy" size={56} intensity="bold" trigger="always" />
                <div>
                  <h2 className="text-lg font-bold text-white font-display">Your Identity Arc</h2>
                  <p className="text-xs text-slate-400 font-body">Progress through sustainability tiers</p>
                </div>
              </div>
              <IdentityTierRail currentTier={1} orientation="horizontal" />
            </FluidGlassPanel>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {KPI_DATA.map((kpi) => (
              <div key={kpi.variant} className="relative flex">
                <SpotlightKPICard
                  variant={kpi.variant}
                  value={kpi.value}
                  label={kpi.label}
                  prefix={kpi.prefix}
                  suffix={kpi.suffix}
                  decimals={kpi.decimals}
                  badge={kpi.badge}
                  className="h-full"
                />
              </div>
            ))}
          </div>

          {currentStep !== 'welcome' && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <div className="w-full bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl px-6 py-4 flex justify-between items-center relative overflow-hidden">
                <div className="absolute top-1/2 left-[12%] right-[12%] h-px bg-white/5 -translate-y-1/2 -z-10" />
                <motion.div
                  className="absolute top-1/2 left-[12%] h-px bg-gradient-to-r from-emerald-500 to-teal-500 -translate-y-1/2 -z-10"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.max(0, currentStepIndex - 1) * 33.333}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                />

                {steps.slice(1).map((step, idx) => {
                  const stepNum = idx + 1
                  const isReached = stepNum <= currentStepIndex
                  const isActive = step.id === currentStep

                  return (
                    <div key={step.id} className="flex flex-col items-center gap-1.5 z-10">
                      <button
                        disabled={stepNum > currentStepIndex}
                        onClick={() => setStep(step.id)}
                        className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                          isActive
                            ? 'bg-emerald-500 text-slate-950 ring-4 ring-emerald-500/20 scale-110 shadow-[0_0_15px_rgba(16,185,129,0.4)] font-extrabold'
                            : isReached
                              ? 'bg-gradient-to-br from-emerald-600 to-teal-600 text-white cursor-pointer hover:brightness-110'
                              : 'bg-white/5 border border-white/10 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        {isReached ? '\u2713' : stepNum}
                      </button>
                      <span
                        className={`text-[10px] font-medium transition-colors duration-300 ${
                          isActive
                            ? 'text-emerald-400 font-bold'
                            : isReached
                              ? 'text-slate-300'
                              : 'text-slate-500'
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <FluidGlassPanel noise variant="neutral" className="p-6 sm:p-8">
              {renderStepContent()}
            </FluidGlassPanel>
          </motion.div>

          <div className="text-center text-xs text-slate-600">
            Authenticated Workspace Session. Science-backed default coefficients.
          </div>
        </div>
      </div>
    </div>
  )
}

import { motion } from 'framer-motion'
import { Login } from '@/components/auth/Login'
import { AnimatedEcoIcon } from '@/components/eco-ui/AnimatedEcoIcon'
import { DecryptReveal } from '@/components/eco-ui/DecryptReveal'
import { FluidGlassPanel } from '@/components/eco-ui/FluidGlassPanel'
import { EcoLineWaves } from '@/components/eco-ui/EcoLineWaves'
import { ClientOnly } from '@/components/ClientOnly'

const FEATURES = [
  { icon: 'leaf' as const, title: 'Carbon Baseline', desc: 'Calculate your per-capita footprint across diet, commute & energy.', intensity: 'bold' as const },
  { icon: 'flame' as const, title: 'Active Streaks', desc: 'Log daily habits and build a net-zero streak with rewards.', intensity: 'epic' as const },
  { icon: 'planet' as const, title: 'Sandbox Simulator', desc: 'Project future reductions via interactive lifestyle sliders.', intensity: 'bold' as const },
]

export default function LoginPage() {
  return (
    <div className="relative min-h-screen overflow-y-auto overflow-x-hidden bg-transparent text-slate-100">
      <ClientOnly>
        <EcoLineWaves
          vibrancy="high"
          intensity="medium"
          pageVariant="login"
          overlayOpacity={0.04}
        />
      </ClientOnly>

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-cyan-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 flex flex-col items-center min-h-screen">
        <section className="flex flex-col items-center justify-center min-h-[50vh] pt-16 pb-8 px-4 w-full">
          <div>
            <AnimatedEcoIcon name="planet" size={120} intensity="bold" />
          </div>

          <div className="mt-6 text-center max-w-2xl">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black leading-[1.1] tracking-tight">
              <DecryptReveal
                text="Enter the Ecosystem."
                as="span"
                delay={300}
                shimmer
                className="bg-gradient-to-r from-emerald-300 via-teal-300 to-cyan-300 bg-clip-text text-transparent"
              />
            </h1>
            <p className="mt-4 text-base sm:text-lg text-slate-400 max-w-md mx-auto leading-relaxed font-light">
              Your carbon diagnostic ledger — compute, simulate, and track your path to net-zero.
            </p>
          </div>

          <div className="mt-2 text-xs text-emerald-500/40 font-mono tracking-[0.2em] uppercase">
            ~ Carbon Diagnostics Engine v4.0 ~
          </div>
        </section>

        <section className="w-full flex justify-center px-4 pb-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="w-full max-w-md"
          >
            <FluidGlassPanel fluid electricBorder noise variant="neutral" className="p-0">
              <Login />
            </FluidGlassPanel>
          </motion.div>
        </section>

        <section className="w-full max-w-4xl px-4 pb-20">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
              >
                <FluidGlassPanel variant="neutral" noise hover={false} className="p-5 text-center">
                  <div className="flex justify-center mb-3">
                    <AnimatedEcoIcon name={f.icon} size={52} intensity={f.intensity} trigger="always" />
                  </div>
                  <h3 className="text-sm font-bold text-white mb-1">{f.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{f.desc}</p>
                </FluidGlassPanel>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

import { useEffect, useRef, useState } from 'react';
import {
  motion,
  useMotionValue,
  useSpring,
  useMotionValueEvent,
} from 'framer-motion';

const SCRAMBLE_SET = "!@#$%^&*()_+-=[]{}|;:',.<>?/~`";

function randChar(): string {
  return SCRAMBLE_SET[Math.floor(Math.random() * SCRAMBLE_SET.length)];
}

function scrambleText(
  target: string,
  setChars: (chars: string[]) => void,
  onComplete?: () => void,
  frames = 28,
): () => void {
  const targetArr = target.split('');
  let frame = 0;
  let id: number;

  const tick = () => {
    frame++;
    setChars(
      targetArr.map((c, i) => {
        if (c === ' ') return ' ';
        const resolveAt = Math.floor(
          frames * (0.15 + (i / targetArr.length) * 0.55),
        );
        return frame >= resolveAt ? c : randChar();
      }),
    );
    if (frame < frames) {
      id = requestAnimationFrame(tick);
    } else {
      setChars(targetArr);
      onComplete?.();
    }
  };

  id = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(id);
}

function DecryptReveal({
  headline,
  value,
}: {
  headline: string;
  value: string;
}) {
  const [chars, setChars] = useState(() => headline.split(''));
  const [phase, setPhase] = useState<
    'scramble-in' | 'headline' | 'scramble-out' | 'value'
  >('scramble-in');

  useEffect(() => {
    if (phase === 'scramble-in') {
      const cancel = scrambleText(headline, setChars, () =>
        setPhase('headline'),
      );
      return cancel;
    }
    if (phase === 'headline') {
      const timer = setTimeout(() => setPhase('scramble-out'), 3500);
      return () => clearTimeout(timer);
    }
    if (phase === 'scramble-out') {
      const cancel = scrambleText(value, setChars, () => setPhase('value'));
      return cancel;
    }
  }, [phase, headline, value]);

  return <>{chars.join('')}</>;
}

function CountUpNumber({
  value,
  decimals = 1,
}: {
  value: number;
  decimals?: number;
}) {
  const countValue = useMotionValue(0);
  const springValue = useSpring(countValue, { damping: 25, stiffness: 80 });
  const [display, setDisplay] = useState('0');

  useMotionValueEvent(springValue, 'change', (latest) => {
    setDisplay(latest.toFixed(decimals));
  });

  useEffect(() => {
    countValue.set(0);
    const timer = setTimeout(() => countValue.set(value), 200);
    return () => clearTimeout(timer);
  }, [value, countValue]);

  return <>{display}</>;
}

const BREAKDOWN_COLORS = {
  emerald: { from: '#10b981', to: '#34d399' },
  teal: { from: '#14b8a6', to: '#2dd4bf' },
  cyan: { from: '#06b6d4', to: '#22d3ee' },
} as const;

interface BreakdownBarProps {
  label: string;
  value: number;
  total: number;
  color: keyof typeof BREAKDOWN_COLORS;
  icon: string;
}

function BreakdownBar({
  label,
  value,
  total,
  color,
  icon,
}: BreakdownBarProps) {
  const pct = total > 0 ? (value / total) * 100 : 0;
  const c = BREAKDOWN_COLORS[color];

  return (
    <div className="group relative overflow-hidden rounded-xl">
      <div
        className="pointer-events-none absolute opacity-0 transition-opacity duration-400 group-hover:opacity-100"
        style={{
          inset: -1,
          borderRadius: '0.75rem',
          background: `conic-gradient(from var(--angle) at 50% 50%, transparent 10%, ${c.from}, ${c.to}, transparent 90%)`,
          animation: 'electric-spin 3s linear infinite',
          zIndex: 0,
        }}
      />
      <div
        className="relative"
        style={{
          zIndex: 1,
          background: 'rgba(255,255,255,0.04)',
          borderRadius: 'calc(0.75rem - 1px)',
          margin: 1,
        }}
      >
        <div className="p-4">
          <div className="flex items-center gap-1.5 mb-2">
            <span className="text-sm leading-none">{icon}</span>
            <span className="text-xs font-semibold text-white/70 tracking-wide uppercase">
              {label}
            </span>
          </div>
          <div className="flex items-baseline justify-between mb-2.5">
            <span
              className="text-xl font-extrabold tracking-tight"
              style={{ color: c.from }}
            >
              {value.toFixed(1)}
              <span className="text-[10px] text-white/40 font-medium ml-1">
                tCO₂e
              </span>
            </span>
            <span className="text-xs font-semibold text-white/40">
              {pct.toFixed(0)}%
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{
                background: `linear-gradient(90deg, ${c.from}, ${c.to})`,
                boxShadow: `0 0 8px ${c.from}44`,
              }}
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 1.2, delay: 0.4, ease: 'easeOut' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

interface EquivalencyCardProps {
  emoji: string;
  value: number;
  label: string;
}

function EquivalencyCard({ emoji, value, label }: EquivalencyCardProps) {
  const countValue = useMotionValue(0);
  const springValue = useSpring(countValue, { damping: 20, stiffness: 60 });
  const [displayVal, setDisplayVal] = useState(0);

  useMotionValueEvent(springValue, 'change', (latest) => {
    setDisplayVal(Math.round(latest));
  });

  useEffect(() => {
    countValue.set(0);
    const timer = setTimeout(() => countValue.set(value), 400);
    return () => clearTimeout(timer);
  }, [value, countValue]);

  return (
    <motion.div
      className="group relative overflow-hidden rounded-2xl border border-white/[0.06] cursor-default"
      style={{ background: 'rgba(255,255,255,0.03)' }}
      whileHover={{ y: -5, scale: 1.03 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <div className="relative z-10 flex flex-col items-center text-center gap-1.5 py-6 px-4">
        <motion.span
          className="text-3xl leading-none"
          whileHover={{ scale: 1.2, rotate: [0, -10, 10, 0] }}
          transition={{ duration: 0.4 }}
          style={{
            filter: 'drop-shadow(0 0 6px rgba(52,211,153,0.25))',
          }}
        >
          {emoji}
        </motion.span>
        <span className="text-3xl font-extrabold bg-gradient-to-br from-emerald-300 via-teal-300 to-cyan-300 bg-clip-text text-transparent leading-tight">
          {displayVal}
        </span>
        <span className="text-[11px] font-medium text-white/40 leading-tight max-w-[120px]">
          {label}
        </span>
      </div>

      <motion.div
        className="absolute inset-0 pointer-events-none opacity-0 rounded-[inherit]"
        style={{
          background:
            'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.05) 50%, transparent 70%)',
          backgroundSize: '200% 100%',
        }}
        whileHover={{
          opacity: 1,
          backgroundPosition: ['200% 0%', '-200% 0%'],
          transition: { duration: 2, repeat: Infinity, ease: 'linear' },
        }}
      />
    </motion.div>
  );
}

interface Equivalencies {
  trees: number;
  flights: number;
  burgers: number;
}

interface ResultsRevealSectionProps {
  co2Footprint: number;
  equivalencies: Equivalencies;
  className?: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.18, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 100, damping: 20 },
  },
};

export const ResultsRevealSection: React.FC<ResultsRevealSectionProps> = ({
  co2Footprint,
  equivalencies,
  className = '',
}) => {
  const dietVal = co2Footprint * 0.25;
  const transportVal = co2Footprint * 0.4;
  const energyVal = co2Footprint * 0.35;

  return (
    <motion.section
      className={`relative overflow-hidden rounded-3xl border border-white/[0.08] ${className}`}
      style={{
        background:
          'linear-gradient(160deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
        backdropFilter: 'blur(32px)',
        WebkitBackdropFilter: 'blur(32px)',
      }}
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <style>{`
        @property --angle {
          syntax: '<angle>';
          initial-value: 0deg;
          inherits: false;
        }
        @keyframes electric-spin {
          to { --angle: 360deg; }
        }
      `}</style>

      <div className="absolute -top-28 -left-24 w-96 h-96 bg-emerald-400/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/4 -right-32 w-[30rem] h-[30rem] bg-teal-400/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 left-1/3 w-80 h-80 bg-cyan-400/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-2/3 left-[15%] w-56 h-56 bg-emerald-400/5 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        className="relative z-10 px-6 py-10 md:px-12 md:py-16 flex flex-col items-center gap-10 md:gap-14"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* 1. Decrypt Reveal Headline */}
        <motion.div variants={itemVariants} className="text-center w-full">
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-white/80 min-h-[1.3em] flex items-center justify-center">
            <span className="inline-block">
              <DecryptReveal
                headline="Your Carbon Footprint"
                value={`${co2Footprint.toFixed(1)} tCO₂e / year`}
              />
            </span>
          </h1>
        </motion.div>

        {/* 2. Giant Gradient CountUp */}
        <motion.div variants={itemVariants} className="text-center">
          <div
            className="text-7xl md:text-8xl lg:text-9xl font-extrabold bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent leading-none tracking-tighter select-none"
            style={{
              textShadow:
                '0 0 40px rgba(52,211,153,0.25), 0 0 80px rgba(20,184,166,0.12), 0 0 120px rgba(6,182,212,0.08)',
            }}
          >
            <CountUpNumber value={co2Footprint} decimals={1} />
          </div>
          <motion.p
            className="mt-3 text-xs md:text-sm font-medium text-white/35 tracking-[0.2em] uppercase"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.2 }}
          >
            tonnes CO₂ equivalent per year
          </motion.p>
        </motion.div>

        {/* 3. Breakdown Bars */}
        <motion.div variants={itemVariants} className="w-full max-w-2xl">
          <p className="text-[10px] font-semibold text-white/25 uppercase tracking-[0.25em] mb-4 text-center">
            Your Breakdown
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <BreakdownBar
              label="Diet"
              value={dietVal}
              total={co2Footprint}
              color="emerald"
              icon="🥗"
            />
            <BreakdownBar
              label="Transport"
              value={transportVal}
              total={co2Footprint}
              color="teal"
              icon="🚗"
            />
            <BreakdownBar
              label="Energy"
              value={energyVal}
              total={co2Footprint}
              color="cyan"
              icon="⚡"
            />
          </div>
        </motion.div>

        {/* 4. Equivalencies */}
        <motion.div variants={itemVariants} className="w-full max-w-2xl">
          <p className="text-[10px] font-semibold text-white/25 uppercase tracking-[0.25em] mb-4 text-center">
            Your Impact In Context
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <EquivalencyCard
              emoji="🌳"
              value={equivalencies.trees}
              label="trees needed to offset"
            />
            <EquivalencyCard
              emoji="✈️"
              value={equivalencies.flights}
              label="NY–LA round trips"
            />
            <EquivalencyCard
              emoji="🍔"
              value={equivalencies.burgers}
              label="beef burgers equivalent"
            />
          </div>
        </motion.div>
      </motion.div>
    </motion.section>
  );
};

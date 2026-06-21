import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface StreakFireCounterProps {
  streak: number;
  previousStreak: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

interface Ember {
  id: number;
  x: number;
  size: number;
  color: string;
  drift: number;
}

interface SparkParticle {
  id: number;
  x: number;
  y: number;
  angle: number;
  velocity: number;
  size: number;
  color: string;
}

const SIZE_MAP = {
  sm: { container: 'p-4', icon: 48, text: 'text-2xl', gap: 'gap-1' },
  md: { container: 'p-6', icon: 72, text: 'text-4xl', gap: 'gap-2' },
  lg: { container: 'p-8', icon: 96, text: 'text-6xl', gap: 'gap-3' },
};

const SPARK_COLORS = ['#34d399', '#10b981', '#14b8a6', '#06b6d4', '#22d3ee', '#a7f3d0'];
const EMBER_COLORS = ['#f97316', '#fb923c', '#34d399', '#10b981', '#fbbf24'];

function FlameSVG({ size }: { size: number }) {
  const scale = size / 72;
  return (
    <svg width={size} height={size} viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="flameGrad" x1="36" y1="68" x2="36" y2="4">
          <stop offset="0%" stopColor="#f97316" />
          <stop offset="40%" stopColor="#ef4444" />
          <stop offset="75%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#fde68a" />
        </linearGradient>
        <linearGradient id="flameInner" x1="36" y1="60" x2="36" y2="8">
          <stop offset="0%" stopColor="#ea580c" />
          <stop offset="50%" stopColor="#f87171" />
          <stop offset="100%" stopColor="#fef08a" />
        </linearGradient>
        <linearGradient id="flameCore" x1="36" y1="50" x2="36" y2="16">
          <stop offset="0%" stopColor="#dc2626" />
          <stop offset="100%" stopColor="#fef9c3" />
        </linearGradient>
        <radialGradient id="glowGrad" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#f97316" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
        </radialGradient>
      </defs>

      <motion.circle cx="36" cy="36" r="28" fill="url(#glowGrad)" opacity={0.3}
        animate={{ scale: [1, 1.05, 0.98, 1.03, 1], opacity: [0.3, 0.4, 0.25, 0.35, 0.3] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.path
        d="M36 8C36 8 22 26 22 38C22 44.5 25.5 52 30 56.5C32 58.5 34 60 36 60C38 60 40 58.5 42 56.5C46.5 52 50 44.5 50 38C50 26 36 8 36 8Z"
        fill="url(#flameGrad)"
        animate={{
          d: [
            'M36 8C36 8 22 26 22 38C22 44.5 25.5 52 30 56.5C32 58.5 34 60 36 60C38 60 40 58.5 42 56.5C46.5 52 50 44.5 50 38C50 26 36 8 36 8Z',
            'M36 10C36 10 20 28 20 40C20 46.5 24 53 29 57C31 59 33.5 61 36 61C38.5 61 41 59 43 57C48 53 52 46.5 52 40C52 28 36 10 36 10Z',
            'M36 6C36 6 24 24 24 37C24 43.5 27 51 31 55.5C33 57.5 34.5 59 36 59C37.5 59 39 57.5 41 55.5C45 51 48 43.5 48 37C48 24 36 6 36 6Z',
            'M36 8C36 8 22 26 22 38C22 44.5 25.5 52 30 56.5C32 58.5 34 60 36 60C38 60 40 58.5 42 56.5C46.5 52 50 44.5 50 38C50 26 36 8 36 8Z',
          ],
        }}
        transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.path
        d="M36 16C36 16 26 30 26 39C26 44 29 49.5 32.5 53C34 54.5 35 55.5 36 55.5C37 55.5 38 54.5 39.5 53C43 49.5 46 44 46 39C46 30 36 16 36 16Z"
        fill="url(#flameInner)"
        animate={{
          d: [
            'M36 16C36 16 26 30 26 39C26 44 29 49.5 32.5 53C34 54.5 35 55.5 36 55.5C37 55.5 38 54.5 39.5 53C43 49.5 46 44 46 39C46 30 36 16 36 16Z',
            'M36 14C36 14 24 30 24 40C24 45 27.5 50 31.5 54C33 55.5 34.5 56.5 36 56.5C37.5 56.5 39 55.5 40.5 54C44.5 50 48 45 48 40C48 30 36 14 36 14Z',
            'M36 18C36 18 28 31 28 38C28 43 30.5 48.5 34 52C35 53 35.5 53.5 36 53.5C36.5 53.5 37 53 38 52C41.5 48.5 44 43 44 38C44 31 36 18 36 18Z',
            'M36 16C36 16 26 30 26 39C26 44 29 49.5 32.5 53C34 54.5 35 55.5 36 55.5C37 55.5 38 54.5 39.5 53C43 49.5 46 44 46 39C46 30 36 16 36 16Z',
          ],
        }}
        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.path
        d="M36 24C36 24 30 33 30 39C30 42.5 32.5 46.5 35 48.5C35.5 49 35.5 49 36 49C36.5 49 36.5 49 37 48.5C39.5 46.5 42 42.5 42 39C42 33 36 24 36 24Z"
        fill="url(#flameCore)"
        animate={{
          d: [
            'M36 24C36 24 30 33 30 39C30 42.5 32.5 46.5 35 48.5C35.5 49 35.5 49 36 49C36.5 49 36.5 49 37 48.5C39.5 46.5 42 42.5 42 39C42 33 36 24 36 24Z',
            'M36 22C36 22 28 33 28 40C28 43.5 31 47.5 33.5 49.5C34.5 50.5 35 51 36 51C37 51 37.5 50.5 38.5 49.5C41 47.5 44 43.5 44 40C44 33 36 22 36 22Z',
            'M36 26C36 26 32 34 32 38C32 41 33.5 45 35.5 47C35.8 47.3 36 47 36 47C36 47 36.2 47.3 36.5 47C38.5 45 40 41 40 38C40 34 36 26 36 26Z',
            'M36 24C36 24 30 33 30 39C30 42.5 32.5 46.5 35 48.5C35.5 49 35.5 49 36 49C36.5 49 36.5 49 37 48.5C39.5 46.5 42 42.5 42 39C42 33 36 24 36 24Z',
          ],
        }}
        transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
      />
    </svg>
  );
}

function StreakNumber({ streak, size }: { streak: number; size: keyof typeof SIZE_MAP }) {
  return (
    <motion.span
      key={streak}
      className={`${SIZE_MAP[size].text} font-black inline-block`}
      initial={{ scale: 1.4, opacity: 0.6 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 12 }}
      style={{
        background: 'linear-gradient(90deg, #fbbf24 0%, #f59e0b 20%, #fef3c7 40%, #fbbf24 60%, #f59e0b 80%, #fbbf24 100%)',
        backgroundSize: '200% 100%',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        animation: 'streak-shimmer 2.5s linear infinite',
      }}
    >
      {streak}
    </motion.span>
  );
}

function EmeraldRing({ streak, size }: { streak: number; size: number }) {
  const intensity = Math.min(streak / 30, 1);
  const maxWidth = size * 1.6;
  const pulseDuration = Math.max(2 - intensity * 0.8, 1.2);

  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        width: maxWidth,
        height: maxWidth,
        border: `${1.5 + intensity * 2}px solid rgba(52,211,153,${0.2 + intensity * 0.4})`,
        boxShadow: `0 0 ${8 + intensity * 24}px rgba(52,211,153,${0.15 + intensity * 0.35}), 0 0 ${4 + intensity * 12}px rgba(20,184,166,${0.1 + intensity * 0.25})`,
      }}
      animate={{
        scale: [1, 1 + intensity * 0.12, 1],
        opacity: [0.6 + intensity * 0.3, 0.1 + intensity * 0.15, 0.6 + intensity * 0.3],
      }}
      transition={{
        duration: pulseDuration,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  );
}

export const StreakFireCounter: React.FC<StreakFireCounterProps> = ({
  streak,
  previousStreak,
  className = '',
  size = 'md',
}) => {
  const [sparks, setSparks] = useState<SparkParticle[]>([]);
  const [embers, setEmbers] = useState<Ember[]>([]);
  const idRef = useRef(0);
  const prevStreakRef = useRef(previousStreak);
  const streakJustIncreased = previousStreak < streak;
  const sz = SIZE_MAP[size];

  useEffect(() => {
    if (streakJustIncreased) {
      const newSparks: SparkParticle[] = Array.from({ length: 8 + Math.floor(Math.random() * 3) }, () => {
        idRef.current++;
        return {
          id: idRef.current,
          x: 0,
          y: 0,
          angle: -Math.PI / 2 + (Math.random() - 0.5) * Math.PI,
          velocity: 40 + Math.random() * 80,
          size: 3 + Math.random() * 4,
          color: SPARK_COLORS[Math.floor(Math.random() * SPARK_COLORS.length)],
        };
      });
      setSparks((prev) => [...prev, ...newSparks]);

      const newEmbers: Ember[] = Array.from({ length: 5 + Math.floor(Math.random() * 2) }, () => {
        idRef.current++;
        return {
          id: idRef.current,
          x: (Math.random() - 0.5) * 40,
          size: 2 + Math.random() * 4,
          color: EMBER_COLORS[Math.floor(Math.random() * EMBER_COLORS.length)],
          drift: (Math.random() - 0.5) * 30,
        };
      });
      setEmbers((prev) => [...prev, ...newEmbers]);

      const batch = idRef.current;
      const timeout = setTimeout(() => {
        setSparks((prev) => prev.filter((s) => s.id > batch - 20));
        setEmbers((prev) => prev.filter((e) => e.id > batch - 20));
      }, 1400);

      return () => clearTimeout(timeout);
    }
  }, [streak]);

  return (
    <>
      <style>{`
        @keyframes streak-shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
      `}</style>

      <div
        className={`relative inline-flex flex-col items-center bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl ${sz.container} ${sz.gap} ${className}`}
      >
        <div className="relative flex items-center justify-center" style={{ width: sz.icon, height: sz.icon }}>
          <EmeraldRing streak={streak} size={sz.icon} />

          <div className="relative z-10">
            <FlameSVG size={sz.icon} />
          </div>

          <AnimatePresence>
            {sparks.map((s) => {
              const dx = Math.cos(s.angle) * s.velocity;
              const dy = Math.sin(s.angle) * s.velocity - 20;
              return (
                <motion.div
                  key={s.id}
                  className="absolute pointer-events-none"
                  initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
                  animate={{ x: dx, y: dy, scale: 0, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.7, ease: 'easeOut' }}
                  style={{
                    width: s.size,
                    height: s.size,
                    borderRadius: '50%',
                    backgroundColor: s.color,
                    boxShadow: `0 0 ${s.size * 2}px ${s.color}`,
                  }}
                />
              );
            })}
          </AnimatePresence>

          <AnimatePresence>
            {embers.map((e) => (
              <motion.div
                key={e.id}
                className="absolute pointer-events-none"
                initial={{ x: e.x, y: 0, scale: 1, opacity: 1 }}
                animate={{
                  x: e.x + e.drift,
                  y: -(30 + Math.random() * 40),
                  scale: [1, 0.6, 0],
                  opacity: [1, 0.5, 0],
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
                style={{
                  width: e.size,
                  height: e.size,
                  borderRadius: '50%',
                  backgroundColor: e.color,
                  boxShadow: `0 0 ${e.size * 2}px ${e.color}`,
                }}
              />
            ))}
          </AnimatePresence>
        </div>

        <div className="flex flex-col items-center">
          <StreakNumber streak={streak} size={size} />
          <span className="text-xs text-slate-400 uppercase tracking-wider mt-0.5">
            day streak
          </span>
        </div>
      </div>
    </>
  );
};

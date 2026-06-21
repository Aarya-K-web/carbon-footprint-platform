import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  motion,
  useMotionValue,
  useSpring,
  useMotionValueEvent,
  AnimatePresence,
} from 'framer-motion';

const TIER_EMOJIS = ['🌱', '🌿', '🍃', '🌳', '🌍'];

const TIER_COLORS = [
  'from-emerald-400 to-green-500',
  'from-emerald-300 to-teal-400',
  'from-teal-400 to-cyan-400',
  'from-cyan-400 to-sky-400',
  'from-sky-400 to-indigo-400',
];

const CONFETTI_COLORS = [
  '#10b981', '#34d399', '#14b8a6',
  '#06b6d4', '#22d3ee', '#67e8f9',
  '#facc15', '#fb923c', '#f472b6',
];

interface EcoShareCardProps {
  username: string;
  tierName: string;
  tierIndex: number;
  co2Footprint: number;
  className?: string;
  onExport?: () => void;
}

interface ConfettiParticle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  rotation: number;
}

export const EcoShareCard: React.FC<EcoShareCardProps> = ({
  username,
  tierName,
  tierIndex,
  co2Footprint,
  className = '',
  onExport,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiParticles, setConfettiParticles] = useState<ConfettiParticle[]>([]);

  const countValue = useMotionValue(0);
  const springValue = useSpring(countValue, { damping: 25, stiffness: 80 });
  const [displayValue, setDisplayValue] = useState('0.00');

  const emoji = TIER_EMOJIS[tierIndex] ?? TIER_EMOJIS[0];
  const gradient = TIER_COLORS[tierIndex] ?? TIER_COLORS[0];

  useMotionValueEvent(springValue, 'change', (latest) => {
    setDisplayValue(latest.toFixed(2));
  });

  useEffect(() => {
    countValue.set(0);
    const timer = setTimeout(() => countValue.set(co2Footprint), 100);
    return () => clearTimeout(timer);
  }, [co2Footprint, countValue]);

  const handleExport = useCallback(() => {
    if (onExport) {
      onExport();
    }
    const particles: ConfettiParticle[] = Array.from({ length: 24 }, (_, i) => ({
      id: i,
      x: (Math.random() - 0.5) * 200,
      y: (Math.random() - 0.5) * 200,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      size: Math.random() * 6 + 3,
      rotation: Math.random() * 720 - 360,
    }));
    setConfettiParticles(particles);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 1200);
  }, [onExport]);

  return (
    <motion.div
      ref={cardRef}
      className={`relative w-[400px] h-[220px] overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl select-none ${className}`}
      whileHover={{ scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      {/* Glow Orbs */}
      <div className="absolute -top-8 -left-8 w-24 h-24 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-teal-400/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-4 w-16 h-16 bg-cyan-400/10 rounded-full blur-3xl pointer-events-none" />

      {/* Shimmer overlay on hover */}
      <motion.div
        className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100"
        style={{
          background: 'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.08) 50%, transparent 70%)',
          backgroundSize: '200% 100%',
        }}
        initial={false}
        whileHover={{
          opacity: 1,
          backgroundPosition: ['200% 0%', '-200% 0%'],
          transition: { duration: 2.5, repeat: Infinity, ease: 'linear' },
        }}
      />

      {/* Floating leaves on hover */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[0, 1, 2, 3].map((i) => (
          <motion.span
            key={`leaf-${i}`}
            className="absolute text-xs opacity-0"
            style={{
              left: `${15 + i * 22}%`,
              bottom: '10%',
            }}
            whileHover={{
              opacity: [0, 0.8, 0],
              y: [0, -60 - i * 15, -80 - i * 10],
              x: [0, (i % 2 === 0 ? 1 : -1) * (10 + i * 5)],
              rotate: [0, 360 + i * 90],
              transition: {
                duration: 3 + i * 0.4,
                repeat: Infinity,
                delay: i * 0.6,
                ease: 'easeOut',
              },
            }}
          >
            {i % 2 === 0 ? '🍃' : '🌱'}
          </motion.span>
        ))}
      </div>

      {/* Top section */}
      <div className="absolute top-3 left-4 right-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-1.5">
          <span className="text-emerald-400 text-sm">🌱</span>
          <span className="text-[10px] font-semibold text-white/80 tracking-wide">
            My Carbon Report
          </span>
        </div>
        <button
          onClick={handleExport}
          className="w-6 h-6 flex items-center justify-center rounded-md bg-white/10 hover:bg-white/20 border border-white/10 transition-colors"
          title="Export"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/70">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
        </button>
      </div>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
        {/* Pulsing tier badge */}
        <div className="relative mb-1.5">
          <motion.div
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, rgba(16,185,129,0.2), rgba(20,184,166,0.15))`,
              border: '1px solid rgba(255,255,255,0.15)',
            }}
            animate={{
              scale: [1, 1.06, 1],
              boxShadow: [
                '0 0 0 0 rgba(16,185,129,0.3)',
                '0 0 0 8px rgba(16,185,129,0)',
                '0 0 0 0 rgba(16,185,129,0)',
              ],
            }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <span className="text-lg">{emoji}</span>
          </motion.div>
        </div>

        {/* Tier name */}
        <span
          className={`text-sm font-extrabold bg-gradient-to-r ${gradient} bg-clip-text text-transparent tracking-tight`}
        >
          {tierName}
        </span>

        {/* Carbon Footprint label */}
        <span className="text-[9px] text-white/50 uppercase tracking-widest font-semibold mt-1">
          Carbon Footprint
        </span>

        {/* Animated value */}
        <span className="text-xl font-extrabold bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent leading-tight">
          {displayValue} tCO₂e/year
        </span>
      </div>

      {/* Bottom section */}
      <div className="absolute bottom-2.5 left-4 right-4 flex items-center justify-between z-10">
        <span className="text-[9px] text-white/40 font-medium">
          @{username} · ecopulse.app
        </span>
        <div className="w-[22px] h-[22px] border border-white/10 rounded flex items-center justify-center bg-white/5">
          <div className="grid grid-cols-3 gap-[1.5px]">
            {Array.from({ length: 9 }).map((_, i) => (
              <div
                key={`qr-${i}`}
                className={`w-[3px] h-[3px] ${i % 2 === 0 ? 'bg-white/30' : 'bg-white/10'}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Confetti burst */}
      <AnimatePresence>
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none z-20 flex items-center justify-center">
            {confettiParticles.map((p) => (
              <motion.div
                key={p.id}
                className="absolute rounded-full"
                style={{
                  width: p.size,
                  height: p.size,
                  backgroundColor: p.color,
                }}
                initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
                animate={{
                  x: p.x,
                  y: p.y,
                  scale: [0, 1.2, 0.8],
                  opacity: [1, 1, 0],
                  rotate: p.rotation,
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            ))}
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

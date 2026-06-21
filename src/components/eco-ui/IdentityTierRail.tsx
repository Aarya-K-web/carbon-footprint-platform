import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform, useMotionValueEvent } from 'framer-motion';

const TIERS = [
  { label: 'Footprint Newbie', emoji: '🌱', number: 1 },
  { label: 'Eco Curious', emoji: '🌿', number: 2 },
  { label: 'Green Committed', emoji: '🍃', number: 3 },
  { label: 'Climate Ally', emoji: '🌍', number: 4 },
  { label: 'Carbon Negative', emoji: '🌟', number: 5 },
] as const;

const COLORS = {
  emerald: '#10b981',
  teal: '#14b8a6',
  cyan: '#06b6d4',
  emeraldLight: 'rgba(16,185,129,0.15)',
  emeraldGlow: 'rgba(16,185,129,0.4)',
};

type Orientation = 'horizontal' | 'vertical';

interface IdentityTierRailProps {
  currentTier: number;
  onTierClick?: (tier: number) => void;
  className?: string;
  orientation?: Orientation;
}

const scrambleText = (text: string): string => {
  const chars = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`';
  return text
    .split('')
    .map((c) => (c === ' ' ? ' ' : chars[Math.floor(Math.random() * chars.length)]))
    .join('');
};

function CountUp({ value, duration = 800 }: { value: number; duration?: number }) {
  const count = useMotionValue(0);
  const springVal = useSpring(count, { damping: 30, stiffness: 100 });
  const [display, setDisplay] = useState('0');

  useEffect(() => {
    count.set(value);
  }, [value, count]);

  useMotionValueEvent(springVal, 'change', (v) => {
    setDisplay(Math.round(v).toString());
  });

  return <span>{display}</span>;
}

function DecryptReveal({ text, active }: { text: string; active: boolean }) {
  const [display, setDisplay] = useState(text);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();
  const [resolved, setResolved] = useState(!active);
  const cycleCount = useRef(0);

  useEffect(() => {
    if (!active) {
      setDisplay(text);
      setResolved(true);
      return;
    }

    setResolved(false);
    cycleCount.current = 0;
    const totalCycles = 6 + Math.floor(text.length * 1.5);

    intervalRef.current = setInterval(() => {
      cycleCount.current++;
      if (cycleCount.current >= totalCycles) {
        clearInterval(intervalRef.current);
        setDisplay(text);
        setResolved(true);
        return;
      }

      const progress = cycleCount.current / totalCycles;
      const revealCount = Math.floor(progress * text.length);
      const scrambled = scrambleText(text.slice(revealCount));
      setDisplay(text.slice(0, revealCount) + scrambled);
    }, 50);

    return () => clearInterval(intervalRef.current);
  }, [text, active]);

  return <span>{display}</span>;
}

function PrismaticBurst({ active, x, y }: { active: boolean; x: number; y: number }) {
  const particles = useMemo(() => {
    const items: Array<{
      id: number;
      angle: number;
      distance: number;
      size: number;
      color: string;
      shape: 'circle' | 'square';
    }> = [];
    const shapes: ('circle' | 'square')[] = ['circle', 'square'];
    const colors = ['#10b981', '#14b8a6', '#06b6d4', '#34d399', '#2dd4bf', '#22d3ee', '#a7f3d0'];
    for (let i = 0; i < 16; i++) {
      items.push({
        id: i,
        angle: (360 / 16) * i + Math.random() * 20,
        distance: 40 + Math.random() * 80,
        size: 3 + Math.random() * 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        shape: shapes[Math.floor(Math.random() * shapes.length)],
      });
    }
    return items;
  }, []);

  return (
    <AnimatePresence>
      {active && (
        <>
          {particles.map((p) => {
            const rad = (p.angle * Math.PI) / 180;
            const tx = Math.cos(rad) * p.distance;
            const ty = Math.sin(rad) * p.distance;

            return (
              <motion.div
                key={p.id}
                className="absolute pointer-events-none"
                style={{
                  width: p.size,
                  height: p.size,
                  left: x - p.size / 2,
                  top: y - p.size / 2,
                  backgroundColor: p.color,
                  borderRadius: p.shape === 'circle' ? '50%' : '2px',
                }}
                initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
                animate={{
                  x: tx,
                  y: ty,
                  opacity: [1, 0.8, 0],
                  scale: [0, 1.2, 0.5],
                }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            );
          })}
        </>
      )}
    </AnimatePresence>
  );
}

function TierCard({
  tier,
  index,
  currentTier,
  onTierClick,
  isHorizontal,
  orientation,
}: {
  tier: (typeof TIERS)[number];
  index: number;
  currentTier: number;
  onTierClick?: (tier: number) => void;
  isHorizontal: boolean;
  orientation: Orientation;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [showLeaves, setShowLeaves] = useState(false);
  const [burstActive, setBurstActive] = useState(false);

  const isCompleted = index < currentTier;
  const isCurrent = index === currentTier;
  const isFuture = index > currentTier;

  const prevCurrentRef = useRef(currentTier);
  useEffect(() => {
    if (prevCurrentRef.current === index && currentTier !== index) {
      setBurstActive(false);
    }
    if (currentTier === index && prevCurrentRef.current !== index) {
      setBurstActive(true);
      const t = setTimeout(() => setBurstActive(false), 1000);
      prevCurrentRef.current = currentTier;
      return () => clearTimeout(t);
    }
    prevCurrentRef.current = currentTier;
  }, [currentTier, index]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    setMousePos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  }, []);

  const handleClick = () => {
    if (onTierClick && !isFuture) onTierClick(index);
  };

  const burstRect = cardRef.current?.getBoundingClientRect();

  return (
    <div className={`relative ${isHorizontal ? 'flex-shrink-0' : ''}`}>
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setShowLeaves(true)}
        onMouseLeave={() => setShowLeaves(false)}
        onClick={handleClick}
        className={`
          relative overflow-hidden rounded-xl p-4 cursor-pointer select-none
          backdrop-blur-md border
          transition-colors duration-300
          ${isCompleted ? 'bg-emerald-500/10 border-emerald-500/40' : ''}
          ${isCurrent ? 'bg-emerald-500/15 border-emerald-400/60' : ''}
          ${isFuture ? 'bg-white/[0.03] border-white/5 grayscale-[0.7] opacity-60' : ''}
          ${!isFuture ? 'hover:bg-white/[0.08]' : ''}
        `}
        whileHover={!isFuture ? { y: -2, transition: { type: 'spring', stiffness: 300, damping: 20 } } : undefined}
        style={{ perspective: 800 }}
      >
        {/* Shape Blur hover background */}
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-300"
          style={{
            opacity: showLeaves && !isFuture ? 1 : 0,
            background: `radial-gradient(280px at ${mousePos.x}% ${mousePos.y}%, rgba(16,185,129,0.12), transparent 60%)`,
            filter: 'blur(20px)',
          }}
        />

        {/* Glowing emerald ring for current tier */}
        {isCurrent && (
          <motion.div
            className="absolute inset-0 rounded-xl pointer-events-none"
            animate={{
              boxShadow: [
                `0 0 12px ${COLORS.emeraldGlow}, inset 0 0 12px ${COLORS.emeraldLight}`,
                `0 0 24px ${COLORS.emeraldGlow}, inset 0 0 20px ${COLORS.emeraldLight}`,
                `0 0 12px ${COLORS.emeraldGlow}, inset 0 0 12px ${COLORS.emeraldLight}`,
              ],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}

        {/* Prismatic Burst */}
        {burstRect && (
          <PrismaticBurst
            active={burstActive}
            x={burstRect.width / 2}
            y={burstRect.height / 2}
          />
        )}

        {/* Completed checkmark glow */}
        {isCompleted && (
          <div className="absolute top-2 right-2 text-emerald-400 text-xs">
            <motion.span
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            >
              ✓
            </motion.span>
          </div>
        )}

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center gap-1.5">
          <span className={`text-2xl ${isFuture ? 'opacity-40' : ''}`}>
            {tier.emoji}
          </span>
          <span className="text-xs font-bold text-white/80 whitespace-nowrap">
            {isCurrent && currentTier === index ? (
              <DecryptReveal text={tier.label} active />
            ) : (
              tier.label
            )}
          </span>
          <span className="text-lg font-extrabold bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
            {isCurrent ? (
              <CountUp value={tier.number} />
            ) : (
              tier.number
            )}
          </span>
        </div>

        {/* Lock icon for future tiers */}
        {isFuture && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <motion.span
              className="text-white/20 text-2xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              🔒
            </motion.span>
          </div>
        )}
      </motion.div>
    </div>
  );
}

function TimelineConnector({
  index,
  isCompleted,
  isHorizontal,
  orientation,
}: {
  index: number;
  isCompleted: boolean;
  isHorizontal: boolean;
  orientation: Orientation;
}) {
  const isVertical = orientation === 'vertical';

  return (
    <div
      className={`
        relative flex-shrink-0
        ${isHorizontal ? 'w-10 h-0.5 self-center' : ''}
        ${isVertical ? 'w-0.5 h-10 self-center' : ''}
        ${isHorizontal && isHorizontal ? 'mx-0' : ''}
        ${isVertical && isVertical ? 'my-0' : ''}
      `}
    >
      {/* Base line */}
      <div
        className={`
          absolute inset-0 rounded-full
          ${isHorizontal ? 'h-px top-1/2 -translate-y-1/2' : 'w-px left-1/2 -translate-x-1/2'}
          ${isCompleted ? 'bg-emerald-500/30' : 'bg-white/10'}
        `}
      />

      {/* Lit line with gradient fill animation */}
      <motion.div
        className={`
          absolute inset-0 rounded-full overflow-hidden
          ${isHorizontal ? 'h-px top-1/2 -translate-y-1/2' : 'w-px left-1/2 -translate-x-1/2'}
        `}
        initial={{ scaleX: 0, scaleY: 0 }}
        animate={
          isCompleted
            ? isHorizontal
              ? { scaleX: 1, scaleY: 1 }
              : { scaleY: 1, scaleX: 1 }
            : { scaleX: 0, scaleY: 0 }
        }
        transition={{ duration: 0.6, ease: 'easeInOut', delay: 0.1 }}
        style={{ originX: 0, originY: 0 }}
      >
        <div
          className={`absolute inset-0 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 ${isHorizontal ? 'h-full' : 'w-full'}`}
        />
      </motion.div>

      {/* Animated glow dot on the lit line */}
      {isCompleted && (
        <motion.div
          className={`
            absolute rounded-full
            w-1.5 h-1.5 bg-emerald-400
            ${isHorizontal ? 'right-0 top-1/2 -translate-y-1/2' : 'bottom-0 left-1/2 -translate-x-1/2'}
          `}
          animate={{
            boxShadow: [
              `0 0 4px ${COLORS.emerald}`,
              `0 0 8px ${COLORS.emerald}`,
              `0 0 4px ${COLORS.emerald}`,
            ],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}
    </div>
  );
}

export const IdentityTierRail: React.FC<IdentityTierRailProps> = ({
  currentTier,
  onTierClick,
  className = '',
  orientation = 'horizontal',
}) => {
  const safeTier = Math.max(0, Math.min(4, currentTier));
  const isHorizontal = orientation === 'horizontal';
  const prevTier = useRef(safeTier);

  const progressPercent = (safeTier / (TIERS.length - 1)) * 100;

  const [justUnlocked, setJustUnlocked] = useState(false);

  useEffect(() => {
    if (prevTier.current !== safeTier && safeTier > prevTier.current) {
      setJustUnlocked(true);
      const t = setTimeout(() => setJustUnlocked(false), 1500);
      prevTier.current = safeTier;
      return () => clearTimeout(t);
    }
    prevTier.current = safeTier;
  }, [safeTier]);

  return (
    <div
      className={`
        relative overflow-hidden
        bg-white/[0.03] backdrop-blur-2xl
        border border-white/10
        rounded-2xl p-6
        ${isHorizontal ? '' : 'w-fit'}
        ${className}
      `}
    >
      {/* Top-level prismatic burst when any tier unlocks */}
      <AnimatePresence>
        {justUnlocked && (
          <motion.div
            className="absolute inset-0 pointer-events-none z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {Array.from({ length: 20 }).map((_, i) => {
              const colors = ['#10b981', '#14b8a6', '#06b6d4', '#34d399', '#2dd4bf', '#22d3ee'];
              const angle = (360 / 20) * i;
              const dist = 100 + Math.random() * 200;
              const rad = (angle * Math.PI) / 180;
              const size = 2 + Math.random() * 4;
              return (
                <motion.div
                  key={i}
                  className="absolute"
                  style={{
                    width: size,
                    height: size,
                    left: '50%',
                    top: '50%',
                    backgroundColor: colors[i % colors.length],
                    borderRadius: Math.random() > 0.5 ? '50%' : '1px',
                  }}
                  initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
                  animate={{
                    x: Math.cos(rad) * dist,
                    y: Math.sin(rad) * dist,
                    opacity: [1, 0.8, 0],
                    scale: [0, 1.5, 0.3],
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.2, ease: 'easeOut', delay: Math.random() * 0.2 }}
                />
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress bar with liquid fill */}
      <div className="relative mb-6">
        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
          {/* Background track */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-white/[0.02] via-emerald-500/5 to-white/[0.02]" />

          {/* Liquid fill progress */}
          <motion.div
            className="relative h-full rounded-full overflow-hidden"
            style={{ width: `${progressPercent}%` }}
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            {/* Gradient fill */}
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 rounded-full" />

            {/* Metallic shimmer sheen */}
            <motion.div
              className="absolute inset-0 w-full h-full"
              style={{
                background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)',
                backgroundSize: '200% 100%',
              }}
              animate={{ backgroundPosition: ['200% 0%', '-200% 0%'] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
            />

            {/* Liquid wave effect */}
            <div
              className="absolute inset-0 opacity-30"
              style={{
                background: 'repeating-linear-gradient(90deg, transparent, transparent 4px, rgba(255,255,255,0.1) 4px, rgba(255,255,255,0.1) 8px)',
                animation: 'liquid-fill 3s ease-in-out infinite',
              }}
            />
          </motion.div>
        </div>

        {/* Tier markers on progress bar */}
        <div className="absolute -top-1 left-0 right-0 flex justify-between px-0">
          {TIERS.map((_, i) => {
            const pct = (i / (TIERS.length - 1)) * 100;
            const isPast = i <= safeTier;
            return (
              <motion.div
                key={i}
                className={`absolute w-4 h-4 rounded-full border-2 -translate-x-1/2 -translate-y-1/2 ${
                  isPast
                    ? 'bg-emerald-500 border-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                    : 'bg-white/10 border-white/20'
                }`}
                style={{ left: `${pct}%`, top: '50%' }}
                animate={
                  isPast
                    ? {
                        scale: [1, 1.2, 1],
                        boxShadow: [
                          '0 0 4px rgba(16,185,129,0.3)',
                          '0 0 10px rgba(16,185,129,0.6)',
                          '0 0 4px rgba(16,185,129,0.3)',
                        ],
                      }
                    : undefined
                }
                transition={isPast ? { duration: 2, repeat: Infinity, ease: 'easeInOut' } : undefined}
              >
                {/* Inner dot for completed */}
                {isPast && (
                  <div className="absolute inset-1 rounded-full bg-emerald-300" />
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Tier cards and connectors */}
      <div
        className={`
          flex
          ${isHorizontal ? 'flex-row items-center' : 'flex-col items-center'}
          gap-0
        `}
      >
        {TIERS.map((tier, index) => (
          <React.Fragment key={index}>
            {/* Connector before (except first) */}
            {index > 0 && (
              <TimelineConnector
                index={index}
                isCompleted={index <= safeTier}
                isHorizontal={isHorizontal}
                orientation={orientation}
              />
            )}

            {/* Tier card */}
            <TierCard
              tier={tier}
              index={index}
              currentTier={safeTier}
              onTierClick={onTierClick}
              isHorizontal={isHorizontal}
              orientation={orientation}
            />
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

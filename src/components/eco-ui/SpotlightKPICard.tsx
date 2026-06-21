import React, { useRef, useState, useCallback, useEffect } from 'react';
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useMotionValueEvent,
} from 'framer-motion';

type KPIVariant = 'baseline' | 'footprint' | 'saved' | 'streak';

interface SpotlightKPICardProps {
  variant?: KPIVariant;
  value: number;
  label: string;
  prefix?: string;
  suffix?: string;
  badge?: string;
  className?: string;
  decimals?: number;
}

const VARIANT_CONFIG: Record<KPIVariant, { icon: string; accent: string; glow: string }> = {
  baseline: {
    icon: '\u{1F333}',
    accent: '#10b981',
    glow: 'rgba(16,185,129,0.08)',
  },
  footprint: {
    icon: '\u{1F30D}',
    accent: '#14b8a6',
    glow: 'rgba(20,184,166,0.08)',
  },
  saved: {
    icon: '\u{1F331}',
    accent: '#10b981',
    glow: 'rgba(16,185,129,0.08)',
  },
  streak: {
    icon: '\u{1F525}',
    accent: '#f59e0b',
    glow: 'rgba(245,158,11,0.08)',
  },
};

const NOISE_SVG =
  'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\' /%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' /%3E%3C/svg%3E")';

export const SpotlightKPICard: React.FC<SpotlightKPICardProps> = ({
  variant = 'baseline',
  value,
  label,
  prefix = '',
  suffix = '',
  badge,
  className = '',
  decimals = 1,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const leafRef = useRef<HTMLSpanElement>(null);
  const [hovered, setHovered] = useState(false);
  const [spotlight, setSpotlight] = useState({ x: 50, y: 50 });

  const config = VARIANT_CONFIG[variant];

  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  const rotateX = useSpring(useTransform(mouseY, [0, 1], [5, -5]), {
    damping: 22,
    stiffness: 180,
  });
  const rotateY = useSpring(useTransform(mouseX, [0, 1], [-5, 5]), {
    damping: 22,
    stiffness: 180,
  });

  const rawGlareX = useTransform(mouseX, [0, 1], [0, 100]);
  const rawGlareY = useTransform(mouseY, [0, 1], [0, 100]);
  const glareX = useSpring(rawGlareX, { damping: 30, stiffness: 150 });
  const glareY = useSpring(rawGlareY, { damping: 30, stiffness: 150 });

  const countValue = useMotionValue(0);
  const springValue = useSpring(countValue, { damping: 28, stiffness: 90 });
  const [displayNum, setDisplayNum] = useState(`${prefix}0`);

  useMotionValueEvent(springValue, 'change', (latest) => {
    setDisplayNum(`${prefix}${latest.toFixed(decimals)}`);
  });

  useEffect(() => {
    countValue.set(value);
  }, [value, countValue]);

  const leafScale = useMotionValue(1);
  const leafGlow = useMotionValue(0);
  const leafX = useMotionValue(0);
  const leafY = useMotionValue(0);

  const springLeafScale = useSpring(leafScale, { damping: 25, stiffness: 200 });
  const springLeafGlow = useSpring(leafGlow, { damping: 25, stiffness: 200 });
  const springLeafX = useSpring(leafX, { damping: 30, stiffness: 150 });
  const springLeafY = useSpring(leafY, { damping: 30, stiffness: 150 });

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = cardRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;

      setSpotlight({ x: x * 100, y: y * 100 });
      mouseX.set(x);
      mouseY.set(y);

      const leafEl = leafRef.current;
      if (leafEl) {
        const lr = leafEl.getBoundingClientRect();
        const cx = lr.left + lr.width / 2;
        const cy = lr.top + lr.height / 2;
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const proximity = Math.max(0, 1 - dist / 280);

        leafScale.set(1 + proximity * 1.5);
        leafGlow.set(proximity * 20);
        leafX.set(dx * 0.08);
        leafY.set(dy * 0.08);
      }
    },
    [mouseX, mouseY, leafScale, leafGlow, leafX, leafY],
  );

  const handleMouseEnter = useCallback(() => setHovered(true), []);
  const handleMouseLeave = useCallback(() => {
    setHovered(false);
    setSpotlight({ x: 50, y: 50 });
    mouseX.set(0.5);
    mouseY.set(0.5);
    leafScale.set(1);
    leafGlow.set(0);
    leafX.set(0);
    leafY.set(0);
  }, [mouseX, mouseY, leafScale, leafGlow, leafX, leafY]);

  const glareBackground = useTransform(
    [glareX, glareY],
    (gx: number, gy: number) =>
      `radial-gradient(circle at ${gx}% ${gy}%, rgba(255,255,255,0.1), transparent 60%)`,
  );

  const leafFilter = useTransform(
    springLeafGlow,
    (g: number) => `drop-shadow(0 0 ${g}px ${config.accent})`,
  );

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        perspective: 1000,
        transformStyle: 'preserve-3d',
      }}
      className={`relative overflow-hidden bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 transition-shadow duration-300 ${className}`}
    >
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-500"
        style={{
          opacity: hovered ? 1 : 0.6,
          background: `radial-gradient(600px at ${spotlight.x}% ${spotlight.y}%, ${config.glow}, transparent 60%)`,
        }}
      />

      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none" />

      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{ background: glareBackground }}
      />

      {hovered && (
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-300"
          style={{
            opacity: 0.035,
            backgroundImage: NOISE_SVG,
            backgroundSize: '256px 256px',
            mixBlendMode: 'overlay',
          }}
        />
      )}

      <div className="relative z-10" style={{ transform: 'translateZ(24px)' }}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-slate-300 uppercase tracking-widest font-semibold font-display">
            {label}
          </span>
          <span className="text-emerald-400/70 text-lg">{config.icon}</span>
        </div>

        {badge && variant === 'streak' && (
          <div className="relative flex items-center gap-1.5 mb-3">
            <span className="relative flex h-6 w-6 items-center justify-center">
              <motion.span
                className="absolute inset-0 rounded-full bg-amber-400/30"
                animate={{
                  scale: [1, 1.8, 1],
                  opacity: [0.6, 0, 0.6],
                }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              />
              <span className="relative text-base">🔥</span>
            </span>
            <span className="text-xs font-semibold text-amber-400/90">{badge}</span>
          </div>
        )}

        <div className="relative">
          <span
            className="text-5xl sm:text-6xl font-extrabold bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent font-mono"
            style={{ transform: 'translateZ(32px)' }}
          >
            {displayNum}
          </span>
          {suffix && (
            <span className="text-2xl text-slate-500 font-semibold align-baseline ml-1">
              {suffix}
            </span>
          )}
        </div>
      </div>

      <motion.span
        ref={leafRef}
        className="absolute bottom-3 right-3 text-lg pointer-events-none select-none z-20"
        style={{
          scale: springLeafScale,
          x: springLeafX,
          y: springLeafY,
          filter: leafFilter,
        }}
      >
        {config.icon}
      </motion.span>
    </motion.div>
  );
};

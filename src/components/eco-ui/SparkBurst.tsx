import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';

const ECO_ICONS = ['🌱', '🍃', '🌿', '🌍'];
const COLORS = ['#34d399', '#10b981', '#14b8a6', '#06b6d4', '#22d3ee'];

interface Particle {
  id: number;
  x: number;
  y: number;
  angle: number;
  velocity: number;
  rotation: number;
  size: number;
  icon: string;
  color: string;
  batch: number;
}

interface Ripple {
  id: number;
  x: number;
  y: number;
  batch: number;
}

interface CO2Float {
  id: number;
  x: number;
  y: number;
  value: number;
  batch: number;
}

interface SparkBurstProps {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  co2Saved?: number;
  className?: string;
  disabled?: boolean;
}

export const SparkBurst: React.FC<SparkBurstProps> = ({
  children,
  onClick,
  co2Saved,
  className = '',
  disabled = false,
}) => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const [co2Floats, setCO2Floats] = useState<CO2Float[]>([]);
  const [shimmer, setShimmer] = useState(false);
  const [mounted, setMounted] = useState(false);
  const idRef = useRef(0);
  const batchRef = useRef(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled) return;

      const { clientX: cx, clientY: cy } = e;
      const batch = ++batchRef.current;

      setShimmer(true);
      setTimeout(() => setShimmer(false), 400);

      const count = 12 + Math.floor(Math.random() * 5);
      const newParticles: Particle[] = Array.from({ length: count }, () => {
        idRef.current++;
        return {
          id: idRef.current,
          x: cx,
          y: cy,
          angle: Math.random() * Math.PI * 2,
          velocity: 50 + Math.random() * 100,
          rotation: (Math.random() - 0.5) * 720,
          size: 12 + Math.random() * 10,
          icon: ECO_ICONS[Math.floor(Math.random() * ECO_ICONS.length)],
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          batch,
        };
      });
      setParticles((prev) => [...prev, ...newParticles]);

      idRef.current++;
      const ripple: Ripple = { id: idRef.current, x: cx, y: cy, batch };
      setRipples((prev) => [...prev, ripple]);

      let co2Float: CO2Float | null = null;
      if (co2Saved && co2Saved > 0) {
        idRef.current++;
        co2Float = {
          id: idRef.current,
          x: cx,
          y: cy,
          value: co2Saved,
          batch,
        };
        setCO2Floats((prev) => [...prev, co2Float!]);
      }

      const cleanupMs = 1200;
      setTimeout(() => {
        setParticles((prev) => prev.filter((p) => p.batch !== batch));
        setRipples((prev) => prev.filter((r) => r.batch !== batch));
        if (co2Float) {
          setCO2Floats((prev) => prev.filter((f) => f.batch !== batch));
        }
      }, cleanupMs);

      onClick?.(e);
    },
    [disabled, co2Saved, onClick],
  );

  return (
    <>
      <style>{`
        @keyframes sh-sweep {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .shimmer-overlay {
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255,255,255,0.05) 15%,
            rgba(255,255,255,0.55) 40%,
            rgba(255,255,255,0.75) 50%,
            rgba(255,255,255,0.55) 60%,
            rgba(255,255,255,0.05) 85%,
            transparent 100%
          );
          background-size: 200% 100%;
          animation: sh-sweep 0.4s ease-in-out forwards;
          pointer-events: none;
        }
      `}</style>

      <div className="relative inline-flex">
        <button
          onClick={handleClick}
          disabled={disabled}
          className={`relative overflow-hidden ${className}`}
        >
          {shimmer && (
            <div className="shimmer-overlay absolute inset-0 z-10 rounded-[inherit]" />
          )}
          {children}
        </button>
      </div>

      {mounted &&
        createPortal(
          <>
            <AnimatePresence>
              {particles.map((p) => {
                const dx = Math.cos(p.angle) * p.velocity;
                const dy = Math.sin(p.angle) * p.velocity - 30;
                return (
                  <motion.div
                    key={p.id}
                    className="fixed pointer-events-none z-[9999] select-none"
                    style={{ left: p.x, top: p.y, lineHeight: 1 }}
                    initial={{ x: 0, y: 0, scale: 0, opacity: 1, rotate: 0 }}
                    animate={{
                      x: dx,
                      y: dy,
                      scale: [0, 1.3, 0.5],
                      opacity: [1, 0.8, 0],
                      rotate: p.rotation,
                    }}
                    exit={{ opacity: 0, scale: 0 }}
                    transition={{
                      type: 'spring',
                      stiffness: 180,
                      damping: 14,
                      mass: 0.6,
                    }}
                  >
                    <span
                      className="inline-block"
                      style={{
                        fontSize: p.size,
                        filter: `drop-shadow(0 0 5px ${p.color}) drop-shadow(0 0 10px ${p.color})`,
                      }}
                    >
                      {p.icon}
                    </span>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            <AnimatePresence>
              {ripples.map((r) => (
                <motion.div
                  key={r.id}
                  className="fixed rounded-full border-2 pointer-events-none z-[9999]"
                  style={{
                    left: r.x,
                    top: r.y,
                    borderColor: 'rgba(52,211,153,0.5)',
                    boxShadow: '0 0 12px rgba(52,211,153,0.25)',
                  }}
                  initial={{ width: 0, height: 0, opacity: 0.8, x: 0, y: 0 }}
                  animate={{
                    width: 80,
                    height: 80,
                    opacity: 0,
                    x: -40,
                    y: -40,
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                />
              ))}
            </AnimatePresence>

            <AnimatePresence>
              {co2Floats.map((f) => (
                <motion.div
                  key={f.id}
                  className="fixed pointer-events-none z-[9999] text-xs font-bold whitespace-nowrap"
                  style={{
                    left: f.x,
                    top: f.y,
                    color: '#34d399',
                    textShadow:
                      '0 0 8px rgba(52,211,153,0.6), 0 0 16px rgba(20,184,166,0.3)',
                  }}
                  initial={{ y: 0, opacity: 1, x: 0 }}
                  animate={{ y: -70, opacity: 0, x: 8 }}
                  exit={{ opacity: 0, y: -50 }}
                  transition={{ duration: 1.2, ease: 'easeOut' }}
                >
                  +{f.value.toFixed(1)} kg saved
                </motion.div>
              ))}
            </AnimatePresence>
          </>,
          document.body,
        )}
    </>
  );
};

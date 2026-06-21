import React, { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';

let cursorX = -1000;
let cursorY = -1000;

interface Ripple {
  id: number;
  x: number;
  y: number;
}

interface TrailParticle {
  id: number;
  x: number;
  y: number;
  angle: number;
}

export function useMagnet(ref: React.RefObject<HTMLElement | null>) {
  const offsetX = useMotionValue(0);
  const offsetY = useMotionValue(0);
  const springX = useSpring(offsetX, { stiffness: 200, damping: 20 });
  const springY = useSpring(offsetY, { stiffness: 200, damping: 20 });

  useEffect(() => {
    let raf: number;
    const loop = () => {
      const el = ref.current;
      if (el) {
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = cursorX - cx;
        const dy = cursorY - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100 && dist > 0) {
          const pull = (1 - dist / 100) * 8;
          offsetX.set((dx / dist) * pull);
          offsetY.set((dy / dist) * pull);
        } else {
          offsetX.set(0);
          offsetY.set(0);
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return { x: springX, y: springY };
}

interface EcoBlobCursorProps {
  enabled?: boolean;
  className?: string;
}

export const EcoBlobCursor: React.FC<EcoBlobCursorProps> = ({
  enabled = true,
  className = '',
}) => {
  const [mounted, setMounted] = useState(false);
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const [particles, setParticles] = useState<TrailParticle[]>([]);
  const idRef = useRef(0);
  const lastSpawn = useRef(0);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 150, damping: 15 });
  const springY = useSpring(mouseY, { stiffness: 150, damping: 15 });
  const blobX = useTransform(springX, (v: number) => v - 16);
  const blobY = useTransform(springY, (v: number) => v - 16);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      cursorX = e.clientX;
      cursorY = e.clientY;

      const now = Date.now();
      if (now - lastSpawn.current > 120) {
        lastSpawn.current = now;
        const id = idRef.current++;
        setParticles((prev) => {
          if (prev.length >= 5) return prev;
          return [...prev, { id, x: e.clientX, y: e.clientY, angle: Math.random() * Math.PI * 2 }];
        });
        setTimeout(() => {
          setParticles((prev) => prev.filter((p) => p.id !== id));
        }, 1000);
      }
    };

    const handleClick = (e: MouseEvent) => {
      const id = idRef.current++;
      setRipples((prev) => [...prev, { id, x: e.clientX, y: e.clientY }]);
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== id));
      }, 800);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
    };
  }, [enabled, mouseX, mouseY]);

  if (!enabled || !mounted) return null;

  return createPortal(
    <>
      <style>{`
        html { cursor: none !important; }
        a, button, input, textarea, select, [role="button"] { cursor: none !important; }
      `}</style>

      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9999]"
        style={{ x: blobX, y: blobY }}
      >
        <div
          className={`w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-400 opacity-70 ${className}`}
          style={{
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            mixBlendMode: 'soft-light',
          }}
        />
      </motion.div>

      <AnimatePresence>
        {ripples.map((r) => (
          <motion.div
            key={r.id}
            className="fixed rounded-full border pointer-events-none z-[9999]"
            style={{
              left: r.x,
              top: r.y,
              borderColor: 'rgba(52,211,153,0.35)',
            }}
            initial={{ width: 0, height: 0, opacity: 0.6, x: 0, y: 0 }}
            animate={{
              width: 60,
              height: 60,
              opacity: 0,
              x: -30,
              y: -30,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          />
        ))}
      </AnimatePresence>

      <AnimatePresence>
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="fixed pointer-events-none z-[9999] select-none"
            style={{ left: p.x, top: p.y, lineHeight: 1 }}
            initial={{ opacity: 1, y: 0, x: 0, scale: 1 }}
            animate={{
              opacity: 0,
              y: -24,
              x: Math.cos(p.angle) * 12,
              scale: 0.3,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: 'easeOut' }}
          >
            <span className="text-[10px]">🌱</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </>,
    document.body,
  );
};

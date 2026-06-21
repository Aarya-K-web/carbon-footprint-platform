import { useCallback, useEffect, useMemo, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

interface DashboardAmbientBackgroundProps {
  className?: string;
  intensity?: number;
}

interface Thread {
  width: number;
  top: string;
  delay: number;
  duration: number;
  opacity: number;
}

interface Ray {
  left: string;
  width: number;
  delay: number;
  duration: number;
  height: number;
}

const THREADS: Thread[] = [
  { width: '30%', top: '20%', delay: 0, duration: 18, opacity: 0.06 },
  { width: '45%', top: '40%', delay: 3, duration: 22, opacity: 0.04 },
  { width: '25%', top: '55%', delay: 6, duration: 16, opacity: 0.08 },
  { width: '50%', top: '70%', delay: 1.5, duration: 20, opacity: 0.03 },
  { width: '35%', top: '85%', delay: 4.5, duration: 14, opacity: 0.05 },
];

const RAYS: Ray[] = [
  { left: '10%', width: 1, delay: 0, duration: 7, height: 25 },
  { left: '25%', width: 2, delay: 2.5, duration: 9, height: 35 },
  { left: '45%', width: 1, delay: 1, duration: 6, height: 20 },
  { left: '65%', width: 1.5, delay: 4, duration: 8, height: 30 },
  { left: '82%', width: 1, delay: 3.5, duration: 7.5, height: 25 },
];

const auroraCircles = [
  {
    size: 384,
    color: 'rgba(20, 184, 166, VARIANT)',
    initialX: -10,
    initialY: -5,
    moveX: 20,
    moveY: 15,
    dur: 18,
  },
  {
    size: 384,
    color: 'rgba(52, 211, 153, VARIANT)',
    initialX: 60,
    initialY: 30,
    moveX: -25,
    moveY: 10,
    dur: 22,
  },
  {
    size: 384,
    color: 'rgba(6, 182, 212, VARIANT)',
    initialX: 80,
    initialY: 60,
    moveX: 15,
    moveY: -20,
    dur: 25,
  },
];

export const DashboardAmbientBackground = ({
  className = '',
  intensity = 0.3,
}: DashboardAmbientBackgroundProps) => {
  const ci = Math.max(0, Math.min(1, intensity));
  const containerRef = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  const ferroBlob1X = useSpring(mouseX, { stiffness: 15, damping: 12, mass: 1.5 });
  const ferroBlob1Y = useSpring(mouseY, { stiffness: 15, damping: 12, mass: 1.5 });
  const ferroBlob2X = useSpring(mouseX, { stiffness: 20, damping: 15, mass: 2 });
  const ferroBlob2Y = useSpring(mouseY, { stiffness: 20, damping: 15, mass: 2 });
  const ferroBlob3X = useSpring(mouseX, { stiffness: 10, damping: 10, mass: 3 });
  const ferroBlob3Y = useSpring(mouseY, { stiffness: 10, damping: 10, mass: 3 });

  const f1Left = useTransform(ferroBlob1X, [0, 1], ['calc(10% - 200px)', 'calc(90% - 200px)']);
  const f1Top = useTransform(ferroBlob1Y, [0, 1], ['calc(10% - 200px)', 'calc(90% - 200px)']);
  const f2Left = useTransform(ferroBlob2X, [0, 1], ['calc(20% - 150px)', 'calc(80% - 150px)']);
  const f2Top = useTransform(ferroBlob2Y, [0, 1], ['calc(20% - 150px)', 'calc(80% - 150px)']);
  const f3Left = useTransform(ferroBlob3X, [0, 1], ['calc(0% - 120px)', 'calc(100% - 120px)']);
  const f3Top = useTransform(ferroBlob3Y, [0, 1], ['calc(0% - 120px)', 'calc(100% - 120px)']);

  const handleMouse = useCallback(
    (clientX: number, clientY: number) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        mouseX.set((clientX - rect.left) / rect.width);
        mouseY.set((clientY - rect.top) / rect.height);
      }
    },
    [mouseX, mouseY],
  );

  useEffect(() => {
    const onMouse = (e: MouseEvent) => handleMouse(e.clientX, e.clientY);
    const onTouch = (e: TouchEvent) => {
      const t = e.touches[0];
      if (t) handleMouse(t.clientX, t.clientY);
    };
    window.addEventListener('mousemove', onMouse, { passive: true });
    window.addEventListener('touchmove', onTouch, { passive: true });
    return () => {
      window.removeEventListener('mousemove', onMouse);
      window.removeEventListener('touchmove', onTouch);
    };
  }, [handleMouse]);

  const auraAlpha = useMemo(() => 0.06 + ci * 0.09, [ci]);
  const ferroAlpha = useMemo(() => 0.04 + ci * 0.06, [ci]);
  const threadAlpha = useMemo(() => 0.03 + ci * 0.05, [ci]);
  const rayAlpha = useMemo(() => 0.02 + ci * 0.04, [ci]);

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 z-[-1] overflow-hidden pointer-events-none ${className}`}
      style={{
        background: 'linear-gradient(135deg, #020617 0%, #09090b 50%, #022c22 100%)',
      }}
    >
      {/* 1. Aurora Gradient Circles - floating slowly */}
      {auroraCircles.map((circle, i) => (
        <motion.div
          key={`aurora-${i}`}
          className="absolute rounded-full"
          style={{
            width: circle.size,
            height: circle.size,
            left: `${circle.initialX}%`,
            top: `${circle.initialY}%`,
            background: `radial-gradient(circle at center, ${circle.color.replace('VARIANT', `${auraAlpha}`)} 0%, transparent 70%)`,
            filter: 'blur(100px)',
          }}
          animate={{
            x: [0, circle.moveX, 0],
            y: [0, circle.moveY, 0],
          }}
          transition={{
            duration: circle.dur,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* 2. Ferrofluid Dark Shapes - reacts to mouse */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: '400px',
          height: '400px',
          left: f1Left,
          top: f1Top,
          background: 'radial-gradient(circle, rgba(0, 0, 0, 0.35) 0%, transparent 70%)',
          filter: 'blur(120px)',
          opacity: ferroAlpha,
        }}
      />
      <motion.div
        className="absolute rounded-full"
        style={{
          width: '300px',
          height: '300px',
          left: f2Left,
          top: f2Top,
          background: 'radial-gradient(circle, rgba(0, 0, 0, 0.3) 0%, transparent 70%)',
          filter: 'blur(100px)',
          opacity: ferroAlpha,
        }}
      />
      <motion.div
        className="absolute rounded-full"
        style={{
          width: '240px',
          height: '240px',
          left: f3Left,
          top: f3Top,
          background: 'radial-gradient(circle, rgba(0, 0, 0, 0.25) 0%, transparent 70%)',
          filter: 'blur(90px)',
          opacity: ferroAlpha,
        }}
      />

      {/* 3. Floating Threads / Ribbons */}
      {THREADS.map((thread, i) => (
        <motion.div
          key={`thread-${i}`}
          className="absolute left-0 h-px"
          style={{
            width: thread.width,
            top: thread.top,
            background: `linear-gradient(90deg, transparent 0%, rgba(52, 211, 153, ${threadAlpha + thread.opacity}) 30%, rgba(52, 211, 153, ${threadAlpha + thread.opacity}) 70%, transparent 100%)`,
            opacity: thread.opacity,
          }}
          animate={{
            y: [0, -8, 0],
            opacity: [thread.opacity, thread.opacity * 1.5, thread.opacity],
          }}
          transition={{
            duration: thread.duration,
            delay: thread.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* 4. Light Rays from bottom */}
      {RAYS.map((ray, i) => (
        <div
          key={`ray-${i}`}
          className="absolute bottom-0"
          style={{
            left: ray.left,
            width: ray.width,
            height: `${ray.height}%`,
            background: `linear-gradient(0deg, rgba(52, 211, 153, ${rayAlpha}) 0%, rgba(20, 184, 166, ${rayAlpha * 0.4}) 40%, transparent 100%)`,
            animation: `dashboard-ray-rise ${ray.duration}s ease-in-out infinite`,
            animationDelay: `${ray.delay}s`,
          }}
        />
      ))}

      {/* Vignette */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.5) 100%)',
        }}
      />

      <style>{`
        @keyframes dashboard-ray-rise {
          0%, 100% {
            transform: translateY(100%);
            opacity: 0;
          }
          20% {
            transform: translateY(60%);
            opacity: 1;
          }
          60% {
            transform: translateY(10%);
            opacity: 0.6;
          }
          80% {
            transform: translateY(0%);
            opacity: 0.2;
          }
        }
      `}</style>
    </div>
  );
};

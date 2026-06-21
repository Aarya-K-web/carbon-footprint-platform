import { useCallback, useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

interface EcoPulseBackgroundProps {
  intensity?: number;
  className?: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  o: number;
}

interface Ray {
  left: string;
  delay: number;
  duration: number;
  height: string;
}

const PARTICLE_COUNT = 20;
const CONNECTION_DIST = 120;

const RAYS: Ray[] = [
  { left: '6%', delay: 0, duration: 5, height: '45%' },
  { left: '14%', delay: 0.7, duration: 4.5, height: '60%' },
  { left: '22%', delay: 1.4, duration: 6, height: '35%' },
  { left: '34%', delay: 0.3, duration: 5.5, height: '55%' },
  { left: '48%', delay: 1.1, duration: 4, height: '40%' },
  { left: '58%', delay: 0.5, duration: 5.2, height: '70%' },
  { left: '72%', delay: 1.8, duration: 4.8, height: '30%' },
  { left: '82%', delay: 0.9, duration: 5.8, height: '50%' },
  { left: '92%', delay: 1.3, duration: 4.2, height: '65%' },
];

export const EcoPulseBackground = ({ intensity = 0.5, className = '' }: EcoPulseBackgroundProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);

  const ci = Math.max(0, Math.min(1, intensity));
  const ciRef = useRef(ci);
  ciRef.current = ci;

  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  const blob1X = useSpring(mouseX, { stiffness: 25, damping: 20, mass: 0.5 });
  const blob1Y = useSpring(mouseY, { stiffness: 25, damping: 20, mass: 0.5 });
  const blob2X = useSpring(mouseX, { stiffness: 35, damping: 25, mass: 0.8 });
  const blob2Y = useSpring(mouseY, { stiffness: 35, damping: 25, mass: 0.8 });
  const blob3X = useSpring(mouseX, { stiffness: 20, damping: 15, mass: 1 });
  const blob3Y = useSpring(mouseY, { stiffness: 20, damping: 15, mass: 1 });
  const blob4X = useSpring(mouseX, { stiffness: 40, damping: 30, mass: 0.3 });
  const blob4Y = useSpring(mouseY, { stiffness: 40, damping: 30, mass: 0.3 });

  const b1Left = useTransform(blob1X, [0, 1], ['calc(0% - 300px)', 'calc(100% - 300px)']);
  const b1Top = useTransform(blob1Y, [0, 1], ['calc(0% - 300px)', 'calc(100% - 300px)']);
  const b2Left = useTransform(blob2X, [0, 1], ['calc(0% - 250px)', 'calc(100% - 250px)']);
  const b2Top = useTransform(blob2Y, [0, 1], ['calc(0% - 250px)', 'calc(100% - 250px)']);
  const b3Left = useTransform(blob3X, [0, 1], ['calc(0% - 200px)', 'calc(100% - 200px)']);
  const b3Top = useTransform(blob3Y, [0, 1], ['calc(0% - 200px)', 'calc(100% - 200px)']);
  const b4Left = useTransform(blob4X, [0, 1], ['calc(0% - 175px)', 'calc(100% - 175px)']);
  const b4Top = useTransform(blob4Y, [0, 1], ['calc(0% - 175px)', 'calc(100% - 175px)']);

  const initParticles = useCallback((w: number, h: number) => {
    const p: Particle[] = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      p.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 1.5 + 0.5,
        o: Math.random() * 0.4 + 0.2,
      });
    }
    particlesRef.current = p;
  }, []);

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

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const w = Math.floor(rect.width);
      const h = Math.floor(rect.height);
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      initParticles(w, h);
    };

    const ro = new ResizeObserver(resize);
    ro.observe(container);
    resize();

    return () => ro.disconnect();
  }, [initParticles]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let running = true;

    const animate = () => {
      if (!running) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      const particles = particlesRef.current;
      const c = ciRef.current;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;
      }

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECTION_DIST) {
            const alpha = (1 - dist / CONNECTION_DIST) * 0.25 * c;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(52, 211, 153, ${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(52, 211, 153, ${p.o * c})`;
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      running = false;
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const blobOpacity = 0.06 + ci * 0.14;
  const gridOpacity = 0.02 + ci * 0.05;
  const rayOpacity = 0.03 + ci * 0.07;
  const scanDuration = 4 - ci * 2;

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 z-[-1] overflow-hidden ${className}`}
      style={{
        background: 'linear-gradient(135deg, #020617 0%, #09090b 50%, #022c22 100%)',
      }}
    >
      {/* 1. CSS Grid Scan */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: [
            `linear-gradient(rgba(52, 211, 153, ${gridOpacity}) 1px, transparent 1px)`,
            `linear-gradient(90deg, rgba(52, 211, 153, ${gridOpacity}) 1px, transparent 1px)`,
          ].join(', '),
          backgroundSize: '60px 60px',
        }}
      />
      <div
        className="absolute inset-y-0 pointer-events-none"
        style={{
          left: 0,
          width: '350px',
          background: `linear-gradient(90deg, transparent 0%, rgba(52, 211, 153, ${0.02 + ci * 0.03}) 50%, transparent 100%)`,
          animation: `scan ${scanDuration}s ease-in-out infinite`,
          filter: 'blur(50px)',
        }}
      />

      {/* 2. Ferrofluid Blobs */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: '600px',
          height: '600px',
          left: b1Left,
          top: b1Top,
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.12) 0%, transparent 70%)',
          filter: 'blur(80px)',
          opacity: blobOpacity,
        }}
      />
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: '500px',
          height: '500px',
          left: b2Left,
          top: b2Top,
          background: 'radial-gradient(circle, rgba(20, 184, 166, 0.1) 0%, transparent 70%)',
          filter: 'blur(100px)',
          opacity: blobOpacity,
        }}
      />
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: '400px',
          height: '400px',
          left: b3Left,
          top: b3Top,
          background: 'radial-gradient(circle, rgba(6, 182, 212, 0.08) 0%, transparent 70%)',
          filter: 'blur(120px)',
          opacity: blobOpacity,
        }}
      />
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: '350px',
          height: '350px',
          left: b4Left,
          top: b4Top,
          background: 'radial-gradient(circle, rgba(52, 211, 153, 0.06) 0%, transparent 70%)',
          filter: 'blur(90px)',
          opacity: blobOpacity,
        }}
      />

      {/* 3. Light Rays */}
      {RAYS.map((ray, i) => (
        <div
          key={i}
          className="absolute top-0 pointer-events-none animate-light-ray"
          style={{
            left: ray.left,
            width: '2px',
            height: ray.height,
            background: `linear-gradient(180deg, rgba(52, 211, 153, ${rayOpacity}) 0%, rgba(20, 184, 166, ${rayOpacity * 0.5}) 40%, transparent 100%)`,
            animationDelay: `${ray.delay}s`,
            animationDuration: `${ray.duration}s`,
          }}
        />
      ))}

      {/* 4. Particle Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
      />

      {/* 5. Noise Overlay */}
      <div
        className="absolute inset-0 pointer-events-none animate-grain"
        style={{
          opacity: 0.02 + ci * 0.03,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' /%3E%3C/svg%3E")`,
          backgroundSize: '256px 256px',
          mixBlendMode: 'overlay',
        }}
      />

      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.6) 100%)',
        }}
      />
    </div>
  );
};

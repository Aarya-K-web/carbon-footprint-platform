import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

type FluidGlassVariant = 'neutral' | 'success' | 'danger';
type PolymorphicAs =
  | 'div'
  | 'section'
  | 'form'
  | 'article'
  | 'main'
  | 'aside'
  | 'span'
  | 'header'
  | 'footer'
  | 'nav';

interface FluidGlassPanelProps {
  children: ReactNode;
  variant?: FluidGlassVariant;
  className?: string;
  hover?: boolean;
  as?: PolymorphicAs;
  fluid?: boolean;
  noise?: boolean;
  electricBorder?: boolean;
}

const motionMap: Record<string, typeof motion.div> = {
  div: motion.div,
  section: motion.section,
  form: motion.form,
  article: motion.article,
  main: motion.main,
  aside: motion.aside,
  span: motion.span,
  header: motion.header,
  footer: motion.footer,
  nav: motion.nav,
};

const variantConfig = {
  neutral: {
    border: 'border-emerald-500/20',
    glow: '0 0 30px rgba(16,185,129,0.15), 0 0 60px rgba(16,185,129,0.05)',
    electricColors: '#10b981, #14b8a6, #06b6d4, #22d3ee, #10b981',
    blob1: 'rgba(16,185,129,0.12)',
    blob2: 'rgba(20,184,166,0.1)',
  },
  success: {
    border: 'border-green-500/20',
    glow: '0 0 30px rgba(34,197,94,0.15), 0 0 60px rgba(34,197,94,0.05)',
    electricColors: '#22c55e, #16a34a, #15803d, #166534, #22c55e',
    blob1: 'rgba(34,197,94,0.12)',
    blob2: 'rgba(22,163,74,0.1)',
  },
  danger: {
    border: 'border-red-500/20',
    glow: '0 0 30px rgba(239,68,68,0.15), 0 0 60px rgba(239,68,68,0.05)',
    electricColors: '#ef4444, #dc2626, #b91c1c, #991b1b, #ef4444',
    blob1: 'rgba(239,68,68,0.12)',
    blob2: 'rgba(220,38,38,0.1)',
  },
};

const NOISE_SVG =
  'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\' /%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' /%3E%3C/svg%3E")';

export const FluidGlassPanel: React.FC<FluidGlassPanelProps> = ({
  children,
  variant = 'neutral',
  className = '',
  hover = true,
  as,
  fluid = false,
  noise = true,
  electricBorder = false,
}) => {
  const MotionTag = (as && motionMap[as]) || motion.div;
  const config = variantConfig[variant];

  return (
    <MotionTag
      className={`relative overflow-hidden rounded-3xl border bg-white/5 backdrop-blur-2xl p-6 sm:p-8 shadow-2xl ${config.border} ${className}`}
      whileHover={
        hover
          ? {
              y: -2,
              backdropFilter: 'blur(48px)',
              boxShadow: config.glow,
              transition: { type: 'spring', stiffness: 300, damping: 20 },
            }
          : undefined
      }
    >
      {electricBorder && (
        <>
          <style>{`
            @property --eb-angle {
              syntax: '<angle>';
              initial-value: 0deg;
              inherits: false;
            }
            @keyframes eb-rotate {
              to { --eb-angle: 360deg; }
            }
            .eb-ring {
              animation: eb-rotate 4s linear infinite;
            }
          `}</style>
          <motion.div
            className="eb-ring absolute inset-[-1px] rounded-3xl pointer-events-none opacity-0 transition-opacity duration-500"
            style={{
              background: `conic-gradient(from var(--eb-angle) at 50% 50%, transparent, ${config.electricColors}, transparent)`,
              WebkitMask: 'radial-gradient(farthest-side, transparent calc(100% - 1.5px), #000 calc(100% - 1px))',
              mask: 'radial-gradient(farthest-side, transparent calc(100% - 1.5px), #000 calc(100% - 1px))',
            }}
            whileHover={{ opacity: 0.6 }}
            transition={{ duration: 0.3 }}
          />
        </>
      )}

      {fluid && (
        <>
          <motion.div
            className="absolute pointer-events-none"
            style={{
              width: '500px',
              height: '500px',
              left: '-100px',
              top: '-100px',
              background: `radial-gradient(circle, ${config.blob1} 0%, transparent 70%)`,
              filter: 'blur(80px)',
            }}
            animate={{
              x: [0, 60, -40, 30, 0],
              y: [0, -50, 40, -30, 0],
            }}
            transition={{
              duration: 18,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <motion.div
            className="absolute pointer-events-none"
            style={{
              width: '400px',
              height: '400px',
              right: '-80px',
              bottom: '-80px',
              background: `radial-gradient(circle, ${config.blob2} 0%, transparent 70%)`,
              filter: 'blur(80px)',
            }}
            animate={{
              x: [0, -50, 30, -20, 0],
              y: [0, 40, -30, 50, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </>
      )}

      {noise && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            opacity: 0.03,
            backgroundImage: NOISE_SVG,
            backgroundSize: '256px 256px',
            mixBlendMode: 'overlay',
          }}
        />
      )}

      <div className="relative z-10">{children}</div>
    </MotionTag>
  );
};

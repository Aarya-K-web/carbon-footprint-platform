import { motion } from 'framer-motion';

const variantColors = {
  default: {
    border: ['#10b981', '#14b8a6', '#06b6d4'],
    glow: 'rgba(16,185,129,0.25)',
  },
  success: {
    border: ['#22c55e', '#16a34a', '#15803d'],
    glow: 'rgba(34,197,94,0.25)',
  },
  danger: {
    border: ['#ef4444', '#dc2626', '#b91c1c'],
    glow: 'rgba(239,68,68,0.25)',
  },
} as const;

const css = `
@property --angle {
  syntax: '<angle>';
  initial-value: 0deg;
  inherits: false;
}
@keyframes electric-spin {
  to { --angle: 360deg; }
}
.electric-fork::before,
.electric-fork::after {
  content: '';
  position: absolute;
  opacity: 0;
  transition: opacity 0.4s ease;
  pointer-events: none;
}
.group:hover .electric-fork::before,
.group:hover .electric-fork::after {
  opacity: 0.15;
}
.electric-fork::before {
  top: 15%;
  right: 20%;
  width: 2px;
  height: 40px;
  background: linear-gradient(to bottom, #10b981, transparent);
  transform: rotate(15deg);
  border-radius: 1px;
  box-shadow: 0 0 6px #10b981, 0 0 12px #14b8a6;
}
.electric-fork::after {
  bottom: 20%;
  left: 15%;
  width: 1.5px;
  height: 55px;
  background: linear-gradient(to top, #06b6d4, transparent);
  transform: rotate(-20deg);
  border-radius: 1px;
  box-shadow: 0 0 6px #06b6d4, 0 0 12px #14b8a6;
}
`;

interface ElectricBorderCardProps {
  children: React.ReactNode;
  active?: boolean;
  className?: string;
  variant?: 'default' | 'success' | 'danger';
}

export const ElectricBorderCard: React.FC<ElectricBorderCardProps> = ({
  children,
  active = false,
  className = '',
  variant = 'default',
}) => {
  const colors = variantColors[variant];

  return (
    <>
      {active && <style>{css}</style>}
      <motion.div
        className={`group relative overflow-hidden rounded-2xl ${className}`}
        style={{
          border: active ? 'none' : '1px solid rgba(255,255,255,0.1)',
          borderRadius: '1rem',
          filter: active ? 'none' : 'grayscale(0.6)',
          cursor: active ? 'pointer' : 'default',
          transition: 'filter 0.3s ease, border 0.3s ease',
        }}
        whileHover={
          active
            ? {
                y: -2,
                scale: 1.01,
                transition: { type: 'spring', stiffness: 300, damping: 20 },
              }
            : undefined
        }
      >
        {active && (
          <div
            className="pointer-events-none absolute"
            style={{
              inset: '-1px',
              borderRadius: '1rem',
              background: `conic-gradient(from var(--angle) at 50% 50%, transparent, ${colors.border[0]}, ${colors.border[1]}, ${colors.border[2]}, transparent)`,
              animation: 'electric-spin 4s linear infinite',
              zIndex: 0,
            }}
          />
        )}
        <div
          className="relative"
          style={{
            zIndex: 1,
            background: 'rgba(255,255,255,0.05)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            borderRadius: active ? 'calc(1rem - 1px)' : '1rem',
            margin: active ? '1px' : 0,
            transition: 'box-shadow 0.3s ease',
          }}
        >
          {active && (
            <div
              className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              style={{ boxShadow: `inset 0 0 30px ${colors.glow}` }}
            />
          )}
          <div className="electric-fork relative">{children}</div>
        </div>
      </motion.div>
    </>
  );
};

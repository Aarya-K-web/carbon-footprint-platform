import { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Badge {
  id: string;
  name: string;
  description: string;
  emoji: string;
  unlocked: boolean;
  unlockedAt?: string;
  category: string;
}

interface AnimatedBadgeGridProps {
  badges: Badge[];
  className?: string;
}

const BURST_COLORS = [
  '#34d399', '#10b981', '#14b8a6', '#06b6d4', '#22d3ee',
  '#f59e0b', '#f472b6', '#a78bfa', '#fb923c', '#e879f9',
];

const PARTICLE_COUNT = 24;
const LEAF_COUNT = 10;

interface Particle {
  id: number;
  angle: number;
  velocity: number;
  color: string;
  size: number;
}

interface Leaf {
  id: number;
  x: number;
  delay: number;
  duration: number;
  emoji: string;
  sway: number;
}

const css = `
@keyframes grid-scan {
  0% { transform: translateY(-100%); }
  100% { transform: translateY(100%); }
}
@keyframes metallic-sweep {
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
}
@keyframes badge-float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-5px); }
}
.grid-scan-overlay {
  animation: grid-scan 3s linear infinite;
  background: repeating-linear-gradient(
    0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px
  );
  pointer-events: none;
}
.metallic-shine {
  background: linear-gradient(
    90deg, transparent 0%, rgba(255,255,255,0.05) 15%, rgba(255,255,255,0.25) 40%,
    rgba(255,255,255,0.35) 50%, rgba(255,255,255,0.25) 60%, rgba(255,255,255,0.05) 85%, transparent 100%
  );
  background-size: 200% 100%;
  animation: metallic-sweep 1.2s ease-in-out forwards;
  pointer-events: none;
}
.badge-float {
  animation: badge-float 3s ease-in-out infinite;
}
`;

function genParticles(): Particle[] {
  return Array.from({ length: PARTICLE_COUNT }, (_, i) => {
    const angle = (Math.PI * 2 * i) / PARTICLE_COUNT + (Math.random() - 0.5) * 0.4;
    return {
      id: i,
      angle,
      velocity: 50 + Math.random() * 90,
      color: BURST_COLORS[Math.floor(Math.random() * BURST_COLORS.length)],
      size: 3 + Math.random() * 5,
    };
  });
}

function genLeaves(): Leaf[] {
  const emojis = ['🍃', '🌿', '🌱'];
  return Array.from({ length: LEAF_COUNT }, (_, i) => ({
    id: i,
    x: -30 + Math.random() * 60,
    delay: 0.1 + Math.random() * 0.3,
    duration: 1.2 + Math.random() * 0.8,
    emoji: emojis[Math.floor(Math.random() * emojis.length)],
    sway: (Math.random() - 0.5) * 40,
  }));
}

function BadgeCard({ badge }: { badge: Badge }) {
  const [showAnim, setShowAnim] = useState(false);
  const particles = useRef(genParticles());
  const leaves = useRef(genLeaves());
  const played = useRef(false);

  useEffect(() => {
    if (badge.unlocked && !played.current) {
      played.current = true;
      setShowAnim(true);
      const timer = setTimeout(() => setShowAnim(false), 2400);
      return () => clearTimeout(timer);
    }
  }, [badge.unlocked]);

  return (
    <motion.div
      layout
      initial={badge.unlocked ? { scale: 0.8, rotate: -5, opacity: 0 } : { scale: 1, opacity: 1 }}
      animate={{ scale: 1, rotate: 0, opacity: 1 }}
      transition={
        badge.unlocked
          ? { type: 'spring', stiffness: 200, damping: 15, mass: 0.8 }
          : { duration: 0.3 }
      }
      className={`relative overflow-hidden rounded-xl ${badge.unlocked ? 'badge-float' : ''}`}
      style={
        badge.unlocked
          ? { boxShadow: '0 0 24px rgba(16,185,129,0.2), 0 0 60px rgba(16,185,129,0.08)' }
          : undefined
      }
    >
      <div className="relative bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4 overflow-hidden">
        {/* Metallic shine sweep */}
        {showAnim && (
          <div className="metallic-shine absolute inset-0 z-30 rounded-xl" />
        )}

        {/* Prismatic burst particles */}
        {showAnim && (
          <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center">
            {particles.current.map((p) => {
              const dx = Math.cos(p.angle) * p.velocity;
              const dy = Math.sin(p.angle) * p.velocity;
              return (
                <motion.div
                  key={p.id}
                  className="absolute rounded-full"
                  style={{
                    width: p.size,
                    height: p.size,
                    backgroundColor: p.color,
                    boxShadow: `0 0 4px ${p.color}, 0 0 10px ${p.color}`,
                  }}
                  initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
                  animate={{
                    x: dx,
                    y: dy,
                    scale: [0, 1.5, 0.3],
                    opacity: [1, 0.8, 0],
                  }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                />
              );
            })}
          </div>
        )}

        {/* Confetti leaves */}
        {showAnim && (
          <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
            {leaves.current.map((leaf) => (
              <motion.div
                key={leaf.id}
                className="absolute"
                style={{ left: `calc(50% + ${leaf.x}px)`, top: 0 }}
                initial={{ y: -10, opacity: 0, rotate: 0 }}
                animate={{
                  y: 140,
                  opacity: [0, 1, 0.8, 0],
                  rotate: leaf.sway * 10,
                  x: [0, leaf.sway],
                }}
                transition={{
                  duration: leaf.duration,
                  delay: leaf.delay,
                  ease: 'easeIn',
                }}
              >
                <span style={{ fontSize: 14 }}>{leaf.emoji}</span>
              </motion.div>
            ))}
          </div>
        )}

        {/* Locked overlay */}
        {!badge.unlocked && (
          <div className="absolute inset-0 z-10 rounded-xl overflow-hidden">
            <div className="absolute inset-0 backdrop-blur-2xl grayscale" />
            <div className="grid-scan-overlay absolute inset-0" />
            <div className="absolute inset-0 bg-black/50" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl opacity-60">🔒</span>
            </div>
          </div>
        )}

        {/* Card content */}
        <div className="relative z-0 flex flex-col items-center text-center gap-2 min-h-[180px]">
          <span className="text-4xl leading-none mt-3">{badge.emoji}</span>
          <div className="flex flex-col gap-1">
            <span className="text-white font-semibold text-sm">{badge.name}</span>
            <span className="text-xs text-slate-400 leading-tight">{badge.description}</span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-slate-300 mt-auto mb-1">
            {badge.category}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export const AnimatedBadgeGrid: React.FC<AnimatedBadgeGridProps> = ({
  badges,
  className = '',
}) => {
  const categories = useMemo(() => {
    const set = new Set(badges.map((b) => b.category));
    return ['All', ...Array.from(set)];
  }, [badges]);

  const [activeCategory, setActiveCategory] = useState('All');

  const filtered = useMemo(() => {
    if (activeCategory === 'All') return badges;
    return badges.filter((b) => b.category === activeCategory);
  }, [badges, activeCategory]);

  if (badges.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <p className="text-slate-400">No badges yet</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <style>{css}</style>

      {/* Category pill nav */}
      <div className="flex items-center gap-1 mb-6 p-1 bg-white/5 rounded-full w-fit">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`relative px-4 py-1.5 text-sm rounded-full transition-colors ${
              cat === activeCategory
                ? 'text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {cat === activeCategory && (
              <motion.div
                layoutId="catPill"
                className="absolute inset-0 bg-emerald-500/25 rounded-full"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10">{cat}</span>
          </button>
        ))}
      </div>

      {/* Badge grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeCategory}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.25 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start"
        >
          {filtered.map((badge) => (
            <BadgeCard key={badge.id} badge={badge} />
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  AnimatePresence,
  useMotionValueEvent,
} from 'framer-motion';

const CSS = `
@property --laser-angle {
  syntax: '<angle>';
  initial-value: 0deg;
  inherits: false;
}
@keyframes laser-spin {
  to { --laser-angle: 360deg; }
}
@property --orb-angle {
  syntax: '<angle>';
  initial-value: 0deg;
  inherits: false;
}
@keyframes orb-shimmer {
  0% { --orb-angle: 0deg; }
  100% { --orb-angle: 360deg; }
}
`;

const EQUIV_FACTORS = {
  treesPerTon: 31,
  co2PerFlight: 0.5,
  co2PerBurger: 0.0036,
};

interface SliderConfig {
  key: string;
  label: string;
  min: number;
  max: number;
}

interface CarbonSimulatorPanelProps {
  baseFootprint?: number;
  onCommit?: (simulatedFootprint: number) => void;
  className?: string;
}

const SLIDERS: SliderConfig[] = [
  { key: 'diet', label: 'Diet Impact', min: -50, max: 20 },
  { key: 'transport', label: 'Transport Impact', min: -60, max: 30 },
  { key: 'energy', label: 'Energy Impact', min: -70, max: 40 },
  { key: 'lifestyle', label: 'Lifestyle Impact', min: -40, max: 20 },
];

function clamp(val: number, lo: number, hi: number): number {
  return val < lo ? lo : val > hi ? hi : val;
}

function rubberBand(val: number, min: number, max: number): number {
  if (val < min) {
    const d = min - val;
    return min - Math.pow(d, 0.55) * 1.8;
  }
  if (val > max) {
    const d = val - max;
    return max + Math.pow(d, 0.55) * 1.8;
  }
  return val;
}

function computeFootprint(base: number, values: Record<string, number>): number {
  const avg =
    (values.diet + values.transport + values.energy + values.lifestyle) / 4 / 100;
  return base * (1 + avg);
}

function colorForFootprint(t: number): { gradient: string; glow: string } {
  if (t < 4) {
    return {
      gradient:
        'radial-gradient(circle at 35% 35%, rgba(34,211,238,0.9) 0%, rgba(20,184,166,0.5) 40%, rgba(6,182,212,0.2) 70%, transparent 100%)',
      glow: 'rgba(6,182,212,0.35)',
    };
  }
  if (t < 7) {
    return {
      gradient:
        'radial-gradient(circle at 40% 30%, rgba(52,211,153,0.9) 0%, rgba(20,184,166,0.5) 40%, rgba(16,185,129,0.2) 70%, transparent 100%)',
      glow: 'rgba(20,184,166,0.35)',
    };
  }
  if (t < 11) {
    return {
      gradient:
        'radial-gradient(circle at 30% 40%, rgba(16,185,129,0.85) 0%, rgba(52,211,153,0.5) 35%, rgba(245,158,11,0.15) 70%, transparent 100%)',
      glow: 'rgba(16,185,129,0.35)',
    };
  }
  return {
    gradient:
      'radial-gradient(circle at 25% 35%, rgba(245,158,11,0.7) 0%, rgba(16,185,129,0.5) 35%, rgba(239,68,68,0.1) 70%, transparent 100%)',
    glow: 'rgba(245,158,11,0.3)',
  };
}

function orbSizeForFootprint(t: number): number {
  return clamp(140 + (t - 2) * 8, 130, 280);
}

function formatLarge(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  return Math.round(n).toString();
}

/* ───── Elastic Slider ───── */

interface ElasticSliderProps {
  config: SliderConfig;
  value: number;
  onChange: (v: number) => void;
}

function ElasticSlider({ config, value, onChange }: ElasticSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const valRef = useRef(value);
  valRef.current = value;

  const rawMV = useMotionValue(value);
  const smoothMV = useSpring(rawMV, {
    stiffness: 220,
    damping: 16,
    mass: 0.6,
  });

  const fillWidth = useTransform(smoothMV, [config.min, config.max], [0, 100]);

  const getValueFromPointer = useCallback(
    (clientX: number): number => {
      const el = trackRef.current;
      if (!el) return valRef.current;
      const rect = el.getBoundingClientRect();
      const pct = clamp((clientX - rect.left) / rect.width, -0.25, 1.25);
      return config.min + pct * (config.max - config.min);
    },
    [config.min, config.max],
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      dragging.current = true;
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      const v = getValueFromPointer(e.clientX);
      const resisted = rubberBand(v, config.min, config.max);
      rawMV.set(resisted);
    },
    [config.min, config.max, rawMV, getValueFromPointer],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging.current) return;
      const v = getValueFromPointer(e.clientX);
      const resisted = rubberBand(v, config.min, config.max);
      rawMV.set(resisted);
    },
    [config.min, config.max, rawMV, getValueFromPointer],
  );

  const handlePointerUp = useCallback(() => {
    dragging.current = false;
    const snapped = clamp(valRef.current, config.min, config.max);
    rawMV.set(snapped);
    onChange(snapped);
  }, [config.min, config.max, rawMV, onChange]);

  const displayVal = Math.round(value);

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
          {config.label}
        </span>
        <span
          className={`text-xs font-bold tabular-nums ${
            displayVal < 0
              ? 'text-emerald-400'
              : displayVal > 0
                ? 'text-rose-400'
                : 'text-slate-400'
          }`}
        >
          {displayVal > 0 ? '+' : ''}
          {displayVal}%
        </span>
      </div>

      <div
        ref={trackRef}
        className="relative h-6 cursor-pointer touch-none select-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <div className="absolute inset-y-0 left-0 right-0 top-1/2 -translate-y-1/2 h-1.5 rounded-full bg-slate-800 overflow-hidden">
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{
              width: fillWidth,
              background:
                'linear-gradient(90deg, #34d399, #14b8a6, #06b6d4)',
              boxShadow: '0 0 8px rgba(52,211,153,0.3)',
            }}
          />
        </div>

        <motion.div
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full pointer-events-none"
          style={{
            left: fillWidth,
            marginLeft: '-8px',
            background: 'radial-gradient(circle at 40% 35%, #6ee7b7, #10b981)',
            boxShadow:
              '0 0 10px rgba(16,185,129,0.5), inset 0 1px 0 rgba(255,255,255,0.2)',
            border: '1px solid rgba(255,255,255,0.15)',
          }}
        />
      </div>
    </div>
  );
}

/* ───── Central Orb ───── */

interface OrbProps {
  footprint: number;
}

function Orb({ footprint }: OrbProps) {
  const colors = colorForFootprint(footprint);
  const size = orbSizeForFootprint(footprint);

  const pulse = useMotionValue(1);
  const pulseSpring = useSpring(pulse, { stiffness: 60, damping: 8, mass: 1 });

  useEffect(() => {
    const i = setInterval(() => {
      pulse.set(1.04);
      setTimeout(() => pulse.set(1), 1000);
    }, 3000);
    return () => clearInterval(i);
  }, [pulse]);

  const angleMV = useMotionValue(0);
  useEffect(() => {
    const i = setInterval(() => {
      angleMV.set(angleMV.get() + 15);
    }, 80);
    return () => clearInterval(i);
  }, [angleMV]);

  const blob1X = useSpring(useMotionValue(0), { stiffness: 30, damping: 20 });
  const blob1Y = useSpring(useMotionValue(0), { stiffness: 30, damping: 20 });
  const blob2X = useSpring(useMotionValue(0), { stiffness: 40, damping: 25 });
  const blob2Y = useSpring(useMotionValue(0), { stiffness: 40, damping: 25 });
  const blob3X = useSpring(useMotionValue(0), { stiffness: 25, damping: 18 });
  const blob3Y = useSpring(useMotionValue(0), { stiffness: 25, damping: 18 });

  useEffect(() => {
    let frame: number;
    let start = Date.now();
    const drift = () => {
      const t = (Date.now() - start) / 1000;
      blob1X.set(Math.sin(t * 0.3) * 18);
      blob1Y.set(Math.cos(t * 0.4) * 14);
      blob2X.set(Math.sin(t * 0.5 + 1) * 12);
      blob2Y.set(Math.cos(t * 0.35 + 2) * 16);
      blob3X.set(Math.sin(t * 0.25 + 3) * 20);
      blob3Y.set(Math.cos(t * 0.45 + 1) * 12);
      frame = requestAnimationFrame(drift);
    };
    drift();
    return () => cancelAnimationFrame(frame);
  }, [blob1X, blob1Y, blob2X, blob2Y, blob3X, blob3Y]);

  return (
    <div className="flex flex-col items-center gap-3">
      <motion.div
        className="relative rounded-full"
        style={{
          width: size,
          height: size,
          scale: pulseSpring,
        }}
      >
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: colors.gradient,
            filter: 'blur(40px)',
            opacity: 0.5,
            transform: 'scale(1.3)',
          }}
        />

        <motion.div
          className="absolute rounded-full"
          style={{
            width: '70%',
            height: '70%',
            left: '15%',
            top: '10%',
            x: blob1X,
            y: blob1Y,
            background:
              'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.15) 0%, transparent 70%)',
            filter: 'blur(8px)',
          }}
        />
        <motion.div
          className="absolute rounded-full"
          style={{
            width: '60%',
            height: '60%',
            left: '25%',
            top: '25%',
            x: blob2X,
            y: blob2Y,
            background:
              'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.08) 0%, transparent 70%)',
            filter: 'blur(12px)',
          }}
        />
        <motion.div
          className="absolute rounded-full"
          style={{
            width: '50%',
            height: '50%',
            left: '30%',
            top: '30%',
            x: blob3X,
            y: blob3Y,
            background: colors.gradient,
            filter: 'blur(6px)',
            mixBlendMode: 'screen',
          }}
        />

        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: colors.gradient,
            boxShadow: `0 0 40px ${colors.glow}, 0 0 80px ${colors.glow}`,
          }}
        />

        <div
          className="absolute inset-[2px] rounded-full"
          style={{
            background:
              'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.12) 0%, transparent 50%)',
          }}
        />

        <div
          className="absolute inset-[1px] rounded-full pointer-events-none"
          style={{
            border: '1px solid rgba(255,255,255,0.08)',
            background: `
              radial-gradient(circle at 50% 50%, transparent 60%, rgba(0,0,0,0.15) 100%)
            `,
          }}
        />

        <motion.div
          className="absolute rounded-full pointer-events-none"
          style={{
            inset: '-2px',
            background: `conic-gradient(from var(--orb-angle) at 50% 50%, transparent 0deg, rgba(255,255,255,0.06) 30deg, transparent 60deg, transparent 300deg, rgba(255,255,255,0.04) 330deg, transparent 360deg)`,
            animation: 'orb-shimmer 6s linear infinite',
          }}
        />
      </motion.div>

      <motion.span
        className="text-lg font-extrabold bg-gradient-to-r from-emerald-300 via-teal-300 to-cyan-300 bg-clip-text text-transparent tracking-tight"
        style={{
          textShadow:
            '0 0 20px rgba(52,211,153,0.15), 0 0 40px rgba(20,184,166,0.08)',
        }}
      >
        {footprint.toFixed(2)} tCO₂e
      </motion.span>
    </div>
  );
}

/* ───── Equivalency Card ───── */

interface EquivCardProps {
  icon: string;
  value: number;
  label: string;
}

function EquivCard({ icon, value, label }: EquivCardProps) {
  const display = formatLarge(value);
  const prevKey = useRef(display);
  const [show, setShow] = useState(true);

  useEffect(() => {
    if (prevKey.current !== display) {
      setShow(false);
      const t = setTimeout(() => {
        prevKey.current = display;
        setShow(true);
      }, 50);
      return () => clearTimeout(t);
    }
  }, [display]);

  return (
    <div className="flex flex-col items-center text-center gap-1 min-w-[90px]">
      <span className="text-xl leading-none">{icon}</span>
      <div className="h-7 flex items-center overflow-hidden">
        <AnimatePresence mode="wait">
          {show && (
            <motion.span
              key={display}
              className="text-xl font-extrabold bg-gradient-to-br from-emerald-300 via-teal-300 to-cyan-300 bg-clip-text text-transparent leading-none"
              initial={{ scale: 0.3, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 1.8, opacity: 0, y: -10 }}
              transition={{ type: 'spring', stiffness: 350, damping: 14 }}
            >
              {display}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
      <span className="text-[10px] font-medium text-white/40 leading-tight max-w-[100px]">
        {label}
      </span>
    </div>
  );
}

/* ───── Main Panel ───── */

export const CarbonSimulatorPanel: React.FC<CarbonSimulatorPanelProps> = ({
  baseFootprint = 8.5,
  onCommit,
  className = '',
}) => {
  const [values, setValues] = useState<Record<string, number>>({
    diet: 0,
    transport: 0,
    energy: 0,
    lifestyle: 0,
  });

  const simulated = computeFootprint(baseFootprint, values);
  const diff = simulated - baseFootprint;

  const equivTrees = Math.round(simulated * EQUIV_FACTORS.treesPerTon);
  const equivFlights = simulated / EQUIV_FACTORS.co2PerFlight;
  const equivBurgers = simulated / EQUIV_FACTORS.co2PerBurger;

  /* Count-up spring */
  const countTarget = useMotionValue(0);
  const countSpring = useSpring(countTarget, { damping: 25, stiffness: 90 });
  const [countDisplay, setCountDisplay] = useState(baseFootprint.toFixed(2));
  const [diffDisplay, setDiffDisplay] = useState('0.00');

  useMotionValueEvent(countSpring, 'change', (v) => {
    setCountDisplay(v.toFixed(2));
    setDiffDisplay((v - baseFootprint).toFixed(2));
  });

  useEffect(() => {
    countTarget.set(simulated);
  }, [simulated, countTarget]);

  const handleSliderChange = useCallback(
    (key: string, v: number) => {
      setValues((prev) => ({ ...prev, [key]: v }));
    },
    [],
  );

  const handleCommit = useCallback(() => {
    onCommit?.(simulated);
  }, [onCommit, simulated]);

  return (
    <>
      <style>{CSS}</style>

      <div
        className={`relative overflow-hidden rounded-3xl border border-white/[0.08] ${className}`}
        style={{
          background:
            'linear-gradient(160deg, rgba(255,255,255,0.04) 0%, rgba(0,0,0,0.25) 100%)',
          backdropFilter: 'blur(32px)',
          WebkitBackdropFilter: 'blur(32px)',
        }}
      >
        {/* Ambient glow */}
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-emerald-400/6 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-teal-400/6 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 px-5 py-6 md:px-8 md:py-8 flex flex-col gap-6">
          {/* Slider grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
            {SLIDERS.map((cfg) => (
              <ElasticSlider
                key={cfg.key}
                config={cfg}
                value={values[cfg.key]}
                onChange={(v) => handleSliderChange(cfg.key, v)}
              />
            ))}
          </div>

          {/* Orb */}
          <div className="flex justify-center py-2">
            <Orb footprint={simulated} />
          </div>

          {/* Count-up */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 text-sm text-slate-400 font-medium">
              <span>Baseline</span>
              <span className="font-bold text-white/70">
                {baseFootprint.toFixed(2)}
              </span>
              <span className="text-slate-500 text-lg leading-none">→</span>
              <span className="text-sm text-slate-400 font-medium">
                Simulated
              </span>
              <span className="text-lg font-extrabold bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                {countDisplay}
              </span>
              <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                tCO₂e
              </span>
            </div>
            <div className="mt-1">
              <span
                className={`text-xs font-bold tabular-nums ${
                  diff < 0
                    ? 'text-emerald-400'
                    : diff > 0
                      ? 'text-rose-400'
                      : 'text-slate-500'
                }`}
              >
                {diff < 0 ? '' : '+'}
                {diffDisplay} tCO₂e
              </span>
            </div>
          </div>

          {/* Equivalencies */}
          <div className="flex justify-center gap-6 md:gap-10 pt-1">
            <EquivCard icon="🌳" value={equivTrees} label="trees needed" />
            <EquivCard
              icon="✈️"
              value={Math.round(equivFlights * 10) / 10}
              label="flights saved"
            />
            <EquivCard
              icon="🍔"
              value={equivBurgers}
              label="burgers avoided"
            />
          </div>

          {/* Commit button */}
          <div className="flex justify-center pt-2">
            <button
              type="button"
              onClick={handleCommit}
              className="group relative overflow-hidden rounded-xl px-8 py-3 font-bold text-sm tracking-wider uppercase"
              style={{ background: 'transparent', border: 'none' }}
            >
              <div
                className="absolute inset-0 rounded-xl pointer-events-none opacity-70 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background: `conic-gradient(from var(--laser-angle) at 50% 50%, transparent 0deg, #10b981 25deg, #34d399 50deg, #06b6d4 75deg, transparent 100deg, transparent 360deg)`,
                  animation: 'laser-spin 3s linear infinite',
                }}
              />
              <div
                className="absolute inset-[1.5px] rounded-[calc(0.75rem-1.5px)] pointer-events-none"
                style={{
                  background:
                    'linear-gradient(160deg, rgba(255,255,255,0.07) 0%, rgba(0,0,0,0.3) 100%)',
                }}
              />
              <span
                className="relative z-10 bg-gradient-to-r from-emerald-300 via-teal-300 to-cyan-300 bg-clip-text text-transparent group-hover:from-emerald-200 group-hover:to-cyan-200 transition-all duration-300"
                style={{
                  textShadow:
                    '0 0 20px rgba(52,211,153,0.2), 0 0 40px rgba(20,184,166,0.1)',
                }}
              >
                Commit Changes
              </span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

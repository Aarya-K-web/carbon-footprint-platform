import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { IdentityTierRail } from './IdentityTierRail';

interface OnboardingShellProps {
  onComplete: () => void;
  className?: string;
}

const GOALS = [
  { id: 'reduce', emoji: '📉', title: 'Reduce by 10%', desc: 'Cut your carbon footprint by 10% this year' },
  { id: 'neutral', emoji: '🌍', title: 'Go Carbon Neutral', desc: 'Offset all your emissions completely' },
  { id: 'weekly', emoji: '📊', title: 'Track Weekly', desc: 'Log and monitor your footprint every week' },
  { id: 'offset', emoji: '🌳', title: 'Offset Everything', desc: 'Offset 100% of your carbon output' },
] as const;

function ProgressDots({ step }: { step: number }) {
  return (
    <div className="flex items-center gap-0">
      {[0, 1, 2].map((i) => (
        <React.Fragment key={i}>
          {i > 0 && (
            <div className="relative w-12 h-px">
              <div className="absolute inset-0 rounded-full bg-white/10" />
              <motion.div
                className="absolute inset-0 rounded-full"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: i <= step ? 1 : 0 }}
                transition={{ duration: 0.6, ease: 'easeInOut', delay: 0.1 }}
                style={{ originX: 0 }}
              >
                <div className="w-full h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 rounded-full" />
              </motion.div>
            </div>
          )}
          <motion.div
            className="relative w-4 h-4 rounded-full border-2 flex items-center justify-center"
            style={{
              borderColor: i <= step ? '#10b981' : 'rgba(255,255,255,0.2)',
              backgroundColor: i < step ? '#10b981' : i === step ? 'rgba(16,185,129,0.2)' : 'transparent',
            }}
            animate={i === step ? {
              boxShadow: [
                '0 0 4px rgba(16,185,129,0.3)',
                '0 0 12px rgba(16,185,129,0.6)',
                '0 0 4px rgba(16,185,129,0.3)',
              ],
            } : {}}
            transition={i === step ? { duration: 2, repeat: Infinity, ease: 'easeInOut' } : {}}
          >
            {i < step && (
              <motion.span
                className="text-[8px] text-white font-bold"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 15 }}
              >
                ✓
              </motion.span>
            )}
            {i === step && (
              <motion.div
                className="w-2 h-2 rounded-full bg-gradient-to-r from-emerald-400 to-teal-400"
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              />
            )}
          </motion.div>
        </React.Fragment>
      ))}
    </div>
  );
}

function AuroraBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div
        className="absolute -top-40 -left-40 w-96 h-96 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)',
          filter: 'blur(80px)',
        }}
        animate={{ x: [0, 30, -20, 0], y: [0, -20, 30, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(20,184,166,0.1) 0%, transparent 70%)',
          filter: 'blur(100px)',
        }}
        animate={{ x: [0, -20, 30, 0], y: [0, 20, -10, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute top-1/3 left-1/2 w-64 h-64 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 70%)',
          filter: 'blur(90px)',
        }}
        animate={{ x: [0, 40, -30, 0], y: [0, -30, 20, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />
      {Array.from({ length: 8 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-emerald-400/30"
          style={{
            left: `${10 + Math.random() * 80}%`,
            top: `${10 + Math.random() * 80}%`,
          }}
          animate={{
            opacity: [0, 0.6, 0],
            y: [0, -30 - Math.random() * 20],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 3,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

function AvatarStep({
  avatarData,
  setAvatarData,
}: {
  avatarData: string | null;
  setAvatarData: (d: string | null) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const maxSize = 512;
        let w = img.width;
        let h = img.height;
        if (w > maxSize || h > maxSize) {
          const ratio = Math.min(maxSize / w, maxSize / h);
          w = Math.floor(w * ratio);
          h = Math.floor(h * ratio);
        }

        canvas.width = w;
        canvas.height = h;
        ctx.drawImage(img, 0, 0, w, h);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const reader = new FileReader();
              reader.onload = () => setAvatarData(reader.result as string);
              reader.readAsDataURL(blob);
            }
          },
          'image/webp',
          0.7,
        );
      };
      img.src = URL.createObjectURL(file);
    },
    [setAvatarData],
  );

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setMousePos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  }, []);

  return (
    <div className="flex flex-col items-center gap-6">
      <canvas ref={canvasRef} className="hidden" />
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      <motion.div
        ref={containerRef}
        onClick={() => fileRef.current?.click()}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setMousePos({ x: 50, y: 50 })}
        className="relative w-36 h-36 rounded-full cursor-pointer overflow-hidden"
        style={{
          border: '2px solid rgba(255,255,255,0.1)',
        }}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
      >
        {avatarData ? (
          <img
            src={avatarData}
            alt="avatar"
            className="w-full h-full object-cover rounded-full"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-white/5">
            <span className="text-5xl">📷</span>
          </div>
        )}
        <div
          className="absolute inset-0 rounded-full pointer-events-none transition-opacity duration-300"
          style={{
            opacity: 0.6,
            background: `radial-gradient(circle at ${mousePos.x}% ${mousePos.y}%, rgba(255,255,255,0.25) 0%, rgba(16,185,129,0.1) 40%, transparent 60%)`,
          }}
        />
        {avatarData && (
          <motion.div
            className="absolute inset-0 rounded-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              background: `radial-gradient(circle at ${mousePos.x}% ${mousePos.y}%, rgba(255,255,255,0.15) 0%, transparent 50%)`,
            }}
          />
        )}
      </motion.div>
      <div className="text-center">
        <p className="text-white/80 font-medium text-sm">Upload Avatar</p>
        <p className="text-white/40 text-xs mt-1">Click to upload your photo</p>
      </div>
    </div>
  );
}

function GoalCard({
  goal,
  selected,
  onSelect,
}: {
  goal: typeof GOALS[number];
  selected: boolean;
  onSelect: () => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [8, -8]), {
    stiffness: 200,
    damping: 20,
  });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-8, 8]), {
    stiffness: 200,
    damping: 20,
  });

  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    x.set(nx);
    y.set(ny);
    setMousePos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  }, [x, y]);

  const handleMouseLeave = useCallback(() => {
    x.set(0);
    y.set(0);
    setMousePos({ x: 50, y: 50 });
  }, [x, y]);

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onSelect}
      className={`relative overflow-hidden rounded-xl p-5 cursor-pointer select-none ${
        selected
          ? 'bg-emerald-500/10 border-emerald-400/60'
          : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.06]'
      }`}
      style={{
        borderWidth: 1,
        borderStyle: 'solid',
        perspective: 800,
        rotateX,
        rotateY,
      }}
      whileHover={{ y: -2 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-300"
        style={{
          opacity: 0.6,
          background: `radial-gradient(circle at ${mousePos.x}% ${mousePos.y}%, ${
            selected ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.06)'
          } 0%, transparent 60%)`,
        }}
      />

      {selected && (
        <motion.div
          className="absolute inset-0 rounded-xl pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            boxShadow: 'inset 0 0 20px rgba(16,185,129,0.15)',
          }}
        />
      )}

      <div className="relative z-10 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-2xl">{goal.emoji}</span>
          {selected && (
            <motion.div
              className="w-6 h-6 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center"
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            >
              <span className="text-white text-xs font-bold">✓</span>
            </motion.div>
          )}
        </div>
        <span className="text-white/90 font-semibold text-sm">{goal.title}</span>
        <span className="text-white/40 text-xs">{goal.desc}</span>
      </div>

      {selected && (
        <motion.div
          className="absolute inset-0 rounded-xl pointer-events-none"
          animate={{
            boxShadow: [
              '0 0 8px rgba(16,185,129,0.2)',
              '0 0 20px rgba(16,185,129,0.4)',
              '0 0 8px rgba(16,185,129,0.2)',
            ],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}
    </motion.div>
  );
}

function GoalStep({
  selectedGoal,
  setSelectedGoal,
}: {
  selectedGoal: string | null;
  setSelectedGoal: (g: string | null) => void;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
      {GOALS.map((goal) => (
        <GoalCard
          key={goal.id}
          goal={goal}
          selected={selectedGoal === goal.id}
          onSelect={() => setSelectedGoal(goal.id)}
        />
      ))}
    </div>
  );
}

function IdentityStep({ onComplete }: { onComplete: () => void }) {
  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-lg">
      <div className="w-full">
        <IdentityTierRail currentTier={0} orientation="horizontal" />
      </div>

      <motion.p
        className="text-lg font-bold bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        Your journey begins here
      </motion.p>

      <motion.div
        className="flex items-center gap-2"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="w-2 h-2 rounded-full bg-emerald-400" />
        <div className="w-2 h-2 rounded-full bg-teal-400" />
        <div className="w-2 h-2 rounded-full bg-cyan-400" />
      </motion.div>

      <motion.button
        onClick={onComplete}
        className="px-8 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500"
        whileHover={{ scale: 1.03, boxShadow: '0 0 30px rgba(16,185,129,0.4)' }}
        whileTap={{ scale: 0.97 }}
      >
        Start Your Journey
      </motion.button>
    </div>
  );
}

const stepTitles = ['Create Your Profile', 'Choose Your Goal', 'Your Identity'];

const variants = {
  enter: { opacity: 0, x: 60 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -60 },
};

export const OnboardingShell: React.FC<OnboardingShellProps> = ({
  onComplete,
  className = '',
}) => {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(0);
  const [avatarData, setAvatarData] = useState<string | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);

  const canContinue = step === 0 ? !!avatarData : step === 1 ? !!selectedGoal : true;

  const handleNext = useCallback(() => {
    if (step < 2) {
      setDirection(1);
      setStep((s) => s + 1);
    }
  }, [step]);

  const handleBack = useCallback(() => {
    if (step > 0) {
      setDirection(-1);
      setStep((s) => s - 1);
    }
  }, [step]);

  const handleStepComplete = useCallback(() => {
    onComplete();
  }, [onComplete]);

  const slideVariants = direction > 0 ? variants : {
    enter: { opacity: 0, x: -60 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 60 },
  };

  return (
    <div className={`relative min-h-screen flex items-center justify-center ${className}`}>
      <AuroraBackground />

      <div className="relative z-10 w-full max-w-xl mx-4">
        <div className="rounded-2xl overflow-hidden backdrop-blur-2xl bg-white/[0.03] border border-white/10 p-8">
          <div className="flex flex-col items-center gap-8">
            <div className="flex flex-col items-center gap-4">
              <ProgressDots step={step} />
              <motion.h2
                key={step}
                className="text-xl font-bold text-white/90"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
              >
                {stepTitles[step]}
              </motion.h2>
            </div>

            <div className="w-full min-h-[320px] flex items-center justify-center">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={step}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.35, ease: 'easeInOut' }}
                  className="w-full flex justify-center"
                >
                  {step === 0 && (
                    <AvatarStep avatarData={avatarData} setAvatarData={setAvatarData} />
                  )}
                  {step === 1 && (
                    <GoalStep selectedGoal={selectedGoal} setSelectedGoal={setSelectedGoal} />
                  )}
                  {step === 2 && (
                    <IdentityStep onComplete={handleStepComplete} />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="w-full flex items-center justify-between pt-2">
              {step > 0 ? (
                <motion.button
                  onClick={handleBack}
                  className="px-5 py-2.5 rounded-xl text-white/60 hover:text-white/90 transition-colors text-sm font-medium"
                  whileHover={{ x: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  ← Back
                </motion.button>
              ) : (
                <div />
              )}

              {step < 2 && (
                <motion.button
                  onClick={handleNext}
                  disabled={!canContinue}
                  className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    canContinue
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white cursor-pointer'
                      : 'bg-white/5 text-white/30 cursor-not-allowed'
                  }`}
                  whileHover={canContinue ? { scale: 1.03, boxShadow: '0 0 20px rgba(16,185,129,0.3)' } : {}}
                  whileTap={canContinue ? { scale: 0.97 } : {}}
                >
                  Continue →
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

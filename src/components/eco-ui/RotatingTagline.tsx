import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const PHRASES = ["Measure it.", "Reduce it.", "Track it.", "Own it.", "Heal it."];
const SCRAMBLE_SET = "!@#$%^&*()_+-=[]{}|;:',.<>?/~`";
const LEAF_ICONS = ["🌱", "🍃", "🌿", "☘️"];

interface RotatingTaglineProps {
  className?: string;
  interval?: number;
}

interface LeafParticle {
  id: number;
  x: number;
  drift: number;
  delay: number;
  size: number;
  icon: string;
}

function randChar(): string {
  return SCRAMBLE_SET[Math.floor(Math.random() * SCRAMBLE_SET.length)];
}

function ScrambledText({ text }: { text: string }) {
  const [chars, setChars] = useState(() => text.split(''));
  const prev = useRef(text);

  useEffect(() => {
    if (prev.current === text) return;
    prev.current = text;

    const target = text.split('');
    const total = 26;
    let frame = 0;
    let id: number;

    const tick = () => {
      frame++;
      setChars(
        target.map((c, i) => {
          if (c === ' ') return ' ';
          const resolveAt = Math.floor(total * (0.15 + (i / target.length) * 0.55));
          return frame >= resolveAt ? c : randChar();
        })
      );
      if (frame < total) {
        id = requestAnimationFrame(tick);
      } else {
        setChars(target);
      }
    };

    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [text]);

  return <>{chars.join('')}</>;
}

export const RotatingTagline: React.FC<RotatingTaglineProps> = ({
  className = '',
  interval = 2500,
}) => {
  const [index, setIndex] = useState(0);
  const [leaves, setLeaves] = useState<LeafParticle[]>([]);
  const idRef = useRef(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % PHRASES.length);

      const next: LeafParticle[] = [];
      for (let i = 0; i < 3 + Math.floor(Math.random() * 2); i++) {
        idRef.current++;
        next.push({
          id: idRef.current,
          x: 10 + Math.random() * 80,
          drift: (Math.random() - 0.5) * 40,
          delay: Math.random() * 0.35,
          size: 14 + Math.random() * 14,
          icon: LEAF_ICONS[Math.floor(Math.random() * LEAF_ICONS.length)],
        });
      }
      setLeaves(next);
    }, interval);

    return () => clearInterval(timer);
  }, [interval]);

  const phrase = PHRASES[index];

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <style>{`
        @keyframes sh-sweep {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .sh-grad {
          background: linear-gradient(
            90deg,
            #34d399 0%,
            #2dd4bf 28%,
            #22d3ee 50%,
            #2dd4bf 72%,
            #34d399 100%
          );
          background-size: 200% auto;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: sh-sweep 3.5s ease-in-out infinite;
        }
      `}</style>

      <div className="relative">
        <AnimatePresence>
          {leaves.map((l) => (
            <motion.span
              key={l.id}
              className="absolute pointer-events-none select-none"
              style={{ left: `${l.x}%`, bottom: 0, fontSize: l.size, lineHeight: 1 }}
              initial={{ opacity: 0, y: 0, x: 0, rotate: 0 }}
              animate={{
                opacity: [0, 1, 1, 0],
                y: [0, -25, -55, -100],
                x: [0, l.drift * 0.3, l.drift * 0.65, l.drift],
                rotate: [0, -10, 8, -5],
              }}
              exit={{ opacity: 0, y: -20 }}
              transition={{
                duration: 2.4,
                delay: l.delay,
                ease: 'easeOut',
                times: [0, 0.15, 0.4, 1],
              }}
            >
              {l.icon}
            </motion.span>
          ))}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          <motion.span
            key={phrase}
            className="sh-grad inline-block"
            initial={{ filter: 'blur(6px)', opacity: 0 }}
            animate={{ filter: 'blur(0px)', opacity: 1 }}
            exit={{ filter: 'blur(6px)', opacity: 0 }}
            transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
          >
            <ScrambledText text={phrase} />
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  );
};

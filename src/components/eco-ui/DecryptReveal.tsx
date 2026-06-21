import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const CHARS = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

interface DecryptRevealProps {
  text: string;
  className?: string;
  delay?: number;
  onComplete?: () => void;
  as?: 'h1' | 'h2' | 'h3' | 'span' | 'p' | 'div';
  gradient?: boolean;
  shimmer?: boolean;
  scrambleSpeed?: number;
  subtext?: string;
  value?: number;
  valuePrefix?: string;
  valueSuffix?: string;
  valueDecimals?: number;
}

function scramble(text: string): string {
  return text
    .split('')
    .map((c) => (c === ' ' ? ' ' : CHARS[Math.floor(Math.random() * CHARS.length)]))
    .join('');
}

export const DecryptReveal: React.FC<DecryptRevealProps> = ({
  text,
  className = '',
  delay = 0,
  onComplete,
  as: Tag = 'span',
  gradient = true,
  shimmer = true,
  scrambleSpeed = 50,
  subtext,
}) => {
  const [display, setDisplay] = useState('');
  const [resolved, setResolved] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    setDisplay('');
    setResolved(false);

    timeoutRef.current = setTimeout(() => {
      const totalCycles = 5 + Math.floor(text.length * 1.2);
      let cycle = 0;

      intervalRef.current = setInterval(() => {
        cycle++;
        if (cycle >= totalCycles) {
          clearInterval(intervalRef.current);
          setDisplay(text);
          setResolved(true);
          onComplete?.();
          return;
        }
        const progress = cycle / totalCycles;
        const revealCount = Math.floor(progress * text.length);
        setDisplay(text.slice(0, revealCount) + scramble(text.slice(revealCount)));
      }, scrambleSpeed);
    }, delay);

    return () => {
      clearTimeout(timeoutRef.current);
      clearInterval(intervalRef.current);
    };
  }, [text, delay, scrambleSpeed, onComplete]);

  const gradientClass =
    gradient
      ? 'bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent'
      : '';

  const MotionTag = motion[Tag as keyof typeof motion] ?? motion.span;

  return (
    <span className={`relative inline-block ${className}`}>
      <MotionTag
        className={`relative font-black tracking-tight ${gradientClass} ${resolved && shimmer ? 'shimmer-text' : ''}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {display || '\u00A0'}
      </MotionTag>
      {resolved && shimmer && (
        <style>{`
          .shimmer-text {
            background-size: 200% auto;
            animation: shimmer-sweep 2.5s ease-in-out infinite;
          }
          @keyframes shimmer-sweep {
            0% { background-position: -200% center; }
            100% { background-position: 200% center; }
          }
        `}</style>
      )}
      {subtext && resolved && (
        <motion.p
          className="text-sm text-slate-400 mt-2 leading-relaxed"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {subtext}
        </motion.p>
      )}
    </span>
  );
};

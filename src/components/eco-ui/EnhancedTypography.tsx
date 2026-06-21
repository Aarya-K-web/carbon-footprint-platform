import React, { useState, useEffect, useRef } from 'react'
import { motion, useMotionValue, useSpring, useMotionValueEvent } from 'framer-motion'

type HeadingTag = 'h1' | 'h2' | 'h3' | 'h4'

interface EcoHeadingProps {
  as?: HeadingTag
  children: React.ReactNode
  className?: string
  gradient?: boolean
  glow?: boolean
  letterSpace?: boolean
  weight?: '700' | '800' | '900'
  size?: string
}

interface EcoNumberProps {
  value: number
  className?: string
  prefix?: string
  suffix?: string
  decimals?: number
  glitch?: boolean
  glow?: boolean
  duration?: number
  size?: string
}

interface EcoBodyProps {
  children: React.ReactNode
  className?: string
  size?: 'sm' | 'base' | 'lg'
  tracking?: boolean
  muted?: boolean
}

const weightMap: Record<string, string> = {
  '700': 'font-bold',
  '800': 'font-extrabold',
  '900': 'font-black',
}

const sizeMap: Record<string, string> = {
  'sm': 'text-xs leading-relaxed',
  'base': 'text-sm leading-relaxed',
  'lg': 'text-base leading-relaxed',
}

export function EcoHeading({
  as: Tag = 'h2',
  children,
  className = '',
  gradient = true,
  glow = false,
  letterSpace = true,
  weight = '800',
  size = '',
}: EcoHeadingProps) {
  return (
    <motion.div
      initial={letterSpace ? { letterSpacing: '-0.05em', opacity: 0 } : undefined}
      animate={letterSpace ? { letterSpacing: '0.02em', opacity: 1 } : undefined}
      transition={{ duration: 1.2, ease: 'easeOut' }}
    >
      <Tag
        className={`font-display ${weightMap[weight]} tracking-tight leading-[1.1] ${size} ${
          gradient ? 'bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent' : 'text-white'
        } ${glow ? 'text-glow-emerald' : ''} ${letterSpace ? 'tracking-premium' : ''} ${className}`}
      >
        {children}
      </Tag>
    </motion.div>
  )
}

export function EcoNumber({
  value,
  className = '',
  prefix = '',
  suffix = '',
  decimals = 1,
  glitch = true,
  glow = true,
  duration = 800,
  size = 'text-5xl sm:text-6xl md:text-7xl',
}: EcoNumberProps) {
  const countValue = useMotionValue(0)
  const springValue = useSpring(countValue, { damping: 28, stiffness: 90 })
  const [display, setDisplay] = useState(`${prefix}0${suffix}`)
  const [glitching, setGlitching] = useState(false)
  const prevValue = useRef(value)

  useMotionValueEvent(springValue, 'change', (latest) => {
    const num = prefix + latest.toFixed(decimals) + suffix
    setDisplay(num)
  })

  useEffect(() => {
    countValue.set(value)

    if (glitch && prevValue.current !== value) {
      setGlitching(true)
      const t = setTimeout(() => setGlitching(false), 500)
      prevValue.current = value
      return () => clearTimeout(t)
    }
  }, [value, countValue, glitch])

  return (
    <span
      className={`font-mono font-extrabold ${size} bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent ${
        glow ? 'text-glow-emerald' : ''
      } ${glitching ? 'glitch-number' : ''} tracking-data ${className}`}
      style={{ fontVariationSettings: '"wght" 800' }}
    >
      {display}
    </span>
  )
}

export function EcoBody({
  children,
  className = '',
  size = 'base',
  tracking = true,
  muted = true,
}: EcoBodyProps) {
  return (
    <p
      className={`font-body ${sizeMap[size]} ${
        tracking ? 'tracking-premium' : ''
      } ${muted ? 'text-slate-400' : 'text-slate-300'} ${className}`}
    >
      {children}
    </p>
  )
}

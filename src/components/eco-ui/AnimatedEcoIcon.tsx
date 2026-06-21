import { useCallback, useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"

type IconName = "flame" | "leaf" | "planet" | "trophy" | "check" | "impact"

export interface AnimatedEcoIconProps {
  name: IconName
  size?: number
  intensity?: "bold" | "epic"
  trigger?: "always" | "hover" | "onMount"
  glowColor?: string
  className?: string
}

const C = {
  emerald: "#10b981",
  teal: "#14b8a6",
  cyan: "#22d3ee",
  amber: "#f59e0b",
  orange: "#f97316",
  rose: "#f43f5e",
  yellow: "#fef08a",
  white: "#ffffff",
}

function useAnimateTrigger(trigger: AnimatedEcoIconProps["trigger"]) {
  const [active, setActive] = useState(trigger === "always")
  const [hovered, setHovered] = useState(false)

  useEffect(() => {
    if (trigger === "onMount") {
      const t = window.setTimeout(() => setActive(true), 100)
      return () => window.clearTimeout(t)
    }
  }, [trigger])

  const running = trigger === "hover" ? hovered && active : active
  return { running, hovered, setHovered, setActive }
}

function useKeyframes() {
  useEffect(() => {
    if (typeof document === "undefined" || document.getElementById("eco-icon-kf")) return
    const s = document.createElement("style")
    s.id = "eco-icon-kf"
    s.textContent = `
@keyframes eco-sway { 0% { transform: rotate(-8deg); } 50% { transform: rotate(2deg);} 100% { transform: rotate(8deg);} }
@keyframes eco-sway-fast { 0% { transform: rotate(-10deg);} 100% { transform: rotate(10deg);} }
@keyframes eco-float { 0%,100% { transform: translateY(0px);} 50% { transform: translateY(-8px);} }
@keyframes eco-shimmer { 0% { background-position: -200% 0;} 100% { background-position: 200% 0;} }
`
    document.head.appendChild(s)
  }, [])
}

function StrongGlow({ size, color, intensity }: { size: number; color: string; intensity: "bold" | "epic" }) {
  const extra = intensity === "epic"
  const layerCount = extra ? 4 : 3
  const s = size * 0.5

  return (
    <>
      {Array.from({ length: layerCount }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            background: `radial-gradient(circle at 50% 50%, ${color}${15 - i * 3} 0%, ${color}${8 - i * 2} ${s * (0.4 + i * 0.25)}px, transparent ${s * (0.6 + i * 0.4)}px)`,
            filter: `blur(${4 + i * 6}px)`,
            transform: `scale(${1 + i * 0.15})`,
          }}
          animate={{ scale: [1 + i * 0.01, 1 + i * 0.03, 1 + i * 0.01] }}
          transition={{ duration: 2.6 + i * 0.35, repeat: Infinity, ease: "easeInOut", delay: i * 0.15 }}
        />
      ))}
    </>
  )
}

function FlameIcon({ size, intensity, hovered, glowColor }: { size: number; intensity: "bold" | "epic"; hovered: boolean; glowColor: string }) {
  const epic = intensity === "epic"
  const g = glowColor
  const particleCount = epic ? 14 : 8

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <StrongGlow size={size} color={g} intensity={intensity} />

      <motion.div
        className="absolute inset-0"
        animate={
          hovered
            ? { scale: [1, 1.06, 0.96, 1.02, 1], rotate: [0, 1.5, -1, 0.5, 0] }
            : { scale: [1, 1.02, 0.98, 1], rotate: [0, 0.5, -0.5, 0] }
        }
        transition={{ duration: hovered ? 0.35 : 1.2, repeat: Infinity, ease: "easeInOut" }}
      >
        <svg viewBox="0 0 100 100" width={size} height={size} className="drop-shadow-[0_0_18px_rgba(16,185,129,0.5)]">
          <defs>
            <radialGradient id="f-outer" cx="50%" cy="65%" r="58%">
              <stop offset="0%" stopColor={C.amber} />
              <stop offset="35%" stopColor={C.orange} />
              <stop offset="70%" stopColor="#dc2626" />
              <stop offset="100%" stopColor="#7f1d1d" />
            </radialGradient>
            <radialGradient id="f-core" cx="50%" cy="42%" r="30%">
              <stop offset="0%" stopColor={C.yellow} />
              <stop offset="35%" stopColor={C.amber} />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
            <linearGradient id="f-glow-edge" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="transparent" />
              <stop offset="40%" stopColor={`${g}50`} />
              <stop offset="80%" stopColor={`${C.amber}30`} />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
          </defs>

          {/* IMPORTANT: NO animate/d morphing; d is always static strings */}
          <path d="M50 6 C38 24 14 36 14 60 C14 79.6 30.2 94 50 94 C69.8 94 86 79.6 86 60 C86 36 62 24 50 6Z" fill="url(#f-outer)" />

          <motion.path
            d="M50 6 C38 24 14 36 14 60 C14 79.6 30.2 94 50 94 C69.8 94 86 79.6 86 60 C86 36 62 24 50 6Z"
            fill="url(#f-glow-edge)"
            animate={hovered ? { opacity: [0.45, 0.85, 0.35, 0.75, 0.45] } : { opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: hovered ? 0.3 : 1.5, repeat: Infinity, ease: "easeInOut" }}
          />

          <motion.path
            d="M50 20 C42 32 22 40 22 58 C22 73.4 34.4 84 50 84 C65.6 84 78 73.4 78 58 C78 40 58 32 50 20Z"
            fill="url(#f-core)"
            animate={{ scale: hovered ? [1, 1.15, 0.92, 1.06, 1] : [1, 1.08, 0.96, 1], opacity: hovered ? [0.85, 1, 0.7, 0.9, 0.85] : [0.7, 1, 0.8, 1] }}
            transition={{ duration: hovered ? 0.3 : 1.4, repeat: Infinity, ease: "easeInOut" }}
          />

          <motion.path
            d="M30 52c-4 8-6 14-6 18 0 11 8 20 18 20s18-9 18-20c0-4-2-10-6-18"
            fill="none"
            stroke={C.amber}
            strokeWidth="2"
            opacity={0.25}
            animate={{ opacity: [0.15, 0.4, 0.15], scale: [1, 1.03, 1] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          />

          {epic && (
            <>
              <motion.path
                d="M50 2 C36 20 10 34 10 60 C10 82 28 98 50 98 C72 98 90 82 90 60 C90 34 64 20 50 2Z"
                fill="none"
                stroke={`${C.orange}30`}
                strokeWidth="1.5"
                strokeDasharray="4 6"
                animate={{ rotate: [0, 360], scale: [1, 1.03, 1] }}
                style={{ transformOrigin: "center" }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              />
              <motion.path
                d="M34 58c-2 6-4 10-4 14 0 8 6 14 14 14s14-6 14-14c0-4-2-8-4-14"
                fill="none"
                stroke={C.yellow}
                strokeWidth="1"
                opacity={0.3}
                animate={{ opacity: [0.2, 0.5, 0.2] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
              />
            </>
          )}
        </svg>
      </motion.div>

      {/* particle dots: no SVG d involved */}
      {Array.from({ length: particleCount }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: epic ? 4 : 3,
            height: epic ? 4 : 3,
            backgroundColor: [C.amber, C.orange, g, C.yellow][i % 4],
            boxShadow: `0 0 ${epic ? 12 : 8}px ${[C.amber, C.orange, g, C.yellow][i % 4]}, 0 0 ${epic ? 20 : 12}px ${[C.amber, C.orange, g, C.yellow][i % 4]}40`,
            left: `${48 + (i % 2 === 0 ? -1 : 1) * (8 + Math.random() * 8)}%`,
            top: `${55 + Math.random() * 25}%`,
          }}
          initial={{ y: 0, opacity: 0, scale: 0 }}
          animate={{
            y: [0, -(25 + Math.random() * 30), -(55 + Math.random() * 25)],
            x: [0, (Math.random() - 0.5) * (epic ? 40 : 25)],
            opacity: [hovered ? 1 : 0.8, 0.95, 0],
            scale: [0, 2, 0],
          }}
          transition={{ duration: 1.8 + Math.random() * 0.8, delay: i * (epic ? 0.1 : 0.18), repeat: Infinity, ease: "easeOut" }}
        />
      ))}
    </div>
  )
}

function LeafIcon({ size, intensity, hovered, glowColor }: { size: number; intensity: "bold" | "epic"; hovered: boolean; glowColor: string }) {
  const epic = intensity === "epic"
  const g = glowColor

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <StrongGlow size={size} color={g} intensity={intensity} />

      <motion.div
        className="absolute inset-0"
        style={{ transformOrigin: "bottom center", animation: `eco-sway ${hovered ? 2 : 3}s ease-in-out infinite alternate` }}
      >
        <svg viewBox="0 0 100 100" width={size} height={size} className="drop-shadow-[0_0_18px_rgba(16,185,129,0.45)]">
          <defs>
            <radialGradient id="l-grad" cx="40%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#6ee7b7" />
              <stop offset="30%" stopColor={g} />
              <stop offset="65%" stopColor="#047857" />
              <stop offset="100%" stopColor="#064e3b" />
            </radialGradient>
            <linearGradient id="l-vein" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#a7f3d0" />
              <stop offset="50%" stopColor={g} />
              <stop offset="100%" stopColor="#047857" />
            </linearGradient>
            <linearGradient id="l-vein-side" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#a7f3d0" />
              <stop offset="100%" stopColor={`${g}80`} />
            </linearGradient>
          </defs>

          <motion.path
            d="M50 8 C30 28 14 48 14 70 C14 86 30 94 50 96 C70 94 86 86 86 70 C86 48 70 28 50 8Z"
            fill="url(#l-grad)"
            animate={{
              scale: hovered ? [1, 1.03, 0.99, 1.02, 1] : [1, 1.01, 0.995, 1],
              opacity: hovered ? [0.98, 1, 0.94, 1, 0.98] : [0.98, 1, 0.96, 1],
            }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          />

          <motion.path
            d="M50 8 L50 90"
            stroke="url(#l-vein)"
            strokeWidth="3"
            strokeLinecap="round"
            opacity={0.75}
            animate={hovered ? { strokeWidth: 3.6, opacity: 1 } : { strokeWidth: 3, opacity: 0.75 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
          />

          {[
            "M50 26 C40 30 32 38 28 48",
            "M50 24 C60 28 68 36 72 46",
            "M50 44 C42 48 36 54 32 62",
            "M50 42 C58 46 64 52 68 60",
            "M50 60 C44 62 40 66 38 72",
            "M50 58 C56 60 60 64 62 70",
          ].map((d, i) => (
            <motion.path
              key={i}
              d={d}
              stroke="url(#l-vein-side)"
              strokeWidth={i < 2 ? 2 : i < 4 ? 1.5 : 1.2}
              fill="none"
              opacity={i < 2 ? 0.5 : i < 4 ? 0.4 : 0.3}
              strokeLinecap="round"
              animate={{ opacity: hovered ? [0.25, 0.55, 0.25] : [0.2, 0.4, 0.2] }}
              transition={{ duration: epic ? 1.6 : 1.9, repeat: Infinity, ease: "easeInOut" }}
            />
          ))}

          {epic && (
            <motion.path
              d="M50 12 C40 20 34 28 30 36"
              stroke={`${C.teal}60`}
              strokeWidth="1"
              fill="none"
              opacity={0.3}
              strokeDasharray="3 4"
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 2.8, repeat: Infinity, ease: "linear" }}
            />
          )}
        </svg>
      </motion.div>

      {Array.from({ length: epic ? 12 : 8 }).map((_, i) => {
        const side = i % 2 === 0 ? -1 : 1
        return (
          <motion.div
            key={i}
            className="absolute rounded-full pointer-events-none"
            style={{
              width: epic ? 4 : 3,
              height: epic ? 4 : 3,
              backgroundColor: [g, C.teal, C.cyan][i % 3],
              boxShadow: `0 0 ${epic ? 10 : 6}px ${[g, C.teal, C.cyan][i % 3]}, 0 0 ${epic ? 16 : 8}px ${[g, C.teal, C.cyan][i % 3]}40`,
              left: `${50 + side * 22 + (Math.random() - 0.5) * 16}%`,
              top: `${25 + Math.random() * 45}%`,
            }}
            initial={{ x: 0, y: 0, opacity: 0 }}
            animate={{
              x: [0, side * (15 + Math.random() * (epic ? 28 : 16))],
              y: [0, -(20 + Math.random() * (epic ? 28 : 16))],
              opacity: [hovered ? 1 : 0.7, 0.9, 0],
              scale: [0, 1.8, 0],
            }}
            transition={{ duration: 2.5 + Math.random() * (epic ? 1.2 : 0.6), delay: i * (epic ? 0.15 : 0.25), repeat: Infinity, ease: "easeOut" }}
          />
        )
      })}
    </div>
  )
}

function PlanetIcon({ size, intensity, hovered, glowColor }: { size: number; intensity: "bold" | "epic"; hovered: boolean; glowColor: string }) {
  const epic = intensity === "epic"
  const g = glowColor

  const continents = useMemo(
    () => [
      "M36 26 C44 24 54 28 56 38 C58 48 52 54 44 56 C36 58 30 52 28 44 C26 36 28 28 36 26Z",
      "M58 38 C66 36 72 42 70 52 C68 62 58 64 54 58 C50 52 50 40 58 38Z",
      "M40 58 C48 56 56 62 52 70 C48 78 38 76 34 68 C30 60 32 60 40 58Z",
      "M62 24 C66 22 72 26 70 32 C68 38 62 38 60 34 C58 30 58 26 62 24Z",
    ],
    []
  )

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <StrongGlow size={size} color={C.cyan} intensity={intensity} />

      <svg viewBox="0 0 100 100" width={size} height={size} className="absolute inset-0 drop-shadow-[0_0_20px_rgba(34,211,238,0.4)]">
        <defs>
          <radialGradient id="p-atmos" cx="50%" cy="50%" r="55%">
            <stop offset="65%" stopColor="transparent" />
            <stop offset="80%" stopColor={`${C.cyan}25`} />
            <stop offset="92%" stopColor={`${g}15`} />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
          <radialGradient id="p-globe" cx="35%" cy="30%" r="58%">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="30%" stopColor={g} />
            <stop offset="65%" stopColor="#047857" />
            <stop offset="100%" stopColor="#064e3b" />
          </radialGradient>
          <radialGradient id="p-shine" cx="25%" cy="25%" r="45%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.2)" />
            <stop offset="40%" stopColor="rgba(255,255,255,0.05)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>

        <circle cx="50" cy="50" r="50" fill="url(#p-atmos)" />

        <motion.circle cx="50" cy="50" r="36" fill="url(#p-globe)" animate={{ scale: [1, 1.035, 1] }} transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }} />

        <circle cx="50" cy="50" r="36" fill="url(#p-shine)" />

        {continents.map((d, i) => (
          <motion.path
            key={i}
            d={d}
            fill="rgba(6,78,59,0.55)"
            animate={{ rotate: hovered ? [0, 18, 0] : [0, 10, 0], opacity: hovered ? [0.85, 1, 0.9] : [0.7, 1, 0.8] }}
            transition={{ duration: 8 + i * 2, repeat: Infinity, ease: "easeInOut" }}
            style={{ transformOrigin: "50px 50px" }}
          />
        ))}

        <motion.ellipse cx="50" cy="50" rx="38" ry="9" fill="none" stroke={`${C.cyan}25`} strokeWidth="2.5" style={{ transformOrigin: "center" }} animate={{ rotate: [0, 360] }} transition={{ duration: hovered ? 4 : 10, repeat: Infinity, ease: "linear" }} />
        <motion.ellipse cx="50" cy="50" rx="44" ry="7" fill="none" stroke={`${g}20`} strokeWidth="2" style={{ transformOrigin: "center" }} animate={{ rotate: [360, 0] }} transition={{ duration: hovered ? 5 : 12, repeat: Infinity, ease: "linear" }} />

        {epic && (
          <>
            <motion.ellipse cx="50" cy="50" rx="50" ry="5" fill="none" stroke={`${C.teal}15`} strokeWidth="1.5" strokeDasharray="5 7" style={{ transformOrigin: "center" }} animate={{ rotate: [0, 360] }} transition={{ duration: 8, repeat: Infinity, ease: "linear" }} />
            <motion.ellipse cx="50" cy="50" rx="52" ry="3" fill="none" stroke={`${C.cyan}10`} strokeWidth="1" strokeDasharray="2 8" style={{ transformOrigin: "center" }} animate={{ rotate: [360, 0] }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }} />
          </>
        )}
      </svg>

      {Array.from({ length: epic ? 10 : 6 }).map((_, i) => {
        const ang = (360 / (epic ? 10 : 6)) * i
        const rad = (ang * Math.PI) / 180
        const r = epic ? 42 : 38
        return (
          <motion.div
            key={i}
            className="absolute rounded-full pointer-events-none"
            style={{
              width: 2.5 + (i % 2),
              height: 2.5 + (i % 2),
              backgroundColor: [C.cyan, g, C.teal][i % 3],
              boxShadow: `0 0 ${epic ? 8 : 5}px ${[C.cyan, g, C.teal][i % 3]}`,
              left: `${30 + Math.random() * 40}%`,
              top: `${25 + Math.random() * 50}%`,
            }}
            initial={{ y: 0, opacity: 0, scale: 0 }}
            animate={{
              y: [0, -(12 + Math.random() * (epic ? 22 : 12))],
              x: [0, (Math.random() - 0.5) * (epic ? 18 : 10)],
              opacity: [0, 0.7, 0],
              scale: [0, 1.4, 0],
            }}
            transition={{ duration: 3 + Math.random() * 2, delay: i * (epic ? 0.2 : 0.35), repeat: Infinity, ease: "easeOut" }}
          />
        )
      })}
    </div>
  )
}

function TrophyIcon({ size, intensity, hovered, glowColor }: { size: number; intensity: "bold" | "epic"; hovered: boolean; glowColor: string }) {
  const epic = intensity === "epic"
  const shimmerSpeed = hovered ? 0.5 : 1.5
  const particleCount = epic ? 14 : 8
  const g = glowColor

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <StrongGlow size={size} color={C.amber} intensity={intensity} />

      <motion.div className="absolute inset-0" style={{ animation: `eco-float ${hovered ? 1.8 : 2.8}s ease-in-out infinite` }}>
        <svg viewBox="0 0 100 100" width={size} height={size} className="drop-shadow-[0_0_22px_rgba(245,158,11,0.45)]">
          <defs>
            <linearGradient id="t-body" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fcd34d" />
              <stop offset="20%" stopColor="#fbbf24" />
              <stop offset="50%" stopColor={C.amber} />
              <stop offset="80%" stopColor="#d97706" />
              <stop offset="100%" stopColor="#92400e" />
            </linearGradient>
            <linearGradient id="t-shine" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.45)" />
              <stop offset="30%" stopColor="rgba(255,255,255,0.05)" />
              <stop offset="70%" stopColor="rgba(255,255,255,0.05)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0.25)" />
            </linearGradient>
            <linearGradient id="t-sweep" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="transparent" />
              <stop offset="30%" stopColor="rgba(255,255,255,0.6)" />
              <stop offset="50%" stopColor="rgba(255,255,255,0.6)" />
              <stop offset="70%" stopColor="transparent" />
              <stop offset="85%" stopColor="rgba(255,255,255,0.3)" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
            <linearGradient id="t-handle" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#b45309" />
            </linearGradient>
          </defs>

          <motion.path d="M26 32 L74 32 L70 66 C70 80 30 80 30 66Z" fill="url(#t-body)" animate={hovered ? { scale: [1, 1.04, 0.97, 1] } : {}} transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }} />
          <path d="M26 32 L74 32 L70 66 C70 80 30 80 30 66Z" fill="url(#t-shine)" />

          <path d="M26 32 C26 22 20 16 16 16 L14 16 C10 16 8 20 8 26 L8 30 C8 38 14 42 22 42 L26 42" fill="url(#t-handle)" opacity={0.85} />
          <path d="M74 32 C74 22 80 16 84 16 L86 16 C90 16 92 20 92 26 L92 30 C92 38 86 42 78 42 L74 42" fill="url(#t-handle)" opacity={0.85} />

          <rect x="40" y="66" width="20" height="7" rx="2" fill="#b45309" />
          <rect x="34" y="73" width="32" height="6" rx="2" fill={C.amber} opacity={0.65} />
          <rect x="28" y="79" width="44" height="8" rx="3" fill="url(#t-body)" opacity={0.45} />

          <motion.rect
            x="26"
            y="32"
            width="48"
            height="34"
            fill="url(#t-sweep)"
            style={{ backgroundPosition: "-200% 0", backgroundSize: "200% 100%", animation: `eco-shimmer ${shimmerSpeed}s linear infinite` }}
          />

          {epic && (
            <>
              <path d="M50 6 L52 14 L60 14 L54 20 L57 28 L50 23 L43 28 L46 20 L40 14 L48 14Z" fill={C.amber} opacity={0.7} />
              <path d="M50 8 L51 12 L55 12 L52 15 L53 19 L50 17 L47 19 L48 15 L45 12 L49 12Z" fill={C.yellow} opacity={0.5} />
              <circle cx="78" cy="20" r="4" fill={g} opacity={0.45} />
              <circle cx="22" cy="20" r="3" fill={C.teal} opacity={0.35} />
            </>
          )}
        </svg>
      </motion.div>

      {Array.from({ length: particleCount }).map((_, i) => {
        const angle = (360 / particleCount) * i
        const rad = (angle * Math.PI) / 180
        const dist = epic ? 55 : 42
        return (
          <motion.div
            key={i}
            className="absolute rounded-full pointer-events-none"
            style={{ width: epic ? 3.5 : 2.5, height: epic ? 3.5 : 2.5, backgroundColor: i % 2 === 0 ? C.amber : g, boxShadow: `0 0 ${epic ? 10 : 6}px ${i % 2 === 0 ? C.amber : g}, 0 0 ${epic ? 16 : 8}px ${i % 2 === 0 ? C.amber : g}40`, left: "50%", top: "50%" }}
            initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
            animate={{ x: [0, Math.cos(rad) * dist * 0.5, Math.cos(rad) * dist], y: [0, Math.sin(rad) * dist * 0.5 - 10, Math.sin(rad) * dist - 20], opacity: [hovered ? 1 : 0.7, 1, 0], scale: [0, 1.5, 0] }}
            transition={{ duration: 2.2 + Math.random() * 1, delay: i * (epic ? 0.1 : 0.15), repeat: Infinity, ease: "easeOut" }}
          />
        )
      })}
    </div>
  )
}

function CheckIcon({ size, intensity, hovered, glowColor }: { size: number; intensity: "bold" | "epic"; hovered: boolean; glowColor: string }) {
  const epic = intensity === "epic"
  const pulseDur = hovered ? 1 : 2
  const g = glowColor

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <StrongGlow size={size} color={g} intensity={intensity} />

      <svg viewBox="0 0 100 100" width={size} height={size} className="absolute inset-0 drop-shadow-[0_0_18px_rgba(16,185,129,0.45)]">
        <defs>
          <linearGradient id="c-ring" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={g} />
            <stop offset="50%" stopColor={C.teal} />
            <stop offset="100%" stopColor={C.cyan} />
          </linearGradient>
          <linearGradient id="c-check" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6ee7b7" />
            <stop offset="50%" stopColor={g} />
            <stop offset="100%" stopColor="#047857" />
          </linearGradient>
          <radialGradient id="c-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={`${g}20`} />
            <stop offset="60%" stopColor={`${g}08`} />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>

        <circle cx="50" cy="50" r="48" fill="url(#c-glow)" />
        <motion.circle cx="50" cy="50" r="42" fill="none" stroke="url(#c-ring)" strokeWidth="4.5" animate={{ scale: [1, 1.03, 1], opacity: [0.6, 1, 0.6] }} transition={{ duration: pulseDur, repeat: Infinity, ease: "easeInOut" }} />
        <motion.circle cx="50" cy="50" r="34" fill={`${g}10`} animate={{ scale: hovered ? [1, 1.08, 0.97, 1] : [1, 1.04, 1], opacity: hovered ? [0.5, 1, 0.4, 0.8] : [0.3, 0.7, 0.3] }} transition={{ duration: pulseDur * 0.5, repeat: Infinity, ease: "easeInOut" }} />

        <motion.path d="M30 48 L46 66 L70 36" fill="none" stroke="url(#c-check)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, ease: "easeOut" }} style={{ filter: "drop-shadow(0 0 4px rgba(16,185,129,0.3))" }} />
        <path d="M30 48 L46 66 L70 36" fill="none" stroke={C.cyan} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity={0.5} />

        {epic && (
          <>
            <motion.circle cx="50" cy="50" r="46" fill="none" stroke={C.teal} strokeWidth="1.5" strokeDasharray="5 7" opacity={0.35} animate={{ rotate: [0, 360] }} style={{ transformOrigin: "center" }} transition={{ duration: 5, repeat: Infinity, ease: "linear" }} />
            <motion.circle cx="50" cy="50" r="48" fill="none" stroke={C.cyan} strokeWidth="0.8" strokeDasharray="2 10" opacity={0.2} animate={{ rotate: [360, 0] }} style={{ transformOrigin: "center" }} transition={{ duration: 7, repeat: Infinity, ease: "linear" }} />
            <motion.circle cx="50" cy="50" r="38" fill="none" stroke={`${g}05`} strokeWidth="12" animate={{ scale: [1, 1.08, 1], opacity: [0, 0.15, 0] }} transition={{ duration: pulseDur * 1.2, repeat: Infinity, ease: "easeInOut" }} />
          </>
        )}
      </svg>
    </div>
  )
}

function ImpactIcon({ size, intensity, hovered, glowColor }: { size: number; intensity: "bold" | "epic"; hovered: boolean; glowColor: string }) {
  const epic = intensity === "epic"
  const g = glowColor

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <StrongGlow size={size} color={C.rose} intensity={intensity} />

      <motion.div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle at 50% 50%, ${C.rose}15 0%, ${C.orange}08 50%, transparent 70%)`, filter: "blur(14px)" }}
        animate={{ scale: hovered ? [1, 1.25, 0.85, 1.15, 1] : [1, 1.06, 0.97, 1.03, 1] }}
        transition={{ duration: hovered ? 0.3 : 1.8, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="absolute inset-0"
        animate={
          hovered
            ? { scale: [1, 1.05, 0.95, 1.03, 0.97, 1], rotate: [0, 2.5, -2.5, 1.5, -1.5, 0] }
            : { scale: [1, 1.03, 0.97, 1], rotate: [0, 0.8, -0.8, 0] }
        }
        transition={{ duration: hovered ? 0.25 : 1.4, repeat: Infinity, ease: "easeInOut" }}
      >
        <svg viewBox="0 0 100 100" width={size} height={size} className="drop-shadow-[0_0_24px_rgba(244,63,94,0.45)]">
          <defs>
            <radialGradient id="i-outer" cx="50%" cy="50%" r="55%">
              <stop offset="0%" stopColor={C.yellow} />
              <stop offset="20%" stopColor={C.orange} />
              <stop offset="50%" stopColor={C.rose} />
              <stop offset="80%" stopColor="#be123c" />
              <stop offset="100%" stopColor="#4c0519" />
            </radialGradient>
            <radialGradient id="i-core" cx="50%" cy="50%" r="22%">
              <stop offset="0%" stopColor={C.yellow} />
              <stop offset="40%" stopColor={C.amber} />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
            <filter id="i-turbulence">
              <feTurbulence type="fractalNoise" baseFrequency={hovered ? 0.1 : 0.05} numOctaves="4" result="noise" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale={hovered ? 15 : 7} xChannelSelector="R" yChannelSelector="G" />
            </filter>
            {epic && (
              <filter id="i-turbulence-2">
                <feTurbulence type="fractalNoise" baseFrequency={hovered ? 0.15 : 0.06} numOctaves="3" result="noise" />
                <feDisplacementMap in="SourceGraphic" in2="noise" scale={hovered ? 20 : 10} xChannelSelector="R" yChannelSelector="B" />
              </filter>
            )}
          </defs>

          {/* Static d, animate only transforms/opacities */}
          <path
            d="M50 4 C42 18 22 26 14 44 C6 62 14 80 28 90 C42 100 58 100 72 90 C86 80 94 62 86 44 C78 26 58 18 50 4Z"
            fill="url(#i-outer)"
            filter={epic ? "url(#i-turbulence-2)" : "url(#i-turbulence)"}
          />

          <motion.path
            d="M50 20 C44 30 30 34 26 48 C22 62 26 74 36 82 C46 90 54 90 64 82 C74 74 78 62 74 48 C70 34 56 30 50 20Z"
            fill="url(#i-core)"
            animate={{ scale: hovered ? [1, 1.15, 0.88, 1.08, 1] : [1, 1.05, 0.96, 1.02, 1], opacity: hovered ? [0.7, 1, 0.6, 0.9, 0.7] : [0.5, 0.9, 0.7, 1, 0.5] }}
            transition={{ duration: hovered ? 0.2 : 1, repeat: Infinity, ease: "easeInOut" }}
          />

          {epic && (
            <>
              <motion.path
                d="M50 8 L52 24 L59 20 L54 26 L61 30 L52 30 L50 36 L48 30 L39 30 L46 26 L41 20 L48 24Z"
                fill={C.yellow}
                opacity={0.4}
                animate={{ rotate: [0, 360], scale: [1, 1.2, 1] }}
                style={{ transformOrigin: "50px 50px" }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
              />
              <motion.path
                d="M50 12 L51 18 L56 16 L53 20 L58 22 L52 23 L50 28 L48 23 L42 22 L47 20 L44 16 L49 18Z"
                fill={C.amber}
                opacity={0.35}
                animate={{ rotate: [360, 0], scale: [1, 1.15, 1] }}
                style={{ transformOrigin: "50px 50px" }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "linear" }}
              />
              <motion.path
                d="M14 44 C18 38 24 34 30 32"
                fill="none"
                stroke={C.rose}
                strokeWidth="1"
                opacity={0.25}
                strokeDasharray="2 4"
                animate={{ opacity: [0.1, 0.4, 0.1] }}
                transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.path
                d="M86 44 C82 38 76 34 70 32"
                fill="none"
                stroke={C.orange}
                strokeWidth="1"
                opacity={0.25}
                strokeDasharray="3 5"
                animate={{ opacity: [0.1, 0.4, 0.1] }}
                transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
              />
            </>
          )}
        </svg>
      </motion.div>

      {Array.from({ length: epic ? 18 : 10 }).map((_, i) => {
        const angle = Math.random() * 360
        const rad = (angle * Math.PI) / 180
        const dist = hovered ? (epic ? 65 : 50) : (epic ? 50 : 38)
        const speed = hovered ? 0.4 + Math.random() * 0.3 : 0.8 + Math.random() * 0.5
        return (
          <motion.div
            key={i}
            className="absolute rounded-full pointer-events-none"
            style={{
              width: epic ? 3.5 : 2.5,
              height: epic ? 3.5 : 2.5,
              backgroundColor: [C.rose, C.orange, C.amber, C.yellow][i % 4],
              boxShadow: `0 0 ${epic ? 10 : 5}px ${[C.rose, C.orange, C.amber, C.yellow][i % 4]}, 0 0 ${epic ? 16 : 8}px ${[C.rose, C.orange, C.amber, C.yellow][i % 4]}40`,
              left: "50%",
              top: "50%",
            }}
            initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
            animate={{ x: [0, Math.cos(rad) * dist * 0.35, Math.cos(rad) * dist], y: [0, Math.sin(rad) * dist * 0.35 - dist * 0.15, Math.sin(rad) * dist - dist * 0.35], opacity: [hovered ? 1 : 0.8, 0.95, 0], scale: [0, 2, 0] }}
            transition={{ duration: speed, delay: i * (epic ? 0.06 : 0.1), repeat: Infinity, ease: "easeOut" }}
          />
        )
      })}
    </div>
  )
}

const ICON_MAP: Record<IconName, React.FC<{ size: number; intensity: "bold" | "epic"; hovered: boolean; glowColor: string }>> = {
  flame: FlameIcon,
  leaf: LeafIcon,
  planet: PlanetIcon,
  trophy: TrophyIcon,
  check: CheckIcon,
  impact: ImpactIcon,
}

export function AnimatedEcoIcon({
  name,
  size = 96,
  intensity = "bold",
  trigger = "always",
  glowColor = C.emerald,
  className = "",
}: AnimatedEcoIconProps) {
  useKeyframes()

  const { running, hovered, setHovered, setActive } = useAnimateTrigger(trigger)
  const IconComponent = ICON_MAP[name]

  const onMouseEnter = useCallback(() => setHovered(true), [setHovered])
  const onMouseLeave = useCallback(() => setHovered(false), [setHovered])

  useEffect(() => {
    if (trigger === "always") setActive(true)
  }, [trigger, setActive])

  return (
    <motion.div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{
        width: size,
        height: size,
        filter:
          intensity === "epic"
            ? "drop-shadow(0 0 10px rgba(16,185,129,0.25)) drop-shadow(0 0 24px rgba(16,185,129,0.12))"
            : "drop-shadow(0 0 8px rgba(16,185,129,0.18))",
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      initial={trigger === "onMount" ? { scale: 0, opacity: 0 } : undefined}
      animate={
        trigger === "onMount" && running
          ? { scale: 1, opacity: 1, transition: { type: "spring", stiffness: 240, damping: 18, delay: 0.08 } }
          : undefined
      }
      whileHover={trigger === "hover" ? { scale: 1.08 } : undefined}
    >
      {running && <IconComponent size={size} intensity={intensity} hovered={hovered} glowColor={glowColor} />}
    </motion.div>
  )
}


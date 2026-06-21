import React, { useEffect, useRef, useState } from "react"
import { Mesh, Program, Renderer, Triangle } from "ogl"

export interface EcoLineWavesProps {
  intensity?: "low" | "medium"
  vibrancy?: "low" | "medium" | "high"
  pageVariant?: "login" | "dashboard" | "wizard" | "results"
  overlayOpacity?: number
  speed?: number
  innerLineCount?: number
  outerLineCount?: number
  warpIntensity?: number
  rotation?: number
  edgeFadeWidth?: number
  colorCycleSpeed?: number
  brightness?: number
  color1?: string
  color2?: string
  color3?: string
  enableMouseInteraction?: boolean
  mouseInfluence?: number
  className?: string
}

const PALETTE = {
  login: { c1: "#10b981", c2: "#14b8a6", c3: "#67e8f9" },
  dashboard: { c1: "#10b981", c2: "#14b8a6", c3: "#67e8f9" },
  wizard: { c1: "#34d399", c2: "#2dd4bf", c3: "#67e8f9" },
  results: { c1: "#10b981", c2: "#14b8a6", c3: "#67e8f9" },
}

const VIBRANCY_PRESETS: Record<string, Partial<EcoLineWavesProps>> = {
  low: {
    brightness: 0.22,
    speed: 0.07,
    mouseInfluence: 1.35,
    warpIntensity: 0.55,
    colorCycleSpeed: 0.22,
  },
  medium: {
    brightness: 0.30,
    speed: 0.085,
    mouseInfluence: 1.35,
    warpIntensity: 0.65,
    colorCycleSpeed: 0.28,
  },
  high: {
    brightness: 0.38,
    speed: 0.10,
    mouseInfluence: 1.35,
    warpIntensity: 0.75,
    colorCycleSpeed: 0.34,
  },
}

const PAGE_VARIANT_SPEED: Record<string, number> = {
  login: 0.11,
  dashboard: 0.08,
  results: 0.09,
}

const PAGE_VARIANT_BRIGHTNESS: Record<string, number> = {
  login: 0.38,
  dashboard: 0.28,
  results: 0.32,
}

const PAGE_VARIANT_DRIFT: Record<string, number> = {
  login: 0.006,
  dashboard: 0.004,
  wizard: 0.003,
  results: 0.005,
}

const INTENSITY_MULTIPLIERS: Record<string, number> = {
  low: 0.7,
  medium: 1.0,
  high: 1.3,
}

function hexToVec3(hex: string): [number, number, number] {
  const h = hex.replace("#", "")
  return [
    parseInt(h.slice(0, 2), 16) / 255,
    parseInt(h.slice(2, 4), 16) / 255,
    parseInt(h.slice(4, 6), 16) / 255,
  ]
}

const vertexShader = `
attribute vec2 uv;
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0, 1);
}
`

const fragmentShader = `
precision highp float;

uniform float uTime;
uniform vec3 uResolution;
uniform float uSpeed;
uniform float uInnerLines;
uniform float uOuterLines;
uniform float uWarpIntensity;
uniform float uRotation;
uniform float uEdgeFadeWidth;
uniform float uColorCycleSpeed;
uniform float uBrightness;
uniform float uGlowPulse;
uniform float uVerticalDrift;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
uniform vec2 uMouse;
uniform float uMouseInfluence;
uniform bool uEnableMouse;

#define HALF_PI 1.5707963

float hashF(float n) {
  return fract(sin(n * 127.1) * 43758.5453123);
}

float smoothNoise(float x) {
  float i = floor(x);
  float f = fract(x);
  float u = f * f * (3.0 - 2.0 * f);
  return mix(hashF(i), hashF(i + 1.0), u);
}

float displaceA(float coord, float t) {
  float result = sin(coord * 2.123 + t * 0.7) * 0.25;
  result += sin(coord * 3.234 + t * 4.345) * 0.15;
  result += sin(coord * 0.589 + t * 0.934) * 0.5;
  return result;
}

float displaceB(float coord, float t) {
  float result = sin(coord * 1.345 + t * 0.5) * 0.35;
  result += sin(coord * 2.734 + t * 3.345) * 0.2;
  result += sin(coord * 0.189 + t * 0.934) * 0.3;
  return result;
}

vec2 rotate2D(vec2 p, float angle) {
  float c = cos(angle);
  float s = sin(angle);
  return vec2(p.x * c - p.y * s, p.x * s + p.y * c);
}

void main() {
  vec2 coords = gl_FragCoord.xy / uResolution.xy;
  coords = coords * 2.0 - 1.0;

  float aspect = uResolution.x / uResolution.y;
  coords.x *= aspect;

  coords = rotate2D(coords, uRotation);

  coords.y += uVerticalDrift * sin(uTime * uSpeed * 0.3);

  float halfT = uTime * uSpeed * 0.5;
  float fullT = uTime * uSpeed;

  float mouseWarp = 0.0;
  if (uEnableMouse) {
    vec2 mPos = rotate2D(uMouse * 2.0 - 1.0, uRotation);
    float mDist = length(coords - mPos);
    mouseWarp = uMouseInfluence * exp(-mDist * mDist * 3.5);
  }

  float warpAx = coords.x + displaceA(coords.y, halfT) * uWarpIntensity + mouseWarp;
  float warpAy = coords.y - displaceA(coords.x * cos(fullT * 1.235), halfT) * uWarpIntensity;
  float warpBx = coords.x + displaceB(coords.y, halfT) * uWarpIntensity + mouseWarp;
  float warpBy = coords.y - displaceB(coords.x * sin(fullT * 1.235), halfT) * uWarpIntensity;

  vec2 fieldA = vec2(warpAx, warpAy);
  vec2 fieldB = vec2(warpBx, warpBy);
  vec2 blended = mix(fieldA, fieldB, mix(fieldA, fieldB, 0.5));

  float fadeTop = smoothstep(uEdgeFadeWidth, uEdgeFadeWidth + 0.5, blended.y);
  float fadeBottom = smoothstep(-uEdgeFadeWidth, -(uEdgeFadeWidth + 0.5), blended.y);
  float vMask = 1.0 - max(fadeTop, fadeBottom);

  float tileCount = mix(uOuterLines, uInnerLines, vMask);
  float scaledY = blended.y * tileCount;
  float nY = smoothNoise(abs(scaledY));

  float ridge = pow(
    step(abs(nY - blended.x) * 2.0, HALF_PI) * cos(2.0 * (nY - blended.x)),
    4.0
  );

  float lines = 0.0;
  for (float i = 1.0; i < 3.0; i += 1.0) {
    lines += pow(max(fract(scaledY), fract(-scaledY)), i * 2.0);
  }

  float pattern = vMask * lines;

  float cycleT = fullT * uColorCycleSpeed;

  float glow = 0.5 + 0.5 * sin(uGlowPulse * uTime * 0.5);
  float lum = (pattern + lines * ridge * 1.2) * (cos(blended.y + cycleT * 0.4) * 0.4 + 1.0);
  lum *= (1.0 + glow * 0.3);

  float colorMixA = sin(blended.x * 2.5 + cycleT) * 0.5 + 0.5;
  float colorMixB = cos(blended.y * 2.5 + cycleT * 0.7) * 0.5 + 0.5;
  float colorMixC = sin((blended.x + blended.y) * 2.0 + cycleT * 0.5) * 0.5 + 0.5;

  vec3 mixedColor = uColor1 * colorMixA + uColor2 * colorMixB + uColor3 * colorMixC;
  mixedColor /= (colorMixA + colorMixB + colorMixC + 0.001);

  float glowBoost = 1.0 + glow * 0.4;
  vec3 col = lum * mixedColor * uBrightness * glowBoost;

  vec3 glowColor = mixedColor * uBrightness * 0.12 * glow;
  col += glowColor;

  float alpha = clamp(length(col) * 6.0, 0.0, 1.0);

  gl_FragColor = vec4(col, alpha);
}
`

function useIsClient() {
  const [isClient, setIsClient] = useState(false)
  useEffect(() => setIsClient(true), [])
  return isClient
}

export const EcoLineWaves = React.memo(function EcoLineWaves({
  intensity = "medium",
  vibrancy = "medium",
  pageVariant = "login",
  overlayOpacity = 0.06,
  speed,
  innerLineCount = 40,
  outerLineCount = 48,
  warpIntensity,
  rotation = -40,
  edgeFadeWidth = 0.1,
  colorCycleSpeed,
  brightness,
  color1,
  color2,
  color3,
  enableMouseInteraction = true,
  mouseInfluence,
  className = "",
}: EcoLineWavesProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [reduceMotion, setReduceMotion] = useState(false)
  const mountedRef = useRef(true)
  const isClient = useIsClient()

  const variantColors = PALETTE[pageVariant]
  const vibrancyPreset = VIBRANCY_PRESETS[vibrancy]
  const intensityMult = INTENSITY_MULTIPLIERS[intensity]

  const variantSpeed = PAGE_VARIANT_SPEED[pageVariant]
  const variantBrightness = PAGE_VARIANT_BRIGHTNESS[pageVariant]
  const variantDrift = PAGE_VARIANT_DRIFT[pageVariant] ?? 0.003

  const configRef = useRef({
    speed: reduceMotion ? 0.05 : (speed ?? vibrancyPreset.speed ?? variantSpeed ?? 0.085),
    warp: (warpIntensity ?? vibrancyPreset.warpIntensity ?? 0.65) * intensityMult,
    brightness: (brightness ?? vibrancyPreset.brightness ?? variantBrightness ?? 0.30) * intensityMult,
    colorCycle: colorCycleSpeed ?? vibrancyPreset.colorCycleSpeed ?? 0.28,
    mouseInf: (mouseInfluence ?? vibrancyPreset.mouseInfluence ?? 1.35) * intensityMult,
    glowPulse: 1.0 + intensityMult * 0.6,
    drift: variantDrift * intensityMult,
    innerLines: innerLineCount,
    outerLines: outerLineCount,
    edgeFade: edgeFadeWidth,
    rotRad: (rotation * Math.PI) / 180,
    c1: hexToVec3(color1 ?? variantColors.c1),
    c2: hexToVec3(color2 ?? variantColors.c2),
    c3: hexToVec3(color3 ?? variantColors.c3),
    enableMouse: enableMouseInteraction,
  })

  configRef.current = {
    speed: reduceMotion ? 0.05 : (speed ?? vibrancyPreset.speed ?? variantSpeed ?? 0.085),
    warp: (warpIntensity ?? vibrancyPreset.warpIntensity ?? 0.65) * intensityMult,
    brightness: (brightness ?? vibrancyPreset.brightness ?? variantBrightness ?? 0.30) * intensityMult,
    colorCycle: colorCycleSpeed ?? vibrancyPreset.colorCycleSpeed ?? 0.28,
    mouseInf: (mouseInfluence ?? vibrancyPreset.mouseInfluence ?? 1.35) * intensityMult,
    glowPulse: 1.0 + intensityMult * 0.6,
    drift: variantDrift * intensityMult,
    innerLines: innerLineCount,
    outerLines: outerLineCount,
    edgeFade: edgeFadeWidth,
    rotRad: (rotation * Math.PI) / 180,
    c1: hexToVec3(color1 ?? variantColors.c1),
    c2: hexToVec3(color2 ?? variantColors.c2),
    c3: hexToVec3(color3 ?? variantColors.c3),
    enableMouse: enableMouseInteraction,
  }

  useEffect(() => {
    mountedRef.current = true
    return () => { mountedRef.current = false }
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    const update = () => { if (mountedRef.current) setReduceMotion(mq.matches) }
    update()
    mq.addEventListener("change", update)
    return () => mq.removeEventListener("change", update)
  }, [])

  useEffect(() => {
    if (typeof document === "undefined") return
    if (document.getElementById("eco-waves-style")) return
    const style = document.createElement("style")
    style.id = "eco-waves-style"
    style.textContent = `
      @keyframes ecoBreath {
        0%, 100% { opacity: 0.85; }
        50% { opacity: 1; }
      }
    `
    document.head.appendChild(style)
  }, [])

  useEffect(() => {
    if (!containerRef.current) return
    const container = containerRef.current
    const renderer = new Renderer({ alpha: true, premultipliedAlpha: false })
    const gl = renderer.gl
    gl.clearColor(0, 0, 0, 0)

    const currentMouse = [0.5, 0.5]
    const targetMouse = [0.5, 0.5]
    let rafMousePending = false

    function handleMouseMove(e: MouseEvent) {
      if (!mountedRef.current) return
      if (rafMousePending) return
      rafMousePending = true
      requestAnimationFrame(() => {
        rafMousePending = false
        if (!containerRef.current) return
        const rect = containerRef.current.getBoundingClientRect()
        targetMouse[0] = (e.clientX - rect.left) / rect.width
        targetMouse[1] = 1.0 - (e.clientY - rect.top) / rect.height
      })
    }

    function handleMouseLeave() {
      targetMouse[0] = 0.5
      targetMouse[1] = 0.5
    }

    const geometry = new Triangle(gl)

    function buildProgram() {
      const cfg = configRef.current
      return new Program(gl, {
        vertex: vertexShader,
        fragment: fragmentShader,
        uniforms: {
          uTime: { value: 0 },
          uResolution: { value: [gl.canvas.width, gl.canvas.height, gl.canvas.width / gl.canvas.height] },
          uSpeed: { value: cfg.speed },
          uInnerLines: { value: cfg.innerLines },
          uOuterLines: { value: cfg.outerLines },
          uWarpIntensity: { value: cfg.warp },
          uRotation: { value: cfg.rotRad },
          uEdgeFadeWidth: { value: cfg.edgeFade },
          uColorCycleSpeed: { value: cfg.colorCycle },
          uBrightness: { value: cfg.brightness },
          uGlowPulse: { value: cfg.glowPulse },
          uVerticalDrift: { value: cfg.drift },
          uColor1: { value: cfg.c1 },
          uColor2: { value: cfg.c2 },
          uColor3: { value: cfg.c3 },
          uMouse: { value: new Float32Array([0.5, 0.5]) },
          uMouseInfluence: { value: cfg.mouseInf },
          uEnableMouse: { value: cfg.enableMouse },
        },
      })
    }

    let program = buildProgram()

    function resize() {
      const w = container.offsetWidth
      const h = container.offsetHeight
      if (w === 0 || h === 0) return
      renderer.setSize(w, h)
      program.uniforms.uResolution.value = [
        gl.canvas.width,
        gl.canvas.height,
        gl.canvas.width / gl.canvas.height,
      ]
    }

    const ro = new ResizeObserver(() => resize())
    ro.observe(container)
    resize()

    const mesh = new Mesh(gl, { geometry, program })
    gl.canvas.style.position = 'absolute'
    gl.canvas.style.inset = '0'
    container.appendChild(gl.canvas)

    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mouseleave", handleMouseLeave)

    let animationFrameId: number | null = null
    let visible = true

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          visible = e.isIntersecting
          if (visible && animationFrameId === null) {
            animationFrameId = requestAnimationFrame(update)
          }
        }
      },
      { threshold: 0 },
    )
    io.observe(container)

    const mouseSmooth = 0.05

    function update(time: number) {
      if (!mountedRef.current || !visible) {
        animationFrameId = null
        return
      }
      animationFrameId = requestAnimationFrame(update)
      const cfg = configRef.current

      program.uniforms.uTime.value = time * 0.001
      program.uniforms.uSpeed.value = cfg.speed
      program.uniforms.uWarpIntensity.value = cfg.warp
      program.uniforms.uBrightness.value = cfg.brightness
      program.uniforms.uColorCycleSpeed.value = cfg.colorCycle
      program.uniforms.uGlowPulse.value = cfg.glowPulse
      program.uniforms.uVerticalDrift.value = cfg.drift
      program.uniforms.uMouseInfluence.value = cfg.mouseInf
      program.uniforms.uColor1.value = cfg.c1
      program.uniforms.uColor2.value = cfg.c2
      program.uniforms.uColor3.value = cfg.c3

      if (cfg.enableMouse) {
        currentMouse[0] += mouseSmooth * (targetMouse[0] - currentMouse[0])
        currentMouse[1] += mouseSmooth * (targetMouse[1] - currentMouse[1])
        program.uniforms.uMouse.value[0] = currentMouse[0]
        program.uniforms.uMouse.value[1] = currentMouse[1]
      } else {
        program.uniforms.uMouse.value[0] = 0.5
        program.uniforms.uMouse.value[1] = 0.5
      }

      renderer.render({ scene: mesh })
    }

    animationFrameId = requestAnimationFrame(update)

    return () => {
      mountedRef.current = false
      if (animationFrameId !== null) cancelAnimationFrame(animationFrameId)
      io.disconnect()
      ro.disconnect()
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseleave", handleMouseLeave)
      if (gl.canvas.parentNode === container) {
        container.removeChild(gl.canvas)
      }
      gl.getExtension("WEBGL_lose_context")?.loseContext()
    }
  }, [])

  if (!isClient) {
    return (
      <div
        className={`absolute inset-0 pointer-events-none bg-gradient-to-b from-slate-950 via-emerald-950/5 to-slate-950 ${className}`}
        aria-hidden
      />
    )
  }

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 pointer-events-none bg-gradient-to-b from-slate-950 via-emerald-950/5 to-slate-950 ${className}`}
      style={{ animation: reduceMotion ? 'none' : 'ecoBreath 8s ease-in-out infinite' }}
      aria-hidden
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: overlayOpacity,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "200px 200px",
          mixBlendMode: "overlay" as const,
          zIndex: 1,
        }}
      />
    </div>
  )
})

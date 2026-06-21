/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        eco: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
          950: '#022c22',
        },
      },
      fontFamily: {
        display: ['Outfit', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        body: ['Nunito', 'system-ui', '-apple-system', 'sans-serif'],
      },
      animation: {
        'spin-slow': 'spin 8s linear infinite',
        'spin-slower': 'spin 12s linear infinite',
        'pulse-soft': 'pulse 4s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float 8s ease-in-out infinite',
        'drift': 'drift 20s linear infinite',
        'scan': 'scan 4s ease-in-out infinite',
        'shimmer': 'shimmer 3s ease-in-out infinite',
        'sheen': 'sheen 2s linear infinite',
        'light-ray': 'light-ray 6s ease-in-out infinite',
        'grain': 'grain 0.5s steps(4) infinite',
        'border-rotate': 'border-rotate 4s linear infinite',
        'liquid-fill': 'liquid-fill 3s ease-in-out infinite',
        'leaf-rise': 'leaf-rise 4s ease-out infinite',
        'streak-pulse': 'streak-pulse 2s ease-in-out infinite',
        'confetti-fall': 'confetti-fall 3s ease-out forwards',
        'ripple': 'ripple 0.6s ease-out forwards',
        'focus-blur': 'focus-blur 2.5s ease-in-out infinite',
        'letter-space': 'letter-space 1.2s ease-out forwards',
        'text-glitch': 'text-glitch 0.3s ease-in-out 3',
        'number-glitch': 'number-glitch 0.25s ease-in-out 2',
        'organic-drift': 'organic-drift 12s ease-in-out infinite',
        'glass-breathe': 'glass-breathe 6s ease-in-out infinite',
        'noise-shift': 'noise-shift 0.8s steps(3) infinite',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(16, 185, 129, 0.15)' },
          '50%': { boxShadow: '0 0 40px rgba(16, 185, 129, 0.3)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-20px) rotate(2deg)' },
        },
        'float-slow': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        drift: {
          '0%': { transform: 'translateX(-10%)' },
          '100%': { transform: 'translateX(110%)' },
        },
        scan: {
          '0%, 100%': { transform: 'translateX(-100%)' },
          '50%': { transform: 'translateX(100%)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        sheen: {
          '0%': { transform: 'translateX(-100%) skewX(-20deg)' },
          '100%': { transform: 'translateX(200%) skewX(-20deg)' },
        },
        'light-ray': {
          '0%, 100%': { opacity: '0', transform: 'scaleY(0.8)' },
          '50%': { opacity: '0.6', transform: 'scaleY(1)' },
        },
        grain: {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '25%': { transform: 'translate(-5%, 5%)' },
          '50%': { transform: 'translate(5%, -5%)' },
          '75%': { transform: 'translate(-3%, -2%)' },
        },
        'border-rotate': {
          '0%': { '--angle': '0deg' },
          '100%': { '--angle': '360deg' },
        },
        'liquid-fill': {
          '0%, 100%': { transform: 'translateX(-100%) scaleY(1)' },
          '50%': { transform: 'translateX(0%) scaleY(1.5)' },
        },
        'leaf-rise': {
          '0%': { transform: 'translateY(20px) scale(0.5)', opacity: '0' },
          '50%': { opacity: '1' },
          '100%': { transform: 'translateY(-40px) scale(1)', opacity: '0' },
        },
        'streak-pulse': {
          '0%, 100%': { transform: 'scale(1)', boxShadow: '0 0 0 0 rgba(239, 68, 68, 0.4)' },
          '50%': { transform: 'scale(1.05)', boxShadow: '0 0 0 10px rgba(239, 68, 68, 0)' },
        },
        'confetti-fall': {
          '0%': { transform: 'translateY(-20px) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(100px) rotate(720deg)', opacity: '0' },
        },
        ripple: {
          '0%': { transform: 'scale(0)', opacity: '0.5' },
          '100%': { transform: 'scale(4)', opacity: '0' },
        },
        'focus-blur': {
          '0%, 100%': { filter: 'blur(4px)', opacity: '0.3' },
          '50%': { filter: 'blur(0px)', opacity: '1' },
        },
        'letter-space': {
          '0%': { letterSpacing: '-0.05em', opacity: '0' },
          '100%': { letterSpacing: '0.02em', opacity: '1' },
        },
        'text-glitch': {
          '0%': { transform: 'translate(0)', filter: 'none' },
          '20%': { transform: 'translate(-2px, 1px)', filter: 'hue-rotate(90deg)' },
          '40%': { transform: 'translate(2px, -1px)', filter: 'hue-rotate(-90deg)' },
          '60%': { transform: 'translate(-1px, 2px)', filter: 'none' },
          '80%': { transform: 'translate(1px, -2px)', filter: 'hue-rotate(45deg)' },
          '100%': { transform: 'translate(0)', filter: 'none' },
        },
        'number-glitch': {
          '0%': { transform: 'translate(0) scale(1)', opacity: '1' },
          '25%': { transform: 'translate(1px, -1px) scale(1.01)', opacity: '0.7', clipPath: 'inset(20% 0 60% 0)' },
          '50%': { transform: 'translate(-1px, 1px) scale(0.99)', opacity: '0.8', clipPath: 'inset(60% 0 20% 0)' },
          '75%': { transform: 'translate(2px, 0) scale(1.005)', opacity: '0.9', clipPath: 'inset(0 20% 0 60%)' },
          '100%': { transform: 'translate(0) scale(1)', opacity: '1', clipPath: 'inset(0)' },
        },
        'organic-drift': {
          '0%, 100%': { transform: 'translate(0px, 0px) scale(1)' },
          '25%': { transform: 'translate(3px, -4px) scale(1.01)' },
          '50%': { transform: 'translate(-2px, 3px) scale(0.99)' },
          '75%': { transform: 'translate(4px, 2px) scale(1.005)' },
        },
        'glass-breathe': {
          '0%, 100%': { backdropFilter: 'blur(20px)', background: 'rgba(255,255,255,0.04)' },
          '50%': { backdropFilter: 'blur(28px)', background: 'rgba(255,255,255,0.07)' },
        },
        'noise-shift': {
          '0%': { transform: 'translate(0, 0)' },
          '33%': { transform: 'translate(-10%, 5%)' },
          '66%': { transform: 'translate(5%, -10%)' },
        },
        'glow-pulse': {
          '0%, 100%': { textShadow: '0 0 20px rgba(16,185,129,0.3), 0 0 40px rgba(16,185,129,0.1)' },
          '50%': { textShadow: '0 0 30px rgba(16,185,129,0.5), 0 0 60px rgba(16,185,129,0.2), 0 0 80px rgba(20,184,166,0.1)' },
        },
      },
    },
  },
  plugins: [],
}

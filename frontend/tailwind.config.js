/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkBg: '#030712',
        darkNavy: '#070b16',
        neonCyan: '#22d3ee',
        neonViolet: '#a78bfa',
        neonBlue: '#3b82f6',
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      },
      boxShadow: {
        'glass': '0 20px 60px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.06)',
        'neo': '10px 10px 28px rgba(0, 0, 0, 0.55), -8px -8px 24px rgba(30, 41, 59, 0.22), inset 1px 1px 0 rgba(255, 255, 255, 0.035)',
        'neo-btn': '8px 8px 18px rgba(0, 0, 0, 0.55), -5px -5px 14px rgba(30, 41, 59, 0.22), inset 1px 1px 0 rgba(255, 255, 255, 0.045)',
        'glow-cyan': '0 0 24px rgba(34, 211, 238, 0.22)',
        'glow-violet': '0 0 24px rgba(167, 139, 250, 0.22)',
      },
      animation: {
        'pulse-slow': 'pulse 8s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'float-delayed': 'float 6s ease-in-out infinite 3s',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-15px)' },
        }
      }
    },
  },
  plugins: [],
}

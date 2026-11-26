/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sakra: {
          deep: '#0F2A24',       // Primary deep forest green
          forest: '#193D32',     // Secondary forest green
          forestLight: '#245244',
          ivory: '#F8F3E8',      // Warm ivory page background
          cream: '#F2E9D8',      // Soft cream surface
          creamLight: '#FAF6EE',
          gold: '#C9A568',       // Antique gold accent
          goldLight: '#E5D7BB',  // Light gold borders
          goldDark: '#A88247',
          dark: '#172820',       // Main text
          muted: '#726B5D',      // Secondary text
          subtle: '#9A9283',
          border: '#E5D7BB',
          gain: '#26754D',       // Restrained green
          loss: '#B84B43',       // Muted brick red
        }
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', '"DM Serif Display"', 'Georgia', 'serif'],
        sans: ['Inter', 'Manrope', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'Menlo', 'monospace'],
      },
      boxShadow: {
        'sakra-subtle': '0 2px 8px -2px rgba(15, 42, 36, 0.05), 0 1px 4px -1px rgba(15, 42, 36, 0.03)',
        'sakra-card': '0 4px 16px -4px rgba(15, 42, 36, 0.07), 0 2px 6px -2px rgba(15, 42, 36, 0.04)',
        'sakra-elevated': '0 12px 28px -6px rgba(15, 42, 36, 0.12), 0 4px 10px -2px rgba(15, 42, 36, 0.06)',
      }
    },
  },
  plugins: [],
}

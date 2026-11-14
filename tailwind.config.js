/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        game: {
          darkest: '#080c14',
          bg: '#0d101a',
          panel: '#151824',
          card: '#1a1d2b',
          border: '#212433',
          borderLight: '#2c3144',
          textMuted: '#8e95ac',
          textBright: '#e8ecf4',
          gold: '#ffcb05',
          green: '#34d399',
          red: '#e3353b',
          blue: '#3b82f6',
        }
      },
      fontFamily: {
        pixel: ['"Press Start 2P"', 'monospace', 'sans-serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

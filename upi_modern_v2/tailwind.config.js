/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        mono: ['Space Mono', 'monospace'],
        sans: ['Syne', 'sans-serif'],
      },
      colors: {
        teal: {
          DEFAULT: '#00d4aa',
          dim: '#00a887',
        },
        navy: {
          DEFAULT: '#050d1a',
          2: '#0a1628',
          3: '#0f2040',
          card: '#0d1f38',
          border: '#1e3050',
        },
        primary: {
          50: '#e6faf6',
          100: '#b3f0e4',
          200: '#80e6d2',
          300: '#4ddcc0',
          400: '#26d4b4',
          500: '#00d4aa',
          600: '#00a887',
          700: '#007a61',
          800: '#004c3c',
          900: '#002e24',
        },
        danger: '#ff4757',
        success: '#2ed573',
        warning: '#ffa502',
      },
      boxShadow: {
        'teal-sm': '0 0 10px rgba(0,212,170,0.15)',
        'card': '0 4px 24px rgba(0,0,0,0.3)',
        'card-lg': '0 8px 48px rgba(0,0,0,0.4)',
      },
      backgroundImage: {
        'grid-pattern': "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%231e3050' stroke-width='0.5'%3E%3Crect width='40' height='40'/%3E%3C/g%3E%3C/svg%3E\")",
      },
      animation: {
        float: 'float 4s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
    },
  },
  plugins: [],
}

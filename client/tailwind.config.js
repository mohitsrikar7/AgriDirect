/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        surface: {
          DEFAULT: '#F9FAFB',
          light: '#f5f5f0',
          alt: '#F3F4F6',
          card: '#ffffff',
        },
        brand: {
          DEFAULT: '#16A34A',
          light: '#22c55e',
          dark: '#15803d',
          muted: '#6b7280',
        },
        accent: {
          DEFAULT: '#F97316',
          light: '#fb923c',
          muted: '#fff7ed',
          dark: '#ea580c',
        },
        border: {
          DEFAULT: '#e5e7eb',
          light: '#f3f4f6',
        },
      },
      keyframes: {
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
      },
      animation: {
        'slide-up': 'slide-up 0.4s ease-out',
        shimmer: 'shimmer 1.5s infinite',
      },
    },
  },
  plugins: [],
};
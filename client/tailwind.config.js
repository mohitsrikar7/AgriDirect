/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        surface: {
          DEFAULT: '#f5f5f0',
          light: '#fafaf7',
          card: '#ffffff',
        },
        brand: {
          DEFAULT: '#1a1a1a',
          light: '#333333',
          muted: '#6b6b63',
        },
        accent: {
          DEFAULT: '#2d5a3d',
          light: '#3a7550',
          muted: '#e8f0eb',
          dark: '#1d3d2a',
        },
        border: {
          DEFAULT: '#e8e8e3',
          light: '#f0f0eb',
        },
      },
    },
  },
  plugins: [],
};
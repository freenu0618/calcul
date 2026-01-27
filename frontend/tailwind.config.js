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
        primary: {
          DEFAULT: '#0dba7d',
          50: '#ecfdf5',
          100: '#d1fae5',
          500: '#0dba7d',
          600: '#0a9664',
          700: '#087a52',
          800: '#065f40',
          900: '#04452e',
        },
        secondary: {
          DEFAULT: '#1e3fae',
          50: '#f0f4ff',
          100: '#e0e8ff',
          500: '#1e3fae',
          600: '#1a369a',
        },
        background: {
          light: '#f6f6f8',
          dark: '#10221c',
        },
        'text-main': '#0d1c17',
        'text-sub': '#4b5563',
      },
      fontFamily: {
        display: ['Public Sans', 'Noto Sans KR', 'sans-serif'],
        sans: ['Public Sans', 'Noto Sans KR', 'sans-serif'],
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'float-delayed': 'float 3s ease-in-out 1.5s infinite',
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

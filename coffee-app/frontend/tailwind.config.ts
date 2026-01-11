import type { Config } from 'tailwindcss'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        coffee: {
          50: '#faf8f6',
          100: '#f5f1ed',
          200: '#ebe3dc',
          300: '#ddd1c4',
          400: '#c9b5a8',
          500: '#b5998c',
          600: '#9d7f70',
          700: '#7d6552',
          800: '#5c4d40',
          900: '#3d342d',
        }
      }
    },
  },
  plugins: [],
} satisfies Config
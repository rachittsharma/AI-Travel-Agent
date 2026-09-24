/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f7ff',
          100: '#e0effe',
          500: '#0284c7',
          600: '#0265d2',
          700: '#034fa6',
          900: '#0c2a4d',
        },
        dark: {
          bg: '#0b0f19',
          card: '#131b2e',
          border: '#1f2d4d',
        }
      },
    },
  },
  plugins: [],
}

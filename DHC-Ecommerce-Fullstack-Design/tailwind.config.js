/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-blue': '#0d6efd',
        'brand-orange': '#ff9017',
        'brand-green': '#00b517',
        'brand-red': '#fa3434',
        'brand-dark': '#1c1c1c',
        'brand-gray': '#8b96a5',
        'bg-main': '#f7f7f7',
      },
    },
  },
  plugins: [],
}

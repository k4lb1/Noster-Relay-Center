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
        surface: 'var(--bg-secondary)',
        muted: 'var(--text-muted)',
      },
    },
  },
  plugins: [],
}

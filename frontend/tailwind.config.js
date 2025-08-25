/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class', // <-- important for class-based dark mode
  theme: {
    extend: {},
  },
  plugins: [],
}

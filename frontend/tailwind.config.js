/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",               // if you have Vite or CRA with public/index.html
    "./src/**/*.{js,jsx,ts,tsx}", // scans all React components
  ],
  darkMode: "class", // ✅ allows manual dark mode via adding 'dark' class to <html>
  theme: {
    extend: {}, // extend Tailwind defaults (colors, fonts, etc.)
  },
  plugins: [], // add shadcn/ui plugins here later if needed
};

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      boxShadow: {
        "btn": '4px 4px 0px 0px rgba(0, 0, 0, 0.95)'
      }
    },
  },
  plugins: [],
}

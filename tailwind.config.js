/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      boxShadow: {
        'btn': '2px 2px 0px 0px rgba(0, 0, 0, 0.95)'
      }
    },
  },
  plugins: [],
};

/** @type {import('tailwindcss').Config} */
const forms = require('@tailwindcss/forms');
const typography = require('@tailwindcss/typography');
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Include all your React files
    "./public/index.html",        // Include your HTML files
  ],
  theme: {
    extend: {},
  },
  plugins: [forms, typography],
};


/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        peplos: {
          pink: '#E882B4',
          blue: '#6EB5FF',
          lime: '#B4E882',
          bg: '#FAF7F5',
        },
      },
    },
  },
  plugins: [],
};

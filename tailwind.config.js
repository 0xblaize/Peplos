/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        peplos: {
          pink: '#E882B4',
          blue: '#6EB5FF',
          lime: '#B4E882',
          bg: '#FAF7F5',
          ink: '#171516',
          muted: '#777071',
          panel: '#F2ECE8',
          line: '#E7DFDA',
          night: '#161415',
        },
      },
      boxShadow: {
        soft: '0 18px 60px rgba(53, 35, 29, 0.08)',
        card: '0 10px 30px rgba(53, 35, 29, 0.08)',
      },
      borderRadius: {
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
};

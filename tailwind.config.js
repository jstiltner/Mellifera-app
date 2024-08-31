/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  theme: {
    extend: {
      colors: {
        honey: {
          light: '#FFA500',
          DEFAULT: '#FFD700',
          dark: '#FF8C00',
        },
        hive: {
          light: '#F4E0B9',
          DEFAULT: '#E6CC95',
          dark: '#D8B671',
        },
        bee: {
          light: '#F5E050',
          DEFAULT: '#FFD700',
          dark: '#DAA520',
        },
      },
    },
  },
  plugins: [],
};

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#102A43',
          light: '#243B53',
          dark: '#071B31',
        },
        paper: '#F6F9FC',
        marigold: {
          DEFAULT: '#14B8A6',
          dark: '#0F8F82',
        },
        vermilion: '#E76F51',
        moss: '#198754',
        line: '#D9E2EC',
      },
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        body: ['"Inter"', 'sans-serif'],
      },
      borderRadius: {
        sm: '3px',
        DEFAULT: '4px',
        md: '6px',
        lg: '10px',
      },
    },
  },
  plugins: [],
};

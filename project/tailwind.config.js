/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      keyframes: {
        slideDown: {
          '0%':   { opacity: '0', transform: 'translateX(-50%) translateY(-12px)' },
          '100%': { opacity: '1', transform: 'translateX(-50%) translateY(0)' },
        },
        fadeOut: {
          '0%':   { opacity: '1' },
          '100%': { opacity: '0' },
        },
      },
      animation: {
        'slideDown': 'slideDown 0.3s ease-out',
      },
    },
  },
  plugins: [],
};

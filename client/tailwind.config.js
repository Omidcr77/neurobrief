module.exports = {
    content: ['./src/**/*.{js,jsx,ts,tsx}'],
    theme: { extend: {} },
    plugins: [],
    theme: {
      extend: {
        backgroundImage: {
          'hero-pattern': "url('/images/hero.jpg')"
        }
      }
    },
    darkMode: 'class',
    plugins: [ require('@tailwindcss/line-clamp') ],
  };
   
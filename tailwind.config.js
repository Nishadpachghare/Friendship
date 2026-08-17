/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0a0a0a',       // near-black background
        ink2: '#131313',      // card background
        parchment: '#f5f2ea', // off-white
        gold: {
          DEFAULT: '#c9a227',
          light: '#e8c468',
          dim: '#8a7530',
        },
        ash: '#8a8578',
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'serif'],
        body: ['"Inter"', 'sans-serif'],
      },
      backgroundImage: {
        'gold-fade': 'linear-gradient(180deg, rgba(201,162,39,0.0) 0%, rgba(201,162,39,0.55) 50%, rgba(201,162,39,0.0) 100%)',
      },
      boxShadow: {
        goldglow: '0 0 40px rgba(201,162,39,0.15)',
      },
      keyframes: {
        drift: {
          '0%,100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '200% 50%' },
        },
      },
      animation: {
        drift: 'drift 6s ease-in-out infinite',
        shimmer: 'shimmer 3s linear infinite',
      },
    },
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'scan': 'scan 10s linear infinite',
        'pulse-emerald': 'emerald-glow 3s ease-in-out infinite',
      },
      keyframes: {
        scan: {
          '0%': { backgroundPosition: '0 0' },
          '100%': { backgroundPosition: '50px 50px' },
        },
        'emerald-glow': {
          '0%, 100%': { 
            opacity: '1',
            filter: 'brightness(1) drop-shadow(0 0 5px rgba(16, 185, 129, 0.4))' 
          },
          '50%': { 
            opacity: '0.8',
            filter: 'brightness(1.3) drop-shadow(0 0 15px rgba(16, 185, 129, 0.7))' 
          },
        },
      },
    },
  },
  plugins: [],
}
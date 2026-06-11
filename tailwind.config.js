/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0066FF',
        'primary-dark': '#0048CC',
        'gray-light': '#F5F7FA',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        'card': '16px',
        'input': '12px',
        'button': '14px',
        'pill': '50px',
      },
      boxShadow: {
        'card-blue': '0 4px 20px rgba(0,102,255,0.15)',
        'card-white': '0 2px 10px rgba(0,0,0,0.08)',
        'button': '0 4px 15px rgba(0,102,255,0.3)',
        'nav': '0 -2px 10px rgba(0,0,0,0.06)',
        'iphone': '0 25px 60px rgba(0,0,0,0.3)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          50: '#f4f6f7',
          100: '#e4eaec',
          200: '#c4d0d5',
          300: '#99aeb7',
          400: '#6f8996',
          500: '#4e6675',
          600: '#3c4f5c',
          700: '#2f3f49',
          800: '#243239',
          900: '#1a2429'
        },
        sun: {
          100: '#fff2c8',
          200: '#ffe18a',
          300: '#ffcf4d',
          400: '#ffba1f',
          500: '#f2a100'
        },
        tide: {
          100: '#dff5f6',
          200: '#b5e6ea',
          300: '#7bd1d9',
          400: '#43b4c3',
          500: '#1f8f9f'
        }
      },
      fontFamily: {
        display: ['"Trebuchet MS"', '"Lucida Sans Unicode"', '"Lucida Grande"', '"Lucida Sans"', 'Tahoma', 'sans-serif'],
        body: ['"Lucida Sans"', '"Lucida Grande"', 'Tahoma', '"Trebuchet MS"', 'sans-serif']
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(255, 255, 255, 0.08), 0 12px 40px rgba(10, 17, 20, 0.35)',
        lift: '0 12px 30px rgba(15, 23, 26, 0.25)'
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        shimmer: {
          '0%': { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '200% 50%' }
        },
        rise: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        }
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        shimmer: 'shimmer 8s linear infinite',
        rise: 'rise 0.6s ease-out both'
      }
    }
  },
  plugins: []
}

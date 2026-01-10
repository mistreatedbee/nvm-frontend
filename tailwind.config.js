/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        nvm: {
          green: {
            50: '#f0fdf4',
            100: '#dcfce7',
            200: '#bbf7d0',
            300: '#86efac',
            400: '#4ade80',
            500: '#2D6A4F',
            600: '#1e4d37',
            700: '#164031',
            800: '#0f3328',
            900: '#0a2419',
            primary: '#2D6A4F',
            light: '#52B788',
            dark: '#1e4d37',
            bg: '#f0fdf4',
          },
          gold: {
            50: '#fefce8',
            100: '#fef9c3',
            200: '#fef08a',
            300: '#fde047',
            400: '#D4AF37',
            500: '#ca8a04',
            600: '#a16207',
            700: '#854d0e',
            800: '#713f12',
            900: '#422006',
            primary: '#D4AF37',
            light: '#F4E5AD',
            dark: '#a16207',
            bg: '#fefce8',
          },
          orange: {
            400: '#FF8C42',
            500: '#FF6B35',
            600: '#E85D2A',
            primary: '#FF6B35',
            light: '#FFB088',
          },
          red: {
            400: '#EF4444',
            500: '#DC2626',
            600: '#B91C1C',
            primary: '#DC2626',
          },
          earth: {
            terracotta: '#D2691E',
            ochre: '#CC7722',
            sienna: '#A0522D',
            sand: '#F4E4BC',
          },
          accent: {
            indigo: '#4F46E5',
            purple: '#7C3AED',
            blue: '#3B82F6',
            orange: '#FF6B35',
            teal: '#14B8A6',
          },
          dark: {
            900: '#111827',
            800: '#1F2937',
            700: '#374151',
          }
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.5s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'bounce-in': 'bounceIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'shimmer': 'shimmer 2s linear infinite',
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
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        bounceIn: {
          '0%': { transform: 'scale(0.3)', opacity: '0' },
          '50%': { transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      }
    },
  },
  plugins: [],
}

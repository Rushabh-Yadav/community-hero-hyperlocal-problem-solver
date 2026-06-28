/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Material Design 3 System Tokens (Custom Hybrid Theme)
        primary: {
          light: '#0061A4',
          DEFAULT: '#1E88E5',
          dark: '#9ECAFF',
        },
        secondary: {
          light: '#535F70',
          DEFAULT: '#26A69A',
          dark: '#BAC8DB',
        },
        tertiary: {
          light: '#6B5778',
          DEFAULT: '#7C4DFF',
          dark: '#D7BAE6',
        },
        background: {
          light: '#F8F9FA',
          DEFAULT: '#121212',
          dark: '#0C0C0E',
        },
        surface: {
          light: '#FFFFFF',
          DEFAULT: '#1E1E24',
          dark: '#16161A',
        },
        error: {
          light: '#BA1A1A',
          DEFAULT: '#EF5350',
          dark: '#FFB4AB',
        },
        success: {
          light: '#2E7D32',
          DEFAULT: '#66BB6A',
          dark: '#81C784',
        },
        warning: {
          light: '#EF6C00',
          DEFAULT: '#FFA726',
          dark: '#FFB74D',
        },
        info: {
          light: '#0288D1',
          DEFAULT: '#29B6F6',
          dark: '#4FC3F7',
        },
        // Premium Slate & Neutral Borders
        neutral: {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
          950: '#030712',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'glass-light': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
        'glass-dark': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'm3-elevation-1': '0px 1px 3px 1px rgba(0, 0, 0, 0.15), 0px 1px 2px 0px rgba(0, 0, 0, 0.30)',
        'm3-elevation-2': '0px 2px 6px 2px rgba(0, 0, 0, 0.15), 0px 1px 2px 0px rgba(0, 0, 0, 0.30)',
        'm3-elevation-3': '0px 1px 3px 0px rgba(0, 0, 0, 0.3), 0px 4px 8px 3px rgba(0, 0, 0, 0.15)',
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        shimmer: 'shimmer 2.5s infinite linear',
        'fade-in': 'fadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards',
        'scale-in': 'scaleIn 0.25s cubic-bezier(0.4, 0, 0.2, 1) forwards',
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(15px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0055FF', // Electric Blue
          light: '#3377FF',
          dark: '#0044CC',
        },
        secondary: {
          DEFAULT: '#FF6600', // Orange Accent
        },
        accent: {
          DEFAULT: '#FF6600',
        },
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
        info: '#3B82F6',
        gray: {
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
        },
        // Login page specifics - keeping for now to avoid breaking login, but should eventually align
        login: {
          purple: '#0055FF', // Override to primary
        }
      },
      borderRadius: {
        '30': '30px', // Identifying as "too round", might urge to remove usage later
        'xl': '12px',
        '2xl': '16px',
        '3xl': '20px', // Reduced from larger values if they existed
      }
    },
  },
  plugins: [],
}

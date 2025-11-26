/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        white: '#ffffff',
        dark: '#000',
        
        // Blue Colors
        blue: {
          DEFAULT: '#2A4F8D',
          extra: '#F2F9FE',
          light: '#0171DB',
          100: '#CCE5FD',
          200: '#99CBFA',
          300: '#67B2F8',
          400: '#3498F5',
          500: '#017EF3',
          600: '#0171DB',
          700: '#0165C2',
          800: '#0158AA',
        },
        
        // Purple Colors
        purple: {
          DEFAULT: '#7e5bef',
          light: '#9d87e6',
          'extra-light': '#f0ecfd',
        },
        
        // Danger Colors
        danger: {
          DEFAULT: '#DD3409',
          light: '#FDF5F3',
        },
        
        // Green Colors
        green: {
          DEFAULT: '#189877',
          dark: '#116A53',
          light: '#5ba692',
          'extra-light': '#E8F5F1',
        },
        
        // Yellow Colors
        yellow: {
          DEFAULT: '#FFC550',
          100: '#FFF3DC',
          200: '#FFE8B9',
          300: '#FFDC96',
          400: '#FFD173',
        },
        
        // Gray Colors
        gray: {
          DEFAULT: '#8492a6',
          dark: '#273444',
          extra: '#D6DAE1',
          light: '#F0F1F2',
          'extra-light': '#F7F8F9',
          500: '#98A2B3',
        },
        
        // Table Colors
        tabel: {
          green: '#E8F5F1',
          purple: '#F0ECFD',
          'blue-light': '#E6F2FE',
        },
        
        // Orange
        orange: '#ff7849',
      },
      fontFamily: {
        sans: ['Neutral', 'sans-serif'],
      },
    },
  },
  plugins: [],
}


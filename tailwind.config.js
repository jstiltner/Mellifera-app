/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  darkMode: 'class',
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        // Professional beekeeping brand colors
        honey: {
          50: '#fef9ec',
          100: '#fbefd0',
          200: '#f7dc9e',
          300: '#f2c46b',
          400: '#eda943',
          500: '#e68a1f', // Rich amber
          600: '#c96d15',
          700: '#a75214',
          800: '#884116',
          900: '#6f3615',
        },
        beeswax: {
          50: '#fdfbf7',
          100: '#f9f4e8',
          200: '#f3e8d0',
          300: '#e8d5a8',
          400: '#dcc07e',
          500: '#d0a955',
          600: '#b88d3d',
          700: '#9a7232',
          800: '#7d5c2c',
          900: '#674c26',
        },
        forest: {
          50: '#f0f7f4',
          100: '#dceee5',
          200: '#badccb',
          300: '#8fc3a9',
          400: '#62a383',
          500: '#458567', // Deep forest green
          600: '#346a52',
          700: '#2b5643',
          800: '#254537',
          900: '#20392f',
        },
        wood: {
          50: '#f7f6f4',
          100: '#edeae5',
          200: '#dbd5cb',
          300: '#c3b9a9',
          400: '#a99885',
          500: '#8f7d6b',
          600: '#7a6a5a',
          700: '#65574c',
          800: '#554941',
          900: '#483e38',
        },
        // shadcn/ui design tokens
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

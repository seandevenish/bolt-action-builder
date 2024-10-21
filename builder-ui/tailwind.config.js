/** @type {import('tailwindcss').Config} */
const colors = require('tailwindcss/colors')

module.exports = {
  content: [
    './src/**/*.{html,ts}'
  ],
  purge: [
    './src/**/*.{html,ts,scss}'
  ],
  theme: {
    fontFamily: {
      sans: ['Poppins', 'sans-serif'],
      serif: ['Merriweather', 'serif'],
    },
    colors: {
      primary: {
        900: '#690100',
        800: '#7e0100',
        700: '#930100',
        600: '#a90100',
        500: '#c00100',
        400: '#ef0000',
        300: '#ff5540',
        200: '#ff8a78',
        100: '#ffb4a8',
        50: '#ffdad4',
      },
      transparent: 'transparent',
      current: 'currentColor',
      black: colors.black,
      white: colors.white,
      gray: colors.slate,
      emerald: colors.emerald,
      indigo: colors.indigo,
      yellow: colors.yellow,
      blue: colors.blue,
      red: colors.red
    },
    borderRadius: {
      'none': '0',
      'sm': '0.125rem',
      'DEFAULT': '0.65rem',
      'lg': '0.75rem',
      'xl': '0.85rem',
      'full': '100%'
    },
    spacing: {
      px: '1px',
      0: '0',
      0.5: '0.125rem',
      1: '0.25rem',
      2: '0.5rem',
      3: '0.75rem',
      4: '1rem',
      5: '1.5rem',
      6: '2rem',
      7: '3rem',
      8: '4rem',
      'lg': '6rem',
      'xl': '8rem',
      '1xl': '12rem',
      '2xl': '16rem',
      '3xl': '24rem',
      '4xl': '32rem',
      '5xl': '40rem',
      '6xl': '48rem'
    }
  },
  plugins: [],

}

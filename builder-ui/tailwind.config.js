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
      'sm': '0.35rem',
      'DEFAULT': '0.65rem',
      'lg': '0.75rem',
      'xl': '0.85rem',
      'full': '100%'
    }
  },
  plugins: [],

}

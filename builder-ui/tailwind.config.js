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
      sans: ['Montserrat', 'sans-serif'],
      serif: ['Merriweather', 'serif'],
    },
    colors: {
      primary: colors.stone,
      neutral: colors.neutral,
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
  plugins: [
    require('@tailwindcss/forms'),
  ],

}

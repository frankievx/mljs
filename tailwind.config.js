module.exports = {
  mode: 'core',
  purge: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    fontFamily: {
      serif: ['Merriweather'],
      sans: ['Muli']
    },
    extend: {
      colors: {
        primary: {
          DEFAULT: '#d4a373',
          light: '#faedcd'
        },
        secondary: {
          DEFAULT: '#ccd5ae',
          light: '#e9edc9'
        },
        accent: "#fefae0"
      }
    }
  },
  variants: {
    extend: {},
  },
  plugins: [],
}

module.exports = {
  mode: 'core',
  purge: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    container: {
      padding: {
        DEFAULT: '1rem',
        sm: '15rem',
        lg: '15rem',
        xl: '15rem',
        '2xl': '15rem',
      },
    },
    fontFamily: {
      serif: ['Merriweather'],
      sans: ['Muli']
    },
    extend: {
      colors: {
        primary: {
          DEFAULT: '#f28482',
          light: '#f5cac3'
        },
        secondary: {
          DEFAULT: '#f6bd60'
        },
        accent: "#84a59d",
        light: "#f7ede2",  
        black: "#1C1D21"
      }
    }
  },
  variants: {
    extend: {},
  },
  plugins: [],
}

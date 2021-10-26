module.exports = {
  mode: 'core',
  purge: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './layouts/**/*.{js,ts,jsx,tsx}',
    // Add more here
  ],
  darkMode: false, // or 'media' or 'class'
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '10rem',
        lg: '15rem',
        xl: '20rem',
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
  plugins: [
    require('tailwind-css-variables')(
      {
        colors: "color"
      }
    )
  ],
}

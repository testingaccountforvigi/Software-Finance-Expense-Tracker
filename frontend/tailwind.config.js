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
          50: '#f5f7fa',
          100: '#eaeef4',
          200: '#d0dbe7',
          300: '#a8bdd3',
          400: '#7899ba',
          500: '#597ba3',
          600: '#456189',
          700: '#384e6f',
          800: '#31435d',
          900: '#2c3a4e',
        },
      },
    },
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors:{
        darkGray: '#121212',
        chatcolor:"#323232"
      }
    },
  },
  plugins: [],
}
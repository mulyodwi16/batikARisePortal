/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./script.js",
  ],
  theme: {
    extend: {
      colors: {
        batik: {
          dark: '#1F1B16',
          'dark-brown': '#4E342E',
          cream: '#F5E6D3',
          gold: '#C09753',
        }
      },
      fontFamily: {
        heading: ['Poppins', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      }
    }
  },
  plugins: [],
}

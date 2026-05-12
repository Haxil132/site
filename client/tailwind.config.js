/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      boxShadow: {
        glass: '0 10px 40px rgba(0,0,0,.25)'
      },
      backgroundImage: {
        aurora: 'radial-gradient(circle at top left, rgba(99,102,241,.35), transparent 36%), radial-gradient(circle at top right, rgba(236,72,153,.25), transparent 32%), radial-gradient(circle at bottom left, rgba(34,197,94,.18), transparent 28%)'
      }
    }
  },
  plugins: []
}

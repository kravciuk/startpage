/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './app/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#0f0f0f',
        'bg-block': '#1a1a1a',
        'bg-block-hover': '#222222',
        'bg-input': '#2a2a2a',
        'bg-dropdown': '#1e1e1e',
        'border-subtle': '#2a2a2a',
        'border-hover': '#3a3a3a',
        'text-primary': '#f0f0f0',
        'text-secondary': '#888888',
        'text-muted': '#555555',
        'accent': '#4f46e5',
        'accent-hover': '#6366f1',
        'danger': '#ef4444',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        lg: '16px',
        md: '12px',
        sm: '10px',
      },
    },
  },
  plugins: [],
}

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
          DEFAULT: "#111111",
          text: "#111111",
        },
        background: {
          DEFAULT: "#FFFFFF",
          secondary: "#F7F7F7",
        },
        border: {
          DEFAULT: "#E5E5E5",
        },
        muted: {
          DEFAULT: "#737373",
        },
        accent: {
          DEFAULT: "#111111",
        },
        success: {
          DEFAULT: "#16A34A", // Accessible Green
        },
        error: {
          DEFAULT: "#DC2626", // Accessible Red
        }
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif',
        ],
      },
      boxShadow: {
        'subtle': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        'premium': '0 10px 30px -10px rgba(0, 0, 0, 0.08)',
      },
      spacing: {
        'safe-bottom': 'env(safe-area-inset-bottom)',
      }
    },
  },
  plugins: [],
}
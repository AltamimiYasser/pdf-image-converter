/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Theme 5: Hybrid (Purple + Green)
        primary: {
          DEFAULT: '#7c3aed',
          hover: '#6d28d9',
        },
        secondary: {
          DEFAULT: '#2563eb',
          hover: '#1d4ed8',
        },
        accent: '#8b5cf6',
        success: {
          DEFAULT: '#10b981',
          hover: '#059669',
          light: '#d1fae5',
          dark: '#065f46',
        },
        warning: {
          DEFAULT: '#f59e0b',
          light: '#fef3c7',
        },
        error: {
          DEFAULT: '#ef4444',
          light: '#fee2e2',
        },
        neutral: {
          bg: '#faf5ff',
          border: '#e9d5ff',
          textSecondary: '#64748b',
          textPrimary: '#1f2937',
        },
      },
    },
  },
  plugins: [],
}
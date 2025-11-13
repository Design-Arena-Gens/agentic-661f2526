/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--bg)',
        foreground: 'var(--fg)',
        muted: 'var(--muted)',
        accent: 'var(--accent)',
        panel: 'var(--panel)'
      },
      boxShadow: {
        soft: '0 1px 2px rgba(0,0,0,0.05), 0 8px 24px rgba(0,0,0,0.12)'
      }
    },
  },
  plugins: [],
}

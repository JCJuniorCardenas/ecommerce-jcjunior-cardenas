module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        body: ['var(--font-body)', 'Inter', 'ui-sans-serif', 'system-ui'],
        display: ['var(--font-display)', 'Inter', 'ui-sans-serif', 'system-ui'],
      },
      colors: {
        paper: 'var(--paper)',
        'paper-soft': 'var(--paper-soft)',
        terracotta: 'var(--accent)',
        forest: 'var(--accent)',
        ink: 'var(--ink)',
        muted: 'var(--muted)',
        panel: 'var(--panel)',
        line: 'var(--line)',
      },
      boxShadow: {
        editorial: '0 14px 40px rgba(0, 0, 0, 0.45)',
      },
    }
  },
  plugins: []
};

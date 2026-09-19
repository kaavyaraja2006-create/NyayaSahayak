/** @type {import('tailwindcss').Config} */
const c = (name) => `rgb(var(--${name}) / <alpha-value>)`;

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: c('bg'),
        surface: c('surface'),
        s2: c('surface-2'),
        line: c('border'),
        fg: c('fg'),
        muted: c('muted'),
        subtle: c('subtle'),
        'on-primary': c('on-primary'),
        primary: { DEFAULT: c('primary'), ink: c('primary-ink') },
        success: { DEFAULT: c('success'), ink: c('success-ink') },
        warning: { DEFAULT: c('warning'), ink: c('warning-ink') },
        conflict: { DEFAULT: c('conflict'), ink: c('conflict-ink') },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        pop: 'var(--shadow-pop)',
      },
      keyframes: {
        shimmer: { '100%': { transform: 'translateX(100%)' } },
        dash: { to: { strokeDashoffset: '-24' } },
        pulseRing: { '0%': { opacity: '0.6', transform: 'scale(0.9)' }, '100%': { opacity: '0', transform: 'scale(1.8)' } },
      },
      animation: {
        dash: 'dash 1.4s linear infinite',
        pulseRing: 'pulseRing 2.2s ease-out infinite',
      },
    },
  },
  plugins: [],
};

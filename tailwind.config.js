/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {

      // ─────────────────────────────────────────────────────────────────
      //  ANTI-GRAVITY SHADOW PRESETS
      //  Philosophy: soft, diffused, multi-layered shadows that give
      //  components the feeling of floating just above the canvas.
      //  No harsh borders. Pure elevation via light physics.
      // ─────────────────────────────────────────────────────────────────
      boxShadow: {
        // Level 0 — Resting state. Component is on canvas but not elevated.
        'ag-base':
          '0 1px 2px 0 rgb(var(--color-ink-primary) / 0.04), ' +
          '0 2px 8px 0 rgb(var(--color-ink-primary) / 0.06)',

        // Level 1 — Subtle card elevation. Default for most panels and cards.
        'ag-card':
          '0 2px 4px 0 rgb(var(--color-ink-primary) / 0.04), ' +
          '0 4px 16px 0 rgb(var(--color-ink-primary) / 0.06), ' +
          '0 8px 32px 0 rgb(var(--color-ink-primary) / 0.04)',

        // Level 2 — Hover elevation. Applied on :hover for interactive cards.
        'ag-hover':
          '0 4px 8px 0 rgb(var(--color-ink-primary) / 0.04), ' +
          '0 8px 24px 0 rgb(var(--color-ink-primary) / 0.08), ' +
          '0 16px 48px 0 rgb(var(--color-ink-primary) / 0.06)',

        // Level 3 — Active / floating state.
        'ag-float':
          '0 8px 16px 0 rgb(var(--color-ink-primary) / 0.06), ' +
          '0 16px 40px 0 rgb(var(--color-ink-primary) / 0.10), ' +
          '0 32px 80px 0 rgb(var(--color-ink-primary) / 0.08)',

        // Level 4 — Modal / drawer peak elevation.
        'ag-modal':
          '0 12px 24px 0 rgb(var(--color-ink-primary) / 0.08), ' +
          '0 24px 64px 0 rgb(var(--color-ink-primary) / 0.12), ' +
          '0 48px 120px 0 rgb(var(--color-ink-primary) / 0.10)',

        // Accent glow — Forest Green primary
        'ag-glow-primary':
          '0 4px 16px 0 rgb(var(--color-brand-500) / 0.20), ' +
          '0 8px 32px 0 rgb(var(--color-brand-500) / 0.12)',

        // Success glow — positive balance, profit indicators.
        'ag-glow-success':
          '0 4px 16px 0 rgb(var(--color-profit) / 0.20), ' +
          '0 8px 32px 0 rgb(var(--color-profit) / 0.12)',

        // Warning glow — alerts, approaching credit limits (Copper).
        'ag-glow-warning':
          '0 4px 16px 0 rgb(var(--color-copper-500) / 0.20), ' +
          '0 8px 32px 0 rgb(var(--color-copper-500) / 0.12)',

        // Inset shadow for pressed states and input fields.
        'ag-inset':
          'inset 0 1px 3px 0 rgb(var(--color-ink-primary) / 0.06), ' +
          'inset 0 2px 6px 0 rgb(var(--color-ink-primary) / 0.04)',

        // Sidebar shadow
        'ag-sidebar':
          '4px 0 24px 0 rgb(var(--color-ink-primary) / 0.04), ' +
          '1px 0 8px 0 rgb(var(--color-ink-primary) / 0.03)',
      },

      colors: {
        // Canvas — warm cream page background
        canvas: {
          DEFAULT: 'rgb(var(--color-canvas-100) / <alpha-value>)',
          50:  'rgb(var(--color-canvas-50) / <alpha-value>)',
          100: 'rgb(var(--color-canvas-100) / <alpha-value>)',
          200: 'rgb(var(--color-canvas-200) / <alpha-value>)',
          300: 'rgb(var(--color-canvas-300) / <alpha-value>)',
        },

        // Surface — component backgrounds
        surface: {
          DEFAULT: 'rgb(var(--color-surface) / <alpha-value>)',
          muted:   'rgb(var(--color-surface-muted) / <alpha-value>)',
          raised:  'rgb(var(--color-surface-raised) / <alpha-value>)',
        },

        // Brand — Forest Green
        brand: {
          50:  'rgb(var(--color-brand-50) / <alpha-value>)',
          100: 'rgb(var(--color-brand-100) / <alpha-value>)',
          200: 'rgb(var(--color-brand-200) / <alpha-value>)',
          300: 'rgb(var(--color-brand-300) / <alpha-value>)',
          400: 'rgb(var(--color-brand-400) / <alpha-value>)',
          500: 'rgb(var(--color-brand-500) / <alpha-value>)',
          600: 'rgb(var(--color-brand-600) / <alpha-value>)',
          700: 'rgb(var(--color-brand-700) / <alpha-value>)',
          800: 'rgb(var(--color-brand-800) / <alpha-value>)',
          900: 'rgb(var(--color-brand-900) / <alpha-value>)',
        },

        // Copper scale
        copper: {
          50:  'rgb(var(--color-copper-50) / <alpha-value>)',
          100: 'rgb(var(--color-copper-100) / <alpha-value>)',
          200: 'rgb(var(--color-copper-200) / <alpha-value>)',
          300: 'rgb(var(--color-copper-300) / <alpha-value>)',
          400: 'rgb(var(--color-copper-400) / <alpha-value>)',
          500: 'rgb(var(--color-copper-500) / <alpha-value>)',
          600: 'rgb(var(--color-copper-600) / <alpha-value>)',
          700: 'rgb(var(--color-copper-700) / <alpha-value>)',
          800: 'rgb(var(--color-copper-800) / <alpha-value>)',
          900: 'rgb(var(--color-copper-900) / <alpha-value>)',
        },

        // Steel scale
        steel: {
          50:  'rgb(var(--color-steel-50) / <alpha-value>)',
          100: 'rgb(var(--color-steel-100) / <alpha-value>)',
          200: 'rgb(var(--color-steel-200) / <alpha-value>)',
          300: 'rgb(var(--color-steel-300) / <alpha-value>)',
          400: 'rgb(var(--color-steel-400) / <alpha-value>)',
          500: 'rgb(var(--color-steel-500) / <alpha-value>)',
          600: 'rgb(var(--color-steel-600) / <alpha-value>)',
          700: 'rgb(var(--color-steel-700) / <alpha-value>)',
          800: 'rgb(var(--color-steel-800) / <alpha-value>)',
          900: 'rgb(var(--color-steel-900) / <alpha-value>)',
        },

        // Sage scale
        sage: {
          50:  'rgb(var(--color-sage-50) / <alpha-value>)',
          100: 'rgb(var(--color-sage-100) / <alpha-value>)',
          200: 'rgb(var(--color-sage-200) / <alpha-value>)',
          300: 'rgb(var(--color-sage-300) / <alpha-value>)',
          400: 'rgb(var(--color-sage-400) / <alpha-value>)',
          500: 'rgb(var(--color-sage-500) / <alpha-value>)',
          600: 'rgb(var(--color-sage-600) / <alpha-value>)',
          700: 'rgb(var(--color-sage-700) / <alpha-value>)',
          800: 'rgb(var(--color-sage-800) / <alpha-value>)',
          900: 'rgb(var(--color-sage-900) / <alpha-value>)',
        },

        // Secondary scale (Teal)
        secondary: {
          50:  'rgb(var(--color-secondary-50) / <alpha-value>)',
          100: 'rgb(var(--color-secondary-100) / <alpha-value>)',
          200: 'rgb(var(--color-secondary-200) / <alpha-value>)',
          300: 'rgb(var(--color-secondary-300) / <alpha-value>)',
          400: 'rgb(var(--color-secondary-400) / <alpha-value>)',
          500: 'rgb(var(--color-secondary-500) / <alpha-value>)',
          600: 'rgb(var(--color-secondary-600) / <alpha-value>)',
          700: 'rgb(var(--color-secondary-700) / <alpha-value>)',
          800: 'rgb(var(--color-secondary-800) / <alpha-value>)',
          900: 'rgb(var(--color-secondary-900) / <alpha-value>)',
        },

        // Tertiary scale (Amber)
        tertiary: {
          50:  'rgb(var(--color-tertiary-50) / <alpha-value>)',
          100: 'rgb(var(--color-tertiary-100) / <alpha-value>)',
          200: 'rgb(var(--color-tertiary-200) / <alpha-value>)',
          300: 'rgb(var(--color-tertiary-300) / <alpha-value>)',
          400: 'rgb(var(--color-tertiary-400) / <alpha-value>)',
          500: 'rgb(var(--color-tertiary-500) / <alpha-value>)',
          600: 'rgb(var(--color-tertiary-600) / <alpha-value>)',
          700: 'rgb(var(--color-tertiary-700) / <alpha-value>)',
          800: 'rgb(var(--color-tertiary-800) / <alpha-value>)',
          900: 'rgb(var(--color-tertiary-900) / <alpha-value>)',
        },

        profit:  'rgb(var(--color-profit) / <alpha-value>)',
        loss:    'rgb(var(--color-loss) / <alpha-value>)',
        neutral: 'rgb(var(--color-neutral) / <alpha-value>)',
        caution: 'rgb(var(--color-caution) / <alpha-value>)',

        // Ink — earthy text hierarchy
        ink: {
          primary:   'rgb(var(--color-ink-primary) / <alpha-value>)',
          secondary: 'rgb(var(--color-ink-secondary) / <alpha-value>)',
          tertiary:  'rgb(var(--color-ink-tertiary) / <alpha-value>)',
          disabled:  'rgb(var(--color-ink-disabled) / <alpha-value>)',
        },
      },

      // ─────────────────────────────────────────────────────────────────
      //  TYPOGRAPHY
      // ─────────────────────────────────────────────────────────────────
      fontFamily: {
        sans:    ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'Inter', 'ui-sans-serif', 'sans-serif'],
        mono:    ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },

      fontSize: {
        'xs':   ['0.75rem',  { lineHeight: '1.125rem', letterSpacing: '0.01em'  }],
        'sm':   ['0.875rem', { lineHeight: '1.375rem', letterSpacing: '0.005em' }],
        'base': ['1rem',     { lineHeight: '1.625rem', letterSpacing: '0'        }],
        'lg':   ['1.125rem', { lineHeight: '1.75rem',  letterSpacing: '-0.005em'}],
        'xl':   ['1.25rem',  { lineHeight: '1.875rem', letterSpacing: '-0.01em' }],
        '2xl':  ['1.5rem',   { lineHeight: '2rem',     letterSpacing: '-0.02em' }],
        '3xl':  ['1.875rem', { lineHeight: '2.25rem',  letterSpacing: '-0.02em' }],
        '4xl':  ['2.25rem',  { lineHeight: '2.625rem', letterSpacing: '-0.03em' }],
        '5xl':  ['3rem',     { lineHeight: '3.25rem',  letterSpacing: '-0.03em' }],
      },

      // ─────────────────────────────────────────────────────────────────
      //  BORDER RADIUS — pill-shaped geometry
      // ─────────────────────────────────────────────────────────────────
      borderRadius: {
        'none': '0',
        'xs':   '0.25rem',
        'sm':   '0.5rem',
        DEFAULT:'0.75rem',
        'md':   '0.75rem',
        'lg':   '1rem',
        'xl':   '1.25rem',
        '2xl':  '1.5rem',
        '3xl':  '2rem',
        'pill': '9999px',
        'full': '9999px',
      },

      // ─────────────────────────────────────────────────────────────────
      //  SPACING SCALE (extends default)
      // ─────────────────────────────────────────────────────────────────
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '30': '7.5rem',
        '72': '18rem',
        '84': '21rem',
        '96': '24rem',
      },

      // ─────────────────────────────────────────────────────────────────
      //  ANIMATION & TRANSITIONS
      // ─────────────────────────────────────────────────────────────────
      transitionTimingFunction: {
        'ag-spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'ag-smooth': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'ag-sharp':  'cubic-bezier(0.4, 0, 0.6, 1)',
      },

      transitionDuration: {
        '150': '150ms',
        '250': '250ms',
        '350': '350ms',
        '450': '450ms',
      },

      keyframes: {
        'ag-float-in': {
          '0%':   { opacity: '0', transform: 'translateY(12px) scale(0.98)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)'       },
        },
        'ag-fade-in': {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'ag-shimmer': {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0'  },
        },
        'ag-pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(99, 102, 241, 0)' },
          '50%':      { boxShadow: '0 0 0 8px rgba(99, 102, 241, 0.12)' },
        },
        'ag-sidebar-in': {
          '0%':   { opacity: '0', transform: 'translateX(-16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)'     },
        },
        'ag-slide-up': {
          '0%':   { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)'   },
        },
        'ag-scale-in': {
          '0%':   { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)'    },
        },
        'ag-glow-pulse': {
          '0%, 100%': { opacity: '0.4' },
          '50%':      { opacity: '0.8' },
        },
      },

      animation: {
        'ag-float-in':   'ag-float-in 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) both',
        'ag-fade-in':    'ag-fade-in 0.25s ease-out both',
        'ag-shimmer':    'ag-shimmer 1.8s linear infinite',
        'ag-pulse-glow': 'ag-pulse-glow 2s ease-in-out infinite',
        'ag-sidebar-in': 'ag-sidebar-in 0.3s ease-out both',
        'ag-slide-up':   'ag-slide-up 0.3s ease-out both',
        'ag-scale-in':   'ag-scale-in 0.25s ease-out both',
        'ag-glow-pulse': 'ag-glow-pulse 3s ease-in-out infinite',
      },

      // ─────────────────────────────────────────────────────────────────
      //  BACKDROP BLUR (glassmorphism accents)
      // ─────────────────────────────────────────────────────────────────
      backdropBlur: {
        'xs': '2px',
        'sm': '4px',
        DEFAULT: '8px',
        'md': '12px',
        'lg': '20px',
        'xl': '40px',
      },
    },
  },
  plugins: [],
};

/** @type {import('tailwindcss').Config} */
module.exports = {
  // FIX: was missing entirely, so Tailwind's `dark:` variant followed the OS
  // color-scheme preference instead of this app's own manual toggle (which
  // sets a `.dark` class on <html> via ThemeProvider). 'class' strategy makes
  // `dark:` utilities respond to that toggle correctly.
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // FIX: every value below now points at a CSS custom property (from
        // src/styles/tokens.css) instead of a static hex string. This is
        // what makes dark mode actually work app-wide: a single
        // `html.dark { --ink-900: ... }` override in tokens.css now
        // re-themes every page using `text-ink-900`, `bg-surface-canvas`,
        // etc., with zero per-page changes required.
        ink: {
          900: 'var(--ink-900)',
          800: 'var(--ink-800)',
          700: 'var(--ink-700)',
          600: 'var(--ink-600)',
          500: 'var(--ink-500)',
          400: 'var(--ink-400)',
          300: 'var(--ink-300)',
          200: 'var(--ink-200)',
          100: 'var(--ink-100)',
          50: 'var(--ink-50)'
        },
        surface: {
          canvas: 'var(--surface-canvas)',
          DEFAULT: 'var(--surface-default)',
          muted: 'var(--surface-muted)',
          border: 'var(--surface-border)'
        },
        brand: {
          50: 'var(--brand-50)',
          100: 'var(--brand-100)',
          200: 'var(--brand-200)',
          300: 'var(--brand-300)',
          400: 'var(--brand-400)',
          500: 'var(--brand-500)',
          600: 'var(--brand-600)',
          700: 'var(--brand-700)'
        },
        navy: {
          500: 'var(--navy-500)',
          700: 'var(--navy-700)',
          // Tailwind's `/opacity` modifiers require an alpha-aware color
          // value. Keep the existing token for non-Tailwind consumers while
          // exposing its RGB channels for utilities such as
          // `from-navy-900/35`.
          900: ({ opacityValue }) => opacityValue === undefined
            ? 'rgb(var(--navy-900-rgb))'
            : `rgb(var(--navy-900-rgb) / ${opacityValue})`
        },
        teal: {
          DEFAULT: 'var(--teal-DEFAULT)',
          soft: 'var(--teal-soft)'
        },
        success: {
          soft: 'var(--success-soft)',
          DEFAULT: 'var(--success-DEFAULT)',
          text: 'var(--success-text)'
        },
        info: {
          soft: 'var(--info-soft)',
          DEFAULT: 'var(--info-DEFAULT)'
        },
        danger: {
          soft: 'var(--danger-soft)',
          DEFAULT: 'var(--danger-DEFAULT)'
        },
        sage: {
          soft: 'var(--sage-soft)',
          bar: 'var(--sage-bar)',
          text: 'var(--sage-text)'
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif']
      },
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1.1rem' }],
        sm: ['0.8125rem', { lineHeight: '1.25rem' }],
        base: ['0.9375rem', { lineHeight: '1.5rem' }],
        md: ['1rem', { lineHeight: '1.5rem' }],
        lg: ['1.125rem', { lineHeight: '1.6rem' }],
        xl: ['1.375rem', { lineHeight: '1.8rem' }],
        '2xl': ['1.75rem', { lineHeight: '2.1rem' }]
      },
      borderRadius: {
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '20px',
        '2xl': '24px',
        '3xl': '28px',
        pill: '999px'
      },
      boxShadow: {
        // FIX: also converted to var()-driven values, so shadows switch to
        // dark-mode-appropriate (glow-style, lighter-alpha) versions
        // automatically instead of rendering as near-invisible dark-on-dark
        // shadows once the background flips to near-black.
        card: 'var(--shadow-card)',
        soft: 'var(--shadow-soft)',
        panel: 'var(--shadow-panel)',
        pop: 'var(--shadow-pop)',
        // New: subtle inset "pressed" shadow for the sidebar's click-moment
        // feedback (see Sidebar.jsx's :active state).
        pressed: 'inset 0 2px 6px rgba(0,0,0,0.35), inset 0 -1px 0 rgba(255,255,255,0.04)',
        // New: teal glow for active/primary elements in dark mode.
        glow: 'var(--shadow-glow)'
      },
      spacing: {
        4.5: '1.125rem',
        18: '4.5rem',
        22: '5.5rem'
      },
      transitionTimingFunction: {
        soft: 'cubic-bezier(0.4, 0, 0.2, 1)'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0, transform: 'translateY(4px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' }
        },
        // New: theme-toggle sun -> moon cross-fade, used by ThemeToggle.jsx.
        // Each icon fades + subtly rotates/scales rather than hard-cutting,
        // for the "smooth transition" the redesign asked for.
        iconFadeOut: {
          '0%': { opacity: 1, transform: 'rotate(0deg) scale(1)' },
          '100%': { opacity: 0, transform: 'rotate(-90deg) scale(0.5)' }
        },
        iconFadeIn: {
          '0%': { opacity: 0, transform: 'rotate(90deg) scale(0.5)' },
          '100%': { opacity: 1, transform: 'rotate(0deg) scale(1)' }
        }
      },
      animation: {
        fadeIn: 'fadeIn 0.25s ease-out',
        iconFadeOut: 'iconFadeOut 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards',
        iconFadeIn: 'iconFadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards'
      }
    }
  },
  plugins: []
};

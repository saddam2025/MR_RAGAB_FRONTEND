// src/components/ui/ThemeToggle.jsx
import React, { useContext } from 'react';
import { ThemeContext } from '../../contexts/ThemeProvider';

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path d="M12 4V2m0 20v-2m8-8h2M2 12h2m13.657-6.343l1.414-1.414M4.929 19.071l1.414-1.414m0-11.314L4.93 4.93M19.071 19.071l-1.414-1.414" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path
        d="M21 12.79A9 9 0 0 1 11.21 3 7 7 0 1 0 21 12.79Z"
        fill="currentColor"
      />
    </svg>
  );
}

export default function ThemeToggle({ className = '' }) {
  const { theme, toggleTheme } = useContext(ThemeContext) || {};
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'التبديل إلى الوضع الفاتح' : 'التبديل إلى الوضع الداكن'}
      title={isDark ? 'التبديل إلى الوضع الفاتح' : 'التبديل إلى الوضع الداكن'}
      className={`inline-flex h-10 w-10 items-center justify-center rounded-full border border-surface-border bg-surface-default/80 text-ink-900 shadow-sm transition-transform duration-200 hover:scale-105 focus:outline-none focus-visible:ring-3 focus-visible:ring-brand-500/30 ${className}`}
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}

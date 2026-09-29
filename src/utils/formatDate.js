// Small date formatting utilities using Intl
// Usage:
//   import { formatDate, formatRelative } from '../utils/formatDate';
//   formatDate(new Date(), { locale: 'ar', dateStyle: 'medium' });

export function formatDate(value, opts = {}) {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value);
  const locale = opts.locale || (typeof document !== 'undefined' ? document.documentElement.lang || 'ar' : 'ar');
  const formatter = new Intl.DateTimeFormat(locale, {
    year: opts.year ?? 'numeric',
    month: opts.month ?? 'short',
    day: opts.day ?? 'numeric',
    hour: opts.hour,
    minute: opts.minute,
    second: opts.second,
    timeZoneName: opts.timeZoneName,
  });
  return formatter.format(date);
}

export function formatRelative(value, opts = {}) {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value);
  const now = new Date();
  const diff = Math.round((now - date) / 1000); // seconds
  if (Math.abs(diff) < 60) return opts.locale?.startsWith('en') ? 'just now' : 'الآن';
  if (Math.abs(diff) < 3600) {
    const m = Math.round(Math.abs(diff) / 60);
    return opts.locale?.startsWith('en') ? `${m}m ago` : `منذ ${m} دقيقة`;
  }
  if (Math.abs(diff) < 86400) {
    const h = Math.round(Math.abs(diff) / 3600);
    return opts.locale?.startsWith('en') ? `${h}h ago` : `منذ ${h} ساعة`;
  }
  // fallback to formatted date
  return formatDate(date, opts);
}

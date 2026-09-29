// Lightweight i18n helper (no external dependency)
// Usage:
//   import i18n from '../utils/i18n';
//   i18n.t('auth.login');
//   i18n.setLocale('en');

const DEFAULT_LOCALE = 'ar';

const messages = {
  en: {
    auth: {
      login: 'Login',
      register: 'Register',
      email: 'Email',
      password: 'Password',
    },
    common: {
      loading: 'Loading...',
      pageNotFound: 'Page not found',
    },
  },
  ar: {
    auth: {
      login: 'تسجيل الدخول',
      register: 'إنشاء حساب',
      email: 'البريد الإلكتروني',
      password: 'كلمة المرور',
    },
    common: {
      loading: 'جارٍ التحميل...',
      pageNotFound: 'الصفحة غير موجودة',
    },
  },
};

let locale = (typeof navigator !== 'undefined' && navigator.language?.startsWith('en')) ? 'en' : DEFAULT_LOCALE;

function setLocale(l) {
  if (!l) return;
  locale = l;
}

function getLocale() {
  return locale;
}

function t(path, fallback) {
  if (!path) return fallback ?? '';
  const parts = path.split('.');
  let node = messages[locale] || {};
  for (const p of parts) {
    node = node?.[p];
    if (node === undefined) break;
  }
  if (node === undefined) {
    // fallback to default locale then fallback param
    node = path.split('.').reduce((acc, p) => acc?.[p], messages[DEFAULT_LOCALE]) ?? fallback ?? path;
  }
  return node;
}

export default {
  t,
  setLocale,
  getLocale,
  messages,
};

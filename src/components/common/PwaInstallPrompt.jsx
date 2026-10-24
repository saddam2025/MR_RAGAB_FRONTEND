import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Download, MoreVertical, Share, Smartphone, X } from 'lucide-react';
import { matchPath, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const DISMISSAL_PERIOD_MS = 7 * 24 * 60 * 60 * 1000;
const STORAGE_KEY_PREFIX = 'ragab-pwa-install-dismissed:';

function authenticatedUserKey(user) {
  const id = user?._id || user?.id || user?.email;
  return id ? String(id) : null;
}

function isInstalledContext() {
  return window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true;
}

function isAppleMobileDevice() {
  const { userAgent, platform, maxTouchPoints } = window.navigator;
  return /iPad|iPhone|iPod/i.test(userAgent) || (platform === 'MacIntel' && maxTouchPoints > 1);
}

function isProtectedPath(routes, pathname) {
  const route = routes.find(({ path }) => matchPath({ path, end: true }, pathname));
  if (!route) return false;
  const roleShortcut = route.auth && route.auth !== 'guest' && route.auth !== 'required';
  return route.auth === 'required' || Boolean(roleShortcut) || Boolean(route.roles?.length);
}

function wasDismissed(userKey) {
  if (!userKey) return false;
  try {
    const until = Number(localStorage.getItem(`${STORAGE_KEY_PREFIX}${encodeURIComponent(userKey)}`));
    return until > Date.now();
  } catch {
    return false;
  }
}

function saveDismissal(userKey) {
  if (!userKey) return;
  try {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${encodeURIComponent(userKey)}`, String(Date.now() + DISMISSAL_PERIOD_MS));
  } catch {
    // A per-session guard below still suppresses duplicate dialogs if storage is blocked.
  }
}

export default function PwaInstallPrompt({ installPrompt, appInstalled, onInstallPromptConsumed, routes }) {
  const { user, loading } = useAuth();
  const { pathname } = useLocation();
  const [mode, setMode] = useState(null);
  const [dialogOwner, setDialogOwner] = useState(null);
  const [busy, setBusy] = useState(false);
  const [appleDevice, setAppleDevice] = useState(false);
  const dialogRef = useRef(null);
  const actionRef = useRef(null);
  const previousFocus = useRef(null);
  const handledUsers = useRef(new Set());
  const userKey = authenticatedUserKey(user);
  const eligible = Boolean(user && !loading && !appInstalled && userKey && isProtectedPath(routes, pathname));

  const closeDialog = useCallback(({ dismiss = false } = {}) => {
    if (dismiss) saveDismissal(userKey);
    handledUsers.current.add(userKey);
    setMode(null);
  }, [userKey]);

  useEffect(() => {
    if (!eligible || mode || handledUsers.current.has(userKey) || isInstalledContext()) return undefined;
    if (wasDismissed(userKey)) return undefined;

    let isAppleDevice = false;
    try {
      isAppleDevice = isAppleMobileDevice();
    } catch {
      // Generic browser instructions remain available when platform detection is blocked.
    }
    setAppleDevice(isAppleDevice);

    const timeoutId = window.setTimeout(() => {
      previousFocus.current = document.activeElement;
      handledUsers.current.add(userKey);
      setDialogOwner(userKey);
      setMode('prompt');
    }, 1500);

    return () => window.clearTimeout(timeoutId);
  }, [eligible, installPrompt, mode, userKey]);

  useEffect(() => {
    if (mode && (!eligible || dialogOwner !== userKey)) {
      setMode(null);
      setBusy(false);
    }
  }, [dialogOwner, eligible, mode, userKey]);

  useEffect(() => {
    if (!mode) return undefined;
    actionRef.current?.focus();
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !busy) closeDialog({ dismiss: true });
      if (event.key !== 'Tab') return;
      const buttons = dialogRef.current?.querySelectorAll('button:not([disabled])');
      if (!buttons?.length) return;
      const first = buttons[0];
      const last = buttons[buttons.length - 1];
      if (!dialogRef.current?.contains(document.activeElement)) {
        event.preventDefault();
        first.focus();
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (previousFocus.current instanceof HTMLElement) previousFocus.current.focus();
    };
  }, [busy, closeDialog, mode]);

  function showInstructions() {
    handledUsers.current.add(userKey);
    setMode('instructions');
  }

  async function handlePrimaryAction() {
    if (mode === 'instructions') {
      closeDialog();
      return;
    }
    if (!installPrompt) {
      showInstructions();
      return;
    }

    setBusy(true);
    const promptEvent = installPrompt;
    onInstallPromptConsumed();
    try {
      await promptEvent.prompt();
      await promptEvent.userChoice;
      closeDialog();
    } catch {
      showInstructions();
    } finally {
      setBusy(false);
    }
  }

  if (!mode || !eligible || dialogOwner !== userKey || typeof document === 'undefined') return null;

  const instructions = appleDevice
    ? [
        { icon: Share, text: 'اضغط على زر المشاركة في Safari.' },
        { icon: Smartphone, text: 'اختر «إضافة إلى الشاشة الرئيسية».' },
        { icon: Download, text: 'اضغط «إضافة» للتأكيد.' },
      ]
    : [
        { icon: MoreVertical, text: 'افتح قائمة المتصفح (⋮ أو ⋯).' },
        { icon: Smartphone, text: 'اختر «تثبيت التطبيق» أو «إضافة إلى الشاشة الرئيسية».' },
        { icon: Download, text: 'اتبع رسالة التأكيد التي يعرضها المتصفح.' },
      ];

  return createPortal(
    <div className="fixed inset-0 z-[110] grid place-items-center overflow-y-auto bg-slate-950/45 p-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))]" dir="rtl">
      <section ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="ragab-pwa-title" aria-describedby="ragab-pwa-description" className="relative my-auto w-full max-w-md rounded-3xl border border-surface-border bg-white p-6 text-ink-900 shadow-2xl dark:border-white/10 dark:bg-surface-default dark:text-white sm:p-7">
        <button type="button" aria-label="إغلاق نافذة تثبيت التطبيق" disabled={busy} onClick={() => closeDialog({ dismiss: true })} className="absolute left-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full text-ink-500 transition hover:bg-surface-muted hover:text-ink-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:opacity-50 dark:hover:text-white">
          <X size={19} aria-hidden="true" />
        </button>

        <div className="mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-brand-700 dark:text-brand-300"><Download size={25} aria-hidden="true" /></div>
        <h2 id="ragab-pwa-title" className="pe-8 text-xl font-extrabold">{mode === 'instructions' ? 'طريقة تثبيت التطبيق' : 'ثبّت تطبيق المنصة'}</h2>
        <p id="ragab-pwa-description" className="mt-3 leading-7 text-ink-600 dark:text-slate-300">
          {mode === 'instructions'
            ? appleDevice
              ? 'افتح المنصة في Safari، ثم اتبع الخطوات التالية لإضافتها إلى الشاشة الرئيسية.'
              : 'قد يختلف اسم الخيار حسب المتصفح. ابحث عن تثبيت التطبيق أو إضافته إلى الشاشة الرئيسية من قائمة المتصفح.'
            : 'خلّي الوصول للكورسات والمحاضرات والواجبات أسهل، وضيف المنصة إلى الشاشة الرئيسية على جهازك.'}
        </p>

        {mode === 'instructions' && <ol className="mt-5 space-y-3">
          {instructions.map(({ icon: Icon, text }, index) => <li key={text} className="flex items-start gap-3 rounded-2xl bg-surface-muted p-3 text-sm leading-6 dark:bg-surface-muted">
            <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-surface-default text-brand-700 dark:bg-white/10 dark:text-brand-300"><Icon size={15} aria-hidden="true" /></span>
            <span><span className="me-1 font-bold">{index + 1}.</span>{text}</span>
          </li>)}
        </ol>}

        {mode === 'instructions' && appleDevice && <p className="mt-4 text-sm leading-6 text-ink-500 dark:text-slate-400">إذا لم تظهر المشاركة، افتح الموقع في Safari ثم جرّب مرة أخرى.</p>}

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row">
          {mode === 'prompt' && <button type="button" disabled={busy} onClick={() => closeDialog({ dismiss: true })} className="inline-flex min-h-11 flex-1 items-center justify-center rounded-2xl bg-surface-muted px-4 py-2.5 font-semibold text-ink-700 transition hover:bg-surface-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:opacity-50 dark:text-slate-200">ليس الآن</button>}
          <button ref={actionRef} type="button" disabled={busy} onClick={handlePrimaryAction} className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-2xl bg-brand-600 px-4 py-2.5 font-bold text-white shadow-sm transition hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-70">
            {mode === 'instructions' ? 'حسنًا' : busy ? 'جارٍ فتح التثبيت…' : 'تثبيت التطبيق'}
            {mode === 'prompt' && <Download size={17} aria-hidden="true" />}
          </button>
        </div>
      </section>
    </div>,
    document.body
  );
}

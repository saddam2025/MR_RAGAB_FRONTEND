// src/components/forms/LoginForm.jsx
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import instructorService from '../../services/instructorService';
import { egyptianWhatsappUrl } from '../../utils/phone';
import { useAuth } from '../../hooks/useAuth';
import Input from '../ui/Input';
import PasswordInput from '../ui/PasswordInput';
import Button from '../ui/Button';

export default function LoginForm({ onSuccess, instructorId }) {
  const { login, verifyMfaLogin } = useAuth();
  const [form, setForm] = useState({ identifier: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState(null);
  // Local, per-submit loading state — deliberately NOT the global
  // AuthContext `loading` flag. That flag also drives RouteGuard (it
  // replaces the entire routed page with a placeholder while true), so
  // reusing it here would unmount/remount this whole page mid-request and
  // wipe serverError right before it could render. See AuthProvider.jsx.
  const [submitting, setSubmitting] = useState(false);
  const [pendingLoginToken, setPendingLoginToken] = useState(null);
  const [mfaCode, setMfaCode] = useState('');
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [hasFailedLogin, setHasFailedLogin] = useState(false);
  const [supportPhone, setSupportPhone] = useState('');

  useEffect(() => {
    let active = true;
    setSupportPhone('');
    if (!instructorId) return () => { active = false; };
    instructorService.get(instructorId)
      .then((response) => { if (active) setSupportPhone(response.data?.supportPhone || ''); })
      .catch(() => { if (active) setSupportPhone(''); });
    return () => { active = false; };
  }, [instructorId]);

  const handleChange = (e) => {
    setForm((s) => ({ ...s, [e.target.name]: e.target.value }));
    setFieldErrors((prev) => ({ ...prev, [e.target.name]: '' }));
    setServerError(null);
  };

  const validate = () => {
    const errs = {};
    const identifier = form.identifier.trim();
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
    const phoneDigits = identifier.replace(/[^\d\u0660-\u0669]/g, '');
    if (!identifier) errs.identifier = 'البريد الإلكتروني أو رقم الهاتف مطلوب';
    else if (!isEmail && (phoneDigits.length < 7 || phoneDigits.length > 15)) errs.identifier = 'أدخل بريدًا إلكترونيًا أو رقم هاتف صالحًا';
    if (!form.password) errs.password = 'كلمة المرور مطلوبة';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError(null);
    if (!validate()) return;

    setSubmitting(true);
    try {
      const res = await login({ identifier: form.identifier, password: form.password }, instructorId);
      if (res.ok) {
        onSuccess?.();
      } else if (res.mfaRequired) {
        setPendingLoginToken(res.pendingLoginToken);
      } else {
        setHasFailedLogin(true);
        setServerError(res.error?.message || res.error || 'فشل تسجيل الدخول');
      }
    } catch (err) {
      setHasFailedLogin(true);
      setServerError(err?.message || 'حدث خطأ غير متوقع');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMfaSubmit = async (e) => {
    e.preventDefault();
    const value = mfaCode.trim();
    if (!value) return setServerError('أدخل رمز التحقق.');
    setSubmitting(true);
    setServerError(null);
    try {
      const res = await verifyMfaLogin({ pendingLoginToken, ...(useBackupCode ? { backupCode: value } : { code: value }) });
      if (res.ok) onSuccess?.();
      else setServerError(res.error?.message || res.error || 'رمز التحقق غير صحيح أو انتهت صلاحيته');
    } finally {
      setSubmitting(false);
    }
  };

  // RegisterPage supports both the instructor-scoped route and the
  // generic /register fallback now, so unauthenticated users can arrive
  // at either path without 404.
  const registerLink = instructorId ? `/${instructorId}/register` : '/register';

  if (pendingLoginToken) return (
    <form onSubmit={handleMfaSubmit} className="space-y-4 w-full" dir="rtl">
      <div className="text-right"><h2 className="text-xl font-bold text-ink-900">تأكيد تسجيل الدخول</h2><p className="mt-2 text-sm text-ink-500">أدخل الرمز من تطبيق المصادقة. لم يكتمل تسجيل الدخول بعد.</p></div>
      {serverError && <div role="alert" className="rounded-md p-3 bg-danger-soft text-danger-DEFAULT text-sm">{serverError}</div>}
      <div><label htmlFor="mfaCode" className="block text-sm font-medium text-ink-700 mb-1">{useBackupCode ? 'رمز الاسترداد' : 'رمز المصادقة المكوّن من 6 أرقام'}</label><Input id="mfaCode" value={mfaCode} onChange={(e) => { setMfaCode(e.target.value); setServerError(null); }} inputMode={useBackupCode ? 'text' : 'numeric'} autoComplete="one-time-code" placeholder={useBackupCode ? 'XXXXXXXX' : '123456'} /></div>
      <Button type="submit" variant="primary" size="md" className="w-full" disabled={submitting}>{submitting ? 'جارٍ التحقق...' : 'تأكيد'}</Button>
      <Button type="button" variant="ghost" size="sm" className="w-full" onClick={() => { setUseBackupCode((current) => !current); setMfaCode(''); setServerError(null); }}>{useBackupCode ? 'استخدام رمز تطبيق المصادقة' : 'استخدام رمز استرداد'}</Button>
      <Button type="button" variant="ghost" size="sm" className="w-full" onClick={() => { setPendingLoginToken(null); setMfaCode(''); setServerError(null); }}>العودة إلى تسجيل الدخول</Button>
    </form>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full" dir="rtl">
      {serverError && (
        <div className="rounded-md p-3 bg-danger-soft text-danger-DEFAULT text-sm">{serverError}</div>
      )}
      {hasFailedLogin && (
        <p className="-mt-2 text-sm text-ink-500" role="status">
          نسيت كلمة المرور؟{' '}
          {egyptianWhatsappUrl(supportPhone)
            ? <a href={egyptianWhatsappUrl(supportPhone)} target="_blank" rel="noopener noreferrer" className="font-semibold text-brand-700 underline">تواصل مع الدعم</a>
            : <span>تواصل مع الدعم</span>}
        </p>
      )}

      <div>
        <label htmlFor="identifier" className="block text-sm font-medium text-ink-700 mb-1">البريد الإلكتروني أو رقم الهاتف</label>
        <Input
          id="identifier"
          name="identifier"
          type="text"
          inputMode="email"
          value={form.identifier}
          onChange={handleChange}
          placeholder="name@example.com أو 010..."
          error={fieldErrors.identifier}
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-ink-700 mb-1">كلمة المرور</label>
        <PasswordInput
          id="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          placeholder="••••••••"
          error={fieldErrors.password}
        />
      </div>

      <Button type="submit" variant="primary" size="md" className="w-full" disabled={submitting}>
        {submitting ? 'جارٍ الدخول...' : 'تسجيل الدخول'}
      </Button>

      <div className="text-center text-sm text-ink-500">
        ليس لديك حساب؟{' '}
        <Link to={registerLink} className="text-brand-700 underline">
          إنشاء حساب
        </Link>
      </div>
    </form>
  );
}

LoginForm.propTypes = {
  onSuccess: PropTypes.func,
  instructorId: PropTypes.string,
};

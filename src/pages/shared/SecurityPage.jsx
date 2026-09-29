export const route = { path: '/:instructorId/security', index: false, auth: 'required', roles: ['admin', 'assistant'], title: 'أمان الحساب' };

import React, { useState } from 'react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import authService from '../../services/authService';
import { useAuth } from '../../hooks/useAuth';

const copy = async (value) => {
  if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(value);
};

export default function SecurityPage() {
  const { user, updateUser } = useAuth();
  const [setup, setSetup] = useState(null);
  const [code, setCode] = useState('');
  const [backupCodes, setBackupCodes] = useState([]);
  const [password, setPassword] = useState('');
  const [disableCode, setDisableCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const beginSetup = async () => {
    setBusy(true); setError(''); setNotice('');
    try { setSetup((await authService.setupMfa()).data?.data || null); }
    catch (err) { setError(err?.message || 'تعذر بدء إعداد المصادقة الثنائية.'); }
    finally { setBusy(false); }
  };
  const confirm = async (event) => {
    event.preventDefault(); setBusy(true); setError('');
    try {
      const data = (await authService.confirmMfa(code.trim())).data?.data;
      setBackupCodes(data?.backupCodes || []); setSetup(null); updateUser({ mfaEnabled: true }); setNotice('تم تفعيل المصادقة الثنائية. احفظ رموز الاسترداد الآن.');
    } catch (err) { setError(err?.message || 'رمز المصادقة غير صحيح.'); }
    finally { setBusy(false); }
  };
  const disable = async (event) => {
    event.preventDefault(); setBusy(true); setError(''); setNotice('');
    try { await authService.disableMfa({ password, code: disableCode.trim() }); updateUser({ mfaEnabled: false }); setPassword(''); setDisableCode(''); setBackupCodes([]); setNotice('تم إيقاف المصادقة الثنائية.'); }
    catch (err) { setError(err?.message || 'تعذر إيقاف المصادقة الثنائية.'); }
    finally { setBusy(false); }
  };

  return <div dir="rtl" className="mx-auto max-w-2xl space-y-5"><div><h1 className="text-2xl font-bold">أمان الحساب</h1><p className="mt-1 text-sm text-ink-500">أضف طبقة حماية لتسجيل دخول حسابك.</p></div>{error && <div role="alert" className="rounded-lg bg-danger-soft p-3 text-sm text-danger-DEFAULT">{error}</div>}{notice && <div role="status" className="rounded-lg bg-success-soft p-3 text-sm text-success-DEFAULT">{notice}</div>}{backupCodes.length > 0 && <section className="rounded-2xl bg-surface-default p-6 shadow-card"><h2 className="text-lg font-semibold">رموز الاسترداد</h2><p className="mt-2 text-sm text-ink-600">احفظ هذه الرموز في مكان آمن. كل رمز يعمل مرة واحدة فقط ولن يظهر مجددًا.</p><div className="mt-4 grid grid-cols-2 gap-2 font-mono text-sm">{backupCodes.map((item) => <code key={item} className="rounded bg-surface-muted p-2 text-center">{item}</code>)}</div><Button type="button" variant="ghost" className="mt-4" onClick={() => copy(backupCodes.join('\n'))}>نسخ الرموز</Button></section>}{!user?.mfaEnabled ? <section className="rounded-2xl bg-surface-default p-6 shadow-card"><h2 className="text-lg font-semibold">تفعيل المصادقة الثنائية</h2>{!setup ? <><p className="mt-2 text-sm text-ink-600">سيظهر مفتاح إعداد تستخدمه في تطبيق المصادقة مثل Google Authenticator أو Microsoft Authenticator.</p><Button type="button" variant="primary" className="mt-4" onClick={beginSetup} disabled={busy}>{busy ? 'جارٍ البدء...' : 'بدء الإعداد'}</Button></> : <form onSubmit={confirm} className="mt-4 space-y-4"><p className="text-sm text-ink-600">أضف حسابًا يدويًا في تطبيق المصادقة، ثم أدخل المفتاح التالي:</p><div className="rounded-lg bg-surface-muted p-3 break-all font-mono text-sm">{setup.secret}</div><Button type="button" variant="ghost" size="sm" onClick={() => copy(setup.secret)}>نسخ المفتاح</Button><details className="text-sm text-ink-600"><summary className="cursor-pointer">رابط الإعداد للتطبيقات التي تدعمه</summary><p className="mt-2 break-all font-mono text-xs">{setup.otpauthUri}</p></details><div><label htmlFor="setupCode" className="mb-1 block text-sm font-medium">رمز تطبيق المصادقة</label><Input id="setupCode" value={code} onChange={(e) => setCode(e.target.value)} inputMode="numeric" autoComplete="one-time-code" placeholder="123456" /></div><Button type="submit" variant="primary" disabled={busy}>{busy ? 'جارٍ التأكيد...' : 'تأكيد التفعيل'}</Button></form>}</section> : <section className="rounded-2xl bg-surface-default p-6 shadow-card"><h2 className="text-lg font-semibold">المصادقة الثنائية مفعّلة</h2><p className="mt-2 text-sm text-ink-600">سيُطلب رمز من تطبيق المصادقة عند تسجيل الدخول القادم.</p><form onSubmit={disable} className="mt-4 space-y-3"><div><label htmlFor="currentPassword" className="mb-1 block text-sm font-medium">كلمة المرور الحالية</label><Input id="currentPassword" type="password" value={password} onChange={(e) => setPassword(e.target.value)} /></div><div><label htmlFor="disableCode" className="mb-1 block text-sm font-medium">رمز تطبيق المصادقة</label><Input id="disableCode" value={disableCode} onChange={(e) => setDisableCode(e.target.value)} inputMode="numeric" autoComplete="one-time-code" /></div><Button type="submit" variant="ghost" disabled={busy}>إيقاف المصادقة الثنائية</Button></form></section>}</div>;
}

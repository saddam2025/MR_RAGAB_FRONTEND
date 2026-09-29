export const route = { path: '/accept-invite/:token', index: false, auth: 'guest', title: 'قبول دعوة مساعد' };

import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Navbar from '../../layouts/Navbar';
import { useAuth } from '../../hooks/useAuth';
import { hasValidPassword, PASSWORD_POLICY_MESSAGE } from '../../utils/passwordPolicy';

export default function AcceptInvitePage() {
  const { token } = useParams();
  const { acceptInvite } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    if (!hasValidPassword(password)) return setError(PASSWORD_POLICY_MESSAGE);
    if (password !== confirmPassword) return setError('كلمتا المرور غير متطابقتين.');
    setSubmitting(true);
    const result = await acceptInvite(token, password);
    if (!result.ok) setError(result.error);
    setSubmitting(false);
  };

  return (
    <div dir="rtl" className="min-h-screen bg-surface-canvas text-ink-900">
      <Navbar />
      <main className="mx-auto flex min-h-[calc(100vh-84px)] max-w-lg items-center px-4 py-12">
        <section className="w-full rounded-3xl bg-surface-default p-6 shadow-card sm:p-8">
          <h1 className="text-2xl font-bold">قبول دعوة المساعد</h1>
          <p className="mt-2 text-sm leading-6 text-ink-500">عيّن كلمة مرور لحسابك، ثم ستنتقل مباشرة إلى لوحة المساعد.</p>
          <form className="mt-6 space-y-4" onSubmit={submit}>
            <div><label htmlFor="password" className="mb-1 block text-sm font-medium text-ink-700">كلمة المرور</label><Input id="password" type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} required /></div>
            <div><label htmlFor="confirmPassword" className="mb-1 block text-sm font-medium text-ink-700">تأكيد كلمة المرور</label><Input id="confirmPassword" type="password" autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required /></div>
            {error && <p role="alert" className="rounded-xl bg-danger-soft p-3 text-sm text-danger-DEFAULT">{error}</p>}
            <Button className="w-full" type="submit" disabled={submitting}>{submitting ? 'جارٍ تفعيل الحساب...' : 'تفعيل حساب المساعد'}</Button>
          </form>
        </section>
      </main>
    </div>
  );
}

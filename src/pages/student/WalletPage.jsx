export const route = { path: '/:instructorId/wallet', index: false, auth: 'required', roles: ['student'], title: 'محفظتي' };

import React, { useState } from 'react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import api from '../../services/api';
import { useAuth } from '../../hooks/useAuth';

export default function WalletPage() {
  const { user, updateUser } = useAuth();
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const redeem = async (event) => {
    event.preventDefault();
    if (!code.trim()) return;
    setLoading(true); setError(''); setMessage('');
    try {
      const response = await api.post('/scratchcards/redeem', { code: code.trim() });
      const walletBalance = response?.data?.data?.walletBalance;
      updateUser({ walletBalance });
      setCode('');
      setMessage(`تم شحن المحفظة بنجاح. رصيدك الحالي: ${walletBalance} ج.م`);
    } catch (requestError) {
      setError(requestError?.message || 'تعذر شحن البطاقة.');
    } finally { setLoading(false); }
  };

  return <div dir="rtl" className="mx-auto max-w-2xl space-y-6"><div><h1 className="text-2xl font-bold text-ink-900">محفظتي</h1><p className="mt-1 text-sm text-ink-500">اشحن رصيدك بكروت الشحن التي ينشئها المدرس، ثم استخدمه للدفع.</p></div><section className="rounded-3xl bg-surface-default p-6 shadow-card"><p className="text-sm text-ink-500">الرصيد المتاح</p><p className="mt-2 text-4xl font-extrabold text-ink-900">{user?.walletBalance ?? 0} <span className="text-lg">ج.م</span></p></section><section className="rounded-3xl bg-surface-default p-6 shadow-card"><h2 className="text-lg font-semibold text-ink-900">شحن بكارت</h2><form onSubmit={redeem} className="mt-4 flex flex-col gap-3 sm:flex-row"><Input value={code} onChange={(event) => setCode(event.target.value)} placeholder="أدخل كود الشحن" /><Button type="submit" disabled={loading}>{loading ? 'جارٍ الشحن...' : 'شحن الرصيد'}</Button></form>{message && <p className="mt-4 rounded-xl bg-success-soft p-3 text-sm text-success-DEFAULT">{message}</p>}{error && <p role="alert" className="mt-4 rounded-xl bg-danger-soft p-3 text-sm text-danger-DEFAULT">{error}</p>}</section></div>;
}

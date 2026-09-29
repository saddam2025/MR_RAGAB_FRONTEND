export const route = { path: '/:instructorId/admin/scratchcards', index: false, auth: 'required', roles: ['admin', 'assistant', 'teacher'], title: 'شحن المحفظة' };

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import api from '../../services/api';
import CourseAccessCodeGenerator from '../../components/admin/CourseAccessCodeGenerator';
import AccessCodeBatchList from '../../components/admin/AccessCodeBatchList';

export default function ScratchCardManager() {
  const { instructorId } = useParams();
  const { user } = useAuth() || {};
  const canGenerate = user?.role === 'admin' || user?.permissions?.includes('can_generate_wallet_codes');
  const canGenerateAccessCodes = user?.role === 'admin' || user?.permissions?.includes('can_generate_access_codes');
  const [count, setCount] = useState(10), [batchId, setBatchId] = useState(''), [value, setValue] = useState(50);
  const [cards, setCards] = useState([]), [batches, setBatches] = useState([]), [status, setStatus] = useState(''), [filterBatch, setFilterBatch] = useState('');
  const [oneTimeCodes, setOneTimeCodes] = useState([]), [error, setError] = useState(''), [copiedCode, setCopiedCode] = useState(''), [loading, setLoading] = useState(true);

  const loadCards = async () => {
    const params = new URLSearchParams();
    if (filterBatch.trim()) params.set('batchId', filterBatch.trim());
    if (status) params.set('status', status);
    const response = await api.get(`/instructors/${instructorId}/scratchcards${params.toString() ? `?${params}` : ''}`);
    setCards(response.data.data.cards || []);
    setBatches(response.data.data.batches || []);
  };

  useEffect(() => {
    let active = true;
    if (!canGenerate) {
      setLoading(false);
      return () => { active = false; };
    }
    setLoading(true);
    api.get(`/instructors/${instructorId}/scratchcards`).then((response) => {
      if (!active) return;
      setCards(response.data.data.cards || []); setBatches(response.data.data.batches || []);
    }).catch((requestError) => { if (active) setError(requestError?.message || 'تعذر تحميل بطاقات شحن المحفظة.'); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [canGenerate, instructorId]);

  const generate = async (event) => {
    event.preventDefault(); setError('');
    try {
      const response = await api.post(`/instructors/${instructorId}/scratchcards/generate`, { count: Number(count), value: Number(value), ...(batchId.trim() ? { batchId: batchId.trim() } : {}) });
      setOneTimeCodes(response.data.data.codes || []); setBatchId(''); await loadCards();
    } catch (requestError) { setError(requestError?.message || 'تعذر توليد بطاقات الشحن.'); }
  };
  const copy = async (code) => { try { await navigator.clipboard.writeText(code); setCopiedCode(code); setTimeout(() => setCopiedCode(''), 1500); } catch { setError('تعذر نسخ الكود.'); } };
  const copyAll = () => copy(oneTimeCodes.join('\n'));
  const remove = async (path, body, prompt) => {
    if (!canGenerate || !window.confirm(prompt)) return;
    setError('');
    try {
      await api.delete(path, body ? { data: body } : undefined);
      await loadCards();
    } catch (requestError) { setError(requestError?.message || 'تعذر حذف الأكواد.'); }
  };

  if (loading) return <div dir="rtl" className="p-6 text-ink-600">جارٍ تحميل بطاقات شحن المحفظة...</div>;
  return <div dir="rtl" className="space-y-6">{canGenerateAccessCodes && <><CourseAccessCodeGenerator instructorId={instructorId} canGenerate={canGenerateAccessCodes} /><AccessCodeBatchList instructorId={instructorId} /></>}{canGenerate && <><header><h1 className="text-xl font-semibold text-ink-900">بطاقات شحن المحفظة</h1><p className="mt-1 text-sm text-ink-500">تظهر الأكواد مرة واحدة عند التوليد فقط.</p></header>{error && <div role="alert" className="rounded-md bg-danger-soft p-3 text-danger-DEFAULT">{error}</div>}
    <form onSubmit={generate} className="grid grid-cols-1 items-end gap-4 rounded-2xl bg-surface-default p-6 shadow-card md:grid-cols-4"><div><label className="mb-1 block text-sm">عدد البطاقات</label><Input type="number" min={1} value={count} onChange={(e) => setCount(e.target.value)} disabled={!canGenerate} /></div><div><label className="mb-1 block text-sm">معرف الدفعة</label><Input value={batchId} onChange={(e) => setBatchId(e.target.value)} disabled={!canGenerate} /></div><div><label className="mb-1 block text-sm">القيمة</label><Input type="number" min={1} value={value} onChange={(e) => setValue(e.target.value)} disabled={!canGenerate} /></div><Button type="submit" variant="primary" disabled={!canGenerate}>توليد</Button></form>
    {oneTimeCodes.length > 0 && <section className="rounded-2xl bg-success-soft p-6"><div className="mb-3 flex items-center justify-between gap-3"><h2 className="font-semibold">بطاقات الشحن الجديدة — انسخها الآن</h2><Button size="sm" variant="subtle" onClick={copyAll}>نسخ كل الأكواد</Button></div><div className="grid grid-cols-2 gap-2 md:grid-cols-4">{oneTimeCodes.map((code) => <div key={code} className="flex items-center justify-between rounded bg-surface-default p-2"><code>{code}</code><Button type="button" size="sm" variant="ghost" onClick={() => copy(code)}>{copiedCode === code ? '✓' : 'نسخ'}</Button></div>)}</div></section>}
    <section className="space-y-4 rounded-2xl bg-surface-default p-6 shadow-card"><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="font-semibold">الأكواد والدفعات</h2><Button type="button" size="sm" variant="subtle" disabled={!canGenerate || batches.length === 0} onClick={() => remove(`/instructors/${instructorId}/scratchcards`, null, 'سيتم حذف سجلات جميع أكواد الشحن نهائيًا. حذف الكود لا يسترجع رصيدًا تم شحنه بالفعل. هل تريد المتابعة؟')}>حذف جميع الأكواد</Button></div><div className="grid grid-cols-1 gap-3 md:grid-cols-3"><Input placeholder="معرف الدفعة" value={filterBatch} onChange={(e) => setFilterBatch(e.target.value)} /><select className="input" value={status} onChange={(e) => setStatus(e.target.value)}><option value="">كل الحالات</option><option value="available">متاح</option><option value="redeemed">مستخدم</option></select><Button variant="ghost" onClick={() => loadCards().catch((requestError) => setError(requestError?.message || 'تعذر تطبيق الفلتر.'))}>تطبيق الفلتر</Button></div><p className="text-xs text-ink-500">ملخص الدفعات: {batches.map((batch) => <span key={batch._id} className="inline-flex items-center gap-2 pe-3">{`${batch._id}: ${batch.redeemed}/${batch.total}`}<Button type="button" size="sm" variant="subtle" disabled={!canGenerate} onClick={() => remove(`/instructors/${instructorId}/scratchcard-batches`, { batchId: batch._id }, 'سيتم حذف كل أكواد هذه الدفعة نهائيًا. حذف الكود لا يسترجع رصيدًا تم شحنه بالفعل. هل تريد المتابعة؟')}>حذف الدفعة</Button></span>)}{batches.length === 0 && 'لا توجد دفعات'}</p><div className="overflow-x-auto"><table className="w-full text-right text-sm"><thead><tr className="border-b"><th className="p-2">النوع</th><th>معرف البطاقة</th><th>القيمة</th><th>الحالة</th><th>المستخدم</th><th>تاريخ الاستخدام</th><th>الدفعة</th><th>إجراء</th></tr></thead><tbody>{cards.map((card) => <tr key={card._id} className="border-b"><td className="p-2"><Badge variant="info">شحن محفظة</Badge></td><td className="font-mono">••••{String(card._id).slice(-6)}</td><td>{card.value} ج.م</td><td><Badge variant={card.isRedeemed ? 'success' : 'neutral'}>{card.isRedeemed ? 'مستخدم' : 'متاح'}</Badge></td><td>{card.redeemedBy?.name || '—'}</td><td>{card.redeemedAt ? new Date(card.redeemedAt).toLocaleDateString('ar') : '—'}</td><td>{card.batchId}</td><td><Button type="button" size="sm" variant="subtle" disabled={!canGenerate} onClick={() => remove(`/instructors/${instructorId}/scratchcards/${card._id}`, null, 'سيتم حذف سجل هذا الكود. إذا استُخدم فلن يؤثر الحذف على الرصيد المشحون. هل تريد المتابعة؟')}>حذف</Button></td></tr>)}{cards.length === 0 && <tr><td colSpan={8} className="p-6 text-center text-ink-500">لا توجد بطاقات مطابقة</td></tr>}</tbody></table></div></section></>}
  </div>;
}

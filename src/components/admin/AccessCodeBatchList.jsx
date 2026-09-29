import React, { useEffect, useState } from 'react';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import api from '../../services/api';

const labels = {
  full_course: 'كورس كامل',
  single_lecture: 'محاضرة واحدة'
};

export default function AccessCodeBatchList({ instructorId }) {
  const [batches, setBatches] = useState([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const response = await api.get(`/instructors/${instructorId}/access-code-batches`);
    setBatches(response.data.data || []);
  };

  useEffect(() => {
    let active = true;
    const refresh = () => api.get(`/instructors/${instructorId}/access-code-batches`)
      .then((response) => { if (active) setBatches(response.data.data || []); })
      .catch((err) => { if (active) setError(err?.message || 'تعذر تحميل دفعات أكواد الوصول.'); });
    refresh();
    window.addEventListener('access-code-batches-updated', refresh);
    return () => { active = false; window.removeEventListener('access-code-batches-updated', refresh); };
  }, [instructorId]);

  const remove = async (path, body, prompt) => {
    if (busy || !window.confirm(prompt)) return;
    setBusy(true); setError('');
    try {
      await api.delete(path, body ? { data: body } : undefined);
      await load();
    } catch (err) {
      setError(err?.message || 'تعذر حذف الأكواد.');
    } finally { setBusy(false); }
  };

  return <section className="bg-surface-default rounded-2xl shadow-card p-6 space-y-4">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-semibold">دفعات أكواد الوصول</h2><p className="text-sm text-ink-500 mt-1">الأكواد نفسها لا تُعرض مرة أخرى بعد التوليد.</p></div><Button type="button" size="sm" variant="subtle" disabled={busy || batches.length === 0} onClick={() => remove(`/instructors/${instructorId}/access-codes`, null, 'سيتم حذف سجلات جميع أكواد الكورسات والمحاضرات نهائيًا. حذف الكود لا يلغي اشتراكًا تم بالفعل. هل تريد المتابعة؟')}>{busy ? 'جارٍ الحذف...' : 'حذف جميع الأكواد'}</Button></div>
    {error && <p className="text-sm text-danger-DEFAULT">{error}</p>}
    <div className="overflow-x-auto"><table className="w-full text-sm text-right"><thead><tr className="border-b"><th className="p-2">النوع</th><th>الكورس / المحاضرة</th><th>الدفعة</th><th>المستخدم</th><th>المتاح</th><th>تاريخ الإنشاء</th><th>إجراء</th></tr></thead><tbody>
      {batches.map((batch) => <React.Fragment key={`${batch.batchId}-${batch.type}-${batch.lectureId || batch.courseId}`}><tr className="border-b"><td className="p-2"><Badge variant={batch.type === 'single_lecture' ? 'info' : 'success'}>{labels[batch.type]}</Badge></td><td>{batch.course?.title_ar || batch.course?.title_en || '—'}{batch.lecture && <div className="text-xs text-ink-500">{batch.lecture.title_ar || batch.lecture.title_en}</div>}</td><td className="font-mono">{batch.batchId}</td><td>{batch.redeemed}/{batch.total}</td><td>{batch.available}</td><td>{batch.createdAt ? new Date(batch.createdAt).toLocaleDateString('ar') : '—'}</td><td><Button type="button" size="sm" variant="subtle" disabled={busy} onClick={() => remove(`/instructors/${instructorId}/access-code-batches`, { batchId: batch.batchId, type: batch.type, courseId: batch.courseId, lectureId: batch.lectureId }, 'سيتم حذف كل أكواد هذه الدفعة نهائيًا. هل تريد المتابعة؟')}>حذف الدفعة</Button></td></tr><tr className="border-b bg-surface-muted/40"><td colSpan={7} className="p-3"><div className="flex flex-wrap gap-2">{(batch.codes || []).map((code) => <span key={code._id} className="inline-flex items-center gap-2 rounded-lg border border-surface-border bg-surface-default px-2 py-1 text-xs"><code>••••{String(code._id).slice(-6)}</code><Badge variant={code.isRedeemed ? 'success' : 'neutral'}>{code.isRedeemed ? 'مستخدم' : 'متاح'}</Badge><Button type="button" size="sm" variant="subtle" disabled={busy} aria-label="حذف الكود" onClick={() => remove(`/instructors/${instructorId}/access-codes/${code._id}`, null, 'سيتم حذف هذا الكود نهائيًا. هل تريد المتابعة؟')}>حذف</Button></span>)}</div></td></tr></React.Fragment>)}
      {batches.length === 0 && !error && <tr><td colSpan={7} className="p-6 text-center text-ink-500">لا توجد دفعات أكواد وصول</td></tr>}
    </tbody></table></div>
  </section>;
}

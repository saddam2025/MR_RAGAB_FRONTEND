export const route = {
  path: '/:instructorId/parent/assignment-grades',
  index: false,
  auth: 'required',
  roles: ['parent'],
  title: 'درجات واجبات الابن'
};

import React, { useEffect, useState } from 'react';
import api from '../../services/api';

export default function ChildAssignmentGradesPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    api.get('/parents/me/child/assignment-grades')
      .then((response) => { if (active) setItems(response?.data?.data || []); })
      .catch((err) => { if (active) setError(err?.message || 'تعذر تحميل درجات الواجبات.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  if (loading) return <div dir="rtl" className="p-6 text-ink-600">جارٍ تحميل درجات الواجبات...</div>;
  return <div dir="rtl" className="mx-auto max-w-4xl space-y-5">
    <header><h1 className="text-2xl font-bold text-ink-900">درجات واجبات الابن</h1><p className="text-sm text-ink-500">الدرجات وملاحظات المساعد أو المدرس للطالب.</p></header>
    {error && <p role="alert" className="rounded-xl bg-danger-soft p-4 text-danger-DEFAULT">{error}</p>}
    {!error && items.map((item) => <article key={item._id} className="rounded-2xl bg-surface-default p-5 shadow-card"><div className="flex justify-between gap-4"><div><h2 className="font-bold">{item.lectureTitle || 'المحاضرة غير متاحة'}</h2><p className="text-sm text-ink-500">{item.courseTitle || 'الكورس غير متاح'}</p></div><b className="text-lg">{item.grade ?? 'إعادة تسليم'}</b></div><p className="mt-3 rounded-lg bg-surface-muted p-3 text-sm">{item.feedback || 'لا توجد ملاحظات.'}</p><p className="mt-2 text-xs text-ink-500">{item.gradedAt ? new Date(item.gradedAt).toLocaleDateString('ar-EG') : 'تاريخ التقييم غير متاح'}</p></article>)}
    {!error && items.length === 0 && <p className="rounded-2xl bg-surface-default p-6 text-center text-ink-500">لا توجد واجبات مُقيّمة حتى الآن.</p>}
  </div>;
}

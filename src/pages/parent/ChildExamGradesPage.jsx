export const route = {
  path: '/:instructorId/parent/exam-grades',
  index: false,
  auth: 'required',
  roles: ['parent'],
  title: 'درجات اختبارات الابن'
};

import React, { useEffect, useState } from 'react';
import api from '../../services/api';

export default function ChildExamGradesPage() {
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    api.get('/parents/me/child/exam-grades')
      .then((response) => { if (active) setGrades(response?.data?.data || []); })
      .catch((err) => { if (active) setError(err?.message || 'تعذر تحميل درجات الاختبارات.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  if (loading) return <div dir="rtl" className="p-6 text-ink-600">جارٍ تحميل الدرجات...</div>;
  return <div dir="rtl" className="mx-auto max-w-5xl space-y-6">
    <header><h1 className="text-2xl font-bold text-ink-900">درجات اختبارات الابن</h1><p className="mt-1 text-sm text-ink-500">سجل محاولات الطالب ونتائجها.</p></header>
    {error && <p role="alert" className="rounded-xl bg-danger-soft p-4 text-sm text-danger-DEFAULT">{error}</p>}
    {!error && <section className="overflow-x-auto rounded-2xl bg-surface-default shadow-card"><table className="w-full text-right text-sm"><thead><tr className="border-b border-surface-border text-ink-500"><th className="p-4">الاختبار</th><th className="p-4">المحاضرة</th><th className="p-4">الكورس</th><th className="p-4">الدرجة</th><th className="p-4">التاريخ</th></tr></thead><tbody>{grades.map((grade) => <tr key={grade._id} className="border-b border-surface-border"><td className="p-4">{grade.quizTitle || 'غير متاح'}</td><td className="p-4">{grade.lectureTitle || 'غير متاح'}</td><td className="p-4">{grade.courseTitle || 'غير متاح'}</td><td className="p-4 font-bold">{grade.score}</td><td className="p-4">{grade.submittedAt ? new Date(grade.submittedAt).toLocaleDateString('ar-EG') : '—'}</td></tr>)}{grades.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-ink-500">لا توجد درجات اختبارات حتى الآن.</td></tr>}</tbody></table></section>}
  </div>;
}

export const route = {
  path: '/:instructorId/exam-grades',
  index: false,
  auth: 'required',
  roles: ['student'],
  title: 'درجات الاختبارات'
};

import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import standaloneExamService from '../../services/standaloneExamService';

export default function ExamGradesPage() {
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [standaloneScores, setStandaloneScores] = useState([]);

  useEffect(() => {
    let active = true;
    Promise.all([api.get('/quizzes/me/exam-grades'), standaloneExamService.getMyScores()])
      .then(([quizResponse, examResponse]) => { if (active) { setGrades(quizResponse.data.data || []); setStandaloneScores(examResponse.data.data || []); } })
      .catch((err) => { if (active) setError(err?.message || 'تعذر تحميل درجات الاختبارات.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  if (loading) return <div dir="rtl" className="p-6 text-ink-600">جارٍ تحميل الدرجات...</div>;
  return <div dir="rtl" className="mx-auto max-w-5xl space-y-6">
    <div><h1 className="text-2xl font-bold text-ink-900">درجات الاختبارات</h1><p className="mt-1 text-sm text-ink-500">سجل اختبارات المحاضرات والامتحانات المستقلة.</p></div>
    {error && <p role="alert" className="rounded-xl bg-danger-soft p-4 text-sm text-danger-DEFAULT">{error}</p>}
    {!error && <section className="overflow-x-auto rounded-2xl bg-surface-default shadow-card"><table className="w-full text-right text-sm"><thead><tr className="border-b border-surface-border text-ink-500"><th className="p-4">الاختبار</th><th className="p-4">المحاضرة</th><th className="p-4">الكورس</th><th className="p-4">الدرجة</th><th className="p-4">التاريخ</th></tr></thead><tbody>{grades.map((grade) => <tr key={grade._id} className="border-b border-surface-border"><td className="p-4">{grade.quizTitle || 'عنوان الاختبار غير متاح'}</td><td className="p-4">{grade.lectureTitle || 'المحاضرة غير متاحة'}</td><td className="p-4">{grade.courseTitle || 'الكورس غير متاح'}</td><td className="p-4 font-bold">{grade.score}</td><td className="p-4">{grade.submittedAt ? new Date(grade.submittedAt).toLocaleDateString('ar-EG') : '—'}</td></tr>)}{grades.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-ink-500">لا توجد درجات اختبارات حتى الآن.</td></tr>}</tbody></table></section>}
    {!error && <section className="overflow-x-auto rounded-2xl bg-surface-default shadow-card"><div className="border-b border-surface-border p-4 font-bold text-ink-900">الامتحانات المستقلة</div><table className="w-full text-right text-sm"><thead><tr className="border-b border-surface-border text-ink-500"><th className="p-4">الامتحان</th><th className="p-4">الدرجة</th><th className="p-4">الحالة</th><th className="p-4">تاريخ التسليم</th></tr></thead><tbody>{standaloneScores.map((item) => <tr key={item.id} className="border-b border-surface-border"><td className="p-4">{item.exam?.title || 'امتحان مستقل'}</td><td className="p-4 font-bold">{item.score ?? 'قيد الحل'}</td><td className="p-4">{item.autoSubmitted ? 'تلقائي' : item.submittedAt ? 'يدوي' : 'قيد الحل'}</td><td className="p-4">{item.submittedAt ? new Date(item.submittedAt).toLocaleDateString('ar-EG') : '—'}</td></tr>)}{standaloneScores.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-ink-500">لا توجد درجات لامتحانات مستقلة حتى الآن.</td></tr>}</tbody></table></section>}
  </div>;
}

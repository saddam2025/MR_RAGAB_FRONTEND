// src/pages/parent/ChildReportsPage.jsx
export const route = {
  path: '/:instructorId/parent/reports',
  index: false,
  auth: 'parent',
  title: 'تقارير الطالب'
};

import React, { useEffect, useState } from 'react';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import { stageLabel } from '../../constants/stages';
import api from '../../services/api';

const TABS = [
  { id: 'grades', label: 'الدرجات' },
  { id: 'attendance', label: 'الحضور' },
  { id: 'assignments', label: 'الواجبات' },
  { id: 'progress', label: 'تقدم المحاضرات' }
];

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return iso;
  }
}

function GradesTab({ quizzes }) {
  return <div className="rounded-2xl bg-surface-default shadow-card p-4"><div className="overflow-x-auto"><table className="w-full text-right"><thead><tr className="text-xs text-ink-500"><th className="py-2 px-3">الاختبار</th><th className="py-2 px-3">الدرجة</th><th className="py-2 px-3">التاريخ</th></tr></thead><tbody>{quizzes.length === 0 ? <tr><td colSpan="3" className="py-4 text-center text-ink-600">لا توجد درجات حديثة</td></tr> : quizzes.map((item) => <tr key={item.id} className="border-t border-surface-border"><td className="py-3 px-3">{item.title}</td><td className="py-3 px-3 font-semibold">{item.score}</td><td className="py-3 px-3 text-sm text-ink-500">{formatDate(item.submittedAt)}</td></tr>)}</tbody></table></div></div>;
}

function AssignmentsTab({ assignments }) {
  const labels = { pending: ['معلق', 'neutral'], graded: ['مصحح', 'success'], resubmit: ['إعادة تسليم', 'danger'] };
  return <div className="rounded-2xl bg-surface-default shadow-card p-4"><div className="overflow-x-auto"><table className="w-full text-right"><thead><tr className="text-xs text-ink-500"><th className="py-2 px-3">المهمة</th><th className="py-2 px-3">الحالة</th><th className="py-2 px-3">الدرجة</th></tr></thead><tbody>{assignments.length === 0 ? <tr><td colSpan="3" className="py-4 text-center text-ink-600">لا توجد واجبات</td></tr> : assignments.map((item) => { const [label, variant] = labels[item.status] || ['غير محدد', 'neutral']; return <tr key={item.id} className="border-t border-surface-border"><td className="py-3 px-3">{item.course?.title || 'واجب'}</td><td className="py-3 px-3"><Badge variant={variant}>{label}</Badge></td><td className="py-3 px-3">{item.grade ?? '-'}</td></tr>; })}</tbody></table></div></div>;
}

function ProgressTab({ courses }) {
  return <div className="rounded-2xl bg-surface-default shadow-card p-4 space-y-4">{courses.length === 0 ? <div className="text-ink-600">لا توجد دورات بدأها الطالب.</div> : courses.map((item) => { const progress = item.quizPassed ? 100 : item.homeworkCompleted ? 50 : 0; return <div key={item.course?.id || item.updatedAt} className="space-y-2"><div className="flex items-center justify-between"><div className="font-medium text-ink-900">{item.course?.title || 'دورة'}</div><div className="text-sm text-ink-500">{progress}%</div></div><div className="h-2.5 overflow-hidden rounded-full bg-surface-muted"><div className="h-full rounded-full bg-brand-500" style={{ width: `${progress}%` }} /></div><div className="text-xs text-ink-500">آخر تحديث: {formatDate(item.updatedAt)}</div></div>; })}</div>;
}

export default function ChildReportsPage() {
  const [report, setReport] = useState(null);
  const [activeTab, setActiveTab] = useState(TABS[0].id);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let active = true;
    api.get('/parents/me/child/report')
      .then((response) => { if (active) setReport(response?.data?.data || null); })
      .catch((error) => { if (active) setLoadError(error?.message || 'تعذر تحميل التقرير.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  if (loading) return <div dir="rtl" className="py-8 text-center text-sm text-ink-500">جارٍ تحميل التقرير...</div>;
  if (loadError || !report) return <div dir="rtl" role="alert" className="rounded-xl bg-danger-soft p-4 text-center text-sm text-danger-DEFAULT">{loadError || 'لا يتوفر تقرير للطالب.'}</div>;

  return <div className="space-y-6" dir="rtl"><header className="flex items-center gap-4"><Avatar src={report.child.avatarUrl} name={report.child.name} size="lg" /><div><h1 className="text-xl font-semibold text-ink-900">{report.child.name}</h1><p className="text-sm text-ink-600">{stageLabel(report.child.stage)}</p></div></header><section className="rounded-2xl bg-surface-default shadow-card p-4"><div className="flex gap-4 overflow-auto border-b border-surface-border pb-3">{TABS.map((tab) => <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)} className={`px-3 py-2 text-sm font-medium ${activeTab === tab.id ? 'border-b-2 border-brand-500 text-brand-700' : 'text-ink-700'}`}>{tab.label}</button>)}</div><div className="mt-4">{activeTab === 'grades' && <GradesTab quizzes={report.quizzes.recent} />}{activeTab === 'attendance' && <div className="rounded-xl bg-surface-muted p-4 text-sm text-ink-600">الحضور غير متاح حالياً لأن المنصة لا تسجل بيانات حضور.</div>}{activeTab === 'assignments' && <AssignmentsTab assignments={report.assignments.recent} />}{activeTab === 'progress' && <ProgressTab courses={report.courseProgress.courses} />}</div></section></div>;
}

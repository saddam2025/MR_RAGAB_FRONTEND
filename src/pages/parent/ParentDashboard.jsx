// src/pages/parent/ParentDashboard.jsx
export const route = {
  path: '/:instructorId/parent/dashboard',
  index: false,
  auth: 'parent',
  title: 'لوحة ولي الأمر'
};

import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import { stageLabel } from '../../constants/stages';
import Button from '../../components/ui/Button';
import api from '../../services/api';

function StatCard({ title, value, hint }) {
  return (
    <div className="rounded-2xl bg-surface-default shadow-card p-4 flex flex-col gap-2">
      <div className="text-xs text-ink-500">{title}</div>
      <div className="text-2xl font-semibold text-ink-900">{value}</div>
      {hint && <div className="text-sm text-ink-600">{hint}</div>}
    </div>
  );
}

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' });
  } catch {
    return iso;
  }
}

export default function ParentDashboard() {
  const navigate = useNavigate();
  const [child, setChild] = useState(null);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let active = true;
    Promise.all([api.get('/parents/me/child'), api.get('/parents/me/child/report')])
      .then(([childResponse, reportResponse]) => {
        if (!active) return;
        setChild(childResponse?.data?.data || null);
        setReport(reportResponse?.data?.data || null);
      })
      .catch((error) => {
        if (active) setLoadError(error?.message || 'تعذر تحميل بيانات الطالب.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  const recentItems = useMemo(() => [
    ...(report?.quizzes?.recent || []).map((item) => ({ id: `quiz-${item.id}`, title: item.title, date: item.submittedAt, type: 'اختبار' })),
    ...(report?.assignments?.recent || []).map((item) => ({ id: `assignment-${item.id}`, title: item.course?.title || 'واجب', date: item.submittedAt, type: 'واجب' }))
  ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5), [report]);

  const alerts = useMemo(() => {
    if (!report) return [];
    const items = [];
    if (report.assignments?.resubmit) items.push({ id: 'resubmit', type: 'danger', text: `هناك ${report.assignments.resubmit} واجب بحاجة إلى إعادة تسليم.` });
    if (report.assignments?.pending) items.push({ id: 'pending', type: 'info', text: `هناك ${report.assignments.pending} واجب قيد الانتظار.` });
    if (typeof report.grades?.overallAverage === 'number' && report.grades.overallAverage < 60) {
      items.push({ id: 'grades', type: 'danger', text: 'متوسط الدرجات الحالي يحتاج إلى متابعة.' });
    }
    return items;
  }, [report]);

  if (loading) return <div dir="rtl" className="py-8 text-center text-sm text-ink-500">جارٍ تحميل بيانات الطالب...</div>;
  if (loadError || !child || !report) return <div dir="rtl" role="alert" className="rounded-xl bg-danger-soft p-4 text-center text-sm text-danger-DEFAULT">{loadError || 'لا تتوفر بيانات الطالب.'}</div>;

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar src={child.avatarUrl} name={child.name} size="lg" />
          <div>
            <div className="text-xl font-semibold text-ink-900">{child.name}</div>
            <Badge className="bg-surface-muted text-ink-700">{stageLabel(child.stage)}</Badge>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('../activity')}>مراسلة المعلم</Button>
          <Button variant="primary" size="sm" onClick={() => navigate('../reports')}>عرض تقرير مفصل</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard title="الأداء الأكاديمي الحالي" value={report.grades.overallAverage ?? '-'} hint="متوسط الاختبارات والواجبات المصححة" />
        <StatCard title="الواجبات المعلقة" value={report.assignments.pending} hint="عدد الواجبات التي لم تُصحح بعد" />
        <StatCard title="الدروس المكتملة" value={report.courseProgress.quizPassedCourses} hint={`من ${report.courseProgress.totalCourses} دورة متاحة`} />
      </div>

      <section className="rounded-2xl bg-surface-default shadow-card p-4">
        <div className="flex items-center justify-between mb-3"><h2 className="text-lg font-semibold">أحدث الأنشطة</h2><div className="text-sm text-ink-500">{recentItems.length} عناصر</div></div>
        {recentItems.length === 0 ? <div className="text-sm text-ink-600">لا توجد أنشطة حديثة.</div> : (
          <div className="space-y-4">{recentItems.map((item) => <div key={item.id} className="flex items-center justify-between"><div><div className="font-medium text-ink-900">{item.title}</div><div className="text-sm text-ink-600">{item.type}</div></div><div className="text-xs text-ink-500">{formatDate(item.date)}</div></div>)}</div>
        )}
      </section>

      <section className="rounded-2xl bg-surface-default shadow-card p-4">
        <div className="flex items-center justify-between mb-3"><h2 className="text-lg font-semibold">تنبيهات</h2><div className="text-sm text-ink-500">{alerts.length} تنبيه</div></div>
        {alerts.length === 0 ? <div className="text-sm text-ink-600">لا توجد تنبيهات حالياً.</div> : (
          <div className="flex flex-col gap-3">{alerts.map((alert) => <div key={alert.id} className="flex items-center gap-3"><Badge variant={alert.type === 'danger' ? 'danger' : 'info'}>{alert.type === 'danger' ? 'تنبيه' : 'معلومة'}</Badge><div className="text-sm text-ink-800">{alert.text}</div></div>)}</div>
        )}
      </section>
    </div>
  );
}

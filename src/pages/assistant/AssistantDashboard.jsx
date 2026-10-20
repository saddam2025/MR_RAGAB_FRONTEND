// src/pages/assistant/AssistantDashboard.jsx
export const route = {
  path: '/:instructorId/assistant/dashboard',
  index: false,
  auth: 'required',
  roles: ['assistant', 'admin', 'teacher'],
  title: 'لوحة المساعد'
};

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Link, useParams } from 'react-router-dom';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { CheckCheck, CircleUserRound, Clock3, RotateCcw, Search, Sparkles, X } from 'lucide-react';
// FIX: real hook file is src/hooks/useAuth.js — there is no src/contexts/AuthContext.jsx.
// The context itself is defined/exported inside AuthProvider.jsx.
import { useAuth } from '../../hooks/useAuth';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Avatar from '../../components/ui/Avatar';
import Input from '../../components/ui/Input';
import api from '../../services/api';

const STATUS_FILTERS = [
  { id: 'all', label: 'عرض الكل' },
  { id: 'pending', label: 'بانتظار التصحيح' },
  { id: 'graded', label: 'تم التصحيح' },
  { id: 'resubmit', label: 'إعادة تسليم' },
];

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleString('ar-EG', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  } catch {
    return iso;
  }
}

function getStudentDisplayName(assignment) {
  const name = typeof assignment?.studentId?.name === 'string' ? assignment.studentId.name.trim() : '';
  return {
    name: name || (assignment?.studentId ? 'اسم الطالب غير متاح' : 'طالب محذوف'),
    hasName: Boolean(name),
    deleted: !assignment?.studentId,
  };
}

function normalizeSearchText(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/\u0640/g, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/[٠-٩]/g, (digit) => String(digit.charCodeAt(0) - 0x0660))
    .replace(/[۰-۹]/g, (digit) => String(digit.charCodeAt(0) - 0x06f0))
    .toLocaleLowerCase('ar-EG')
    .trim();
}

function getSearchableAssignmentText(assignment) {
  const student = getStudentDisplayName(assignment);
  return normalizeSearchText([
    student.name,
    assignment.courseId?.title_ar,
    assignment.courseId?.title_en,
    assignment.lectureId?.title_ar,
    assignment.lectureId?.title_en,
  ].filter(Boolean).join(' '));
}

function DashboardCard({ title, children, className = '' }) {
  return <section className={`rounded-2xl border border-surface-border bg-surface-default p-5 shadow-card transition duration-200 hover:shadow-soft motion-reduce:transition-none sm:p-6 ${className}`}>
    {title && <h2 className="mb-4 text-lg font-semibold text-ink-900">{title}</h2>}
    {children}
  </section>;
}

function LoadingCard({ className = '' }) {
  return <div className={`animate-pulse rounded-2xl border border-surface-border bg-surface-default p-5 shadow-card ${className}`} aria-label="جارٍ تحميل البيانات"><div className="h-4 w-1/2 rounded bg-surface-muted" /><div className="mt-4 h-9 w-1/3 rounded bg-surface-muted" /></div>;
}

function WeeklyTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  const date = new Date(`${point.date}T12:00:00Z`);
  const weekday = new Intl.DateTimeFormat('en-US', { weekday: 'short', timeZone: 'Africa/Cairo' }).format(date);
  const fullDate = new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'Africa/Cairo' }).format(date);
  const count = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(point.count);
  return <div className="rounded-xl border border-surface-border bg-surface-default px-3 py-2 text-sm shadow-card" dir="ltr">
    <p className="font-semibold text-ink-900">{weekday} · {count}</p><p className="text-xs text-ink-500">{fullDate}</p>
  </div>;
}

export default function AssistantDashboard() {
  const { instructorId } = useParams();
  const { user } = useAuth() || {};
  const reduceMotion = useReducedMotion();
  const role = user?.role || null;
  const permissions = Array.isArray(user?.permissions) ? user.permissions : [];
  const canGrade = role === 'admin' || permissions.includes('can_grade_exams');
  const [assignments, setAssignments] = useState([]);
  const [summary, setSummary] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reload, setReload] = useState(0);
  const listRef = useRef(null);

  useEffect(() => {
    if (!canGrade) return undefined;
    const controller = new AbortController();
    setLoading(true);
    setError('');
    api.get(`/instructors/${instructorId}/assignments`, { signal: controller.signal })
      .then((response) => {
        setAssignments(response?.data?.data || []);
        setSummary(response?.data?.summary || null);
      })
      .catch((requestError) => { if (!controller.signal.aborted) setError(requestError?.message || 'تعذر تحميل واجبات الطلاب.'); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [canGrade, instructorId, reload]);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(normalizeSearchText(search)), 250);
    return () => clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    assignments.forEach((assignment) => {
      const student = getStudentDisplayName(assignment);
      if (!student.hasName) {
        console.warn('[AssistantDashboard] Homework submission has no populated student name', {
          assignmentId: assignment._id,
          missingStudentDocument: student.deleted,
        });
      }
    });
  }, [assignments]);

  const stats = useMemo(() => {
    return assignments.reduce((counts, assignment) => {
      if (Object.hasOwn(counts, assignment.status)) counts[assignment.status] += 1;
      return counts;
    }, { pending: 0, graded: 0, resubmit: 0 });
  }, [assignments]);
  const total = stats.pending + stats.graded + stats.resubmit;
  const progressPercent = total ? Math.round((stats.graded / total) * 100) : 0;
  const searchMatchedAssignments = useMemo(() => assignments.filter((item) => (
    !debouncedSearch || getSearchableAssignmentText(item).includes(debouncedSearch)
  )), [assignments, debouncedSearch]);
  const searchStatusCounts = useMemo(() => searchMatchedAssignments.reduce((counts, assignment) => {
    if (Object.hasOwn(counts, assignment.status)) counts[assignment.status] += 1;
    return counts;
  }, { all: searchMatchedAssignments.length, pending: 0, graded: 0, resubmit: 0 }), [searchMatchedAssignments]);
  const visibleAssignments = useMemo(() => searchMatchedAssignments.filter((item) => (
    activeFilter === 'all' || item.status === activeFilter
  )), [activeFilter, searchMatchedAssignments]);
  const oldestPending = useMemo(() => assignments.filter((item) => item.status === 'pending')
    .sort((left, right) => new Date(left.submittedAt || 0) - new Date(right.submittedAt || 0))[0] || null, [assignments]);
  const oldestPendingStudent = oldestPending ? getStudentDisplayName(oldestPending) : null;
  const weeklyData = summary?.correctedByDay || [];
  const chartTop = Math.max(4, Math.ceil(Math.max(0, ...weeklyData.map((point) => point.count)) / 4) * 4);
  const chartTicks = [0, chartTop / 4, chartTop / 2, (chartTop * 3) / 4, chartTop];
  const chartAllZero = weeklyData.length === 7 && weeklyData.every((point) => point.count === 0);
  const chartSummary = weeklyData.map((point) => {
    const date = new Date(`${point.date}T12:00:00Z`);
    return `${new Intl.DateTimeFormat('en-US', { weekday: 'short', timeZone: 'Africa/Cairo' }).format(date)}: ${new Intl.NumberFormat('en-US').format(point.count)}`;
  }).join(', ');

  const retry = () => {
    setReload((value) => value + 1);
  };
  const selectFilter = (filter) => {
    setActiveFilter(filter);
    listRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen bg-surface-canvas text-ink-900" dir="rtl">
      <div className="container mx-auto px-4 py-6">
        <header className="mb-6">
          <div className="flex items-center justify-between gap-4">
            <div className="text-right">
              <h1 className="text-2xl font-semibold">مرحباً {user?.name || 'المساعد'}</h1>
              <p className="text-sm text-ink-500 mt-1">لوحة تصحيح الواجبات</p>
            </div>
            <div>
              <Avatar name={user?.name || 'المساعد'} src={user?.avatarUrl || user?.avatar} size="md" />
            </div>
          </div>
        </header>

        {/* Permission guard — assistants without can_grade_exams (and non-admins)
            never see the grading queue at all, just this disabled-state card. */}
        {!canGrade ? (
          <div className="rounded-2xl bg-surface-muted p-8 text-center">
            <div className="mb-4">
              <svg className="mx-auto w-12 h-12 text-ink-500" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M12 2v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M6 8v10a2 2 0 002 2h8a2 2 0 002-2V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <rect x="8" y="10" width="8" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </div>
            <div className="text-lg font-semibold text-ink-900">ليس لديك صلاحية تصحيح الواجبات</div>
            <div className="mt-2 text-sm text-ink-500">تواصل مع المدرس لطلب تفعيل صلاحية تصحيح الواجبات.</div>
          </div>
        ) : (
          <>
            <section className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3" aria-label="ملخص الواجبات">
              {[{ id: 'pending', label: 'الواجبات المعلقة', value: stats.pending, Icon: Clock3, tone: 'warning' },
                { id: 'graded', label: 'تم تصحيحها', value: stats.graded, Icon: CheckCheck, tone: 'success' },
                { id: 'resubmit', label: 'تحتاج إعادة تسليم', value: stats.resubmit, Icon: RotateCcw, tone: 'danger' }].map(({ id, label, value, Icon, tone }) => (
                <button key={id} type="button" onClick={() => (error ? retry() : selectFilter(id))} aria-label={error ? `إعادة تحميل ${label}` : `${label}: ${value}`} className={`group flex min-h-28 items-center gap-4 rounded-2xl border bg-surface-default p-5 text-right shadow-card transition duration-200 hover:-translate-y-0.5 hover:shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 motion-reduce:transition-none motion-reduce:hover:transform-none ${id === 'pending' && value > 0 ? 'border-brand-300' : id === 'resubmit' && value > 0 ? 'border-danger-DEFAULT' : 'border-surface-border'}`}>
                  <span className={`grid size-12 shrink-0 place-items-center rounded-2xl ${tone === 'warning' ? 'bg-brand-100 text-brand-700' : tone === 'success' ? 'bg-success-soft text-success-text' : 'bg-danger-soft text-danger-DEFAULT'}`}><Icon size={21} aria-hidden="true" /></span>
                  <span><span className="block text-sm text-ink-500">{label}</span>{loading ? <span className="mt-2 block h-8 w-12 animate-pulse rounded bg-surface-muted" /> : error ? <span className="mt-2 block text-sm text-danger-DEFAULT">تعذر التحميل</span> : <span className="mt-1 block text-3xl font-bold text-ink-900">{value.toLocaleString('ar-EG')}</span>}</span>
                </button>
              ))}
            </section>
            {error && <div role="alert" className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-danger-soft p-3 text-sm text-danger-DEFAULT"><span>{error}</span><Button type="button" variant="subtle" size="sm" onClick={retry}>إعادة المحاولة</Button></div>}

            <section className="mb-5 grid grid-cols-1 gap-4 lg:grid-cols-[minmax(250px,0.8fr)_minmax(0,1.6fr)]">
              {loading ? <><LoadingCard className="min-h-72" /><LoadingCard className="min-h-72" /></> : error ? <>
                <DashboardCard title="نسبة التصحيح"><div className="grid min-h-48 place-content-center gap-3 text-center"><p className="text-sm text-danger-DEFAULT">تعذر تحميل الإحصاءات.</p><Button type="button" variant="subtle" size="sm" onClick={retry}>إعادة المحاولة</Button></div></DashboardCard>
                <DashboardCard title="الواجبات المصححة آخر 7 أيام"><div className="grid min-h-48 place-content-center gap-3 text-center"><p className="text-sm text-danger-DEFAULT">تعذر تحميل الرسم البياني.</p><Button type="button" variant="subtle" size="sm" onClick={retry}>إعادة المحاولة</Button></div></DashboardCard>
              </> : <>
                <DashboardCard title="نسبة التصحيح">
                  <div className="grid justify-items-center">
                    <div className="relative size-44" role="img" aria-label={`تم تصحيح ${stats.graded} من ${total} واجبات، ${progressPercent} بالمئة`}>
                      <svg viewBox="0 0 120 120" className="size-full -rotate-90" aria-hidden="true">
                        <circle cx="60" cy="60" r="48" fill="none" stroke="var(--surface-border)" strokeWidth="12" />
                        <motion.circle cx="60" cy="60" r="48" fill="none" stroke="var(--brand-500)" strokeWidth="12" strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 48}`} initial={{ strokeDashoffset: 2 * Math.PI * 48 }} animate={{ strokeDashoffset: 2 * Math.PI * 48 * (1 - progressPercent / 100) }} transition={{ duration: reduceMotion ? 0 : 1, ease: 'easeOut' }} />
                      </svg>
                      <div className="absolute inset-0 grid content-center justify-items-center"><strong className="text-3xl font-bold text-ink-900">{progressPercent.toLocaleString('ar-EG')}٪</strong><span className="mt-1 text-xs text-ink-500">{stats.graded.toLocaleString('ar-EG')} من {total.toLocaleString('ar-EG')}</span></div>
                    </div>
                    {total === 0 && <p className="mt-2 text-sm text-ink-500">لا توجد واجبات في الوقت الحالي.</p>}
                  </div>
                </DashboardCard>
                <DashboardCard title="الواجبات المصححة آخر 7 أيام" className="min-w-0">
                  <div className="mb-3 flex justify-end"><Badge variant="info">واجب</Badge></div>
                  <div dir="ltr" role="img" aria-label={`Corrected homework in the last 7 days: ${chartSummary}`}>
                    <ul className="sr-only">{weeklyData.map((point) => <li key={point.date}>{point.date}: {point.count}</li>)}</ul>
                    <div className="h-56 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={weeklyData} margin={{ top: 8, right: 12, left: 2, bottom: 0 }}>
                          <defs><linearGradient id="assistantWeeklyFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--brand-500)" stopOpacity={0.28} /><stop offset="100%" stopColor="var(--brand-500)" stopOpacity={0.01} /></linearGradient></defs>
                          <CartesianGrid vertical={false} stroke="var(--surface-border)" strokeDasharray="4 6" />
                          <XAxis dataKey="date" tickFormatter={(value) => new Intl.DateTimeFormat('en-US', { weekday: 'short', timeZone: 'Africa/Cairo' }).format(new Date(`${value}T12:00:00Z`))} tick={{ fill: 'var(--ink-500)', fontSize: 12 }} axisLine={false} tickLine={false} />
                          <YAxis domain={[0, chartTop]} ticks={chartTicks} allowDecimals={false} tickFormatter={(value) => new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value)} tick={{ fill: 'var(--ink-500)', fontSize: 12 }} axisLine={false} tickLine={false} width={30} />
                          <Tooltip content={<WeeklyTooltip />} />
                          <Area type="monotone" dataKey="count" stroke="var(--brand-500)" strokeWidth={3} fill="url(#assistantWeeklyFill)" isAnimationActive={!reduceMotion} animationDuration={900} activeDot={{ r: 5, fill: 'var(--surface-default)', stroke: 'var(--brand-500)', strokeWidth: 2 }} dot={{ r: 4, fill: 'var(--surface-default)', stroke: 'var(--brand-500)', strokeWidth: 2 }} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  {chartAllZero && <p className="mt-2 text-center text-xs text-ink-500">لم يتم تصحيح واجبات خلال آخر 7 أيام.</p>}
                </DashboardCard>
              </>}
            </section>

            {loading && <LoadingCard className="mb-5 min-h-24" />}
            {error && <DashboardCard title="التالي في الطابور" className="mb-5"><div className="flex min-h-16 flex-wrap items-center justify-between gap-3"><p className="text-sm text-danger-DEFAULT">تعذر تحميل الواجب التالي.</p><Button type="button" variant="subtle" size="sm" onClick={retry}>إعادة المحاولة</Button></div></DashboardCard>}
            {!loading && !error && <section className={`mb-5 flex flex-wrap items-center gap-4 rounded-2xl border p-5 shadow-card ${oldestPending ? 'border-brand-300 bg-brand-50' : 'border-success-DEFAULT bg-success-soft'}`}>
              <span className={`grid size-12 place-items-center rounded-2xl ${oldestPending ? 'bg-brand-100 text-brand-700' : 'bg-success-soft text-success-text'}`}><Sparkles size={21} aria-hidden="true" /></span>
              <div className="min-w-0 flex-1"><h2 className="font-semibold text-ink-900">{oldestPending ? 'التالي في الطابور' : stats.resubmit ? 'لا توجد واجبات بانتظار التصحيح' : 'كل الواجبات متصححة'}</h2>{oldestPending ? <p className="mt-1 truncate text-sm text-ink-600" title={`${oldestPendingStudent.name} · ${oldestPending.courseId?.title_ar || oldestPending.courseId?.title_en || 'كورس غير متاح'}${(oldestPending.lectureId?.title_ar || oldestPending.lectureId?.title_en) ? ` · ${oldestPending.lectureId.title_ar || oldestPending.lectureId.title_en}` : ''} · ${formatDate(oldestPending.submittedAt)}`}>{oldestPendingStudent.name} · {oldestPending.courseId?.title_ar || oldestPending.courseId?.title_en || 'كورس غير متاح'}{(oldestPending.lectureId?.title_ar || oldestPending.lectureId?.title_en) ? ` · ${oldestPending.lectureId.title_ar || oldestPending.lectureId.title_en}` : ''} · {formatDate(oldestPending.submittedAt)}</p> : <p className="mt-1 text-sm text-ink-500">{stats.resubmit ? `${stats.resubmit.toLocaleString('ar-EG')} واجب بحاجة لإعادة التسليم من الطالب.` : 'لا توجد واجبات بانتظار التصحيح حالياً.'}</p>}</div>
              {oldestPending && <Link to={`/${instructorId}/assistant/grade/${oldestPending._id}`}><Button type="button" variant="primary">ابدأ التصحيح</Button></Link>}
            </section>}

            <DashboardCard title="قائمة الواجبات" className="box-border min-w-0 max-w-full overflow-hidden">
              <div ref={listRef} className="scroll-mt-4" />
              <div className="mb-4 grid gap-3 lg:grid-cols-[minmax(220px,0.8fr)_minmax(0,1.5fr)]">
                <div className="relative min-w-0">
                  <label htmlFor="assistant-homework-search" className="sr-only">ابحث باسم الطالب أو الكورس أو الوحدة</label>
                  <Input id="assistant-homework-search" type="text" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="ابحث باسم الطالب أو الكورس أو الوحدة" className="[&>input]:!pe-12 [&>input]:!ps-11" />
                  <Search size={17} aria-hidden="true" className="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 text-ink-400" />
                  {search.length > 0 && <button type="button" onClick={() => { setSearch(''); setDebouncedSearch(''); }} aria-label="مسح البحث" className="absolute end-3 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full text-ink-500 transition hover:bg-surface-muted hover:text-ink-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"><X size={16} /></button>}
                </div>
                <div className="flex min-w-0 flex-wrap items-center gap-2" role="tablist" aria-label="تصفية الواجبات">
                  {STATUS_FILTERS.map((filter) => {
                    const count = searchStatusCounts[filter.id];
                    return <Button key={filter.id} type="button" size="sm" variant={activeFilter === filter.id ? 'ghost' : 'subtle'} onClick={() => setActiveFilter(filter.id)} aria-pressed={activeFilter === filter.id} className="gap-2">{filter.label}<span className="rounded-pill bg-surface-default/70 px-2 py-0.5 text-xs">{(count || 0).toLocaleString('ar-EG')}</span></Button>;
                  })}
                </div>
              </div>
              <p className="mb-3 text-xs text-ink-500">أعداد الحالات مطابقة لنتائج البحث وتتجاهل حالة التصفية المحددة.</p>
              {loading ? <div className="space-y-3"><div className="h-16 animate-pulse rounded-xl bg-surface-muted" /><div className="h-16 animate-pulse rounded-xl bg-surface-muted" /><div className="h-16 animate-pulse rounded-xl bg-surface-muted" /></div>
                : error ? <div className="grid min-h-36 place-content-center gap-3 text-center"><p className="text-sm text-danger-DEFAULT">تعذر تحميل قائمة الواجبات.</p><Button type="button" variant="subtle" size="sm" onClick={retry}>إعادة المحاولة</Button></div>
                  : visibleAssignments.length === 0 ? <div className="rounded-xl bg-surface-muted p-7 text-center text-sm text-ink-500">لا توجد واجبات مطابقة لهذا البحث أو الفلتر.</div>
                    : <div className="grid items-start gap-3 [grid-template-columns:repeat(auto-fill,minmax(min(100%,300px),1fr))]">
                      {visibleAssignments.map((assignment, index) => {
                        const student = getStudentDisplayName(assignment);
                        const studentName = student.name;
                        const firstName = student.hasName ? student.name.trim().split(/\s+/)[0] : '';
                        const course = assignment.courseId?.title_ar || assignment.courseId?.title_en || 'كورس غير متاح';
                        const lecture = assignment.lectureId?.title_ar || assignment.lectureId?.title_en;
                        const gradeValue = Number(assignment.grade);
                        const maxGrade = 100;
                        const graded = assignment.status !== 'pending' && assignment.grade !== null && assignment.grade !== undefined && assignment.grade !== '' && Number.isFinite(gradeValue);
                        const gradePercent = graded && maxGrade > 0 ? Math.max(0, Math.min(100, (gradeValue / maxGrade) * 100)) : 0;
                        const gradeText = graded ? `${new Intl.NumberFormat('ar-EG', { maximumFractionDigits: 2 }).format(gradeValue)} / ${new Intl.NumberFormat('ar-EG').format(maxGrade)}` : '';
                        const statusLabel = assignment.status === 'graded' ? 'تم التصحيح' : assignment.status === 'resubmit' ? 'إعادة تسليم' : 'بانتظار التصحيح';
                        const variant = assignment.status === 'graded' ? 'success' : assignment.status === 'resubmit' ? 'danger' : 'neutral';
                        return <motion.article key={assignment._id} initial={reduceMotion ? false : { opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduceMotion ? 0 : 0.2, delay: reduceMotion ? 0 : Math.min(index, 8) * 0.035 }} className="box-border grid min-w-0 w-full max-w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-x-2.5 gap-y-2 overflow-hidden rounded-2xl border border-surface-border bg-surface-default p-3 shadow-card transition duration-200 hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-soft motion-reduce:transition-none motion-reduce:hover:transform-none">
                          <div className="col-span-2 flex min-w-0 items-center gap-2.5">
                            {student.hasName ? <Avatar name={firstName.charAt(0)} size="sm" className="shrink-0" /> : <span aria-hidden="true" className="grid size-9 shrink-0 place-items-center rounded-full bg-surface-muted text-ink-500"><CircleUserRound size={18} /></span>}
                            <p className={`min-w-0 flex-1 truncate text-sm font-semibold ${student.hasName ? 'text-ink-900' : 'text-ink-500'}`} title={studentName}>{studentName}</p>
                            <Badge variant={variant} className="w-fit max-w-full shrink-0">{statusLabel}</Badge>
                          </div>
                          <p className="col-span-2 min-w-0 truncate text-xs text-ink-600" title={`${course}${lecture ? ` · ${lecture}` : ''}`}>{course}{lecture ? ` · ${lecture}` : ''}</p>
                          <div className="col-span-2 grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-end gap-2">
                            <div className="min-w-0">
                              <div className="flex min-w-0 items-center justify-between gap-2 text-xs text-ink-500"><span className="min-w-0 truncate" title={formatDate(assignment.submittedAt)}>{formatDate(assignment.submittedAt)}</span>{graded && <bdi dir="ltr" className="shrink-0 whitespace-nowrap font-semibold text-ink-700">{gradeText}</bdi>}</div>
                              {graded && <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-pill bg-surface-muted"><span className="block h-full max-w-full rounded-pill bg-brand-500" style={{ width: `${gradePercent}%` }} /></div>}
                            </div>
                            {assignment.status === 'pending' ? <Link className="shrink-0" to={`/${instructorId}/assistant/grade/${assignment._id}`}><Button type="button" variant="primary" size="sm">صحّح</Button></Link> : <Link className="shrink-0" to={`/${instructorId}/assistant/grade/${assignment._id}?view=1`}><Button type="button" variant="ghost" size="sm">عرض</Button></Link>}
                          </div>
                        </motion.article>;
                      })}
                    </div>}
            </DashboardCard>
          </>
        )}
      </div>
    </div>
  );
}

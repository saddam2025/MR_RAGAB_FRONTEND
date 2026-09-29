export const route = {
  path: '/:instructorId/admin/dashboard',
  index: false,
  auth: 'required',
  roles: ['admin'],
  title: 'لوحة التحكم'
};

import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ArrowLeft, CreditCard, FileDown, GraduationCap, Settings, Zap } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import Badge from '../../components/ui/Badge';
import api from '../../services/api';

function formatCurrency(amount) {
  return `${Number(amount || 0).toLocaleString('ar-EG')} ج.م`;
}

function formatMonth(month) {
  const [year, monthNumber] = String(month).split('-').map(Number);
  if (!year || !monthNumber) return month;
  return new Intl.DateTimeFormat('ar-EG', { month: 'short' }).format(new Date(Date.UTC(year, monthNumber - 1, 1)));
}

function sourceLabel(source) {
  const labels = {
    paymob: 'Paymob (دفع إلكتروني)',
    scratchcard: 'كروت الشحن',
    access_code: 'أكواد الوصول',
    wallet: 'المحفظة'
  };
  return labels[source] || source || 'مصدر آخر';
}

function SummaryCard({ label, value }) {
  return (
    <div className="bg-surface-default rounded-2xl shadow-card p-5">
      <p className="text-sm text-ink-500">{label}</p>
      <p className="text-2xl font-bold text-ink-900 mt-2">{value}</p>
    </div>
  );
}

export default function AdminDashboard() {
  const { user } = useAuth() || {};
  const { instructorId } = useParams();
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadSummary() {
      if (!instructorId) return;
      setError('');
      try {
        const response = await api.get(`/instructors/${instructorId}/dashboard/summary`);
        if (!cancelled) setSummary(response.data?.data || null);
      } catch (requestError) {
        if (!cancelled) setError(requestError?.message || 'تعذر تحميل ملخص لوحة التحكم. حاول مرة أخرى.');
      }
    }

    loadSummary();
    return () => { cancelled = true; };
  }, [instructorId]);

  const chartData = useMemo(
    () => (summary?.revenueSeries || []).map((item) => ({ ...item, label: formatMonth(item.month) })),
    [summary]
  );
  const totalRevenueSources = useMemo(
    () => (summary?.revenueBySource || []).reduce((total, source) => total + Number(source.amount || 0), 0),
    [summary]
  );
  const quickActions = [
    { to: `/${instructorId}/admin/courses`, title: 'إدارة الدورات', description: 'إضافة الدروس وتنظيم المحتوى', Icon: GraduationCap, highlight: true },
    { to: `/${instructorId}/admin/scratchcards`, title: 'أكواد الدخول / كروت الشحن', description: 'إدارة الأكواد وعمليات الشحن', Icon: CreditCard },
    ...(user?.role === 'admin' ? [{ to: `/${instructorId}/admin/settings`, title: 'الإعدادات', description: 'تخصيص إعدادات المنصة', Icon: Settings }] : []),
    { to: `/${instructorId}/admin/students/export`, title: 'تصدير بيانات الطلاب', description: 'تحميل تقرير بيانات الطلاب', Icon: FileDown },
  ];

  return (
    <div dir="rtl" className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-ink-900">مرحباً {user?.name || 'المشرف'} 👋</h1>
        <p className="text-sm text-ink-500 mt-1">نظرة عامة على أداء المنصة</p>
      </div>

      {error && <div role="alert" className="rounded-xl bg-danger-soft p-4 text-sm text-danger-DEFAULT">{error}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard label="إجمالي الطلاب النشطين" value={Number(summary?.activeStudents || 0).toLocaleString('ar-EG')} />
        <SummaryCard label="الدورات المنشورة" value={Number(summary?.publishedCourses || 0).toLocaleString('ar-EG')} />
        <SummaryCard
          label="واجبات معلقة للمساعدين"
          value={summary?.pendingGradingAvailable === false ? 'غير متاح' : Number(summary?.pendingGrading || 0).toLocaleString('ar-EG')}
        />
        <SummaryCard label="إيرادات الشهر الحالي" value={formatCurrency(summary?.monthlyRevenue)} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 bg-surface-default rounded-2xl shadow-card p-6">
          <h2 className="text-lg font-medium text-ink-900 mb-6">الإيرادات خلال آخر 6 أشهر</h2>
          <div className="h-64" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="label" tickLine={false} axisLine={false} />
                <YAxis tickFormatter={(value) => Number(value).toLocaleString('ar-EG')} tickLine={false} axisLine={false} width={56} />
                <Tooltip formatter={(value) => formatCurrency(value)} labelFormatter={(_, payload) => payload?.[0]?.payload?.month || ''} />
                <Bar dataKey="amount" name="الإيرادات" fill="#22c55e" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="bg-surface-default rounded-2xl shadow-card p-6">
          <h2 className="text-lg font-medium text-ink-900 mb-4">الإيرادات حسب المصدر</h2>
          <div className="space-y-4">
            {(summary?.revenueBySource || []).map((source, index) => {
              const percentage = totalRevenueSources ? Math.round((Number(source.amount || 0) / totalRevenueSources) * 100) : 0;
              const variant = index % 2 === 0 ? 'info' : 'success';
              return (
                <div key={source.source} className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant={variant}>{sourceLabel(source.source)}</Badge>
                    <span className="text-sm text-ink-700 font-medium">{percentage}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-surface-muted overflow-hidden">
                    <div className={variant === 'info' ? 'h-full rounded-full bg-info-DEFAULT' : 'h-full rounded-full bg-success-DEFAULT'} style={{ width: `${percentage}%` }} />
                  </div>
                  <p className="text-xs text-ink-500">{formatCurrency(source.amount)}</p>
                </div>
              );
            })}
            {summary && !summary.revenueBySource?.length && <p className="text-sm text-ink-500">لا توجد إيرادات ناجحة حتى الآن.</p>}
          </div>
        </section>
      </div>

      <section className="rounded-[var(--radius-xl)] border border-surface-border bg-surface-default p-6 shadow-card">
        <h2 className="mb-5 flex items-center gap-3 text-xl font-bold text-ink-900">
          <Zap size={24} className="text-teal-DEFAULT" aria-hidden="true" />
          إجراءات سريعة
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {quickActions.map(({ to, title, description, Icon, highlight }) => (
            <Link
              key={to}
              to={to}
              className={`group flex min-h-[132px] items-center justify-between gap-4 rounded-3xl border p-5 transition duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 ${highlight ? 'border-teal-DEFAULT/70 bg-teal-soft/70 hover:border-teal-DEFAULT hover:bg-teal-soft' : 'border-brand-300/35 bg-surface-default hover:border-brand-400/70 hover:bg-surface-muted'}`}
            >
              <div className="flex min-w-0 items-center gap-4">
                <span className={`grid h-16 w-16 shrink-0 place-items-center rounded-full border ${highlight ? 'border-teal-DEFAULT/60 bg-teal-DEFAULT/10 text-teal-DEFAULT' : 'border-brand-300/50 bg-brand-100 text-brand-500 dark:bg-brand-100 dark:text-brand-400'}`}>
                  <Icon size={30} strokeWidth={1.8} aria-hidden="true" />
                </span>
                <span className="min-w-0 text-right">
                  <span className={`block text-lg font-bold ${highlight ? 'text-teal-DEFAULT' : 'text-ink-900 dark:text-white'}`}>{title}</span>
                  <span className="mt-1 block text-sm text-ink-500 dark:text-ink-700">{description}</span>
                </span>
              </div>
              <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-full transition-colors ${highlight ? 'bg-teal-DEFAULT/15 text-teal-DEFAULT group-hover:bg-teal-DEFAULT group-hover:text-navy-900' : 'bg-brand-100 text-brand-500 group-hover:bg-brand-200 dark:text-brand-400'}`}>
                <ArrowLeft size={22} aria-hidden="true" />
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

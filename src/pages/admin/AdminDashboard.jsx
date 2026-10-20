export const route = {
  path: '/:instructorId/admin/dashboard',
  index: false,
  auth: 'required',
  roles: ['admin'],
  title: 'لوحة التحكم'
};

import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, CreditCard, FileDown, GraduationCap, Settings, Zap } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import AnalysisSection from '../../components/admin/AnalysisSection';

export default function AdminDashboard() {
  const { user } = useAuth() || {};
  const { instructorId } = useParams();
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

      <AnalysisSection instructorId={instructorId} />

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

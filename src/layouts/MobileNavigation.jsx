import React from 'react';
import {
  Award, BookOpen, ClipboardCheck, FileCheck2, GraduationCap,
  LayoutDashboard, Library, LockKeyhole, Plus, ShieldCheck, Users,
} from 'lucide-react';
import { NavLink, useLocation, useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const tenantNavigation = {
  student: [
    { to: 'catalog', label: 'الكورسات', icon: BookOpen },
    { to: 'my-courses', label: 'كورساتي', icon: Library, end: true },
    { to: 'assignment-grades', label: 'درجات الواجب', icon: ClipboardCheck, end: true },
    { to: 'exam-grades', label: 'درجات الامتحان', icon: FileCheck2, end: true },
  ],
  assistant: [
    { to: 'assistant/dashboard', label: 'الرئيسية', icon: LayoutDashboard, end: true },
    { to: 'assistant/grade', label: 'الواجبات', icon: ClipboardCheck },
    { to: 'students', label: 'الطلاب', icon: Users },
    { to: 'security', label: 'الأمان', icon: ShieldCheck, end: true },
  ],
  admin: [
    { to: 'admin/dashboard', label: 'الرئيسية', icon: LayoutDashboard, end: true },
    { to: 'admin/courses', label: 'الدورات', icon: BookOpen },
    { to: 'students', label: 'الطلاب', icon: Users },
    { to: 'security', label: 'الأمان', icon: ShieldCheck, end: true },
  ],
  teacher: [
    { to: 'assistant/dashboard', label: 'الرئيسية', icon: LayoutDashboard, end: true },
    { to: 'assistant/grade', label: 'الواجبات', icon: ClipboardCheck },
    { to: 'admin/courses', label: 'الدورات', icon: BookOpen },
    { to: 'catalog', label: 'استكشاف', icon: Award },
  ],
  parent: [
    { to: 'parent/dashboard', label: 'الرئيسية', icon: LayoutDashboard, end: true },
    { to: 'parent/courses', label: 'الدورات', icon: GraduationCap },
    { to: 'parent/reports', label: 'التقارير', icon: FileCheck2 },
    { to: 'parent/activity', label: 'النشاط', icon: Users },
  ],
};

const superAdminNavigation = [
  { to: '/super-admin', label: 'الرئيسية', icon: LayoutDashboard, end: true },
  { to: '/super-admin/tenants', label: 'المؤسسات', icon: Users, end: true },
  { to: '/super-admin/tenants/new', label: 'إضافة مؤسسة', icon: Plus, end: true },
  { to: '/super-admin/security', label: 'الأمان', icon: LockKeyhole, end: true },
];

export default function MobileNavigation() {
  const { user } = useAuth();
  const { instructorId } = useParams();
  const { pathname } = useLocation();
  const isSuperAdmin = user?.role === 'super_admin';
  const items = isSuperAdmin ? superAdminNavigation : tenantNavigation[user?.role];

  if (!items?.length || (!isSuperAdmin && !instructorId)) return null;

  return (
    <nav dir="rtl" aria-label="التنقل الرئيسي للهاتف" className="mobile-navigation fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-surface-border bg-surface-default/95 px-1 shadow-[0_-8px_24px_rgba(15,35,65,.08)] backdrop-blur md:hidden">
      {items.map(({ to, label, icon: Icon, end }) => {
        const target = isSuperAdmin ? to : `/${instructorId}/${to}`;
        const isCatalogPath = !isSuperAdmin && to === 'catalog' && (pathname === `/${instructorId}/catalog` || pathname.startsWith(`/${instructorId}/stages/`));
        const isTenantListPath = isSuperAdmin && to === '/super-admin/tenants' && pathname.startsWith('/super-admin/tenants/') && !pathname.startsWith('/super-admin/tenants/new');

        return (
          <NavLink
            key={to}
            to={target}
            end={end}
            aria-label={label}
            title={label}
            className={({ isActive }) => `flex min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-1 py-1 text-[11px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${isActive || isCatalogPath || isTenantListPath ? 'text-brand-700 dark:text-brand-300' : 'text-ink-500 hover:text-ink-900 dark:hover:text-white'}`}
          >
            <Icon size={20} strokeWidth={2} aria-hidden="true" />
            <span className="w-full truncate text-center">{label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}

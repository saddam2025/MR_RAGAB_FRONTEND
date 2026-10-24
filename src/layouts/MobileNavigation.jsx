import React from 'react';
import { BookOpen, ClipboardCheck, FileCheck2, Library } from 'lucide-react';
import { NavLink, useLocation, useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const items = [
  { to: 'catalog', label: 'الكورسات', icon: BookOpen },
  { to: 'my-courses', label: 'كورساتي', icon: Library, end: true },
  { to: 'assignment-grades', label: 'درجات الواجب', icon: ClipboardCheck, end: true },
  { to: 'exam-grades', label: 'درجات الامتحان', icon: FileCheck2, end: true },
];

export default function MobileNavigation() {
  const { user } = useAuth();
  const { instructorId } = useParams();
  const { pathname } = useLocation();
  if (user?.role !== 'student' || !instructorId) return null;

  return (
    <nav aria-label="التنقل الرئيسي للهاتف" className="mobile-navigation fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-surface-border bg-surface-default/95 px-1 shadow-[0_-8px_24px_rgba(15,35,65,.08)] backdrop-blur md:hidden">
      {items.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={`/${instructorId}/${to}`}
          end={end}
          aria-label={label}
          title={label}
          className={({ isActive }) => {
            const isCatalogPath = to === 'catalog' && (pathname === `/${instructorId}/catalog` || pathname.startsWith(`/${instructorId}/stages/`));
            return `flex min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-1 py-1 text-[11px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${isActive || isCatalogPath ? 'text-brand-700 dark:text-brand-300' : 'text-ink-500 hover:text-ink-900 dark:hover:text-white'}`;
          }}
        >
          <Icon size={20} strokeWidth={2} aria-hidden="true" />
          <span className="w-full truncate text-center">{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}

import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Building2, LayoutDashboard, LogOut, Menu, Plus, ShieldCheck, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import ThemeToggle from '../components/ui/ThemeToggle';
import Logo from '../components/common/Logo';

const navItems = [
  { to: '/super-admin', label: 'نظرة عامة', icon: LayoutDashboard, end: true },
  { to: '/super-admin/tenants', label: 'المؤسسات', icon: Building2 },
  { to: '/super-admin/tenants/new', label: 'إضافة مؤسسة', icon: Plus },
  { to: '/super-admin/security', label: 'أمان الحساب', icon: ShieldCheck },
];

export default function SuperAdminLayout() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();
  useEffect(() => { setOpen(false); }, [location.pathname]);
  useEffect(() => {
    if (!open) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previousOverflow; };
  }, [open]);
  const links = (mobile = false) => <nav className="flex-1 space-y-2">{navItems.map(({ to, label, icon: Icon, end }) => <NavLink key={to} to={to} end={end} onClick={() => mobile && setOpen(false)} className={({ isActive }) => `flex items-center gap-4 justify-start flex-row-reverse px-6 py-3 text-[15px] transition duration-200 ${isActive ? 'rounded-l-full bg-surface-default text-ink-900 font-semibold' : 'rounded-xl text-white/70 hover:bg-white/5 hover:text-white'}`}><span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white/10 text-white"><Icon size={19} /></span>{label}</NavLink>)}</nav>;
  const side = <><div className="mb-8 flex items-center gap-3 px-2"><Logo light /><div className="text-xs text-white/60">منصة التعلم الذكي</div></div><div className="mb-6 rounded-2xl bg-white/5 p-4 ring-1 ring-white/10"><p className="font-semibold text-white">الإدارة العليا</p><p className="mt-1 truncate text-xs text-white/60">{user?.name || 'Super Admin'}</p></div>{links()}<button type="button" onClick={() => { setOpen(false); logout(); }} className="mt-4 flex w-full items-center gap-4 justify-start flex-row-reverse rounded-xl px-6 py-3 text-[15px] font-medium text-white/70 transition hover:bg-white/5 hover:text-white"><span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white/10"><LogOut size={19} /></span>تسجيل الخروج</button></>;
  return <div dir="rtl" className="min-h-screen bg-surface-canvas text-ink-900"><aside className="sidebar-scroll fixed inset-y-0 right-0 z-30 hidden h-[100dvh] w-72 overscroll-contain overflow-y-auto bg-[var(--sidebar-bg)] px-4 py-8 text-white lg:flex lg:flex-col">{side}</aside><header className="sticky top-3 z-20 mx-4 flex h-16 items-center justify-between rounded-[2rem] bg-[#1081f5] px-5 text-white shadow-panel lg:mr-80 lg:px-7"><button type="button" onClick={() => setOpen(true)} className="rounded-xl p-2 hover:bg-white/10 lg:hidden" aria-label="فتح القائمة"><Menu /></button><div><p className="text-sm font-bold">لوحة الإدارة العليا</p><p className="text-xs text-white/70">إدارة المؤسسات والاشتراكات</p></div><ThemeToggle className="!border-white/20 !bg-white/10 !text-white !shadow-none" /></header>{open && <div className="fixed inset-0 z-40 lg:hidden"><button type="button" aria-label="إغلاق القائمة" className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} /><aside className="sidebar-scroll absolute inset-y-0 right-0 flex h-[100dvh] w-72 flex-col overscroll-contain overflow-y-auto bg-[var(--sidebar-bg)] px-4 py-8 text-white shadow-panel"><button type="button" onClick={() => setOpen(false)} className="mb-4 self-start rounded-lg p-2 text-white hover:bg-white/10"><X /></button>{side}</aside></div>}<main className="p-4 sm:p-6 lg:mr-72 lg:p-8"><Outlet /></main></div>;
}

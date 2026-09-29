import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import clsx from 'clsx';
import { Bell } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import ThemeToggle from '../components/ui/ThemeToggle';
import Button from '../components/ui/Button';
import Logo from '../components/common/Logo';
import { dashboardPathFor } from '../utils/dashboardPath';
import notificationService from '../services/notificationService';

const HamburgerIcon = () => <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5"><path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>;
const UserIcon = () => <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4"><path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM6 20c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>;

export default function Navbar({ sidebarOpen = false, onToggleSidebar, sticky = false }) {
  const { user } = useAuth() || {};
  const { instructorId } = useParams();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const canSeeNotifications = ['assistant', 'student', 'parent'].includes(user?.role);
  const userId = user?._id || user?.id;
  const homeLink = instructorId ? `/${instructorId}` : '/';
  const loginLink = instructorId ? `/${instructorId}/login` : '/login';
  const registerLink = instructorId ? `/${instructorId}/register` : '/register';
  const accountLink = dashboardPathFor(user);

  useEffect(() => {
    if (!canSeeNotifications) {
      setUnreadCount(0);
      return undefined;
    }
    let active = true;
    const loadUnreadCount = () => {
      notificationService.unreadCount()
        .then((response) => { if (active) setUnreadCount(Number(response?.data?.data?.count) || 0); })
        .catch(() => { if (active) setUnreadCount(0); });
    };
    loadUnreadCount();
    const intervalId = window.setInterval(loadUnreadCount, 30000);
    window.addEventListener('focus', loadUnreadCount);
    window.addEventListener('notifications-updated', loadUnreadCount);
    return () => {
      active = false;
      window.clearInterval(intervalId);
      window.removeEventListener('focus', loadUnreadCount);
      window.removeEventListener('notifications-updated', loadUnreadCount);
    };
  }, [canSeeNotifications, userId]);

  const submitSearch = (event) => {
    event?.preventDefault();
    if (!instructorId) return;
    const query = search.trim();
    // Staff manage the same course content from the management page; sending
    // them to the student catalogue made the navbar search appear inert.
    const target = ['admin', 'assistant', 'teacher'].includes(user?.role)
      ? `/${instructorId}/admin/courses`
      : `/${instructorId}/catalog`;
    navigate(`${target}?search=${encodeURIComponent(query)}`);
  };

  return (
    <><header className={clsx(sticky ? 'sticky top-3 z-30' : 'relative z-30', 'mx-auto flex w-[calc(100%-2rem)] max-w-[1800px] items-center justify-between rounded-[2rem] bg-[#1081f5] px-5 py-3 shadow-[0_18px_45px_rgba(6,70,151,.25)] sm:px-7')}>
      <div className="flex min-w-0 items-center gap-3">
        {onToggleSidebar && <button type="button" onClick={onToggleSidebar} aria-label={sidebarOpen ? 'إغلاق القائمة' : 'فتح القائمة'} aria-expanded={sidebarOpen} className="rounded-xl p-2 text-white transition hover:bg-white/10 lg:hidden"><HamburgerIcon /></button>}
        <Logo to={homeLink} light />
      </div>
      <nav className="flex items-center gap-2 sm:gap-3">
        {user?.role === 'student' && <form onSubmit={submitSearch} className="hidden items-center gap-2 rounded-full bg-[#173454] px-4 py-2 text-sm font-bold text-white lg:flex"><label htmlFor="site-search" className="sr-only">ابحث في المحتوى</label><button type="button" onClick={() => submitSearch()} aria-label="بحث" className="rounded p-1 transition hover:bg-white/10">⌕</button><input id="site-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="ابحث في المحتوى" className="w-32 bg-transparent text-white outline-none placeholder:text-white/75" /></form>}
        <ThemeToggle className="!border-white/20 !bg-white/10 !text-white !shadow-none" />
        {canSeeNotifications && instructorId && <Link to={`/${instructorId}/notifications`} aria-label={unreadCount ? `الإشعارات، ${unreadCount} غير مقروء` : 'الإشعارات'} title="الإشعارات" className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"><Bell size={19} aria-hidden="true" />{unreadCount > 0 && <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-danger-DEFAULT px-1 text-center text-[10px] font-bold leading-5 text-white">{unreadCount > 99 ? '99+' : unreadCount}</span>}</Link>}
        {user ? <Link to={accountLink} className="inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-2 text-sm font-bold text-[#0759a8] transition hover:bg-white"><UserIcon /><span className="hidden sm:inline">حسابي</span></Link> : <><Link to={loginLink}><Button variant="ghost" size="sm">تسجيل الدخول</Button></Link><Link to={registerLink}><Button variant="primary" size="sm">حساب جديد</Button></Link></>}
      </nav>
    </header></>
  );
}

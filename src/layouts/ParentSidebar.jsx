// src/layouts/ParentSidebar.jsx
import React, { useContext } from 'react';
import { NavLink, useParams } from 'react-router-dom';
import { InstructorContext } from '../contexts/InstructorContext';
import { useAuth } from '../hooks/useAuth'; // FIX: was importing non-existent useAuth from AuthProvider
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';
import Logo from '../components/common/Logo';
import { ChevronLeft, ChevronRight, LogOut } from 'lucide-react';
import { SidebarIcon, sidebarActiveItemClass } from './Sidebar';

function Item({ to, icon, children }) {
  return (
    <NavLink
      to={to}
      title={children}
      aria-label={children}
      className={({ isActive }) =>
        `sidebar-nav-item flex items-center gap-3 justify-start flex-row-reverse px-4 py-3 rounded-xl text-[15px] font-medium transition-all duration-300 ${
          isActive
            ? `sidebar-nav-item-active ${sidebarActiveItemClass}`
            : 'text-white/70 hover:text-white hover:bg-[var(--sidebar-bg-soft)]'
        }`
      }
    >
      <span className="sidebar-nav-icon flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-white"><SidebarIcon name={icon} /></span>
      <span className="sidebar-nav-label">{children}</span>
    </NavLink>
  );
}

export default function ParentSidebar({ collapsed = false, onToggleCollapsed, showCollapseToggle = false }) {
  const { selected } = useContext(InstructorContext);
  const { user, logout } = useAuth();
  const { instructorId } = useParams();
  const base = instructorId ? `/${instructorId}` : '';

  return (
    <div data-sidebar-collapsed={collapsed} className={`sidebar-scroll flex h-full max-h-[100dvh] flex-col overscroll-contain bg-[var(--sidebar-bg)] px-4 py-8 text-white overflow-y-auto${collapsed ? ' sidebar-collapsed' : ''}`}>
      <div className="sidebar-brand mb-8 flex items-center justify-between gap-3 px-2">
        {!collapsed && <div><Logo light /><div className="text-xs text-white/60">بوابة ولي الأمر</div></div>}
        {showCollapseToggle && <button type="button" onClick={onToggleCollapsed} aria-label={collapsed ? 'توسيع القائمة الجانبية' : 'تصغير القائمة الجانبية'} title={collapsed ? 'توسيع القائمة' : 'تصغير القائمة'} className="sidebar-collapse-toggle hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white/80 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white md:flex">{collapsed ? <ChevronLeft size={19} aria-hidden="true" /> : <ChevronRight size={19} aria-hidden="true" />}</button>}
      </div>

      <div className="sidebar-profile mb-6 rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
        <div className="flex items-center gap-3">
          <Avatar src={user?.avatarUrl || user?.avatar || selected?.avatar} name={user?.name || selected?.name || 'ولي الأمر'} size="md" />
          <div className="flex-1 min-w-0">
            <div className="truncate font-semibold text-white">{user?.name || 'ولي الأمر'}</div>
            <div className="truncate text-xs text-white/60">{selected?.name || 'منصة تعليمية'}</div>
          </div>
          <div>
            <Badge className="text-xs">{user?.role || 'ولي أمر'}</Badge>
          </div>
        </div>

      </div>

      <nav className="sidebar-navigation flex-1 space-y-1.5" aria-label="قائمة ولي الأمر">
        <Item to={`${base}/parent/dashboard`} icon="dashboard">لوحة التحكم</Item>
        <Item to={`${base}/parent/reports`} icon="exam_grades">تقارير الأبناء</Item>
        <Item to={`${base}/parent/courses`} icon="my_courses">كورسات الابن</Item>
        <Item to={`${base}/parent/exam-grades`} icon="exam_grades">درجات الاختبارات</Item>
        <Item to={`${base}/parent/assignment-grades`} icon="assignment_turned_in">درجات الواجبات والملاحظات</Item>
        <Item to={`${base}/parent/activity`} icon="messages">النشاط والرسائل</Item>
        <Item to={`${base}/parent/leaderboard`} icon="military_tech">لوحة الشرف</Item>
      </nav>

      <div className="sidebar-footer mt-auto border-t border-white/10 pt-2">
        <button type="button" onClick={logout} aria-label="تسجيل الخروج" title="تسجيل الخروج" className="sidebar-nav-item flex w-full items-center gap-3 rounded-xl px-4 py-3 text-[15px] font-medium text-white/70 transition hover:bg-white/5 hover:text-white">
          <span className="sidebar-nav-icon flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-white/10"><LogOut className="h-5 w-5" aria-hidden="true" /></span>
          <span className="sidebar-nav-label">تسجيل الخروج</span>
        </button>
      </div>

    </div>
  );
}

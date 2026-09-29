// src/layouts/ParentSidebar.jsx
import React, { useContext } from 'react';
import { NavLink, useParams } from 'react-router-dom';
import { InstructorContext } from '../contexts/InstructorContext';
import { useAuth } from '../hooks/useAuth'; // FIX: was importing non-existent useAuth from AuthProvider
import Avatar from '../components/ui/Avatar';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Logo from '../components/common/Logo';
import { sidebarActiveItemClass } from './Sidebar';

function Item({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 justify-start flex-row-reverse px-4 py-3 rounded-xl text-[15px] font-medium transition-all duration-300 ${
          isActive
            ? sidebarActiveItemClass
            : 'text-white/70 hover:text-white hover:bg-[var(--sidebar-bg-soft)]'
        }`
      }
    >
      {children}
    </NavLink>
  );
}

export default function ParentSidebar() {
  const { selected } = useContext(InstructorContext);
  const { user, logout } = useAuth();
  const { instructorId } = useParams();
  const base = instructorId ? `/${instructorId}` : '';

  return (
    <div className="sidebar-scroll flex h-full max-h-[100dvh] flex-col overscroll-contain bg-[var(--sidebar-bg)] px-4 py-8 text-white overflow-y-auto">
      <div className="mb-8 flex items-center gap-3 px-2">
        <Logo light />
        <div className="text-xs text-white/60">بوابة ولي الأمر</div>
      </div>

      <div className="mb-6 rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
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

        <div className="mt-4">
          <Button
            variant="ghost"
            size="sm"
            className="w-full !bg-white/10 !text-white !border-white/20 !shadow-none hover:!bg-white/20"
            onClick={logout}
          >
            تسجيل الخروج
          </Button>
        </div>
      </div>

      <nav className="flex-1 space-y-1.5">
        <Item to={`${base}/parent/dashboard`}>لوحة التحكم</Item>
        <Item to={`${base}/parent/reports`}>تقارير الأبناء</Item>
        <Item to={`${base}/parent/courses`}>كورسات الابن</Item>
        <Item to={`${base}/parent/exam-grades`}>درجات الاختبارات</Item>
        <Item to={`${base}/parent/assignment-grades`}>درجات الواجبات والملاحظات</Item>
        <Item to={`${base}/parent/activity`}>النشاط والرسائل</Item>
        <Item to={`${base}/parent/leaderboard`}>لوحة الشرف</Item>
      </nav>

    </div>
  );
}

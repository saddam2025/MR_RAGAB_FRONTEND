// src/layouts/Sidebar.jsx
//
// FULL REBUILD per the Stitch reference designs (login/plan/grading screens).
// All existing logic is preserved exactly — InstructorContext, useParams,
// useAuth, role-gated nav sections (student/assistant/admin/parent), and the
// instructor-switcher list. Only styling/markup changed.
//
// CUTOUT TECHNIQUE — lifted directly from the Stitch export rather than the
// earlier hand-built version, since Stitch generated it correctly for a
// right-side RTL sidebar from the start (rounded-l-full on the tab itself,
// with ::after/::before positioned at right-0 using large negative offsets
// and a spread box-shadow matching the page canvas color, instead of the
// earlier small-corner-radius stacking trick).
//
// Now a fixed-position element (see Layouts.jsx) — no longer needs the old
// -m-5/p-5 edge-bleed hack, since it fills its own <aside> completely with
// no ancestor padding to fight against.
//
// LOGOUT — moved here from Navbar.jsx, which no longer renders it (per the
// redesign's reduced navbar scope). Without this, there'd be no way to log
// out at all.

import React, { useContext } from 'react';
import { NavLink, useLocation, useParams } from 'react-router-dom';
import {
  Award, BookCopy, BookOpen, ChevronLeft, ChevronRight, Clapperboard,
  ClipboardCheck, ClipboardList, FileCheck2, FileDown, KeyRound,
  Languages, LayoutDashboard, Library, LogOut, MessageSquare, Settings,
  ShieldCheck, Upload, Users, WalletCards,
} from 'lucide-react';
import { InstructorContext } from '../contexts/InstructorContext';
import Avatar from '../components/ui/Avatar';
import { useAuth } from '../hooks/useAuth';
import Logo from '../components/common/Logo';
import { managedInstructorIdFor } from '../utils/dashboardPath';

const sidebarIcons = {
  dashboard: LayoutDashboard,
  menu_book: BookOpen,
  course_management: BookCopy,
  my_courses: Library,
  military_tech: Award,
  assignment_turned_in: ClipboardCheck,
  exam_grades: FileCheck2,
  upload_file: Upload,
  vpn_key: KeyRound,
  admin_panel_settings: ShieldCheck,
  quiz: ClipboardList,
  settings: Settings,
  family_restroom: Users,
  translate: Languages,
  wallet: WalletCards,
  reels: Clapperboard,
  messages: MessageSquare,
  students_export: FileDown,
};

export function SidebarIcon({ name, className = 'h-5 w-5' }) {
  const Icon = sidebarIcons[name] || BookOpen;
  return <Icon className={className} aria-hidden="true" />;
}

export const sidebarActiveItemClass = 'flex items-center gap-4 justify-start flex-row-reverse rounded-l-full bg-surface-default text-ink-900 font-semibold px-6 py-3 transition duration-200';

function Item({ to, icon, children, activeWhen }) {
  const location = useLocation();
  const explicitActive = activeWhen ? activeWhen(location) : null;

  return (
    <NavLink to={to} title={children} aria-label={children} className="group block">
      {({ isActive }) => (
        <span
          className={`sidebar-nav-item ${(explicitActive ?? isActive) ? 'sidebar-nav-item-active ' : ''}${
            (explicitActive ?? isActive)
              ? sidebarActiveItemClass
              : 'flex items-center gap-4 justify-start flex-row-reverse text-white/70 hover:text-white hover:bg-white/5 rounded-xl px-6 py-3 transition-colors duration-200'
          }`}
        >
          <span className="sidebar-nav-icon flex h-9 w-9 items-center justify-center rounded-2xl bg-white/10 text-white">
            <SidebarIcon name={icon} />
          </span>
          <span className="sidebar-nav-label text-[15px]">{children}</span>
        </span>
      )}
    </NavLink>
  );
}

function BrandHeader({ collapsed, onToggleCollapsed, showCollapseToggle }) {
  return (
    <div className="sidebar-brand mb-8 flex items-center justify-between gap-3 px-2">
      {!collapsed && <Logo light />}
      {showCollapseToggle && <button type="button" onClick={onToggleCollapsed} aria-label={collapsed ? 'توسيع القائمة الجانبية' : 'تصغير القائمة الجانبية'} title={collapsed ? 'توسيع القائمة' : 'تصغير القائمة'} className="sidebar-collapse-toggle hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white/80 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white md:flex">{collapsed ? <ChevronLeft size={19} aria-hidden="true" /> : <ChevronRight size={19} aria-hidden="true" />}</button>}
    </div>
  );
}

export default function Sidebar({ collapsed = false, onToggleCollapsed, showCollapseToggle = false }) {
  const { selected, instructors } = useContext(InstructorContext);
  const { instructorId } = useParams();
  const { user, logout } = useAuth() || {};
  const role = user?.role || null;
  const permissions = Array.isArray(user?.permissions) ? user.permissions : [];
  const canGrade = role === 'admin' || role === 'teacher' || permissions.includes('can_grade_exams');
  const canCreateQuizzes = role === 'admin' || permissions.includes('can_create_quizzes');
  const canGenerateWalletCodes = role === 'admin' || permissions.includes('can_generate_wallet_codes');
  const canGenerateAccessCodes = role === 'admin' || permissions.includes('can_generate_access_codes');

  // Public pages use a tenant slug in the URL. Management pages must instead
  // use the authenticated owner's ObjectId, otherwise the backend correctly
  // rejects the request as an invalid or foreign instructor.
  const managedInstructorId = managedInstructorIdFor(user);
  const base = managedInstructorId || instructorId ? `/${managedInstructorId || instructorId}` : '';

  const InstructorsList = () => (
    <div className="sidebar-instructors mt-6 px-3 pb-2 pt-4 border-t border-white/10">
      <div className="text-xs font-medium text-white/50 mb-3">المدرسون المتاحون</div>
      <div className="flex flex-col gap-1.5">
        {instructors.slice(0, 4).map((ins) => (
          <NavLink
            key={ins.id || ins._id || ins.name}
            to={`/${ins.id || ins._id || ins.name}`}
            className="flex items-center gap-3 px-2 py-2 rounded-xl text-white/80 hover:bg-[var(--sidebar-bg-soft)] hover:text-white transition-colors duration-300"
          >
            <Avatar src={ins.avatar} name={ins.name} size="sm" />
        <div className="text-sm">{ins.name}</div>
          </NavLink>
        ))}
      </div>
    </div>
  );

  const LogoutLink = () => (
    <button
      type="button"
      onClick={logout}
      aria-label="تسجيل الخروج"
      title="تسجيل الخروج"
      className="sidebar-nav-item sidebar-logout-item group mt-4 flex w-full items-center gap-4 justify-start flex-row-reverse text-white/70 hover:text-white hover:bg-white/5 rounded-xl transition-colors duration-300 px-6 py-3"
    >
      <span className="sidebar-nav-icon inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-white/10 text-white transition-transform group-hover:-translate-x-1"><LogOut className="h-5 w-5" aria-hidden="true" /></span>
      <span className="sidebar-nav-label text-[15px] font-medium">تسجيل الخروج</span>
    </button>
  );

  const Header = ({ avatarSrc, name, subtitle }) => (
    <div className="sidebar-profile mb-6 rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
      <div className="flex items-center gap-3">
        <Avatar src={avatarSrc} name={name} size="md" />
        <div className="min-w-0">
          <div className="truncate font-semibold text-white">{name}</div>
          <div className="truncate text-xs text-white/60">{subtitle}</div>
        </div>
      </div>
    </div>
  );

  // ---- ASSISTANT ----
  if (role === 'assistant') {
    return (
      <div data-sidebar-collapsed={collapsed} className={`sidebar-scroll flex h-full max-h-[100dvh] flex-col overscroll-contain bg-[var(--sidebar-bg)] px-4 py-8 text-white overflow-y-auto${collapsed ? ' sidebar-collapsed' : ''}`}>
        <BrandHeader collapsed={collapsed} onToggleCollapsed={onToggleCollapsed} showCollapseToggle={showCollapseToggle} />
        <Header avatarSrc={user?.avatarUrl || user?.avatar || selected?.avatar} name={user?.name || selected?.name || 'مساعد'} subtitle="لوحة المساعد" />

        <nav className="sidebar-navigation flex-1 space-y-2" aria-label="القائمة الجانبية">
          <Item to={`${base}/assistant/dashboard`} icon="dashboard">لوحة المساعد</Item>
          {canGrade && <Item to={`${base}/assistant/grade`} icon="assignment_turned_in">تصحيح الواجبات</Item>}
          {/* Requirement #15: assistants have identical upload permissions to teachers */}
          <Item to={`${base}/admin/courses`} icon="upload_file">رفع محتوى تعليمي</Item>
          <Item to={`${base}/admin/reels`} icon="reels">رفع ريل</Item>
          {canCreateQuizzes && <Item to={`${base}/admin/quiz-builder`} icon="quiz">منشئ اختبارات المحاضرات</Item>}
          <Item to={`${base}/admin/standalone-exams`} icon="exam_grades">امتحانات منفصلة</Item>
          <Item to={`${base}/assistant/messages`} icon="messages">رسائل أولياء الأمور</Item>
          <Item to={`${base}/students`} icon="family_restroom">الطلاب</Item>
          <Item to={`${base}/leaderboard`} icon="military_tech">لوحة الشرف</Item>
          {(canGenerateWalletCodes || canGenerateAccessCodes) && <Item to={`${base}/admin/scratchcards`} icon="vpn_key">إدارة الأكواد</Item>}
          <Item to={`${base}/security`} icon="admin_panel_settings">أمان الحساب</Item>
          <Item to={`${base}/admin/students/export`} icon="students_export">تصدير الطلاب</Item>
        </nav>

        <InstructorsList />
        <div className="sidebar-footer mt-auto border-t border-white/10 pt-2">
          <LogoutLink />
        </div>
      </div>
    );
  }

  // ---- TEACHER / ADMIN ----
  if (role === 'admin' || role === 'teacher') {
    return (
      <div data-sidebar-collapsed={collapsed} className={`sidebar-scroll flex h-full max-h-[100dvh] flex-col overscroll-contain bg-[var(--sidebar-bg)] px-4 py-8 text-white overflow-y-auto${collapsed ? ' sidebar-collapsed' : ''}`}>
        <BrandHeader collapsed={collapsed} onToggleCollapsed={onToggleCollapsed} showCollapseToggle={showCollapseToggle} />
        <Header avatarSrc={user?.avatarUrl || user?.avatar || selected?.avatar} name={user?.name || selected?.name || 'اختر مدرس'} subtitle={selected?.tagline || 'منصة تعليمية'} />

        <nav className="sidebar-navigation flex-1 space-y-2" aria-label="القائمة الجانبية">
          <Item to={`${base}/admin/dashboard`} icon="dashboard">لوحة التحكم</Item>
          <Item to={`${base}/catalog`} icon="menu_book">الكورسات</Item>

          <div className="sidebar-nav-section pt-3 mt-3 border-t border-white/10">
            <div className="sidebar-nav-section-label text-xs font-medium text-white/50 px-3 mb-2">المساعِد</div>
            <div className="space-y-2">
              <Item to={`${base}/assistant/dashboard`} icon="dashboard">لوحة المساعد</Item>
              {canGrade && <Item to={`${base}/assistant/grade`} icon="assignment_turned_in">تصحيح الواجبات</Item>}
            </div>
          </div>

          <div className="sidebar-nav-section pt-3 mt-3 border-t border-white/10">
            <div className="sidebar-nav-section-label text-xs font-medium text-white/50 px-3 mb-2">الإدارة</div>
            <div className="space-y-2">
              <Item to={`${base}/admin/courses`} icon="course_management">إدارة الكورسات</Item>
              <Item to={`${base}/admin/quiz-builder`} icon="quiz">منشئ الاختبارات</Item>
              {role === 'admin' && <Item to={`${base}/admin/standalone-exams`} icon="exam_grades">امتحانات منفصلة</Item>}
              <Item to={`${base}/admin/scratchcards`} icon="vpn_key">أكواد الوصول</Item>
              <Item to={`${base}/students`} icon="family_restroom">الطلاب</Item>
              <Item to={`${base}/leaderboard`} icon="military_tech">لوحة الشرف</Item>
              <Item to={`${base}/admin/students/export`} icon="students_export">تصدير الطلاب</Item>
              <Item to={`${base}/admin/reels`} icon="reels">رفع مقطع سريع</Item>
              {role === 'admin' && <Item to={`${base}/admin/settings`} icon="settings">إعدادات المنصة</Item>}
              <Item to={`${base}/security`} icon="admin_panel_settings">أمان الحساب</Item>
            </div>
          </div>

        </nav>

        <InstructorsList />
        <div className="sidebar-footer mt-auto border-t border-white/10 pt-2">
          <LogoutLink />
        </div>
      </div>
    );
  }

  // ---- STUDENT (default) ----
  return (
    <div data-sidebar-collapsed={collapsed} className={`sidebar-scroll flex h-full max-h-[100dvh] flex-col overscroll-contain bg-[var(--sidebar-bg)] px-4 py-8 text-white overflow-y-auto${collapsed ? ' sidebar-collapsed' : ''}`}>
      <BrandHeader collapsed={collapsed} onToggleCollapsed={onToggleCollapsed} showCollapseToggle={showCollapseToggle} />
      <Header avatarSrc={user?.avatarUrl || user?.avatar || selected?.avatar} name={user?.name || 'طالب'} subtitle={selected?.name || 'منصة تعليمية'} />

      <nav className="sidebar-navigation flex-1 space-y-2" aria-label="القائمة الجانبية">
        <Item to={`${base}/dashboard`} icon="dashboard" activeWhen={({ pathname, hash }) => pathname === `${base}/dashboard` && hash !== '#parent-access-code' && hash !== '#current-courses'}>لوحة التحكم</Item>
        <Item to={`${base}/catalog`} icon="menu_book" activeWhen={({ pathname }) => pathname === `${base}/catalog` || pathname.startsWith(`${base}/stages/`)}>الكورسات</Item>
          <Item to={`${base}/my-courses`} icon="my_courses">كورساتي</Item>
        <Item to={`${base}/translator`} icon="translate">المترجم الناطق</Item>
        <Item to={`${base}/wallet`} icon="wallet">محفظتي</Item>
        <Item to={`${base}/reels`} icon="reels">الريلز</Item>
        <Item to={`${base}/leaderboard`} icon="military_tech">لوحة الشرف</Item>
        <Item to={`${base}/exam-grades`} icon="exam_grades">درجات الاختبارات</Item>
        <Item to={`${base}/assignment-grades`} icon="assignment_turned_in">درجات الواجبات</Item>
        <Item to={`${base}/dashboard#parent-access-code`} icon="family_restroom" activeWhen={({ pathname, hash }) => pathname === `${base}/dashboard` && hash === '#parent-access-code'}>كود ربط ولي الأمر</Item>
      </nav>

      <InstructorsList />
      <div className="sidebar-footer mt-auto border-t border-white/10 pt-2">
        <LogoutLink />
      </div>
    </div>
  );
}

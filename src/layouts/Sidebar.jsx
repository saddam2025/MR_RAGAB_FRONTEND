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
import { InstructorContext } from '../contexts/InstructorContext';
import Avatar from '../components/ui/Avatar';
import { useAuth } from '../hooks/useAuth';
import Logo from '../components/common/Logo';
import { managedInstructorIdFor } from '../utils/dashboardPath';

function SidebarIcon({ name }) {
  const shared = 'h-5 w-5';
  switch (name) {
    case 'dashboard':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={shared} aria-hidden="true">
          <path d="M4 7h7v7H4V7Z" fill="currentColor" />
          <path d="M13 4h7v16h-7V4Z" fill="currentColor" opacity="0.7" />
        </svg>
      );
    case 'menu_book':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={shared} aria-hidden="true">
          <path d="M6 4h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6V4Z" stroke="currentColor" strokeWidth="1.8" />
          <path d="M6 8h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case 'military_tech':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={shared} aria-hidden="true">
          <path d="M12 3 6 8v10h12V8l-6-5Z" stroke="currentColor" strokeWidth="1.8" />
          <path d="M6 8h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case 'assignment_turned_in':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={shared} aria-hidden="true">
          <path d="M8 12.5 11 15.5 16 9.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2Z" stroke="currentColor" strokeWidth="1.8" />
        </svg>
      );
    case 'upload_file':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={shared} aria-hidden="true">
          <path d="M12 16V6m0 0L8 10m4-4 4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M6 18h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case 'vpn_key':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={shared} aria-hidden="true">
          <path d="M7 12a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z" stroke="currentColor" strokeWidth="1.8" />
          <path d="M10 12h10v2h-2v2h-2v-2H10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'admin_panel_settings':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={shared} aria-hidden="true">
          <path d="M12 4l7 3v5c0 5-3 7-7 7s-7-2-7-7V7l7-3Z" stroke="currentColor" strokeWidth="1.8" />
          <path d="M12 11v5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M9 14h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case 'quiz':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={shared} aria-hidden="true">
          <path d="M12 3 4 6v12l8 3 8-3V6l-8-3Z" stroke="currentColor" strokeWidth="1.8" />
          <path d="M9 9h6M9 13h3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case 'settings':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={shared} aria-hidden="true">
          <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
          <path d="M4.93 4.93 7.76 7.76M16.24 16.24 19.07 19.07M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case 'family_restroom':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={shared} aria-hidden="true">
          <path d="M8 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm8 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" stroke="currentColor" strokeWidth="1.8" />
          <path d="M5 20c0-3 2-5 5-5s5 2 5 5M15 17c0-2.5 2-4.5 4.5-4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" fill="none" className={shared} aria-hidden="true">
          <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
        </svg>
      );
  }
}

export const sidebarActiveItemClass = 'flex items-center gap-4 justify-start flex-row-reverse rounded-l-full bg-surface-default text-ink-900 font-semibold px-6 py-3 transition duration-200';

function Item({ to, icon, children, activeWhen }) {
  const location = useLocation();
  const explicitActive = activeWhen ? activeWhen(location) : null;

  return (
    <NavLink to={to} className="group block">
      {({ isActive }) => (
        <span
          className={
            (explicitActive ?? isActive)
              ? sidebarActiveItemClass
              : 'flex items-center gap-4 justify-start flex-row-reverse text-white/70 hover:text-white hover:bg-white/5 rounded-xl px-6 py-3 transition-colors duration-200'
          }
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white/10 text-white">
            <SidebarIcon name={icon} />
          </span>
          <span className="text-[15px]">{children}</span>
        </span>
      )}
    </NavLink>
  );
}

function BrandHeader() {
  return (
    <div className="mb-8 flex items-center gap-3 px-2">
      <Logo light />
    </div>
  );
}

export default function Sidebar() {
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
    <div className="mt-6 px-3 pb-2 pt-4 border-t border-white/10">
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
      className="group mt-4 flex w-full items-center gap-4 justify-start flex-row-reverse text-white/70 hover:text-white hover:bg-white/5 rounded-xl transition-colors duration-300 px-6 py-3"
    >
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-white/10 text-white transition-transform group-hover:-translate-x-1">
        <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
          <path d="M10 8l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M14 12H4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M20 4v16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </span>
      <span className="text-[15px] font-medium">تسجيل الخروج</span>
    </button>
  );

  const Header = ({ avatarSrc, name, subtitle }) => (
    <div className="mb-6 rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
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
      <div className="sidebar-scroll flex h-full max-h-[100dvh] flex-col overscroll-contain bg-[var(--sidebar-bg)] px-4 py-8 text-white overflow-y-auto">
        <BrandHeader />
        <Header avatarSrc={user?.avatarUrl || user?.avatar || selected?.avatar} name={user?.name || selected?.name || 'مساعد'} subtitle="لوحة المساعد" />

        <nav className="flex-1 space-y-2">
          <Item to={`${base}/assistant/dashboard`} icon="dashboard">لوحة المساعد</Item>
          {canGrade && <Item to={`${base}/assistant/grade`} icon="assignment_turned_in">تصحيح الواجبات</Item>}
          {/* Requirement #15: assistants have identical upload permissions to teachers */}
          <Item to={`${base}/admin/courses`} icon="upload_file">رفع محتوى تعليمي</Item>
          {canCreateQuizzes && <Item to={`${base}/admin/quiz-builder`} icon="quiz">منشئ اختبارات المحاضرات</Item>}
          <Item to={`${base}/admin/standalone-exams`} icon="quiz">امتحانات منفصلة</Item>
          <Item to={`${base}/assistant/messages`} icon="family_restroom">رسائل أولياء الأمور</Item>
          <Item to={`${base}/students`} icon="family_restroom">الطلاب</Item>
          <Item to={`${base}/leaderboard`} icon="military_tech">لوحة الشرف</Item>
          {(canGenerateWalletCodes || canGenerateAccessCodes) && <Item to={`${base}/admin/scratchcards`} icon="vpn_key">إدارة الأكواد</Item>}
          <Item to={`${base}/security`} icon="admin_panel_settings">أمان الحساب</Item>
          <Item to={`${base}/admin/students/export`} icon="menu_book">تصدير الطلاب</Item>
        </nav>

        <InstructorsList />
        <div className="mt-auto border-t border-white/10 pt-2">
          <LogoutLink />
        </div>
      </div>
    );
  }

  // ---- TEACHER / ADMIN ----
  if (role === 'admin' || role === 'teacher') {
    return (
      <div className="sidebar-scroll flex h-full max-h-[100dvh] flex-col overscroll-contain bg-[var(--sidebar-bg)] px-4 py-8 text-white overflow-y-auto">
        <BrandHeader />
        <Header avatarSrc={user?.avatarUrl || user?.avatar || selected?.avatar} name={user?.name || selected?.name || 'اختر مدرس'} subtitle={selected?.tagline || 'منصة تعليمية'} />

        <nav className="flex-1 space-y-2">
          <Item to={`${base}/admin/dashboard`} icon="dashboard">لوحة التحكم</Item>
          <Item to={`${base}/catalog`} icon="menu_book">الكورسات</Item>

          <div className="pt-3 mt-3 border-t border-white/10">
            <div className="text-xs font-medium text-white/50 px-3 mb-2">المساعِد</div>
            <div className="space-y-2">
              <Item to={`${base}/assistant/dashboard`} icon="dashboard">لوحة المساعد</Item>
              {canGrade && <Item to={`${base}/assistant/grade`} icon="assignment_turned_in">تصحيح الواجبات</Item>}
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-white/10">
            <div className="text-xs font-medium text-white/50 px-3 mb-2">الإدارة</div>
            <div className="space-y-2">
              <Item to={`${base}/admin/courses`} icon="menu_book">إدارة الكورسات</Item>
              <Item to={`${base}/admin/quiz-builder`} icon="quiz">منشئ الاختبارات</Item>
              {role === 'admin' && <Item to={`${base}/admin/standalone-exams`} icon="quiz">امتحانات منفصلة</Item>}
              <Item to={`${base}/admin/scratchcards`} icon="vpn_key">أكواد الوصول</Item>
              <Item to={`${base}/students`} icon="family_restroom">الطلاب</Item>
              <Item to={`${base}/leaderboard`} icon="military_tech">لوحة الشرف</Item>
              <Item to={`${base}/admin/students/export`} icon="menu_book">تصدير الطلاب</Item>
              <Item to={`${base}/admin/reels`} icon="upload_file">رفع مقطع سريع</Item>
              {role === 'admin' && <Item to={`${base}/admin/settings`} icon="settings">إعدادات المنصة</Item>}
              <Item to={`${base}/security`} icon="admin_panel_settings">أمان الحساب</Item>
            </div>
          </div>

        </nav>

        <InstructorsList />
        <div className="mt-auto border-t border-white/10 pt-2">
          <LogoutLink />
        </div>
      </div>
    );
  }

  // ---- STUDENT (default) ----
  return (
    <div className="sidebar-scroll flex h-full max-h-[100dvh] flex-col overscroll-contain bg-[var(--sidebar-bg)] px-4 py-8 text-white overflow-y-auto">
      <BrandHeader />
      <Header avatarSrc={user?.avatarUrl || user?.avatar || selected?.avatar} name={user?.name || 'طالب'} subtitle={selected?.name || 'منصة تعليمية'} />

      <nav className="flex-1 space-y-2">
        <Item to={`${base}/dashboard`} icon="dashboard" activeWhen={({ pathname, hash }) => pathname === `${base}/dashboard` && hash !== '#parent-access-code' && hash !== '#current-courses'}>لوحة التحكم</Item>
        <Item to={`${base}/catalog`} icon="menu_book">الكورسات</Item>
        <Item to={`${base}/dashboard#current-courses`} icon="menu_book" activeWhen={({ pathname, hash }) => pathname === `${base}/dashboard` && hash === '#current-courses'}>كورساتي</Item>
        <Item to={`${base}/wallet`} icon="vpn_key">محفظتي</Item>
        <Item to={`${base}/reels`} icon="menu_book">الريلز</Item>
        <Item to={`${base}/leaderboard`} icon="military_tech">لوحة الشرف</Item>
        <Item to={`${base}/exam-grades`} icon="assignment_turned_in">درجات الاختبارات</Item>
        <Item to={`${base}/assignment-grades`} icon="assignment_turned_in">درجات الواجبات</Item>
        <Item to={`${base}/dashboard#parent-access-code`} icon="family_restroom" activeWhen={({ pathname, hash }) => pathname === `${base}/dashboard` && hash === '#parent-access-code'}>كود ربط ولي الأمر</Item>
      </nav>

      <InstructorsList />
      <div className="mt-auto border-t border-white/10 pt-2">
        <LogoutLink />
      </div>
    </div>
  );
}

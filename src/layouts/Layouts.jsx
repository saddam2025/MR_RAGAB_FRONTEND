import React, { useEffect, useState } from 'react';
import { Outlet, useLocation, useMatch, useParams } from 'react-router-dom';
import clsx from 'clsx';
import { useAuth } from '../hooks/useAuth';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import MobileNavigation from './MobileNavigation';
import useTenantData from '../hooks/useTenantData';
import TenantSeoHead from '../components/seo/TenantSeoHead';

function TenantMetadata() {
  const { instructorId } = useParams();
  const { instructorProfile } = useTenantData(instructorId);
  return instructorProfile ? <TenantSeoHead tenant={instructorProfile} tenantId={instructorId} /> : null;
}

export default function Layouts() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const location = useLocation();
  const { user } = useAuth() || {};
  const showSidebar = Boolean(user);
  const isTenantLoginPage = Boolean(useMatch({ path: '/:instructorId/login', end: true }));
  const isTenantRegisterPage = Boolean(useMatch({ path: '/:instructorId/register', end: true }));
  const isTenantAuthPage = isTenantLoginPage || isTenantRegisterPage;
  const showMobileNavigation = showSidebar && user?.role === 'student' && !isTenantAuthPage;
  const toggleMobileSidebar = () => setMobileSidebarOpen((open) => !open);
  useEffect(() => { setMobileSidebarOpen(false); }, [location.pathname]);
  useEffect(() => {
    if (!mobileSidebarOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previousOverflow; };
  }, [mobileSidebarOpen]);

  return (
    <div className="dot-grid-background min-h-screen flex bg-surface-canvas text-ink-900">
      <TenantMetadata />
      {showSidebar && (
        <aside className={`sidebar fixed inset-y-0 right-0 z-30 hidden h-[100dvh] transition-[width] duration-200 md:block ${sidebarCollapsed ? 'w-[var(--sidebar-collapsed-width)]' : 'w-72'}`}>
          <Sidebar collapsed={sidebarCollapsed} onToggleCollapsed={() => setSidebarCollapsed((value) => !value)} showCollapseToggle />
        </aside>
      )}

      <div className={clsx('flex-1 min-w-0 flex flex-col transition-[margin] duration-200', showSidebar && (sidebarCollapsed ? 'md:mr-[var(--sidebar-collapsed-width)]' : 'md:mr-72'))}>
        {!isTenantAuthPage && <Navbar sidebarOpen={mobileSidebarOpen} onToggleSidebar={showSidebar ? toggleMobileSidebar : undefined} sticky sidebarOffset={showSidebar} sidebarCollapsed={sidebarCollapsed} />}

        <main className={`flex-1 p-4 sm:p-6 lg:p-8 animate-fadeIn${showMobileNavigation ? ' has-mobile-navigation' : ''}`}>
          <Outlet />
        </main>
      </div>

      {showSidebar && mobileSidebarOpen ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            onClick={toggleMobileSidebar}
            className="absolute inset-0 bg-black/30"
            aria-label="إغلاق القائمة"
          />
          <aside className="absolute inset-y-0 right-0 h-[100dvh] w-full max-w-[320px] overscroll-contain border-l border-surface-border bg-surface-default shadow-panel animate-fadeIn">
            <div className="h-full overflow-hidden">
              <Sidebar />
            </div>
          </aside>
        </div>
      ) : null}
      {showMobileNavigation && <MobileNavigation />}
    </div>
  );
}

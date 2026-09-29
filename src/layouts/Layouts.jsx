import React, { useEffect, useState } from 'react';
import { Outlet, useLocation, useMatch, useParams } from 'react-router-dom';
import clsx from 'clsx';
import { useAuth } from '../hooks/useAuth';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import useTenantData from '../hooks/useTenantData';
import TenantSeoHead from '../components/seo/TenantSeoHead';

function TenantMetadata() {
  const { instructorId } = useParams();
  const { instructorProfile } = useTenantData(instructorId);
  return instructorProfile ? <TenantSeoHead tenant={instructorProfile} tenantId={instructorId} /> : null;
}

export default function Layouts() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth() || {};
  const showSidebar = Boolean(user);
  const isTenantHomepage = Boolean(useMatch({ path: '/:instructorId', end: true }));
  const isTenantLoginPage = Boolean(useMatch({ path: '/:instructorId/login', end: true }));
  const isTenantRegisterPage = Boolean(useMatch({ path: '/:instructorId/register', end: true }));
  const isTenantAuthPage = isTenantLoginPage || isTenantRegisterPage;
  const toggleMobileSidebar = () => setMobileSidebarOpen((open) => !open);
  useEffect(() => { setMobileSidebarOpen(false); }, [location.pathname]);
  useEffect(() => {
    if (!mobileSidebarOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previousOverflow; };
  }, [mobileSidebarOpen]);

  return (
    <div className="min-h-screen flex bg-surface-canvas text-ink-900">
      <TenantMetadata />
      {showSidebar && (
        <aside className="sidebar fixed inset-y-0 right-0 z-30 hidden h-[100dvh] w-72 lg:block">
          <Sidebar />
        </aside>
      )}

      <div className={clsx('flex-1 min-w-0 flex flex-col', showSidebar && 'lg:mr-72')}>
        {!isTenantAuthPage && <Navbar sidebarOpen={mobileSidebarOpen} onToggleSidebar={showSidebar ? toggleMobileSidebar : undefined} sticky={isTenantHomepage} />}

        <main className="flex-1 p-4 sm:p-6 lg:p-8 animate-fadeIn">
          <Outlet />
        </main>
      </div>

      {showSidebar && mobileSidebarOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            onClick={toggleMobileSidebar}
            className="absolute inset-0 bg-black/30"
            aria-label="إغلاق القائمة"
          />
          <aside className="absolute inset-y-0 right-0 h-[100dvh] w-full max-w-[320px] overscroll-contain border-l border-surface-border bg-surface-default shadow-panel animate-fadeIn">
            <div className="sidebar-scroll h-full overflow-y-auto overscroll-contain p-4">
              <Sidebar />
            </div>
          </aside>
        </div>
      ) : null}
    </div>
  );
}

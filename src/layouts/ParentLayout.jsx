// src/layouts/ParentLayout.jsx
import React, { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import ParentSidebar from './ParentSidebar';
import Navbar from './Navbar';
// FIX: SelectedChildProvider is now mounted globally in App.jsx.
// Wrapping again here created a second, disconnected instance that reset
// selectedChildId whenever the user entered/left /parent/* routes.

export default function ParentLayout() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const location = useLocation();
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
      <aside className="sidebar fixed inset-y-0 right-0 z-30 hidden h-[100dvh] w-72 lg:block">
        <ParentSidebar />
      </aside>

      <div className="flex-1 min-w-0 lg:mr-72 flex flex-col">
        <Navbar sidebarOpen={mobileSidebarOpen} onToggleSidebar={toggleMobileSidebar} sticky sidebarOffset />

        <main className="flex-1 p-6 lg:p-8 animate-fadeIn">
          <Outlet />
        </main>
      </div>

      {mobileSidebarOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button type="button" onClick={toggleMobileSidebar} className="absolute inset-0 bg-black/30" aria-label="إغلاق القائمة" />
          <aside className="absolute inset-y-0 right-0 h-[100dvh] w-full max-w-[320px] overscroll-contain border-l border-surface-border bg-surface-default shadow-panel animate-fadeIn">
            <div className="sidebar-scroll h-full overflow-y-auto overscroll-contain p-4"><ParentSidebar /></div>
          </aside>
        </div>
      ) : null}
    </div>
  );
}

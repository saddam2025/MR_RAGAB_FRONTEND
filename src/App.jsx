// src/App.jsx
import React, { Suspense, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useParams } from 'react-router-dom';
import { buildAutoRoutes } from './routes.auto';
import Layouts from './layouts/Layouts';
import ParentLayout from './layouts/ParentLayout';
import SuperAdminLayout from './layouts/SuperAdminLayout';
import { AuthProvider } from './contexts/AuthProvider';
import { InstructorProvider } from './contexts/InstructorContext';
import { SelectedChildProvider } from './contexts/SelectedChildContext';
import { ThemeProvider } from './contexts/ThemeProvider';
import useAuth from './hooks/useAuth';
import { dashboardPathFor, managedInstructorIdFor } from './utils/dashboardPath';
import ScrollToTop from './components/common/ScrollToTop';
import { Toaster } from 'react-hot-toast';
import SupportContactButton from './components/common/SupportContactButton';
import LoadingScreen from './components/common/LoadingScreen';

function RouteGuard({ route, children }) {
  const { user, loading } = useAuth();
  const { instructorId } = useParams();
  const location = useLocation();

  if (loading) {
    return <LoadingScreen />;
  }

  // FIX: instructor selector now lives at '/'. The old '/select-instructor'
  // path was not registered anywhere and would only hit the catch-all 404
  // route. AuthProvider.jsx is updated to redirect to '/'.
  if (route.auth === 'guest' && user) {
    return <Navigate to={dashboardPathFor(user)} replace />;
  }

  // FIX: every page built so far exports auth as a role string directly
  // (auth: 'admin' | 'assistant' | 'student' | 'parent'), not as the generic
  // 'required' flag + separate roles[] array this guard originally expected.
  // Under the original logic, auth: 'admin' matched neither 'required' nor
  // 'guest', so those pages were never actually protected. This treats any
  // auth value that isn't 'required' / 'guest' / null as shorthand for
  // roles: [thatValue], staying backward-compatible with every route already
  // written instead of requiring a retroactive edit across many files.
  const isRoleAuth = route.auth && route.auth !== 'guest' && route.auth !== 'required';
  const requiredRoles = isRoleAuth ? [route.auth] : route.roles || [];
  const needsAuth = route.auth === 'required' || isRoleAuth || requiredRoles.length > 0;

  if (needsAuth && !user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRoles.length > 0 && (!user || !requiredRoles.includes(user.role))) {
    return <Navigate to={dashboardPathFor(user)} replace />;
  }

  // Never let a public tenant slug, another instructor's ObjectId, or a
  // stale bookmarked URL become the target of a management request. The
  // sidebar uses the same trusted source, and this guard also repairs direct
  // links before a page can call the API.
  const routeAllowsManagement = requiredRoles.some((role) => ['admin', 'teacher', 'assistant'].includes(role));
  const managedInstructorId = managedInstructorIdFor(user);
  if (instructorId && routeAllowsManagement && managedInstructorId && String(instructorId) !== String(managedInstructorId)) {
    const pathParts = location.pathname.split('/');
    pathParts[1] = encodeURIComponent(managedInstructorId);
    return <Navigate to={`${pathParts.join('/')}${location.search}${location.hash}`} replace />;
  }

  return children;
}

export default function App() {
  const [routes, setRoutes] = useState([]);
  const [routesLoading, setRoutesLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const rs = await buildAutoRoutes();
        if (mounted) setRoutes(rs);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Failed to build auto routes:', err);
        if (mounted) setRoutes([]);
      } finally {
        if (mounted) setRoutesLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  if (routesLoading) {
    return <LoadingScreen />;
  }

  return (
    // BrowserRouter must wrap AuthProvider — AuthProvider.jsx calls
    // useNavigate(), which throws outside Router context.
    <BrowserRouter>
      <ScrollToTop />
      <AuthProvider>
        <InstructorProvider>
          <SelectedChildProvider>
            <ThemeProvider>
              <Suspense fallback={<LoadingScreen />}>
                <Routes>
                  {routes
                    .filter((r) => r.path && !r.path.startsWith('/:instructorId') && !r.path.startsWith('/super-admin'))
                    .map((r) => {
                      if (!r.loader) return null;
                      const Component = React.lazy(r.loader);
                      const element = (
                        <RouteGuard route={r}>
                          <Component />
                        </RouteGuard>
                      );
                      if (r.index) return <Route key={r.path} index element={element} />;
                      return <Route key={r.path} path={r.path} element={element} />;
                  })}

                  <Route path="/super-admin" element={<RouteGuard route={{ auth: 'required', roles: ['super_admin'] }}><SuperAdminLayout /></RouteGuard>}>
                    {routes
                      .filter((r) => r.path && r.path.startsWith('/super-admin'))
                      .map((r) => {
                        if (!r.loader) return null;
                        const Component = React.lazy(r.loader);
                        const element = <RouteGuard route={r}><Component /></RouteGuard>;
                        if (r.index) return <Route key={r.path} index element={element} />;
                        const nestedPath = r.path.replace('/super-admin/', '');
                        return <Route key={r.path} path={nestedPath} element={element} />;
                      })}
                  </Route>

                  <Route path="/:instructorId/parent" element={<ParentLayout />}>
                    {routes
                      .filter((r) => r.path && r.path.startsWith('/:instructorId/parent'))
                      .map((r) => {
                        if (!r.loader) return null;
                        const Component = React.lazy(r.loader);
                        const element = (
                          <RouteGuard route={r}>
                            <Component />
                          </RouteGuard>
                        );
                        if (r.index) return <Route key={r.path} index element={element} />;
                        const nestedPath = r.path.replace('/:instructorId/parent/', '');
                        return <Route key={r.path} path={nestedPath} element={element} />;
                      })}
                  </Route>

                  {/* Routing rule: the tenant homepage/landing page must use
                      path: '/:instructorId' with index: true (registered as
                      this Route's index child below) rather than a literal
                      '/home' segment, so it renders directly in Layouts'
                      <Outlet/> at the bare tenant URL. */}
                  <Route path="/:instructorId" element={<Layouts />}>
                    {routes
                      .filter(
                        (r) =>
                          r.path &&
                          r.path.startsWith('/:instructorId') &&
                          !r.path.startsWith('/:instructorId/parent')
                      )
                      .map((r) => {
                        if (!r.loader) return null;
                        const Component = React.lazy(r.loader);
                        const element = (
                          <RouteGuard route={r}>
                            <Component />
                          </RouteGuard>
                        );
                        if (r.index) return <Route key={r.path} index element={element} />;
                        const nestedPath = r.path.replace('/:instructorId/', '');
                        return <Route key={r.path} path={nestedPath} element={element} />;
                      })}
                  </Route>

                  <Route path="*" element={<div className="p-6">الصفحة غير موجودة</div>} />
                </Routes>
                <Toaster position="top-center" />
                <SupportContactButton />
              </Suspense>

            </ThemeProvider>
          </SelectedChildProvider>
        </InstructorProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

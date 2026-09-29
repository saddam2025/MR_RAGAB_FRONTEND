// src/routes.auto.js
// Auto-route builder for Vite using import.meta.glob
// Returns an array of route descriptors:
// [{ path, index, auth, title, roles, loader, _file }]
export async function buildAutoRoutes() {
  // FIX: this file lives at src/routes.auto.js, so the glob root is already
  // inside src/. The previous glob ('./src/pages/**/*...') pointed at
  // src/src/pages, which doesn't exist — buildAutoRoutes() was silently
  // returning an empty array and the app rendered only the 404 fallback.
  const eagerModules = import.meta.glob('./pages/**/*.{jsx,tsx,js}', { eager: true });
  const lazyLoaders = import.meta.glob('./pages/**/*.{jsx,tsx,js}');

  const routes = [];

  for (const filePath of Object.keys(eagerModules)) {
    const mod = eagerModules[filePath];
    const routeMeta = mod && mod.route ? mod.route : null;

    if (!routeMeta || !routeMeta.path) {
      continue; // hybrid: only include pages with explicit route metadata
    }

    // Normalize support for route aliasing: a page may expose one or more
    // path entries (e.g. /login and /:instructorId/login).
    const paths = Array.isArray(routeMeta.path) ? routeMeta.path : [routeMeta.path];

    // Ensure loader is a function that returns a promise resolving the module
    const rawLoader = lazyLoaders[filePath];
    const loader = rawLoader ? () => rawLoader() : () => Promise.resolve(eagerModules[filePath]);

    for (const path of paths) {
      routes.push({
        path,
        index: !!routeMeta.index,
        auth: routeMeta.auth || null,
        title: routeMeta.title || null,
        roles: Array.isArray(routeMeta.roles) ? routeMeta.roles : null,
        loader,
        _file: filePath,
      });
    }
  }

  // stable sort: index routes first, then by path
  routes.sort((a, b) => {
    if (a.index && !b.index) return -1;
    if (!a.index && b.index) return 1;
    return a.path.localeCompare(b.path);
  });

  return routes;
}
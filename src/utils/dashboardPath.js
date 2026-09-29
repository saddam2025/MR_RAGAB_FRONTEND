function userId(user) {
  return user?._id || user?.id || null;
}

// Administrative routes must always be scoped to the account that owns the
// tenant. A route parameter can be a public tenant slug (or a stale link),
// so it is never a trustworthy source for an admin/assistant API URL.
export function managedInstructorIdFor(user) {
  if (user?.role === 'admin' || user?.role === 'teacher') return userId(user);
  if (user?.role === 'assistant') return user?.instructorId || null;
  return null;
}

/**
 * Dashboard routes use the owning admin's id as the :instructorId segment.
 * Admins are that owner themselves; the other tenant roles receive it in
 * user.instructorId from the login response.
 */
export function dashboardPathFor(user) {
  switch (user?.role) {
    case 'super_admin':
      return '/super-admin';
    case 'admin':
    case 'teacher': {
      const instructorId = managedInstructorIdFor(user);
      return instructorId ? `/${instructorId}/admin/dashboard` : '/';
    }
    case 'assistant': {
      const instructorId = managedInstructorIdFor(user);
      return instructorId ? `/${instructorId}/assistant/dashboard` : '/';
    }
    case 'parent': {
      const instructorId = user?.instructorId;
      return instructorId ? `/${instructorId}/parent/dashboard` : '/';
    }
    case 'student': {
      const instructorId = user?.instructorId;
      return instructorId ? `/${instructorId}/dashboard` : '/';
    }
    default:
      return '/';
  }
}

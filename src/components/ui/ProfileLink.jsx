import React from 'react';
import PropTypes from 'prop-types';
import { Link, useParams } from 'react-router-dom';
import clsx from 'clsx';
import { useAuth } from '../../hooks/useAuth';

export function getProfilePath({ instructorId, userId, profileType, role }) {
  if (!instructorId || !userId) return null;
  if (profileType === 'student') return `/${instructorId}/profiles/students/${userId}`;
  if (profileType === 'assistant') {
    return role === 'parent'
      ? `/${instructorId}/parent/profiles/assistants/${userId}`
      : `/${instructorId}/profiles/assistants/${userId}`;
  }
  return null;
}

export default function ProfileLink({ children, instructorId: providedInstructorId, userId, profileType, className, ariaLabel }) {
  const { instructorId: routeInstructorId } = useParams();
  const { user } = useAuth();
  const to = getProfilePath({ instructorId: providedInstructorId || routeInstructorId, userId, profileType, role: user?.role });

  if (!to) return children;

  return (
    <Link
      to={to}
      aria-label={ariaLabel}
      className={clsx('inline-flex rounded-full transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-default', className)}
    >
      {children}
    </Link>
  );
}

ProfileLink.propTypes = {
  children: PropTypes.node.isRequired,
  instructorId: PropTypes.string,
  userId: PropTypes.string,
  profileType: PropTypes.oneOf(['student', 'assistant']),
  className: PropTypes.string,
  ariaLabel: PropTypes.string,
};

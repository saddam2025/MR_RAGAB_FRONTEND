import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { resolveApiAssetUrl } from '../../services/api';
import ProfileLink from './ProfileLink';

function initialsFromName(name) {
  if (!name) return '';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function Avatar({ src, avatarUrl, name, size = 'md', status, className: extraClassName, linkToProfile = false, userId, profileType }) {
  const sizes = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-9 h-9 text-sm',
    md: 'w-11 h-11 text-base', // FIX: text-md is not a valid Tailwind class
    lg: 'w-14 h-14 text-lg',
  };
  const className = clsx(
    'inline-flex items-center justify-center rounded-full overflow-hidden',
    'bg-brand-100 text-brand-700 font-bold ring-2 ring-surface-DEFAULT shadow-card',
    sizes[size],
    extraClassName
  );
  const imageSrc = resolveApiAssetUrl(avatarUrl || src);
  const avatarContent = imageSrc ? (
    <img src={imageSrc} alt={name || 'avatar'} className={className} />
  ) : (
    <div className={className} aria-hidden>
      <span>{initialsFromName(name)}</span>
    </div>
  );
  const canLink = linkToProfile && userId && ['student', 'assistant'].includes(profileType);

  return (
    <div className="relative inline-flex items-center">
      {canLink ? (
        <ProfileLink userId={userId} profileType={profileType} ariaLabel={`عرض ملف ${name || 'المستخدم'}`}>
          {avatarContent}
        </ProfileLink>
      ) : avatarContent}

      {status && (
        <span
          className={clsx(
            'absolute bottom-0 start-0 translate-y-1/4 translate-x-1/4 rounded-full ring-2 ring-surface-DEFAULT',
            status === 'online' && 'bg-success-DEFAULT w-3 h-3',
            status === 'away' && 'bg-brand-400 w-3 h-3',
            status === 'offline' && 'bg-ink-300 w-3 h-3'
          )}
        />
      )}
    </div>
  );
}

Avatar.propTypes = {
  src: PropTypes.string,
  avatarUrl: PropTypes.string,
  name: PropTypes.string,
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg']),
  status: PropTypes.oneOf(['online', 'away', 'offline']),
  className: PropTypes.string,
  linkToProfile: PropTypes.bool,
  userId: PropTypes.string,
  profileType: PropTypes.oneOf(['student', 'assistant']),
};

import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';

const variantMap = {
  brand: 'bg-brand-100 !text-brand-700 ring-1 ring-brand-300/50',
  info: 'bg-info-soft !text-info-DEFAULT ring-1 ring-info-DEFAULT/15',
  success: 'bg-success-soft !text-success-text ring-1 ring-success-DEFAULT/20',
  danger: 'bg-danger-soft !text-danger-DEFAULT ring-1 ring-danger-DEFAULT/20',
  neutral: 'bg-surface-muted !text-ink-700 ring-1 ring-surface-border',
};

export default function Badge({ children, variant = 'neutral', className }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 px-2.5 py-1 rounded-pill text-xs font-semibold leading-none',
        variantMap[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

Badge.propTypes = {
  children: PropTypes.node,
  variant: PropTypes.oneOf(['brand', 'info', 'success', 'danger', 'neutral']),
  className: PropTypes.string,
};

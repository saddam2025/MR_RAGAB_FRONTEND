import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';

export default function Input({ className, error, icon, ...rest }) {
  return (
    <div className={clsx('relative', className)}>
      {icon && (
        <div className="absolute inset-y-0 end-4 flex items-center pointer-events-none text-ink-400">
          {icon}
        </div>
      )}
      <input
        {...rest}
        className={clsx(
          'input w-full rounded-lg py-3 px-4 text-base placeholder:text-ink-400',
          'transition-all duration-200 ease-soft',
          icon ? 'pe-11' : '',
          error ? 'border-danger-DEFAULT focus:!shadow-none focus:!border-danger-DEFAULT' : ''
        )}
        aria-invalid={Boolean(error)}
      />
      {error && <p className="text-xs text-danger-DEFAULT mt-1.5 ps-1">{error}</p>}
    </div>
  );
}

Input.propTypes = {
  className: PropTypes.string,
  error: PropTypes.string,
  icon: PropTypes.node,
};

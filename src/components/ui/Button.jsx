import React from 'react'
import PropTypes from 'prop-types'
import clsx from 'clsx'

const base =
  'group/button inline-flex shrink-0 items-center justify-center gap-2 font-semibold rounded-full transition-transform outline-none select-none active:not-aria-[haspopup]:scale-[0.995] disabled:pointer-events-none disabled:opacity-50 focus-visible:ring-3 focus-visible:ring-brand-500/50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*=size-])]:size-4'

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-md',
  lg: 'px-5 py-3 text-lg',
}

const variants = {
  primary: '!rounded-2xl bg-teal text-navy-900 shadow-lg hover:-translate-y-0.5 hover:shadow-glow',
  ghost: 'bg-brand-100 text-brand-700 border border-transparent hover:bg-brand-50',
  subtle: 'bg-surface-muted text-ink-700 hover:bg-surface-border',
}

function Button({ children, variant = 'primary', size = 'md', className, ...rest }) {
  return (
    <button
      data-slot="button"
      className={clsx(base, sizes[size], variants[variant], className)}
      {...rest}
    >
      {children}
    </button>
  )
}

Button.propTypes = {
  children: PropTypes.node,
  variant: PropTypes.oneOf(['primary', 'ghost', 'subtle']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  className: PropTypes.string,
}

export default Button
export { Button }

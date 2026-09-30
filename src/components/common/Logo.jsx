import React from 'react';
import { Link } from 'react-router-dom';

export default function Logo({ to = '/', light = false, className = '' }) {
  return (
    <Link to={to} className={`inline-flex min-w-0 items-center ${className}`} aria-label="Mr Ragab Seddik">
      <img src="/assets/brand/ragab-logo.png" alt="Mr Ragab Seddik" className="h-10 w-24 object-contain sm:h-12 sm:w-28" />
    </Link>
  );
}

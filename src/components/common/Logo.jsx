import React from 'react';
import { Link } from 'react-router-dom';

export default function Logo({ to = '/', light = false, className = '' }) {
  return (
    <Link to={to} className={`inline-flex min-w-0 items-center ${className}`} aria-label="Mr Attia Kamel">
      <img src="/assets/brand/attia-logo.png" alt="Mr Attia Kamel" className="h-12 w-auto max-w-[180px] object-contain" />
    </Link>
  );
}

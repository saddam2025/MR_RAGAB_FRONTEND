import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Eye, EyeOff } from 'lucide-react';

export default function PasswordInput({ id, value, onChange, error, ...inputProps }) {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <div className="relative">
        <input
          {...inputProps}
          id={id}
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          aria-invalid={Boolean(error)}
          className={`input w-full rounded-lg py-3 pe-12 ps-4 text-base placeholder:text-ink-400 transition-all duration-200 ease-soft ${error ? 'border-danger-DEFAULT focus:!shadow-none focus:!border-danger-DEFAULT' : ''}`}
        />
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
          aria-pressed={visible}
          className="absolute inset-y-0 end-3 inline-flex items-center text-ink-500 hover:text-ink-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        >
          {visible ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
        </button>
      </div>
      {error && <p className="mt-1.5 ps-1 text-xs text-danger-DEFAULT">{error}</p>}
    </div>
  );
}

PasswordInput.propTypes = {
  id: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  error: PropTypes.string
};

import React from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import Button from './Button';

export default function ConfirmModal({ title = 'تأكيد الإجراء', description, confirmLabel = 'تأكيد', cancelLabel = 'إلغاء', busy = false, onConfirm, onCancel }) {
  if (typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] grid place-items-center bg-black/40 p-4" role="presentation">
      <section role="dialog" aria-modal="true" aria-labelledby="confirm-modal-title" className="w-full max-w-md rounded-2xl bg-surface-default p-6 text-ink-900 shadow-panel">
        <h3 id="confirm-modal-title" className="text-xl font-bold">{title}</h3>
        <div className="mt-3 text-ink-600">{description}</div>
        <div className="mt-6 flex gap-3">
          <Button type="button" onClick={onConfirm} disabled={busy}>{busy ? 'جارٍ التنفيذ...' : confirmLabel}</Button>
          <Button type="button" variant="subtle" onClick={onCancel} disabled={busy}>{cancelLabel}</Button>
        </div>
      </section>
    </div>,
    document.body
  );
}

ConfirmModal.propTypes = {
  title: PropTypes.string,
  description: PropTypes.node.isRequired,
  confirmLabel: PropTypes.string,
  cancelLabel: PropTypes.string,
  busy: PropTypes.bool,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

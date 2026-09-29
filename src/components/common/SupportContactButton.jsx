import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import instructorService from '../../services/instructorService';
import { egyptianWhatsappUrl } from '../../utils/phone';

const DEFAULT_SUPPORT_PHONE = '201060369537';

export default function SupportContactButton() {
  const location = useLocation();
  const instructorId = location.pathname.split('/').filter(Boolean)[0];
  const isTenantRoute = instructorId && !['login', 'register', 'super-admin'].includes(instructorId);
  const [supportPhone, setSupportPhone] = useState(DEFAULT_SUPPORT_PHONE);

  useEffect(() => {
    let active = true;
    setSupportPhone(DEFAULT_SUPPORT_PHONE);
    if (!isTenantRoute) return () => { active = false; };

    instructorService.get(instructorId)
      .then((response) => { if (active && response.data?.supportPhone) setSupportPhone(response.data.supportPhone); })
      .catch(() => {});

    return () => { active = false; };
  }, [instructorId, isTenantRoute]);

  const href = egyptianWhatsappUrl(supportPhone);
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" aria-label="تواصل مع الدعم الفني عبر واتساب" title="تواصل مع الدعم الفني" className="fixed bottom-4 left-4 z-[60] grid h-14 w-14 place-items-center overflow-hidden rounded-full bg-white shadow-lg ring-1 ring-surface-border transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/40">
      <img src="/assets/support-floating.png" alt="" draggable="false" className="h-full w-full select-none object-cover" />
    </a>
  );
}

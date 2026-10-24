import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import instructorService from '../../services/instructorService';
import { DEFAULT_SUPPORT_PHONE, egyptianWhatsappUrl } from '../../utils/phone';
import { useAuth } from '../../hooks/useAuth';

export default function SupportContactButton() {
  const location = useLocation();
  const { user } = useAuth();
  const instructorId = location.pathname.split('/').filter(Boolean)[0];
  const isTenantRoute = instructorId && !['login', 'register', 'super-admin'].includes(instructorId);
  const [supportPhone, setSupportPhone] = useState(DEFAULT_SUPPORT_PHONE);

  useEffect(() => {
    let active = true;
    setSupportPhone(DEFAULT_SUPPORT_PHONE);
    if (!isTenantRoute) return () => { active = false; };

    instructorService.get(instructorId)
      .then((response) => {
        if (!active) return;
        const tenant = response.data || {};
        setSupportPhone(tenant.supportPhone || DEFAULT_SUPPORT_PHONE);
      })
      .catch(() => {});

    return () => { active = false; };
  }, [instructorId, isTenantRoute]);

  const href = egyptianWhatsappUrl(supportPhone);
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" aria-label="تواصل مع الدعم الفني عبر واتساب" title="تواصل مع الدعم الفني" className={`support-contact-button${user?.role === 'student' ? ' support-contact-button--above-mobile-navigation' : ''}`}>
      <img src="/assets/support-floating.png" alt="" draggable="false" className="h-full w-full select-none object-cover" />
    </a>
  );
}

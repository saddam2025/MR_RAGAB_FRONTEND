import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import Avatar from '../ui/Avatar';
import { resolveApiAssetUrl } from '../../services/api';

function formatExpiry(value) {
  if (!value) return 'غير محدد';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'غير محدد' : date.toLocaleDateString('ar-EG');
}

export default function MyCourseCard({ enrollment, tenant, instructorId }) {
  const { course, expiresAt, viewsRemaining } = enrollment;
  const thumbnail = resolveApiAssetUrl(course.thumbnailUrl);
  const courseTitle = course.title_ar || course.title_en;

  return (
    <Link to={`/${instructorId}/courses/${course._id}`} className="group block overflow-hidden rounded-2xl border border-surface-border bg-surface-default shadow-card transition hover:-translate-y-0.5 hover:border-brand-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-600">
      <div className="aspect-video overflow-hidden bg-surface-muted">
        {thumbnail ? <img src={thumbnail} alt="" className="h-full w-full object-cover transition group-hover:scale-[1.02]" /> : <div className="grid h-full place-items-center text-sm text-ink-500">لا توجد صورة للكورس</div>}
      </div>
      <div className="p-4">
        <div className="flex min-w-0 items-center gap-2">
          <Avatar src={tenant?.logoUrl || tenant?.profileImageUrl} name={tenant?.name} size="sm" />
          <p className="truncate text-xs font-semibold text-ink-500">{tenant?.name || 'المنصة التعليمية'}</p>
        </div>
        <h3 className="mt-3 line-clamp-2 min-h-12 font-extrabold text-ink-900">{courseTitle}</h3>
        <div className="mt-3 space-y-1 text-xs text-ink-500">
          <p>متاح حتى: {formatExpiry(expiresAt)}</p>
          <p>المشاهدات المتبقية: {viewsRemaining == null ? 'غير محدودة' : viewsRemaining}</p>
        </div>
        <div className="mt-4 rounded-xl bg-brand-600 px-3 py-2 text-center text-sm font-bold text-white">ادخل الكورس</div>
      </div>
    </Link>
  );
}

MyCourseCard.propTypes = {
  enrollment: PropTypes.shape({
    course: PropTypes.shape({ _id: PropTypes.string, title_ar: PropTypes.string, title_en: PropTypes.string, thumbnailUrl: PropTypes.string }).isRequired,
    expiresAt: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
    viewsRemaining: PropTypes.number
  }).isRequired,
  tenant: PropTypes.shape({ name: PropTypes.string, logoUrl: PropTypes.string, profileImageUrl: PropTypes.string }),
  instructorId: PropTypes.string.isRequired
};

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Button from '../ui/Button';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';

export default function CourseCard({ course, onOpen, onEnroll, price, openLabel = 'عرض التفاصيل', enrollLabel = 'اشترك الآن', status, meta, showInstructor = true, platformLogoUrl, openDisabled = false, enrollDisabled = false, hidePrice = false, singleAction = false }) {
  const displayPrice = price ?? course.price;
  const [imageFailed, setImageFailed] = useState(false);
  const thumbnailUrl = course.image || course.thumbnailUrl;
  return <article dir="rtl" className="group overflow-hidden rounded-[2rem] border border-[var(--surface-border)] bg-[var(--surface-default)] shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-soft dark:border-white/10 dark:bg-[#071426] animate-fadeIn">
    <div className="relative aspect-[16/10] overflow-hidden rounded-b-[2rem] bg-gradient-to-bl from-brand-100 via-brand-50 to-surface-muted">
      {thumbnailUrl && !imageFailed ? <img src={thumbnailUrl} alt={course.title} onError={() => setImageFailed(true)} className="h-full w-full object-cover transition duration-500 group-hover:scale-110" /> : <div className="grid h-full place-items-center text-4xl" aria-label="لا توجد صورة للكورس">📚</div>}
      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/5 to-transparent" />
      <div className="absolute left-4 top-4">{!hidePrice && displayPrice != null && <Badge variant="brand" className="bg-white/90 shadow-lg">{displayPrice === 0 ? 'مجاني' : `${displayPrice} ج.م`}</Badge>}</div>
      {course.level && <div className="absolute right-4 top-4"><Badge variant={course.levelVariant || 'info'} className="bg-slate-900/75 !text-white ring-0 backdrop-blur-sm">{course.level}</Badge></div>}
      {status && <div className="absolute bottom-4 right-4"><Badge variant={status.variant || 'neutral'} className="bg-slate-900/75 !text-white ring-0 backdrop-blur-sm">{status.label}</Badge></div>}
    </div>
    <div className="relative z-10 -mt-8 rounded-t-[2rem] border-t border-[var(--surface-border)] bg-[var(--surface-default)] p-5 pt-7 text-[var(--ink-900)] shadow-[0_-10px_25px_rgba(15,23,42,0.12)] dark:border-white/10 dark:bg-[#071426] dark:text-white dark:shadow-[0_-10px_25px_rgba(0,0,0,0.2)]">
      <h3 className="min-h-14 text-lg font-extrabold leading-7 text-[var(--ink-900)] line-clamp-2 dark:text-white">{course.title}</h3>
      <p className="mt-2 min-h-10 text-sm leading-6 text-[var(--ink-600)] line-clamp-2 dark:text-slate-300">{course.subtitle || 'شرح مبسط وتدريبات تساعدك على إتقان المادة.'}</p>
      <div className="my-4 flex min-h-14 items-center gap-3 border-y border-[var(--surface-border)] py-3 dark:border-white/10">
        {showInstructor && <><Avatar src={platformLogoUrl || course.instructor?.logoUrl || course.instructor?.avatar} name={course.instructor?.name} size="sm" /><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold text-[var(--ink-900)] dark:text-white">{course.instructor?.name || 'فريق المنصة'}</p><p className="truncate text-xs text-[var(--ink-500)] dark:text-slate-400">{meta || `${course.lectureCount ?? course.lessonsCount ?? 0} محاضرة · ${course.homeworkCount ?? 0} واجبات`}</p></div></>}
        {!showInstructor && <p className="text-sm text-[var(--ink-600)] dark:text-slate-300">{meta}</p>}
      </div>
      {singleAction ? <Button variant="primary" size="md" className="w-full" onClick={() => onOpen?.(course)} disabled={openDisabled}>{openLabel}</Button> : <div className="flex gap-2"><Button variant="ghost" size="sm" className="flex-1 !border !border-brand-300 !bg-brand-100 !text-brand-700 hover:!bg-brand-200 dark:!border-brand-400/40 dark:!bg-brand-100 dark:!text-brand-700 dark:hover:!bg-brand-200" onClick={() => onOpen?.(course)} disabled={openDisabled}>{openLabel}</Button><Button variant="primary" size="sm" className="flex-1" onClick={() => onEnroll?.(course)} disabled={enrollDisabled}>{enrollLabel}</Button></div>}
    </div>
  </article>;
}

CourseCard.propTypes = { course: PropTypes.shape({ title: PropTypes.string, subtitle: PropTypes.string, image: PropTypes.string, thumbnailUrl: PropTypes.string, price: PropTypes.number, lectureCount: PropTypes.number, homeworkCount: PropTypes.number, level: PropTypes.string, levelVariant: PropTypes.oneOf(['info', 'success', 'danger', 'brand']), instructor: PropTypes.shape({ name: PropTypes.string, avatar: PropTypes.string, logoUrl: PropTypes.string }), lessonsCount: PropTypes.number, owned: PropTypes.bool }).isRequired, onOpen: PropTypes.func, onEnroll: PropTypes.func, price: PropTypes.number, openLabel: PropTypes.string, enrollLabel: PropTypes.string, status: PropTypes.shape({ label: PropTypes.string.isRequired, variant: PropTypes.string }), meta: PropTypes.string, showInstructor: PropTypes.bool, platformLogoUrl: PropTypes.string, openDisabled: PropTypes.bool, enrollDisabled: PropTypes.bool, hidePrice: PropTypes.bool, singleAction: PropTypes.bool };

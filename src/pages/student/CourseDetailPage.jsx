// src/pages/student/CourseDetailPage.jsx
export const route = {
  path: '/:instructorId/courses/:courseId',
  index: false,
  auth: null,
  title: 'تفاصيل الدورة',
};

import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import CourseCard from '../../components/common/CourseCard';
import instructorService from '../../services/instructorService';
import { useAuth } from '../../hooks/useAuth';
import api, { resolveApiAssetUrl } from '../../services/api';

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-ink-400">
      <path
        d="M6 10V8a6 6 0 1112 0v2M5 10h14a1 1 0 011 1v9a1 1 0 01-1 1H5a1 1 0 01-1-1v-9a1 1 0 011-1z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function CourseDetailPage() {
  const { instructorId, courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth() || {};
  const [course, setCourse] = useState(null);
  const [lectures, setLectures] = useState([]);
  const [error, setError] = useState('');
  const [purchaseError, setPurchaseError] = useState('');

  useEffect(() => {
    let active = true;
    instructorService.getCourse(instructorId, courseId)
      .then((response) => { if (active) setCourse(response.data); })
      .catch((requestError) => { if (active) setError(requestError.message || 'تعذر تحميل الدورة.'); });
    return () => { active = false; };
  }, [instructorId, courseId]);

  const loadLectures = async () => {
    try {
      const response = await api.get(`/courses/${courseId}/lectures`);
      setLectures(response.data.data || []);
    } catch (requestError) {
      setPurchaseError(requestError?.message || 'تعذر تحميل محاضرات الدورة.');
    }
  };

  useEffect(() => { void loadLectures(); }, [courseId, user?.role]);

  const lectureStatus = (lecture) => ({
    free: { label: 'مجانية', variant: 'success' },
    purchased: { label: 'أنت مشترك في هذه المحاضرة', variant: 'brand' },
    not_purchased: { label: 'مقفلة - لم يُشترى', variant: 'danger' },
    pending_previous: { label: 'مقفلة - بانتظار إتمام السابقة', variant: 'neutral' }
  }[lecture.status] || { label: 'مقفلة', variant: 'neutral' });
  const courseOwned = user?.role === 'student' && lectures.length > 0 && lectures.every((lecture) => lecture.status === 'free' || lecture.status === 'purchased');

  if (error) return <div dir="rtl" className="rounded-2xl bg-danger-soft p-6 text-center text-danger-DEFAULT">{error}</div>;
  if (!course) return <div dir="rtl" className="rounded-2xl bg-surface-muted p-6 text-center text-ink-500">جارٍ تحميل الدورة...</div>;

  return (
    <div dir="rtl" className="space-y-6 pb-28">
      {/* Back link */}
      <button
        onClick={() => navigate(`/${instructorId}/catalog`)}
        className="flex items-center gap-2 text-sm text-ink-500 transition-colors hover:text-ink-900"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
          <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        العودة إلى الدورات
      </button>

      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl shadow-card">
        <div className="h-64 w-full sm:h-72">
          <img
            src={course.image || '/src/assets/vite.svg'}
            alt={course.title}
            onError={(event) => { event.currentTarget.style.display = 'none'; }}
            className="h-full w-full object-cover"
          />
        </div>
        {/* Readability overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-ink-900/85 via-ink-900/35 to-transparent" />

        {/* Price badge */}
        <div className="absolute right-6 top-6">
          <div className="rounded-2xl bg-accent px-5 py-3 text-center shadow-lg">
            <div className="text-[11px] font-medium text-accent-ink/70">سعر الدورة</div>
            <div className="text-xl font-bold text-accent-ink">{course.price} ج.م</div>
          </div>
        </div>

        {/* Title block */}
        <div className="absolute inset-x-0 bottom-0 p-6 text-right">
          <span className="mb-3 inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
            دورة متقدمة
          </span>
          <h1 className="font-display text-lg font-bold leading-tight text-white text-balance sm:text-3xl">{course.title}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/80">
            {course.subtitle}
          </p>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Access rules card */}
        <section className="rounded-2xl bg-surface-default p-6 shadow-card lg:col-span-1">
          <div className="flex items-center justify-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-500/12 text-brand-600">
              <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="13" r="8" stroke="currentColor" strokeWidth="1.6" />
                <path d="M12 9v4l2 2M9 2h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </span>
          </div>
          <h2 className="mt-4 text-center text-lg font-bold text-ink-900">شروط الوصول</h2>
          <div className="mt-4 space-y-2 text-center text-sm text-ink-600">
            <p>صلاحية المشاهدة: <span className="font-semibold text-ink-900">{course.accessPeriodDays} أيام</span></p>
            <p>الحد الأقصى: <span className="font-semibold text-ink-900">{course.maxViews} مرات</span></p>
          </div>
          {/* Preserve original access-rules copy via Badge */}
          <div className="mt-4 flex justify-center">
            <Badge variant="info">
              صلاحية المشاهدة: {course.accessPeriodDays} أيام | الحد الأقصى للمشاهدات: {course.maxViews} مرات
            </Badge>
          </div>
        </section>

        {/* About */}
        <section className="rounded-2xl bg-surface-default p-6 shadow-card lg:col-span-2">
          <div className="mb-3 flex items-center gap-2">
            <span className="text-brand-600">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
                <path d="M12 11v5M12 8h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </span>
            <h2 className="text-lg font-bold text-ink-900">عن الدورة</h2>
          </div>
          <p className="text-sm leading-relaxed text-ink-600">{course.subtitle || 'لا يوجد وصف متاح لهذه الدورة حاليًا.'}</p>
        </section>
      </div>

      <section className="rounded-2xl bg-surface-default p-6 shadow-card space-y-3">
        <div><h2 className="text-lg font-bold text-ink-900">محاضرات الدورة</h2><p className="mt-1 text-sm text-ink-500">سعر المحاضرة المعروض للتوضيح؛ يتم تأكيد السعر من الخادم عند الشراء.</p></div>
        {purchaseError && <p role="alert" className="rounded-lg bg-danger-soft p-3 text-sm text-danger-DEFAULT">{purchaseError}</p>}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">{lectures.map((lecture) => {
          const isStudent = user?.role === 'student';
          const state = lectureStatus(lecture);
          const canOpen = isStudent && (lecture.status === 'free' || lecture.status === 'purchased');
          const canBuy = isStudent && lecture.status === 'not_purchased';
          const previewMeta = !user ? 'سجّل الدخول لشراء أو مشاهدة المحاضرة' : 'معاينة للمحتوى المنشور';
          return <CourseCard key={lecture._id} course={{ title: `${lecture.order}. ${lecture.title_ar || lecture.title_en}`, subtitle: lecture.description_ar || lecture.description_en || 'محاضرة من هذه الدورة', image: resolveApiAssetUrl(lecture.thumbnailUrl), price: Number(lecture.price) }} price={Number(lecture.price)} showInstructor={false} meta={isStudent ? (canOpen ? 'المحاضرة متاحة للمشاهدة' : lecture.status === 'pending_previous' ? 'أكمل المتطلبات أولاً' : 'متاحة للشراء بشكل منفصل') : previewMeta} status={state} singleAction openLabel={canBuy ? 'اشترك في المحاضرة' : 'ادخل المحاضرة'} openDisabled={isStudent ? !canOpen && !canBuy : Boolean(user)} onOpen={() => { if (canOpen) navigate(`/${instructorId}/courses/${courseId}/lectures/${lecture._id}/learn`); else if (canBuy) navigate(`/${instructorId}/courses/${courseId}/lectures/${lecture._id}/checkout`); else if (!user) navigate(`/${instructorId}/login`); }} />;
        })}</div>
        {lectures.length === 0 && <p className="text-sm text-ink-500">لا توجد محاضرات منشورة حاليًا.</p>}
      </section>

      {/* Sticky CTA */}
      <div className="fixed bottom-0 inset-x-0 z-10 border-t border-surface-border bg-surface-default/95 p-4 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4">
          <div className="text-sm text-ink-500">
            إجمالي السعر: <span className="text-lg font-bold text-ink-900">{course.price} ج.م</span>
          </div>
          <Button variant="primary" size="md" onClick={() => navigate(courseOwned ? `/${instructorId}/dashboard` : `/${instructorId}/checkout/${courseId}`)}>
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
              <path d="M6 6h15l-1.5 9h-12z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
              <circle cx="9" cy="20" r="1.4" fill="currentColor" />
              <circle cx="18" cy="20" r="1.4" fill="currentColor" />
            </svg>
            {courseOwned ? 'الذهاب إلى كورساتي' : 'شراء الدورة'}
          </Button>
        </div>
      </div>
    </div>
  );
}

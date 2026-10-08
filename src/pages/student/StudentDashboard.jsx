// src/pages/student/StudentDashboard.jsx
export const route = {
  path: '/:instructorId/dashboard',
  index: false,
  auth: 'required',
  roles: ['student'],
  title: 'لوحة الطالب',
};

import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Avatar from '../../components/ui/Avatar';
import Button from '../../components/ui/Button';
import { resolveApiAssetUrl } from '../../services/api';
import reelService from '../../services/reelService';
import { trackReelViewOnce } from '../../services/reelViewTracking';
import useEnrolledCourses from '../../hooks/useEnrolledCourses';
import MyCourseCard from '../../components/common/MyCourseCard';
import Translator from '../../features/translator/Translator.jsx';

export default function StudentDashboard() {
  const { instructorId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const { courses: enrolledCourses, tenant, loading: coursesLoading, error: coursesError } = useEnrolledCourses(instructorId);
  const [reels, setReels] = useState([]);
  const [reelsLoading, setReelsLoading] = useState(true);
  const [reelsError, setReelsError] = useState('');
  const [videoErrors, setVideoErrors] = useState({});

  const walletBalance = user?.walletBalance ?? 0;
  const parentAccessCode = user?.parentAccessCode || null;

  useEffect(() => {
    let active = true;
    setReelsLoading(true);
    setReelsError('');
    reelService.list(instructorId, 1, 8)
      .then((response) => { if (active) setReels(Array.isArray(response?.data?.data) ? response.data.data : []); })
      .catch((error) => { if (active) setReelsError(error?.message || 'تعذر تحميل الريلز. حاول مرة أخرى.'); })
      .finally(() => { if (active) setReelsLoading(false); });
    return () => { active = false; };
  }, [instructorId]);

  const handleCopyCode = async () => {
    if (!parentAccessCode) return;
    try {
      await navigator.clipboard.writeText(parentAccessCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard API unavailable; fail silently
    }
  };

  return (
    <div dir="rtl" className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Avatar src={user?.avatarUrl || user?.avatar} name={user?.name} size="md" />
          <div>
            <div className="text-lg font-semibold text-ink-900">
              مرحباً {user?.name || 'الطالب'}
            </div>
            <div className="text-sm text-ink-500">لوحة الطالب</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="subtle" size="sm" onClick={() => navigate(`/${instructorId}/wallet`)}>محفظتي: {walletBalance} ج.م</Button>
        </div>
      </div>

      {/* Enrolled courses */}
      <section id="current-courses" className="scroll-mt-24 rounded-[var(--radius-xl)] border border-surface-border bg-surface-default p-5 shadow-card sm:p-6">
        <div className="mb-5 flex items-end justify-between gap-4"><div><p className="text-sm font-semibold text-brand-600">تابع تقدّمك</p><h2 className="mt-1 text-xl font-extrabold text-ink-900">كورساتي</h2></div><Button variant="subtle" size="sm" onClick={() => navigate(`/${instructorId}/my-courses`)}>كل كورساتي</Button></div>
        {coursesLoading ? <div className="rounded-2xl bg-surface-muted p-6 text-center text-sm text-ink-500">جارٍ تحميل كورساتي...</div> : coursesError ? <div role="alert" className="rounded-2xl bg-danger-soft p-6 text-center text-sm text-danger-DEFAULT">{coursesError}</div> : enrolledCourses.length === 0 ? <div className="rounded-2xl bg-surface-muted p-6 text-center text-sm text-ink-500">لا توجد كورسات في قائمتك حتى الآن.</div> : <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{enrolledCourses.slice(0, 3).map((enrollment) => <MyCourseCard key={enrollment.course._id} enrollment={enrollment} tenant={tenant} instructorId={instructorId} />)}</div>}
      </section>

      <section className="rounded-[var(--radius-xl)] border border-surface-border bg-surface-default p-5 shadow-card sm:p-6" aria-labelledby="dashboard-reels-title">
        <div className="mb-5"><p className="text-sm font-semibold text-brand-600">مقاطع قصيرة</p><h2 id="dashboard-reels-title" className="mt-1 text-xl font-extrabold text-ink-900">ريلز</h2></div>
        {reelsLoading ? <div className="rounded-2xl bg-surface-muted p-6 text-center text-sm text-ink-500">جارٍ تحميل الريلز...</div> : reelsError ? <div role="alert" className="rounded-2xl bg-danger-soft p-6 text-center text-sm text-danger-DEFAULT">{reelsError}</div> : reels.length === 0 ? <div className="rounded-2xl bg-surface-muted p-6 text-center text-sm text-ink-500">لا توجد ريلز حتى الآن</div> : <div className="flex snap-x gap-4 overflow-x-auto pb-2">{reels.map((reel) => <article key={reel._id} className="w-52 shrink-0 snap-start overflow-hidden rounded-2xl bg-navy-900 text-white shadow-panel sm:w-56"><video className="aspect-[9/16] w-full bg-black object-cover" controls playsInline preload="metadata" src={resolveApiAssetUrl(reel.videoUrl)} onPlay={() => trackReelViewOnce(reel._id).catch(() => {})} onError={() => setVideoErrors((current) => ({ ...current, [reel._id]: true }))}>متصفحك لا يدعم تشغيل الفيديو.</video><div className="p-3">{reel.caption && <p className="line-clamp-2 text-sm leading-6">{reel.caption}</p>}{videoErrors[reel._id] && <p role="alert" className="mt-2 text-sm text-red-300">تعذر تشغيل هذا الفيديو.</p>}</div></article>)}</div>}
      </section>

      <Translator variant="compact" />

      {/* Parent access code */}
      <section id="parent-access-code" className="bg-surface-default rounded-2xl shadow-card p-6 scroll-mt-24">
        <h2 className="text-lg font-semibold text-ink-900 mb-2">كود ربط ولي الأمر</h2>
        <p className="text-sm text-ink-500 mb-4">
          شارك هذا الكود مع ولي أمرك لربط حسابه بحسابك عند التسجيل
        </p>
        <div className="flex items-center gap-3">
          <div className="flex-1 px-4 py-2 rounded-lg bg-surface-muted font-mono text-ink-900 text-sm">
            {parentAccessCode || 'الكود غير متاح حالياً، حاول تحديث الصفحة'}
          </div>
          <Button variant="ghost" size="sm" onClick={handleCopyCode} disabled={!parentAccessCode}>
            {copied ? 'تم النسخ' : 'نسخ'}
          </Button>
        </div>
      </section>

    </div>
  );
}

export const route = { path: '/:instructorId/reels', index: false, auth: 'student', title: 'مقاطع سريعة' };

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import Button from '../../components/ui/Button';
import { resolveApiAssetUrl } from '../../services/api';
import reelService from '../../services/reelService';
import { stageLabel } from '../../constants/stages';

const PAGE_SIZE = 10;

function errorMessage(error, fallback) {
  return error?.message || fallback;
}

export default function ReelsViewerPage() {
  const { instructorId } = useParams();
  const trackedReelIds = useRef(new Set());
  const [reels, setReels] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [moreError, setMoreError] = useState('');
  const [trackingError, setTrackingError] = useState('');
  const [videoErrors, setVideoErrors] = useState({});

  const load = useCallback(async (page = 1) => {
    const setBusy = page === 1 ? setLoading : setLoadingMore;
    setBusy(true);
    if (page === 1) setError('');
    else setMoreError('');
    try {
      const response = await reelService.list(instructorId, page, PAGE_SIZE);
      const payload = response?.data || {};
      const received = Array.isArray(payload.data) ? payload.data : [];
      setReels((current) => (page === 1 ? received : [...current, ...received]));
      setPagination(payload.pagination || null);
    } catch (requestError) {
      if (page === 1) setError(errorMessage(requestError, 'تعذر تحميل المقاطع. حاول مرة أخرى.'));
      else setMoreError(errorMessage(requestError, 'تعذر تحميل المزيد من المقاطع. حاول مرة أخرى.'));
    } finally {
      setBusy(false);
    }
  }, [instructorId]);

  useEffect(() => {
    load();
  }, [load]);

  const trackView = async (reelId) => {
    if (trackedReelIds.current.has(reelId)) return;
    trackedReelIds.current.add(reelId);
    setTrackingError('');
    try {
      await reelService.trackView(reelId);
    } catch (requestError) {
      setTrackingError(errorMessage(requestError, 'تعذر تسجيل مشاهدة هذا المقطع.'));
    }
  };

  if (loading) return <div dir="rtl" className="rounded-[var(--radius-xl)] bg-surface-default p-8 text-center text-ink-500 shadow-card">جارٍ تحميل المقاطع...</div>;
  if (error) return <div dir="rtl" role="alert" className="rounded-[var(--radius-xl)] bg-danger-soft p-6 text-center text-danger-DEFAULT"><p>{error}</p><Button variant="subtle" size="sm" className="mt-4" onClick={() => load()}>إعادة المحاولة</Button></div>;
  if (reels.length === 0) return <div dir="rtl" className="rounded-[var(--radius-xl)] bg-surface-default p-10 text-center text-ink-500 shadow-card">لا توجد ريلز متاحة حاليًا</div>;

  const hasMore = pagination && pagination.page < pagination.totalPages;
  return (
    <div className="mx-auto max-w-lg space-y-5" dir="rtl">
      <div><p className="text-sm font-bold text-brand-600">مراجعة سريعة</p><h1 className="text-2xl font-extrabold text-ink-900">المقاطع السريعة</h1></div>
      {trackingError && <div role="alert" className="rounded-xl bg-danger-soft p-3 text-sm text-danger-DEFAULT">{trackingError}</div>}
      {moreError && <div role="alert" className="rounded-xl bg-danger-soft p-3 text-sm text-danger-DEFAULT">{moreError}</div>}
      <div className="max-h-[75vh] snap-y snap-mandatory space-y-5 overflow-y-auto rounded-[var(--radius-xl)]" aria-label="خلاصة المقاطع السريعة">
        {reels.map((reel) => (
          <article key={reel._id} className="snap-start overflow-hidden rounded-[var(--radius-xl)] bg-navy-900 shadow-panel">
            <video
              className="aspect-[9/15] w-full bg-black object-contain"
              controls
              playsInline
              preload="metadata"
              src={resolveApiAssetUrl(reel.videoUrl)}
              onPlay={() => trackView(reel._id)}
              onError={() => setVideoErrors((current) => ({ ...current, [reel._id]: true }))}
            >
              متصفحك لا يدعم تشغيل الفيديو.
            </video>
            <div className="p-4 text-white">
              {reel.caption && <p className="leading-6">{reel.caption}</p>}
              {reel.stage && <p className="mt-2 text-xs text-white/65">{stageLabel(reel.stage)}</p>}
              {videoErrors[reel._id] && <p role="alert" className="mt-3 text-sm text-danger-DEFAULT">تعذر تشغيل هذا الفيديو.</p>}
            </div>
          </article>
        ))}
      </div>
      {hasMore && <div className="text-center"><Button variant="subtle" onClick={() => load(pagination.page + 1)} disabled={loadingMore}>{loadingMore ? 'جارٍ تحميل المزيد...' : 'تحميل المزيد'}</Button></div>}
    </div>
  );
}

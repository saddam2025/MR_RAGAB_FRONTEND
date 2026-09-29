export const route = { path: '/:instructorId/admin/reels', index: false, auth: 'required', roles: ['admin', 'assistant'], title: 'رفع مقطع سريع' };

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { resolveApiAssetUrl } from '../../services/api';
import reelService from '../../services/reelService';
import { STAGES, stageLabel } from '../../constants/stages';

const MAX_REEL_BYTES = 500 * 1024 * 1024;
const ALLOWED_TYPES = new Set(['video/mp4', 'video/webm']);
const PAGE_SIZE = 10;

function fileError(file) {
  if (!file) return 'اختر ملف فيديو أولاً.';
  if (!ALLOWED_TYPES.has(file.type)) return 'يقبل الخادم ملفات MP4 أو WebM فقط.';
  if (file.size > MAX_REEL_BYTES) return 'يجب ألا يتجاوز حجم الفيديو 500MB.';
  return '';
}

function messageFor(error, fallback) {
  return error?.message || fallback;
}

function formatDate(value) {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString('ar-EG');
}

export default function ReelsUploadPage() {
  const { instructorId } = useParams();
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState('');
  const [stage, setStage] = useState('');
  const [validationError, setValidationError] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(null);
  const [reels, setReels] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [listError, setListError] = useState('');
  const [moreError, setMoreError] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [deleteError, setDeleteError] = useState('');

  const loadReels = useCallback(async (page = 1) => {
    const setBusy = page === 1 ? setLoading : setLoadingMore;
    setBusy(true);
    if (page === 1) setListError('');
    else setMoreError('');
    try {
      const response = await reelService.list(instructorId, page, PAGE_SIZE);
      const payload = response?.data || {};
      const received = Array.isArray(payload.data) ? payload.data : [];
      setReels((current) => (page === 1 ? received : [...current, ...received]));
      setPagination(payload.pagination || null);
    } catch (requestError) {
      if (page === 1) setListError(messageFor(requestError, 'تعذر تحميل المقاطع. حاول مرة أخرى.'));
      else setMoreError(messageFor(requestError, 'تعذر تحميل المزيد من المقاطع. حاول مرة أخرى.'));
    } finally {
      setBusy(false);
    }
  }, [instructorId]);

  useEffect(() => {
    loadReels();
  }, [loadReels]);

  const chooseFile = (event) => {
    const selected = event.target.files?.[0] || null;
    const error = fileError(selected);
    setFile(error ? null : selected);
    setValidationError(error);
    setUploadError('');
    setProgress(null);
  };

  const upload = async (event) => {
    event.preventDefault();
    const error = fileError(file);
    if (error) {
      setValidationError(error);
      return;
    }

    setUploading(true);
    setUploadError('');
    setProgress(null);
    try {
      await reelService.upload(instructorId, { video: file, caption, stage }, setProgress);
      setFile(null);
      setCaption('');
      setStage('');
      if (inputRef.current) inputRef.current.value = '';
      await loadReels();
    } catch (requestError) {
      const fallback = requestError?.uploadStage === 'init'
        ? 'تعذر إنشاء مساحة الرفع في Bunny Stream.'
        : requestError?.uploadStage === 'transfer'
          ? 'فشل النقل المباشر للفيديو إلى Bunny Stream.'
          : requestError?.uploadStage === 'confirm'
            ? 'اكتمل النقل لكن Bunny لم يؤكد الفيديو بعد. انتظر قليلاً ثم أعد المحاولة.'
            : 'تعذر رفع الفيديو. حاول مرة أخرى.';
      setUploadError(messageFor(requestError, fallback));
    } finally {
      setUploading(false);
    }
  };

  const remove = async (reelId) => {
    setDeletingId(reelId);
    setDeleteError('');
    try {
      await reelService.remove(reelId);
      await loadReels();
    } catch (requestError) {
      setDeleteError(messageFor(requestError, 'تعذر حذف المقطع. لم يتم تغييره في القائمة.'));
    } finally {
      setDeletingId(null);
    }
  };

  const hasMore = pagination && pagination.page < pagination.totalPages;

  return (
    <div className="mx-auto max-w-3xl space-y-6" dir="rtl">
      <div><p className="text-sm font-bold text-brand-600">محتوى قصير وجذاب</p><h1 className="text-2xl font-extrabold text-ink-900">رفع مقطع سريع</h1><p className="mt-1 text-sm text-ink-500">يدعم الخادم MP4 وWebM حتى 500MB، مع وصف ومرحلة اختياريين.</p></div>

      <form className="rounded-[var(--radius-xl)] border border-surface-border bg-surface-default p-6 shadow-card" onSubmit={upload}>
        <label className="grid cursor-pointer place-items-center rounded-[var(--radius-lg)] border-2 border-dashed border-brand-300 bg-surface-muted p-10 text-center hover:bg-surface-border">
          <span className="text-4xl" aria-hidden="true">↑</span><b className="mt-3 text-ink-900">{file ? file.name : 'اختر فيديو للرفع'}</b><small className="mt-1 text-ink-500">MP4 أو WebM — حتى 500MB</small>
          <input ref={inputRef} type="file" accept="video/mp4,video/webm" className="hidden" onChange={chooseFile} disabled={uploading} />
        </label>
        {validationError && <p role="alert" className="mt-3 text-sm text-danger-DEFAULT">{validationError}</p>}

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <label className="text-sm font-bold text-ink-700">وصف المقطع<textarea className="input mt-2 min-h-24" value={caption} onChange={(event) => setCaption(event.target.value)} disabled={uploading} placeholder="وصف اختياري للمقطع" /></label>
          <label className="text-sm font-bold text-ink-700">المرحلة الدراسية<select className="input mt-2" value={stage} onChange={(event) => setStage(event.target.value)} disabled={uploading}><option value="">كل المراحل</option>{STAGES.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
        </div>
        {uploading && <div className="mt-5" role="status"><p className="text-sm text-ink-600">جارٍ رفع الفيديو…</p>{progress !== null ? <><progress className="mt-2 h-3 w-full accent-brand-500" value={progress} max="100">{progress}%</progress><p className="mt-1 text-xs text-ink-500">{progress}%</p></> : <p className="mt-1 text-xs text-ink-500">لم يوفّر المتصفح الحجم الإجمالي للملف بعد.</p>}</div>}
        {uploadError && <p role="alert" className="mt-4 rounded-xl bg-danger-soft p-3 text-sm text-danger-DEFAULT">{uploadError}</p>}
        <div className="mt-6 flex justify-end"><Button type="submit" disabled={!file || uploading}>{uploading ? 'جارٍ الرفع...' : 'نشر المقطع'}</Button></div>
      </form>

      <section className="rounded-[var(--radius-xl)] border border-surface-border bg-surface-default p-6 shadow-card">
        <h2 className="text-lg font-extrabold text-ink-900">المقاطع المنشورة</h2>
        <p className="mt-1 text-sm text-ink-500">تعرض هذه القائمة بيانات المقاطع الحقيقية المحفوظة على الخادم.</p>
        {deleteError && <p role="alert" className="mt-4 rounded-xl bg-danger-soft p-3 text-sm text-danger-DEFAULT">{deleteError}</p>}
        {loading ? <p className="mt-5 text-sm text-ink-500">جارٍ تحميل المقاطع...</p> : listError ? <div role="alert" className="mt-5 rounded-xl bg-danger-soft p-3 text-sm text-danger-DEFAULT"><p>{listError}</p><Button variant="subtle" size="sm" className="mt-3" onClick={() => loadReels()}>إعادة المحاولة</Button></div> : reels.length === 0 ? <p className="mt-5 text-sm text-ink-500">لا توجد مقاطع منشورة حالياً.</p> : <div className="mt-5 space-y-3">{reels.map((reel) => <article key={reel._id} className="rounded-xl bg-surface-muted p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-sm font-bold text-ink-900">{reel.caption || 'بدون وصف'}</p><div className="mt-2 flex flex-wrap gap-2">{reel.stage && <Badge variant="neutral">{stageLabel(reel.stage)}</Badge>}<Badge variant="info">{reel.viewCount} مشاهدة</Badge>{formatDate(reel.createdAt) && <Badge variant="neutral">{formatDate(reel.createdAt)}</Badge>}</div></div><Button variant="subtle" size="sm" className="text-danger-DEFAULT" onClick={() => remove(reel._id)} disabled={deletingId === reel._id}>{deletingId === reel._id ? 'جارٍ الحذف...' : 'حذف'}</Button></div>{reel.bunnyEmbedUrl ? <iframe className="mt-4 aspect-video w-full rounded-lg bg-black" src={reel.bunnyEmbedUrl} title={reel.caption || 'Bunny video'} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen /> : <video className="mt-4 max-h-64 w-full rounded-lg bg-black" controls preload="metadata" src={resolveApiAssetUrl(reel.videoUrl)}>متصفحك لا يدعم تشغيل الفيديو.</video>}</article>)}</div>}
        {moreError && <p role="alert" className="mt-4 rounded-xl bg-danger-soft p-3 text-sm text-danger-DEFAULT">{moreError}</p>}
        {hasMore && <div className="mt-5 text-center"><Button variant="subtle" onClick={() => loadReels(pagination.page + 1)} disabled={loadingMore}>{loadingMore ? 'جارٍ تحميل المزيد...' : 'تحميل المزيد'}</Button></div>}
      </section>
    </div>
  );
}

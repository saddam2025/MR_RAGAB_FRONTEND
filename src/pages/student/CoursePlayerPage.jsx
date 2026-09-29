// src/pages/student/CoursePlayerPage.jsx
export const route = {
  path: '/:instructorId/courses/:courseId/lectures/:lectureId/learn',
  index: false,
  auth: 'student',
  title: 'مشغل الدورة'
};

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useParams } from 'react-router-dom';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { useAuth } from '../../hooks/useAuth';
import api, { resolveApiAssetUrl } from '../../services/api';
import quizService from '../../services/quizService';

export default function CoursePlayerPage() {
  const { instructorId, courseId, lectureId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const videoRef = useRef(null);
  const playerFrameRef = useRef(null);
  const sessionSecondsRef = useRef(0);
  const lastPlayedAtRef = useRef(null);
  const lastSavedAtRef = useRef(0);
  const [lecture, setLecture] = useState(null);
  const [access, setAccess] = useState(null);
  const [resumeSeconds, setResumeSeconds] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [progressError, setProgressError] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMobileFullscreen, setIsMobileFullscreen] = useState(false);
  const [isPhone, setIsPhone] = useState(false);
  const [quizSubmission, setQuizSubmission] = useState(null);
  const [assignment, setAssignment] = useState(null);

  useEffect(() => {
    const updateFullscreenState = () => setIsFullscreen(document.fullscreenElement === playerFrameRef.current);
    document.addEventListener('fullscreenchange', updateFullscreenState);
    return () => document.removeEventListener('fullscreenchange', updateFullscreenState);
  }, []);

  // Do not use viewport width alone: an iPhone in landscape is often wider
  // than 767px. The user agent keeps the phone-only behaviour stable across
  // orientation changes, while the media query covers mobile test devices.
  useEffect(() => {
    const updatePhoneState = () => {
      const phoneUserAgent = /Android.*Mobile|iPhone|iPod|IEMobile|Opera Mini/i.test(navigator.userAgent || '');
      const narrowTouchViewport = window.matchMedia('(max-width: 767px) and (pointer: coarse)').matches;
      setIsPhone(phoneUserAgent || narrowTouchViewport);
    };
    updatePhoneState();
    window.addEventListener('resize', updatePhoneState);
    window.addEventListener('orientationchange', updatePhoneState);
    return () => {
      window.removeEventListener('resize', updatePhoneState);
      window.removeEventListener('orientationchange', updatePhoneState);
    };
  }, []);

  // iOS Safari cannot fullscreen an arbitrary iframe element. Use a page-level
  // mobile presentation so the watermark remains above Bunny's iframe.
  useEffect(() => {
    if (!isMobileFullscreen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previousOverflow; };
  }, [isMobileFullscreen]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setLoadError('');
    setProgressError('');
    setLecture(null);
    setAccess(null);
    setResumeSeconds(0);
    sessionSecondsRef.current = 0;
    lastPlayedAtRef.current = null;
    lastSavedAtRef.current = 0;

    const loadPlayer = async () => {
      try {
        // start-view is the authoritative access gate. Do not fetch/render a
        // playable source until it has granted this viewing session.
        const accessResponse = await api.post(`/courses/${courseId}/lectures/${lectureId}/start-view`);
        const progressResponse = await api.get(`/courses/${courseId}/lectures/${lectureId}/watch-progress`);

        if (!active) return;
        setAccess(accessResponse?.data?.data || null);
        setLecture(accessResponse?.data?.data?.lecture || null);
        setResumeSeconds(Number(progressResponse?.data?.data?.watchedSeconds) || 0);
      } catch (error) {
        if (active) setLoadError(error?.message || 'تعذر التحقق من صلاحية مشاهدة هذه المحاضرة.');
      } finally {
        if (active) setLoading(false);
      }
    };

    loadPlayer();
    return () => { active = false; };
  }, [courseId, lectureId]);

  const saveProgress = async () => {
    const video = videoRef.current;
    if (!video || !Number.isFinite(video.currentTime)) return;

    const activeSessionSeconds = sessionSecondsRef.current + (lastPlayedAtRef.current
      ? (Date.now() - lastPlayedAtRef.current) / 1000
      : 0);

    try {
      await api.patch(`/courses/${courseId}/lectures/${lectureId}/watch-progress`, {
        watchedSeconds: video.currentTime,
        sessionSeconds: Math.max(0, Math.round(activeSessionSeconds)),
        totalDurationSeconds: Number.isFinite(video.duration) ? video.duration : 0
      });
      lastSavedAtRef.current = video.currentTime;
      setProgressError('');
    } catch (error) {
      setProgressError(error?.message || 'تعذر حفظ تقدم المشاهدة.');
    }
  };

  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (!video || !resumeSeconds || resumeSeconds >= video.duration) return;
    video.currentTime = resumeSeconds;
  };

  const handlePlay = () => {
    if (!lastPlayedAtRef.current) lastPlayedAtRef.current = Date.now();
  };

  const handlePause = () => {
    if (lastPlayedAtRef.current) {
      sessionSecondsRef.current += (Date.now() - lastPlayedAtRef.current) / 1000;
      lastPlayedAtRef.current = null;
    }
    void saveProgress();
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (video && video.currentTime - lastSavedAtRef.current >= 15) void saveProgress();
  };

  const toggleFullscreen = async () => {
    if (isPhone) {
      setIsMobileFullscreen((current) => !current);
      setProgressError('');
      return;
    }

    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await playerFrameRef.current?.requestFullscreen();
    } catch {
      setProgressError('تعذر تغيير وضع عرض الفيديو في هذا المتصفح.');
    }
  };

  const videoUrl = resolveApiAssetUrl(lecture?.videoUrl || access?.videoUrl);
  const bunnyEmbedUrl = lecture?.bunnyEmbedUrl || access?.lecture?.bunnyEmbedUrl;
  const title = lecture?.title_ar || lecture?.title_en || 'المحاضرة';
  const watermark = access?.watermark || { name: user?.name || 'طالب', phone: user?.phone || '' };
  const watermarkText = [watermark.name, watermark.phone].filter(Boolean).join(' • ');
  const fullscreenLabel = isFullscreen || isMobileFullscreen ? 'تصغير الفيديو' : 'تكبير الفيديو';
  const homeworkUrl = lecture?.homeworkUrl ? resolveApiAssetUrl(lecture.homeworkUrl) : '';
  const quizId = lecture?.quizId || '';

  useEffect(() => {
    let active = true;
    if (!quizId) { setQuizSubmission(null); return () => { active = false; }; }
    quizService.getMySubmission(quizId)
      .then((response) => { if (active) setQuizSubmission(response?.data?.data || null); })
      .catch(() => { if (active) setQuizSubmission(null); });
    return () => { active = false; };
  }, [quizId]);

  useEffect(() => {
    let active = true;
    api.get(`/courses/${courseId}/lectures/${lectureId}/assignments/mine`)
      .then((response) => { if (active) setAssignment(response?.data?.data || null); })
      .catch(() => { if (active) setAssignment(null); });
    return () => { active = false; };
  }, [courseId, lectureId]);
  const playerFrame = bunnyEmbedUrl ? <div ref={playerFrameRef} className={`video-player-frame relative aspect-video w-full overflow-hidden rounded-2xl bg-black ring-1 ring-black/40${isMobileFullscreen ? ' video-mobile-fullscreen' : ''}`}>
    <iframe className="h-full w-full" src={bunnyEmbedUrl} title={title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" />
    <div className="video-watermark">{watermarkText}</div>
    <button type="button" className="video-fullscreen-button" onClick={toggleFullscreen}>{fullscreenLabel}</button>
    {/* This is rendered only for phones and intercepts Bunny's own fullscreen
        control before it can enter an iframe-only mode without the watermark. */}
    {isPhone && <button type="button" className="video-mobile-fullscreen-control" onClick={toggleFullscreen} aria-label={fullscreenLabel}>⛶</button>}
  </div> : videoUrl ? <div ref={playerFrameRef} className={`video-player-frame relative w-full overflow-hidden rounded-2xl bg-black ring-1 ring-black/40${isMobileFullscreen ? ' video-mobile-fullscreen' : ''}`}>
    <video
      ref={videoRef}
      className="w-full h-auto max-h-[60vh] bg-black"
      controls
      controlsList="nodownload nofullscreen"
      disablePictureInPicture
      src={videoUrl}
      preload="metadata"
      onLoadedMetadata={handleLoadedMetadata}
      onPlay={handlePlay}
      onPause={handlePause}
      onEnded={handlePause}
      onTimeUpdate={handleTimeUpdate}
    />
    <div className="video-watermark">{watermarkText}</div>
    <button type="button" className="video-fullscreen-button" onClick={toggleFullscreen}>{fullscreenLabel}</button>
  </div>
    : <div className="rounded-2xl bg-surface-muted p-6 text-center text-sm text-ink-600">لا يوجد فيديو لهذه المحاضرة. أكمل متطلباتها المتاحة أدناه.</div>;
  const renderedPlayer = isMobileFullscreen && typeof document !== 'undefined'
    ? createPortal(playerFrame, document.body)
    : playerFrame;

  if (loading) {
    return <div dir="rtl" className="container mx-auto px-4 py-8 text-center text-sm text-ink-500">جارٍ التحقق من صلاحية المشاهدة...</div>;
  }

  if (loadError || !access) {
    return (
      <div dir="rtl" className="container mx-auto max-w-2xl px-4 py-8">
        <section role="alert" className="rounded-2xl bg-danger-soft p-6 text-center">
          <h1 className="text-xl font-semibold text-danger-DEFAULT">تعذر تشغيل المحاضرة</h1>
          <p className="mt-2 text-sm text-danger-DEFAULT">{loadError || 'تعذر التحقق من صلاحية المحاضرة.'}</p>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-canvas text-ink-900" dir="rtl">
      <main className="container mx-auto max-w-5xl px-4 py-6 space-y-5">
        <section className="rounded-3xl bg-surface-default shadow-card p-5">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Avatar src={null} name={watermark.name} size="sm" />
              <div>
                <h1 className="text-lg font-bold text-ink-900">{title}</h1>
                <p className="text-xs text-ink-500">{watermark.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {access.viewsRemaining != null && <Badge variant="info" className="text-xs">المشاهدات المتبقية: {access.viewsRemaining}</Badge>}
              {access.daysRemaining != null && <Badge variant="info" className="text-xs">الأيام المتبقية: {access.daysRemaining}</Badge>}
            </div>
          </div>

          {renderedPlayer}

          {progressError && <p role="alert" className="mt-3 text-sm text-danger-DEFAULT">{progressError}</p>}
        </section>

        <section className="rounded-3xl bg-surface-default shadow-card p-6 text-right">
          <h2 className="font-display text-2xl font-bold text-ink-900">{title}</h2>
          {lecture?.description_ar && <p className="mt-2 text-sm leading-relaxed text-ink-600">{lecture.description_ar}</p>}
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <article className="rounded-2xl border border-brand-200 bg-brand-50/50 p-5">
              <p className="text-sm font-bold text-ink-900">الواجب</p>
              {homeworkUrl ? <><p className="mt-2 text-sm text-ink-600">تم رفع واجب هذه المحاضرة، ويمكنك عرضه أو تحميله ثم تسليم الحل.</p><div className="mt-4 flex flex-wrap gap-2"><a href={homeworkUrl} target="_blank" rel="noreferrer" download><Button size="sm" variant="ghost">عرض / تحميل الواجب</Button></a><Button size="sm" variant="primary" onClick={() => navigate(assignment ? `/${instructorId}/assignment-grades` : `/${instructorId}/courses/${courseId}/lectures/${lectureId}/assignments`)}>{assignment ? 'شوف درجة الواجب' : 'تسليم الواجب'}</Button></div></> : <p className="mt-2 text-sm text-ink-500">الواجب لسه منزلش.</p>}
            </article>
            <article className="rounded-2xl border border-surface-border bg-surface-muted p-5">
              <p className="text-sm font-bold text-ink-900">الامتحان</p>
              {quizId ? <><p className="mt-2 text-sm text-ink-600">اختبار المحاضرة جاهز. تأكد من فهم الدرس قبل البدء.</p><Button className="mt-4" size="sm" variant="primary" onClick={() => navigate(quizSubmission ? `/${instructorId}/exam-grades` : `/${instructorId}/courses/${courseId}/quizzes/${quizId}`)}>{quizSubmission ? 'شوف درجتك' : 'بدء الامتحان'}</Button></> : <p className="mt-2 text-sm text-ink-500">الامتحان لسه منزلش.</p>}
            </article>
          </div>
          <div className="mt-5">
            <Button variant="ghost" onClick={() => { window.location.href = 'mailto:support@riyadiaty.example.com'; }}>
              تواصل مع الدعم
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}

export const route = {
  path: '/:instructorId/exams/:examId/take',
  index: false,
  auth: 'required',
  roles: ['student'],
  title: 'الامتحان'
};

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import QuizQuestionNavigator from '../../components/quiz/QuizQuestionNavigator';
import standaloneExamService from '../../services/standaloneExamService';

const errorMessage = (error, fallback) => error?.message || fallback;

function formatRemaining(seconds) {
  const safeSeconds = Math.max(0, seconds);
  const minutes = Math.floor(safeSeconds / 60);
  return `${String(minutes).padStart(2, '0')}:${String(safeSeconds % 60).padStart(2, '0')}`;
}

export default function StandaloneExamTakingPage() {
  const { instructorId, examId } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [startedAt, setStartedAt] = useState(null);
  const [answers, setAnswers] = useState([]);
  const answersRef = useRef([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const autoSubmitRequested = useRef(false);

  const setSelectedAnswers = (next) => {
    answersRef.current = next;
    setAnswers(next);
  };

  const start = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const response = await standaloneExamService.start(examId);
      const payload = response?.data?.data;
      if (!payload?.exam?.questions || !payload?.submission?.startedAt) throw new Error('استجابة بدء الامتحان غير صالحة.');
      setExam(payload.exam);
      setStartedAt(payload.submission.startedAt);
      setSelectedAnswers(Array(payload.exam.questions.length).fill(null));
      setCurrentIndex(0);
    } catch (requestError) {
      setError(errorMessage(requestError, 'تعذر بدء الامتحان.'));
    } finally {
      setLoading(false);
    }
  }, [examId]);

  useEffect(() => { start(); }, [start]);

  const submit = useCallback(async ({ automatic = false } = {}) => {
    if (!exam || submitting || result) return;
    const currentAnswers = answersRef.current;
    // Navigator requires answers in order. Keeping the answered prefix lets a
    // timer-expiry request send only real selections, never fake placeholders.
    const firstUnanswered = currentAnswers.findIndex((answer) => answer == null);
    const submittedAnswers = firstUnanswered === -1 ? currentAnswers : currentAnswers.slice(0, firstUnanswered);
    if (!automatic && submittedAnswers.length !== exam.questions.length) {
      setError('أجب عن جميع الأسئلة قبل التسليم.');
      return;
    }
    setSubmitting(true); setError('');
    try {
      const response = await standaloneExamService.submit(examId, submittedAnswers);
      const payload = response?.data?.data;
      if (typeof payload?.score !== 'number') throw new Error('استجابة التسليم لا تحتوي على الدرجة.');
      setResult(payload);
    } catch (requestError) {
      // A concurrent expiry/read can finalize the same attempt first. The
      // backend includes the already-recorded score in that conflict response.
      const recorded = requestError?.data;
      if (typeof recorded?.score === 'number') setResult(recorded);
      else setError(errorMessage(requestError, 'تعذر إرسال الإجابات. حاول مرة أخرى.'));
    } finally {
      setSubmitting(false);
    }
  }, [exam, examId, result, submitting]);

  useEffect(() => {
    if (!exam || !startedAt || result) return undefined;
    const deadline = new Date(startedAt).getTime() + exam.durationMinutes * 60 * 1000;
    const updateTimer = () => {
      const seconds = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      setRemainingSeconds(seconds);
      if (seconds === 0 && !autoSubmitRequested.current) {
        autoSubmitRequested.current = true;
        submit({ automatic: true });
      }
    };
    updateTimer();
    const timer = window.setInterval(updateTimer, 250);
    return () => window.clearInterval(timer);
  }, [exam, startedAt, result, submit]);

  const selectOption = (optionIndex) => {
    const next = [...answers];
    next[currentIndex] = optionIndex;
    setSelectedAnswers(next);
  };

  const questionCount = exam?.questions?.length || 0;
  const title = useMemo(() => exam?.title || 'الامتحان', [exam]);
  if (loading) return <div dir="rtl" className="rounded-2xl bg-surface-default p-8 text-center text-ink-500 shadow-card">جارٍ بدء الامتحان...</div>;
  if (error && !exam) return <div dir="rtl" role="alert" className="rounded-2xl bg-danger-soft p-6 text-center text-danger-DEFAULT"><p>{error}</p><Button variant="subtle" className="mt-4" onClick={start}>إعادة المحاولة</Button></div>;
  if (!exam || questionCount === 0) return <div dir="rtl" className="rounded-2xl bg-surface-default p-8 text-center text-ink-500 shadow-card">لا توجد أسئلة متاحة لهذا الامتحان.</div>;
  if (result) return <div dir="rtl" className="mx-auto max-w-2xl space-y-6"><section className="rounded-2xl bg-surface-default p-8 text-center shadow-card"><Badge variant={result.autoSubmitted ? 'danger' : 'success'}>{result.autoSubmitted ? 'تم التسليم تلقائياً' : 'تم التسليم بنجاح'}</Badge><h1 className="mt-4 text-2xl font-bold text-ink-900">{title}</h1><p className="mt-5 text-5xl font-extrabold text-brand-700">{result.score}%</p><p className="mt-3 text-sm text-ink-500">ظهرت درجتك فوراً بعد التصحيح التلقائي.</p><Button className="mt-6" onClick={() => navigate(`/${instructorId}/dashboard`, { replace: true })}>العودة للوحة التحكم</Button></section></div>;

  return <div dir="rtl" className="mx-auto max-w-2xl space-y-6"><div className="flex items-start justify-between gap-4"><div><p className="text-sm font-bold text-brand-600">امتحان مستقل</p><h1 className="text-2xl font-extrabold text-ink-900">{title}</h1><p className="mt-1 text-sm text-ink-500">سؤال {currentIndex + 1} من {questionCount}</p></div><Badge variant={remainingSeconds != null && remainingSeconds < 60 ? 'danger' : 'info'}>الوقت المتبقي: {remainingSeconds == null ? '--:--' : formatRemaining(remainingSeconds)}</Badge></div>{error && <p role="alert" className="rounded-xl bg-danger-soft p-3 text-sm text-danger-DEFAULT">{error}</p>}<QuizQuestionNavigator questions={exam.questions} currentIndex={currentIndex} answers={answers} onSelect={selectOption} onPrevious={() => setCurrentIndex((index) => Math.max(0, index - 1))} onNext={() => currentIndex === questionCount - 1 ? submit() : setCurrentIndex((index) => index + 1)} submitting={submitting} submitLabel={submitting ? 'جارٍ الإرسال...' : 'إرسال الامتحان'} /></div>;
}

export const route = { path: '/:instructorId/quizzes/:quizId/results/:submissionId', index: false, auth: 'student', title: 'نتيجة الاختبار' };
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import MathText from '../../components/math/MathText';
import QuestionStemDisplay from '../../components/quiz/QuestionStemDisplay';
import quizService from '../../services/quizService';
export default function QuizResultsPage() {
  const { instructorId, submissionId } = useParams(); const navigate = useNavigate(); const [data, setData] = useState(null); const [error, setError] = useState(''); const [loading, setLoading] = useState(true);
  const load = useCallback(async () => { setLoading(true); setError(''); try { const r = await quizService.getSubmission(submissionId); const d = r?.data?.data; if (!d?.submission || !Array.isArray(d.questions)) throw new Error('استجابة النتيجة غير صالحة.'); setData(d); } catch (e) { setError(e?.message || 'تعذر تحميل النتيجة.'); } finally { setLoading(false); } }, [submissionId]);
  useEffect(() => { load(); }, [load]);
  const questions = useMemo(() => data?.questions.map((q, i) => ({ ...q, studentAnswerIndex: data.submission.answers[i] ?? null })) || [], [data]);
  if (loading) return <div dir="rtl" className="rounded-2xl bg-surface-default p-8 text-center text-ink-500 shadow-card">جارٍ تحميل النتيجة...</div>;
  if (error) return <div dir="rtl" role="alert" className="rounded-2xl bg-danger-soft p-6 text-center text-danger-DEFAULT"><p>{error}</p><Button variant="subtle" className="mt-4" onClick={load}>إعادة المحاولة</Button></div>;
  return <div dir="rtl" className="mx-auto max-w-3xl space-y-6"><section className="rounded-2xl bg-surface-default p-8 text-center shadow-card"><p className={`text-5xl font-bold ${data.submission.passed ? 'text-brand-700' : 'text-danger-DEFAULT'}`}>{data.submission.score}%</p><Badge className="mt-4" variant={data.submission.passed ? 'success' : 'danger'}>{data.submission.passed ? 'ناجح' : 'لم يحقق النسبة المطلوبة'}</Badge><Button className="mt-6" variant="primary" onClick={() => navigate(`/${instructorId}/dashboard`, { replace: true })}>العودة للوحة التحكم</Button></section><section className="rounded-2xl bg-surface-default p-6 shadow-card"><h2 className="mb-4 text-lg font-bold">مراجعة الأسئلة</h2>{questions.map((q, i) => <article key={q._id} className="border-t border-surface-border py-4 first:border-t-0"><p className="font-bold">{i + 1}. <QuestionStemDisplay question={q} /></p><div className="mt-3 grid gap-2 sm:grid-cols-2">{q.options.map((option, oi) => <div key={oi} className={`rounded-lg border p-3 ${oi === q.correctOptionIndex ? 'border-success-DEFAULT bg-success-soft' : oi === q.studentAnswerIndex ? 'border-danger-DEFAULT bg-danger-soft' : 'border-surface-border'}`}><MathText content={option} /></div>)}</div>{q.explanation && q.studentAnswerIndex !== q.correctOptionIndex && <p className="mt-3 text-sm text-ink-600"><MathText content={q.explanation} /></p>}</article>)}</section></div>;
}

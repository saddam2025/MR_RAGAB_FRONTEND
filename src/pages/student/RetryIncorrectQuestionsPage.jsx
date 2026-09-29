export const route = { path: '/:instructorId/quizzes/:quizId/results/:submissionId/retry', index: false, auth: 'student', title: 'مراجعة الإجابات' };

import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import MathText from '../../components/math/MathText';
import QuestionStemDisplay from '../../components/quiz/QuestionStemDisplay';
import QuizQuestionNavigator from '../../components/quiz/QuizQuestionNavigator';
import quizService from '../../services/quizService';

function messageFor(error, fallback) {
  return error?.message || fallback;
}

export default function RetryIncorrectQuestionsPage() {
  const { instructorId, quizId, submissionId } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await quizService.getRetryQuestions(submissionId);
      const received = response?.data?.data?.questions;
      const nextQuestions = Array.isArray(received) ? received : [];
      setQuestions(nextQuestions);
      setAnswers(Array(nextQuestions.length).fill(null));
      setCurrentIndex(0);
    } catch (requestError) {
      setError(messageFor(requestError, 'تعذر تحميل الأسئلة الخاطئة. حاول مرة أخرى.'));
    } finally {
      setLoading(false);
    }
  }, [submissionId]);

  useEffect(() => { load(); }, [load]);

  const selectOption = (optionIndex) => {
    setAnswers((current) => current.map((answer, index) => index === currentIndex ? optionIndex : answer));
  };

  const submit = async () => {
    setSubmitting(true);
    setError('');
    try {
      const response = await quizService.submitRetry(submissionId, answers);
      setResult(response?.data?.data || null);
    } catch (requestError) {
      setError(messageFor(requestError, 'تعذر إرسال إعادة المحاولة. حاول مرة أخرى.'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div dir="rtl" className="rounded-2xl bg-surface-default p-8 text-center text-ink-500 shadow-card">جارٍ تحميل الأسئلة الخاطئة...</div>;
  if (error && !questions.length) return <div dir="rtl" role="alert" className="rounded-2xl bg-danger-soft p-6 text-center text-danger-DEFAULT"><p>{error}</p><Button variant="subtle" size="sm" className="mt-4" onClick={load}>إعادة المحاولة</Button></div>;
  if (result) {
    const reviewQuestions = Array.isArray(result.questions) ? result.questions : [];
    return <div dir="rtl" className="mx-auto max-w-3xl space-y-6"><section className={`rounded-2xl p-6 text-center ${result.passed ? 'bg-success-soft text-success-text' : 'bg-danger-soft text-danger-DEFAULT'}`}><h1 className="text-2xl font-extrabold">{result.passed ? 'تمت إعادة المحاولة بنجاح' : 'راجع الإجابات المتبقية'}</h1><p className="mt-2">{result.passed ? 'أصبحت جميع الإجابات صحيحة.' : 'يعرض الخادم الإجابات والشرح للأسئلة التي ما زالت غير صحيحة.'}</p></section>{reviewQuestions.map((question, index) => <section key={question._id || index} className="rounded-2xl bg-surface-default p-6 shadow-card"><h2 className="font-bold text-ink-900">{index + 1}. <QuestionStemDisplay question={question} /></h2><div className="mt-4 grid gap-2 sm:grid-cols-2">{question.options.map((option, optionIndex) => <div key={optionIndex} className={`rounded-lg border p-3 text-sm ${optionIndex === question.correctOptionIndex ? 'border-success-DEFAULT bg-success-soft text-success-text' : optionIndex === question.studentAnswerIndex ? 'border-danger-DEFAULT bg-danger-soft text-danger-DEFAULT' : 'border-surface-border text-ink-700'}`}><MathText content={option} /></div>)}</div>{question.explanation && <p className="mt-4 rounded-lg bg-surface-muted p-3 text-sm text-ink-700"><MathText content={question.explanation} /></p>}</section>)}<div className="text-center"><Button variant="subtle" onClick={() => navigate(`/${instructorId}/quizzes/${quizId}/results/${submissionId}`)}>العودة للنتيجة</Button></div></div>;
  }
  if (questions.length === 0) return <div dir="rtl" className="rounded-2xl bg-surface-default p-8 text-center text-ink-500 shadow-card"><p>لا توجد أسئلة خاطئة لإعادة المحاولة.</p><Button variant="subtle" size="sm" className="mt-4" onClick={() => navigate(`/${instructorId}/quizzes/${quizId}/results/${submissionId}`)}>العودة للنتيجة</Button></div>;

  return <div dir="rtl" className="mx-auto max-w-2xl space-y-6"><div className="flex items-start justify-between gap-4"><div><p className="text-sm font-bold text-brand-600">فرصة جديدة</p><h1 className="text-2xl font-extrabold text-ink-900">أعد حل الإجابات الخاطئة</h1><p className="mt-1 text-sm text-ink-500">سؤال {currentIndex + 1} من {questions.length}</p></div><Badge variant="info">إعادة محاولة</Badge></div>{error && <div role="alert" className="rounded-xl bg-danger-soft p-3 text-sm text-danger-DEFAULT">{error}</div>}<QuizQuestionNavigator questions={questions} currentIndex={currentIndex} answers={answers} onSelect={selectOption} onPrevious={() => setCurrentIndex((index) => Math.max(0, index - 1))} onNext={() => currentIndex === questions.length - 1 ? submit() : setCurrentIndex((index) => index + 1)} submitting={submitting} submitLabel={submitting ? 'جارٍ الإرسال...' : 'إرسال إعادة المحاولة'} /></div>;
}

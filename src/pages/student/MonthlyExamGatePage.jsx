export const route = { path: '/:instructorId/monthly-exam', index: false, auth: 'student', title: 'اختبار الشهر' };

import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '../../components/ui/Button';
import useAuth from '../../hooks/useAuth';
import quizService from '../../services/quizService';
import subscriptionService from '../../services/subscriptionService';

const errorMessage = (error, fallback) => error?.message || fallback;

export default function MonthlyExamGatePage() {
  const { instructorId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [exam, setExam] = useState(null);
  const [eligibility, setEligibility] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    const studentId = user?._id || user?.id;
    const stage = user?.stage;
    if (!studentId || !stage) {
      setError('تعذر تحديد بيانات الطالب أو المرحلة الدراسية.');
      setLoading(false);
      return;
    }
    setLoading(true); setError(''); setExam(null); setEligibility(null);
    try {
      const subscriptionResponse = await subscriptionService.getCurrent(studentId, stage);
      const subscription = subscriptionResponse?.data?.data;
      const monthlyExam = subscription?.monthlyExam;
      if (!monthlyExam?.quizId) {
        setLoading(false);
        return;
      }
      setExam({ ...monthlyExam, subscriptionId: subscription._id });
      const eligibilityResponse = await quizService.checkMonthlyExamEligibility(monthlyExam.quizId);
      setEligibility(eligibilityResponse?.data?.data || null);
    } catch (requestError) {
      setError(errorMessage(requestError, 'تعذر تحميل اختبار الشهر. حاول مرة أخرى.'));
    } finally { setLoading(false); }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <div dir="rtl" className="mx-auto max-w-2xl rounded-[var(--radius-xl)] bg-surface-default p-8 text-center text-ink-500 shadow-card">جارٍ التحقق من اختبار الشهر...</div>;
  if (error) return <div dir="rtl" role="alert" className="mx-auto max-w-2xl rounded-[var(--radius-xl)] bg-danger-soft p-8 text-center text-danger-DEFAULT"><p>{error}</p><Button variant="subtle" className="mt-4" onClick={load}>إعادة المحاولة</Button></div>;
  if (!exam) return <div dir="rtl" className="mx-auto max-w-2xl rounded-[var(--radius-xl)] bg-surface-default p-8 text-center shadow-card"><h1 className="text-2xl font-extrabold text-ink-900">لا يتوفر اختبار شهر حالي</h1><p className="mt-3 text-ink-600">لا يوجد اختبار مرتبط باشتراكك الحالي لهذه المرحلة.</p></div>;
  if (!eligibility?.eligible) return <div dir="rtl" className="mx-auto max-w-2xl rounded-[var(--radius-xl)] bg-surface-default p-8 text-center shadow-card"><p className="text-sm font-bold text-brand-600">اختبار الشهر {exam.month}</p><h1 className="mt-2 text-2xl font-extrabold text-ink-900">لا يمكنك بدء الاختبار حالياً</h1><p className="mt-4 text-ink-600">{eligibility?.reason || 'لم تتحقق أهلية الاختبار.'}</p></div>;
  return <div dir="rtl" className="mx-auto max-w-2xl rounded-[var(--radius-xl)] bg-surface-default p-8 text-center shadow-card"><p className="text-sm font-bold text-brand-600">اختبار الشهر {exam.month}</p><h1 className="mt-2 text-2xl font-extrabold text-ink-900">أنت مؤهل لبدء الاختبار</h1><p className="mt-4 text-ink-600">يتم التحقق من أهليتك من الخادم قبل تحميل الأسئلة.</p><Button className="mt-6" onClick={() => navigate(`/${instructorId}/quiz/take/${exam.quizId}`, { state: { monthlyExam: { subscriptionId: exam.subscriptionId } } })}>بدء الاختبار</Button></div>;
}

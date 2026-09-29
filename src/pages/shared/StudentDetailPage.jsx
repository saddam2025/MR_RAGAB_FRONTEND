export const route = {
  path: '/:instructorId/students/:studentId',
  index: false,
  auth: 'required',
  roles: ['admin', 'assistant'],
  title: 'بيانات الطالب'
};

import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Avatar from '../../components/ui/Avatar';
import Button from '../../components/ui/Button';
import ConfirmModal from '../../components/ui/ConfirmModal';
import PasswordInput from '../../components/ui/PasswordInput';
import api from '../../services/api';
import { stageLabel } from '../../constants/stages';
import { hasValidPassword, PASSWORD_POLICY_MESSAGE } from '../../utils/passwordPolicy';
import toast from 'react-hot-toast';

function date(value) {
  return value ? new Date(value).toLocaleDateString('ar-EG') : 'غير متاح';
}

export default function StudentDetailPage() {
  const { instructorId, studentId } = useParams();
  const [detail, setDetail] = useState(null);
  const [gradeHistory, setGradeHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [gradesLoading, setGradesLoading] = useState(true);
  const [error, setError] = useState('');
  const [gradesError, setGradesError] = useState('');
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [resetPasswordError, setResetPasswordError] = useState('');
  const [resettingPassword, setResettingPassword] = useState(false);

  useEffect(() => {
    let active = true;
    api.get(`/instructors/${instructorId}/students/${studentId}`)
      .then((response) => { if (active) setDetail(response?.data?.data || null); })
      .catch((requestError) => { if (active) setError(requestError?.message || 'تعذر تحميل بيانات الطالب.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [instructorId, studentId]);

  useEffect(() => {
    let active = true;
    api.get(`/instructors/${instructorId}/students/${studentId}/profile`)
      .then((response) => { if (active) setGradeHistory(response?.data?.data || null); })
      .catch((requestError) => { if (active) setGradesError(requestError?.message || 'تعذر تحميل الدرجات.'); })
      .finally(() => { if (active) setGradesLoading(false); });
    return () => { active = false; };
  }, [instructorId, studentId]);

  if (loading) return <div dir="rtl" className="rounded-2xl bg-surface-default p-6 text-center text-ink-500 shadow-card">جارٍ تحميل بيانات الطالب...</div>;
  if (error || !detail?.student) return <div dir="rtl" role="alert" className="rounded-2xl bg-danger-soft p-6 text-center text-danger-DEFAULT">{error || 'الطالب غير موجود.'}</div>;
  const { student, lectureAccess = [], courseEnrollments = [] } = detail;
  const hasGuardianPhone = Boolean(student.guardianPhone?.trim());
  const quizGrades = (gradeHistory?.quizSubmissions || []).map((submission) => ({
    id: `quiz-${submission._id}`,
    title: submission.quizTitle || submission.courseTitle || (submission.quizType === 'monthly_exam' ? 'اختبار الشهر' : 'اختبار'),
    date: submission.submittedAt,
    grade: `${submission.score}%`,
    category: submission.quizType === 'monthly_exam' ? 'اختبار' : 'كويز'
  }));
  const examGrades = (gradeHistory?.standaloneExamSubmissions || []).map((submission) => ({
    id: `exam-${submission._id}`,
    title: submission.exam?.title || 'اختبار',
    date: submission.submittedAt || submission.startedAt,
    grade: submission.score == null ? 'لم يُرصد تقييم' : `${submission.score}%`,
    category: 'اختبار'
  }));
  const homeworkGrades = (gradeHistory?.assignments || []).map((assignment) => ({
    id: `assignment-${assignment._id}`,
    title: assignment.lectureTitle || assignment.courseTitle || 'واجب',
    date: assignment.gradedAt || assignment.submittedAt,
    grade: assignment.grade == null ? (assignment.status === 'pending' ? 'قيد التصحيح' : 'لم تُسجل درجة') : `${assignment.grade}%`,
    category: 'واجب'
  }));
  const grades = [...quizGrades, ...examGrades, ...homeworkGrades].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

  const resetStudentPassword = async () => {
    if (!hasValidPassword(newPassword)) {
      setResetPasswordError(PASSWORD_POLICY_MESSAGE);
      return;
    }

    setResettingPassword(true);
    setResetPasswordError('');
    try {
      await api.patch(`/instructors/${instructorId}/students/${studentId}/reset-password`, { newPassword });
      toast.success('تم تغيير كلمة المرور بنجاح');
      setResetModalOpen(false);
      setNewPassword('');
    } catch (requestError) {
      const message = requestError?.message || 'تعذر تغيير كلمة المرور. حاول مرة أخرى.';
      setResetPasswordError(message);
      toast.error(message);
    } finally {
      setResettingPassword(false);
    }
  };

  return <div dir="rtl" className="mx-auto max-w-5xl space-y-6">
    <Link to={`/${instructorId}/students`}><Button variant="subtle" size="sm">العودة إلى الطلاب</Button></Link>
    <section className="rounded-2xl bg-surface-default p-6 shadow-card"><div className="flex items-center gap-4"><Avatar src={student.avatarUrl} name={student.name} size="lg" /><div><h1 className="text-2xl font-bold text-ink-900">{student.name}</h1><p className="text-sm text-ink-500">مسجل منذ {date(student.registeredAt)}</p></div></div><dl className="mt-6 grid gap-4 text-sm sm:grid-cols-2"><div><dt className="text-ink-500">البريد الإلكتروني</dt><dd className="mt-1 font-medium">{student.email || 'غير متاح'}</dd></div><div><dt className="text-ink-500">هاتف الطالب</dt><dd className="mt-1 font-medium">{student.phone || 'غير متاح'}</dd></div>{hasGuardianPhone ? <div><dt className="text-ink-500">رقم ولي الأمر</dt><dd className="mt-1 font-medium">{student.guardianPhone}</dd></div> : <><div><dt className="text-ink-500">هاتف الأب</dt><dd className="mt-1 font-medium">{student.fatherPhone || 'غير متاح'}</dd></div><div><dt className="text-ink-500">هاتف الأم</dt><dd className="mt-1 font-medium">{student.motherPhone || 'غير متاح'}</dd></div></>}<div><dt className="text-ink-500">حالة ولي الأمر</dt><dd className={`mt-1 font-medium ${student.parentLinked ? 'text-success-text' : 'text-ink-500'}`}>{student.parentLinked ? 'مرتبط بالطالب' : 'غير مرتبط بالطالب'}</dd></div><div><dt className="text-ink-500">المرحلة</dt><dd className="mt-1 font-medium">{student.stage ? stageLabel(student.stage) : 'غير متاح'}</dd></div><div><dt className="text-ink-500">الشعبة</dt><dd className="mt-1 font-medium">{student.track || 'غير متاح'}</dd></div></dl><div className="mt-6 border-t border-surface-border pt-4"><Button type="button" variant="subtle" onClick={() => { setNewPassword(''); setResetPasswordError(''); setResetModalOpen(true); }}>تغيير كلمة المرور</Button></div></section>
    <section className="rounded-2xl bg-surface-default p-6 shadow-card"><h2 className="text-lg font-bold">المحاضرات المشتراة</h2><div className="mt-4 space-y-3">{lectureAccess.map((access) => <article key={access.id} className="rounded-xl bg-surface-muted p-4"><p className="font-medium">{access.lectureTitle || access.courseTitle || 'العنصر المرتبط غير متاح'}</p><p className="mt-1 text-sm text-ink-500">تاريخ الشراء: {date(access.purchasedAt)} · ينتهي: {date(access.expiresAt)}</p><p className="mt-1 text-sm text-ink-500">المشاهدات: {access.viewsUsed} / {access.maxViews}</p></article>)}{lectureAccess.length === 0 && <p className="text-ink-500">لا توجد محاضرات مشتراة.</p>}</div></section>
    <section className="rounded-2xl bg-surface-default p-6 shadow-card"><h2 className="text-lg font-bold">الكورسات المسجل بها</h2><div className="mt-4 space-y-3">{courseEnrollments.map((enrollment) => <article key={enrollment.id} className="rounded-xl bg-surface-muted p-4"><p className="font-medium">{enrollment.courseTitle || 'الكورس غير متاح'}</p><p className="mt-1 text-sm text-ink-500">تاريخ الاشتراك: {date(enrollment.purchasedAt)} · ينتهي: {date(enrollment.expiresAt)}</p></article>)}{courseEnrollments.length === 0 && <p className="text-ink-500">لا توجد كورسات مسجل بها.</p>}</div></section>
    <section className="rounded-2xl bg-surface-default p-6 shadow-card"><h2 className="text-lg font-bold">درجات الطالب</h2>{gradesLoading ? <p className="mt-4 text-ink-500">جارٍ تحميل الدرجات...</p> : gradesError ? <p role="alert" className="mt-4 text-danger-DEFAULT">{gradesError}</p> : <div className="mt-4 space-y-3">{grades.map((item) => <article key={item.id} className="flex flex-col gap-2 rounded-xl bg-surface-muted p-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-medium text-ink-900">{item.title}</p><p className="mt-1 text-sm text-ink-500">{item.category} · {date(item.date)}</p></div><p className="shrink-0 text-sm font-semibold text-ink-700">{item.grade}</p></article>)}{grades.length === 0 && <p className="text-ink-500">لا توجد درجات مسجلة لهذا الطالب حتى الآن.</p>}</div>}</section>
    {resetModalOpen && <ConfirmModal title="تغيير كلمة مرور الطالب" confirmLabel="تغيير كلمة المرور" cancelLabel="إلغاء" busy={resettingPassword} onConfirm={resetStudentPassword} onCancel={() => { if (!resettingPassword) setResetModalOpen(false); }} description={<div className="space-y-3"><label htmlFor="student-new-password" className="block text-sm font-medium text-ink-700">كلمة المرور الجديدة</label><PasswordInput id="student-new-password" value={newPassword} onChange={(event) => { setNewPassword(event.target.value); setResetPasswordError(''); }} autoComplete="new-password" error={resetPasswordError} /><p className="text-xs text-ink-500">12 حرفًا على الأقل، وتحتوي على حروف وأرقام.</p></div>} />}
  </div>;
}

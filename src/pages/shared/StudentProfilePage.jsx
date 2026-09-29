export const route = {
  path: '/:instructorId/profiles/students/:studentId',
  index: false,
  auth: 'required',
  roles: ['admin', 'assistant'],
  title: 'ملف الطالب',
};

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import { useAuth } from '../../hooks/useAuth';
import profileService from '../../services/profileService';

function errorMessage(error) {
  if (error?.status === 403) return 'ليس لديك صلاحية لعرض ملف هذا الطالب.';
  if (error?.status === 404) return 'الطالب غير موجود أو لم يعد متاحاً.';
  return error?.message || 'تعذر تحميل ملف الطالب. حاول مرة أخرى.';
}

function formatDate(value) {
  if (!value) return 'غير متاح';
  try {
    return new Date(value).toLocaleDateString('ar-EG');
  } catch {
    return 'غير متاح';
  }
}

export default function StudentProfilePage() {
  const { instructorId, studentId } = useParams();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    profileService.getStudentProfile(instructorId, studentId)
      .then((response) => {
        if (active) setProfile(response?.data?.data || null);
      })
      .catch((requestError) => {
        if (active) setError(errorMessage(requestError));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [instructorId, studentId]);

  if (loading) return <div className="rounded-2xl bg-surface-default p-6 text-center text-ink-500 shadow-card">جارٍ تحميل ملف الطالب...</div>;
  if (error) return <div role="alert" className="rounded-2xl bg-danger-soft p-6 text-center text-danger-DEFAULT">{error}</div>;
  if (!profile?.student) return <div role="alert" className="rounded-2xl bg-danger-soft p-6 text-center text-danger-DEFAULT">تعذر العثور على بيانات الطالب.</div>;

  const isAdmin = user?.role === 'admin';
  const { student, assignments = [], quizSubmissions = [], videoProgress = [] } = profile;

  return (
    <div className="mx-auto max-w-4xl space-y-6" dir="rtl">
      <section className="rounded-[var(--radius-xl)] bg-navy-900 p-7 text-white shadow-panel">
        <div className="flex flex-wrap items-center gap-5">
          <Avatar avatarUrl={student.avatarUrl} name={student.name} size="lg" />
          <div className="flex-1">
            <p className="text-sm text-brand-200">ملف الطالب</p>
            <h1 className="mt-1 text-2xl font-extrabold">{student.name}</h1>
            <p className="mt-1 text-sm text-white/65">منضم منذ {formatDate(student.joinedAt)}</p>
            {isAdmin && <p className="mt-1 text-sm text-white/65">{student.email || 'لا يوجد بريد'} · {student.phone || 'لا يوجد هاتف'}</p>}
            <p className="mt-1 text-sm text-white/65">حالة ولي الأمر: {student.parentLinked ? 'مرتبط بالطالب' : 'غير مرتبط بالطالب'}</p>
          </div>
          <Badge variant="success">طالب</Badge>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-surface-muted p-4"><p className="text-xs text-ink-500">الواجبات</p><b className="mt-2 block text-xl text-ink-900">{assignments.length}</b></div>
        <div className="rounded-2xl bg-surface-muted p-4"><p className="text-xs text-ink-500">محاولات الاختبارات</p><b className="mt-2 block text-xl text-ink-900">{quizSubmissions.length}</b></div>
        <div className="rounded-2xl bg-surface-muted p-4"><p className="text-xs text-ink-500">تقدم الدروس</p><b className="mt-2 block text-xl text-ink-900">{videoProgress.length}</b></div>
      </section>

      <section className="rounded-[var(--radius-lg)] border border-surface-border bg-surface-default p-6 shadow-card">
        <h2 className="text-lg font-extrabold text-ink-900">ملخص تعليمي</h2>
        <div className="mt-4 space-y-3 text-sm text-ink-700">
          {assignments.slice(0, 5).map((assignment) => <div key={assignment._id} className="rounded-lg bg-surface-muted p-3">{assignment.title || 'واجب'} — {assignment.status || 'بانتظار المراجعة'}</div>)}
          {assignments.length === 0 && <p className="text-ink-500">لا توجد واجبات متاحة للعرض.</p>}
        </div>
      </section>
    </div>
  );
}

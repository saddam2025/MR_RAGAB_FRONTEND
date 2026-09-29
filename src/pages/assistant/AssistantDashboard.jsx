// src/pages/assistant/AssistantDashboard.jsx
export const route = {
  path: '/:instructorId/assistant/dashboard',
  index: false,
  auth: 'required',
  roles: ['assistant', 'admin', 'teacher'],
  title: 'لوحة المساعد'
};

import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
// FIX: real hook file is src/hooks/useAuth.js — there is no src/contexts/AuthContext.jsx.
// The context itself is defined/exported inside AuthProvider.jsx.
import { useAuth } from '../../hooks/useAuth';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Avatar from '../../components/ui/Avatar';
import api from '../../services/api';

const filters = [
  { id: 'all', label: 'عرض الكل' },
  { id: 'pending', label: 'بانتظار التصحيح' },
  { id: 'graded', label: 'تم التصحيح' },
  { id: 'resubmit', label: 'إعادة تسليم' },
];

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleString('ar-EG', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  } catch {
    return iso;
  }
}

export default function AssistantDashboard() {
  const { instructorId } = useParams();
  const { user } = useAuth() || {};
  const role = user?.role || null;
  const permissions = Array.isArray(user?.permissions) ? user.permissions : [];
  const canGrade = role === 'admin' || permissions.includes('can_grade_exams');
  const [assignments, setAssignments] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!canGrade) return undefined;
    let active = true;
    setLoading(true);
    setError('');
    api.get(`/instructors/${instructorId}/assignments`)
      .then((response) => { if (active) setAssignments(response?.data?.data || []); })
      .catch((requestError) => { if (active) setError(requestError?.message || 'تعذر تحميل واجبات الطلاب.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [canGrade, instructorId]);

  const stats = useMemo(() => {
    const pending = assignments.filter((a) => a.status === 'pending').length;
    const graded = assignments.filter((a) => a.status === 'graded').length;
    const resubmit = assignments.filter((a) => a.status === 'resubmit').length;
    return { pending, graded, resubmit };
  }, [assignments]);
  const visibleAssignments = activeFilter === 'all' ? assignments : assignments.filter((item) => item.status === activeFilter);

  return (
    <div className="min-h-screen bg-surface-canvas text-ink-900" dir="rtl">
      <div className="container mx-auto px-4 py-6">
        <header className="mb-6">
          <div className="flex items-center justify-between gap-4">
            <div className="text-right">
              <h1 className="text-2xl font-semibold">مرحباً {user?.name || 'المساعد'}</h1>
              <p className="text-sm text-ink-500 mt-1">لوحة تصحيح الواجبات</p>
            </div>
            <div>
              <Avatar name={user?.name || 'المساعد'} src={user?.avatarUrl || user?.avatar} size="md" />
            </div>
          </div>
        </header>

        {/* Permission guard — assistants without can_grade_exams (and non-admins)
            never see the grading queue at all, just this disabled-state card. */}
        {!canGrade ? (
          <div className="rounded-2xl bg-surface-muted p-8 text-center">
            <div className="mb-4">
              <svg className="mx-auto w-12 h-12 text-ink-500" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M12 2v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M6 8v10a2 2 0 002 2h8a2 2 0 002-2V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <rect x="8" y="10" width="8" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </div>
            <div className="text-lg font-semibold text-ink-900">ليس لديك صلاحية تصحيح الواجبات</div>
            <div className="mt-2 text-sm text-ink-500">تواصل مع المدرس لطلب تفعيل صلاحية تصحيح الواجبات.</div>
          </div>
        ) : (
          <>
            {/* Summary cards */}
            <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="rounded-2xl bg-surface-default shadow-card p-4">
                <p className="text-xs text-ink-500">الواجبات المعلقة</p>
                <p className="mt-2 text-2xl font-semibold text-ink-900">{stats.pending}</p>
              </div>
              <div className="rounded-2xl bg-surface-default shadow-card p-4">
                <p className="text-xs text-ink-500">تم تصحيحها</p>
                <p className="mt-2 text-2xl font-semibold text-ink-900">{stats.graded}</p>
              </div>
              <div className="rounded-2xl bg-surface-default shadow-card p-4">
                <p className="text-xs text-ink-500">تحتاج إعادة تسليم</p>
                <p className="mt-2 text-2xl font-semibold text-ink-900">{stats.resubmit}</p>
              </div>
            </section>

            {/* Assignments list */}
            <section>
              <h2 className="mb-4 text-lg font-semibold text-ink-900">قائمة الواجبات</h2>
              <div className="mb-4 flex flex-wrap gap-2" role="tablist" aria-label="تصفية الواجبات">
                {filters.map((filter) => <Button key={filter.id} type="button" size="sm" variant={activeFilter === filter.id ? 'ghost' : 'subtle'} onClick={() => setActiveFilter(filter.id)} aria-pressed={activeFilter === filter.id}>{filter.label}</Button>)}
              </div>
              {error && <div role="alert" className="mb-4 rounded-xl bg-danger-soft p-3 text-sm text-danger-DEFAULT">{error}</div>}
              {loading && <p className="text-sm text-ink-500">جارٍ تحميل الواجبات...</p>}
              <div className="space-y-3">
                {!loading && !error && visibleAssignments.length === 0 && <div className="rounded-2xl bg-surface-default p-6 text-sm text-ink-500 shadow-card">لا توجد واجبات مطابقة لهذا العرض.</div>}
                {visibleAssignments.map((a) => (
                  <div key={a._id} className="rounded-2xl bg-surface-default shadow-card p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col">
                        <div className="text-sm font-medium text-ink-900">{a.studentId?.name || 'طالب'}</div>
                        <div className="text-xs text-ink-500">{a.courseId?.title_ar || a.courseId?.title_en || 'واجب المحاضرة'}</div>
                        <div className="text-xs text-ink-500 mt-1">{formatDate(a.submittedAt)}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div>
                        {a.status === 'pending' && <Badge className="text-xs">بانتظار التصحيح</Badge>}
                        {a.status === 'graded' && <Badge variant="success" className="text-xs">تم التصحيح</Badge>}
                        {a.status === 'resubmit' && <Badge variant="danger" className="text-xs">إعادة تسليم</Badge>}
                      </div>

                      {typeof a.grade !== 'undefined' && (
                        <div className="text-sm text-ink-700">الدرجة: <span className="font-semibold">{a.grade}</span></div>
                      )}

                      {a.status === 'pending' ? (
                        <Link to={`/${instructorId}/assistant/grade/${a._id}`}>
                          <Button variant="primary" size="sm">تصحيح</Button>
                        </Link>
                      ) : (
                        <Link to={`/${instructorId}/assistant/grade/${a._id}?view=1`}>
                          <Button variant="ghost" size="sm">عرض</Button>
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}

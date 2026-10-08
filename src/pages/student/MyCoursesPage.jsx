export const route = { path: '/:instructorId/my-courses', index: false, auth: 'student', title: 'كورساتي' };

import React from 'react';
import { Link, useParams } from 'react-router-dom';
import MyCourseCard from '../../components/common/MyCourseCard';
import useEnrolledCourses from '../../hooks/useEnrolledCourses';

export default function MyCoursesPage() {
  const { instructorId } = useParams();
  const { courses, tenant, loading, error } = useEnrolledCourses(instructorId);

  return (
    <main dir="rtl" className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div><p className="text-sm font-semibold text-brand-600">تابع تعلّمك</p><h1 className="mt-1 text-2xl font-extrabold text-ink-900">كورساتي</h1></div>
        <Link to={`/${instructorId}/catalog`} className="rounded-xl border border-surface-border px-4 py-2 text-sm font-semibold text-ink-700 transition hover:border-brand-400">استكشف الكورسات</Link>
      </header>
      {loading && <div className="rounded-2xl bg-surface-default p-8 text-center text-sm text-ink-500">جارٍ تحميل كورساتي...</div>}
      {!loading && error && <div role="alert" className="rounded-2xl bg-danger-soft p-6 text-center text-sm text-danger-DEFAULT">{error}</div>}
      {!loading && !error && courses.length === 0 && <div className="rounded-2xl bg-surface-default p-8 text-center text-sm text-ink-500">لا توجد كورسات متاحة في قائمتك حاليًا.</div>}
      {!loading && !error && courses.length > 0 && <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{courses.map((enrollment) => <MyCourseCard key={enrollment.course._id} enrollment={enrollment} tenant={tenant} instructorId={instructorId} />)}</div>}
    </main>
  );
}

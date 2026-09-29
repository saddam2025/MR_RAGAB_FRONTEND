export const route = {
  path: '/:instructorId/parent/courses',
  index: false,
  auth: 'required',
  roles: ['parent'],
  title: 'كورسات الابن'
};

import React, { useEffect, useState } from 'react';
import api from '../../services/api';

export default function ChildCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    api.get('/parents/me/child/courses')
      .then((response) => { if (active) setCourses(response?.data?.data || []); })
      .catch((err) => { if (active) setError(err?.message || 'تعذر تحميل كورسات الابن.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  if (loading) return <div dir="rtl" className="p-6 text-ink-600">جارٍ تحميل الكورسات...</div>;
  return <div dir="rtl" className="mx-auto max-w-5xl space-y-6">
    <header><h1 className="text-2xl font-bold text-ink-900">كورسات الابن</h1><p className="mt-1 text-sm text-ink-500">الكورسات والمحاضرات التي يملك الطالب صلاحية الوصول إليها.</p></header>
    {error && <p role="alert" className="rounded-xl bg-danger-soft p-4 text-sm text-danger-DEFAULT">{error}</p>}
    {!error && <section className="grid gap-4 sm:grid-cols-2">{courses.map((course) => <article key={course.id} className="rounded-2xl bg-surface-default p-5 shadow-card"><h2 className="font-bold text-ink-900">{course.title || 'عنوان الكورس غير متاح'}</h2><p className="mt-2 text-sm text-ink-500">{course.lectureCount} محاضرة منشورة</p><p className="mt-1 text-sm text-ink-600">{course.fullAccess ? 'صلاحية كاملة للكورس' : `صلاحية ${course.partialLectureCount} محاضرة`}</p></article>)}{courses.length === 0 && <p className="rounded-2xl bg-surface-default p-6 text-center text-ink-500 sm:col-span-2">لا توجد كورسات متاحة للطالب حالياً.</p>}</section>}
  </div>;
}

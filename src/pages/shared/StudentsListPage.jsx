export const route = {
  path: '/:instructorId/students',
  index: false,
  auth: 'required',
  roles: ['admin', 'assistant'],
  title: 'الطلاب'
};

import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Avatar from '../../components/ui/Avatar';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import api from '../../services/api';
import { stageLabel } from '../../constants/stages';

const PAGE_SIZE = 20;

export default function StudentsListPage() {
  const { instructorId } = useParams();
  const [students, setStudents] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    api.get(`/instructors/${instructorId}/students`, { params: { page, limit: PAGE_SIZE, search: search || undefined } })
      .then((response) => {
        if (!active) return;
        setStudents(response?.data?.data || []);
        setPagination(response?.data?.pagination || null);
      })
      .catch((requestError) => { if (active) setError(requestError?.message || 'تعذر تحميل الطلاب.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [instructorId, page, search]);

  const submitSearch = (event) => {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };
  const totalPages = Math.max(1, pagination?.totalPages || 1);

  return <div dir="rtl" className="mx-auto max-w-5xl space-y-6">
    <header><h1 className="text-2xl font-bold text-ink-900">الطلاب</h1><p className="mt-1 text-sm text-ink-500">كل الطلاب المسجلين لدى المدرس الحالي.</p></header>
    <form onSubmit={submitSearch} className="flex gap-3"><Input value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="ابحث بالاسم" dir="rtl" className="flex-1" /><Button type="submit">بحث</Button></form>
    {error && <p role="alert" className="rounded-xl bg-danger-soft p-4 text-danger-DEFAULT">{error}</p>}
    {loading ? <div className="rounded-2xl bg-surface-default p-6 text-center text-ink-500 shadow-card">جارٍ تحميل الطلاب...</div> : !error && <section className="overflow-hidden rounded-2xl bg-surface-default shadow-card"><div className="divide-y divide-surface-border">{students.map((student) => <Link key={student._id} to={`/${instructorId}/students/${student._id}`} className="flex items-center gap-4 p-4 transition hover:bg-surface-muted"><Avatar src={student.avatarUrl} name={student.name} size="md" /><div className="min-w-0 flex-1"><h2 className="font-semibold text-ink-900">{student.name}</h2><p className="truncate text-sm text-ink-500">{student.email || 'لا يوجد بريد إلكتروني'}</p></div><span className="text-sm text-ink-500">{student.stage ? stageLabel(student.stage) : 'المرحلة غير متاحة'}</span></Link>)}{students.length === 0 && <p className="p-8 text-center text-ink-500">لا يوجد طلاب مطابقون.</p>}</div></section>}
    {!error && pagination && <div className="flex items-center justify-center gap-4"><Button variant="subtle" size="sm" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}>الأحدث</Button><span className="text-sm text-ink-600">صفحة {page} من {totalPages}</span><Button variant="subtle" size="sm" disabled={page >= totalPages} onClick={() => setPage((current) => current + 1)}>الأقدم</Button></div>}
  </div>;
}

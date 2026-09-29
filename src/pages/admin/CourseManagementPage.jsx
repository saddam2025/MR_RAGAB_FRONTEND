// src/pages/admin/CourseManagementPage.jsx
export const route = {
  path: '/:instructorId/admin/courses',
  index: false,
  auth: 'required',
  roles: ['admin', 'teacher', 'assistant'],
  title: 'إدارة الدورات'
};

import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import courseService from '../../services/courseService';
import { STAGES } from '../../constants/stages';
import { resolveApiAssetUrl } from '../../services/api';

function formatPrice(n) {
  return `${n.toLocaleString('ar-EG')} ج.م`;
}

export default function CourseManagementPage() {
  const { instructorId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState(() => searchParams.get('search') || '');
  const [stageFilter, setStageFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [confirmingDeleteId, setConfirmingDeleteId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [visibleCount, setVisibleCount] = useState(6);

  const loadCourses = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await courseService.list(instructorId);
      setCourses(response.data.data || []);
    } catch (requestError) {
      setError(requestError.message || 'تعذر تحميل الدورات.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadCourses(); }, [instructorId]);
  useEffect(() => { setSearch(searchParams.get('search') || ''); }, [searchParams]);
  useEffect(() => { setVisibleCount(6); }, [search]);

  const filteredCourses = useMemo(() => {
    const q = search.trim().toLowerCase();
    return courses.filter((c) => {
      if (stageFilter && c.stage !== stageFilter) return false;
      if (categoryFilter && c.categoryId?.name !== categoryFilter) return false;
      if (!q) return true;
      return [c.title_ar, c.title_en, c.stage, c.categoryId?.name]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q));
    });
  }, [courses, search, stageFilter, categoryFilter]);
  const categories = useMemo(() => [...new Set(courses.map((course) => course.categoryId?.name).filter(Boolean))], [courses]);
  const visibleCourses = filteredCourses.slice(0, visibleCount);

  const handleTogglePublish = async (course) => {
    try {
      await courseService.update(instructorId, course._id, { isPublished: !course.isPublished });
      await loadCourses();
    } catch (requestError) {
      setError(requestError.message || 'تعذر تحديث حالة النشر.');
    }
  };

  const handleDelete = async (id) => {
    try {
      await courseService.remove(instructorId, id);
      setConfirmingDeleteId(null);
      await loadCourses();
    } catch (requestError) {
      setError(requestError.message || 'تعذر حذف الدورة.');
    }
  };

  return (
    <div dir="rtl" className="space-y-8">
      {/* Page header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink-900">إدارة الكورسات</h1>
          <p className="text-sm text-ink-500 mt-2 leading-relaxed">
            إدارة وتحديث جميع الدورات التعليمية المتاحة على المنصة.
          </p>
        </div>
        <Button variant="primary" onClick={() => navigate(`/${instructorId}/admin/courses/edit/new`)}>
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          دورة جديدة
        </Button>
      </div>
      {error && <div role="alert" className="rounded-xl bg-danger-soft p-4 text-sm text-danger-DEFAULT">{error}</div>}

      {/* Toolbar: sort / filter / search */}
      <div className="bg-surface-default rounded-2xl shadow-card p-4 flex items-center gap-3 flex-wrap">
        <Button variant="subtle" size="sm">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
            <path d="M3 6h18M6 12h12M10 18h4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          </svg>
          ترتيب
        </Button>
        <Button variant="subtle" size="sm">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
            <path d="M4 5h16l-6 8v5l-4 2v-7L4 5z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          تصفية
        </Button>
        <div className="relative flex-1 min-w-[220px]">
          <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-ink-400">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.7" />
              <path d="M20 20l-3-3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            </svg>
          </span>
          <Input
            className="pr-12"
            placeholder="البحث عن كورس بواسطة العنوان، المرحلة، أو التصنيف..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select aria-label="المرحلة الدراسية" className="input w-auto min-w-[170px]" value={stageFilter} onChange={(e) => setStageFilter(e.target.value)}>
          <option value="">المرحلة الدراسية</option>
          {STAGES.map((stage) => <option key={stage.id} value={stage.id}>{stage.label}</option>)}
        </select>
        <select aria-label="التصنيف" className="input w-auto min-w-[150px]" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          <option value="">التصنيف</option>
          {categories.map((category) => <option key={category} value={category}>{category}</option>)}
        </select>
      </div>

      <section aria-label="قائمة الكورسات" className="space-y-5">
        {!loading && filteredCourses.length === 0 && <div className="rounded-2xl bg-surface-default p-12 text-center text-ink-500 shadow-card">لا توجد دورات مطابقة للبحث</div>}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visibleCourses.map((course) => (
            <article key={course._id} className="group overflow-hidden rounded-3xl border border-surface-border bg-surface-default shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-soft">
              <div className="relative aspect-[16/9] overflow-hidden bg-surface-muted">
                {course.thumbnailUrl ? <img src={resolveApiAssetUrl(course.thumbnailUrl)} alt={course.title_ar || course.title_en} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /> : <div className="grid h-full place-items-center text-4xl text-brand-500" aria-label="لا توجد صورة للكورس">📚</div>}
                <div className="absolute inset-0 bg-gradient-to-t from-navy-900/60 via-transparent to-transparent" />
                <div className="absolute left-3 top-3 flex gap-1">
                  <Button variant="ghost" size="sm" aria-label="تعديل" onClick={() => navigate(`/${instructorId}/admin/courses/edit/${course._id}`)}><svg className="h-4 w-4" viewBox="0 0 24 24" fill="none"><path d="M4 20h4l10-10-4-4L4 16v4z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /></svg></Button>
                  <Button variant="ghost" size="sm" className="text-danger-DEFAULT" aria-label="حذف" onClick={() => setConfirmingDeleteId(course._id)}><svg className="h-4 w-4" viewBox="0 0 24 24" fill="none"><path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg></Button>
                </div>
              </div>
              <div className="space-y-4 p-5">
                <h2 className="min-h-14 text-lg font-bold leading-7 text-ink-900 line-clamp-2">{course.title_ar || course.title_en}</h2>
                <div className="flex items-center justify-between border-y border-surface-border py-3"><span className="font-bold text-ink-900">{formatPrice(Number(course.price) || 0)}</span><div className="flex items-center gap-2"><button type="button" onClick={() => handleTogglePublish(course)} role="switch" aria-checked={course.isPublished} aria-label={course.isPublished ? 'إلغاء نشر الكورس' : 'نشر الكورس'} className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border transition-colors ${course.isPublished ? 'border-success-600 bg-success-DEFAULT' : 'border-surface-border bg-surface-muted'}`}><span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-md ring-1 ring-black/10 transition-all ${course.isPublished ? 'start-6' : 'start-1'}`} /></button><Badge variant={course.isPublished ? 'success' : 'neutral'}>{course.isPublished ? 'منشورة' : 'مسودة'}</Badge></div></div>
                {confirmingDeleteId === course._id && <div className="flex items-center gap-2 rounded-xl bg-danger-DEFAULT/8 p-3"><span className="text-xs font-medium text-danger-DEFAULT">تأكيد الحذف؟</span><Button variant="primary" size="sm" onClick={() => handleDelete(course._id)}>نعم</Button><Button variant="ghost" size="sm" onClick={() => setConfirmingDeleteId(null)}>إلغاء</Button></div>}
              </div>
            </article>
          ))}
        </div>
        {visibleCount < filteredCourses.length && <div className="flex justify-center"><Button variant="subtle" onClick={() => setVisibleCount((count) => count + 6)}>عرض المزيد</Button></div>}
        <p className="text-center text-xs text-ink-500">عرض {visibleCourses.length} من {filteredCourses.length} كورس</p>
      </section>
    </div>
  );
}

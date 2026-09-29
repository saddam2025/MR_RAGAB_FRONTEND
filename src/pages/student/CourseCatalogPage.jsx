// src/pages/student/CourseCatalogPage.jsx
export const route = {
  path: ['/:instructorId/catalog', '/:instructorId/stages/:stageId/courses'],
  index: false,
  auth: null,
  title: 'الدورات',
};

import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import CourseCard from '../../components/common/CourseCard';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import instructorService from '../../services/instructorService';
import standaloneExamService from '../../services/standaloneExamService';
import { useAuth } from '../../hooks/useAuth';
import { STAGES } from '../../constants/stages';

export default function CourseCatalogPage() {
  const { instructorId, stageId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [selectedStage, setSelectedStage] = useState(stageId || '');
  const [activeCategory, setActiveCategory] = useState(null);
  const [courses, setCourses] = useState([]);
  const [exams, setExams] = useState([]);
  const [platformLogoUrl, setPlatformLogoUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth() || {};

  useEffect(() => setSearch(searchParams.get('search') || ''), [searchParams]);

  useEffect(() => {
    let active = true;
    setPlatformLogoUrl('');
    instructorService.get(instructorId)
      .then((response) => { if (active) setPlatformLogoUrl(response.data?.logoUrl || ''); })
      .catch(() => { if (active) setPlatformLogoUrl(''); });
    return () => { active = false; };
  }, [instructorId]);

  // A stage supplied by the stage-specific route is authoritative when the
  // page first opens. The general catalog starts with all stages selected.
  useEffect(() => {
    setSelectedStage(stageId || '');
    setActiveCategory(null);
  }, [stageId]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    instructorService.getCourses(instructorId, { stage: selectedStage, category: activeCategory })
      .then((response) => { if (active) setCourses(response.data); })
      .catch((requestError) => { if (active) setError(requestError.message || 'تعذر تحميل الدورات.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [instructorId, selectedStage, activeCategory]);

  const handleStageChange = (event) => {
    setSelectedStage(event.target.value);
    // Categories are stage-specific in the backend. Never retain a category
    // selected under a different stage.
    setActiveCategory(null);
  };

  useEffect(() => {
    let active = true;
    if (user?.role !== 'student') { setExams([]); return () => { active = false; }; }
    standaloneExamService.getAvailable()
      .then((response) => { if (active) setExams(response.data?.data || []); })
      .catch(() => { if (active) setExams([]); });
    return () => { active = false; };
  }, [user?.role]);

  const stageCourses = useMemo(() => {
    return courses;
  }, [courses]);

  const categories = useMemo(
    () => [...new Set(stageCourses.map((c) => c.category))],
    [stageCourses]
  );

  const filteredCourses = useMemo(() => {
    return stageCourses.filter((c) => {
      const matchesSearch = c.title.toLowerCase().includes(search.trim().toLowerCase());
      return matchesSearch;
    });
  }, [stageCourses, search]);

  return (
    <div dir="rtl" className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-ink-900">الدورات المتاحة</h1>
        <p className="text-sm text-ink-500 mt-1">تصفح الدورات الخاصة بهذه المرحلة الدراسية</p>
      </div>

      <Input
        placeholder="ابحث عن دورة..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div>
        <label htmlFor="course-stage-filter" className="mb-2 block text-sm font-medium text-ink-700">المرحلة الدراسية</label>
        <select id="course-stage-filter" value={selectedStage} onChange={handleStageChange} className="input w-full">
          <option value="">كل المراحل الدراسية</option>
          {STAGES.map((stage) => <option key={stage.id} value={stage.id}>{stage.label}</option>)}
        </select>
      </div>
      {loading && <div className="text-sm text-ink-500">جارٍ تحميل الدورات...</div>}
      {error && <div role="alert" className="text-sm text-danger-DEFAULT">{error}</div>}

      {categories.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <button type="button" onClick={() => setActiveCategory(null)}>
            <Badge variant={!activeCategory ? 'brand' : 'neutral'} className="cursor-pointer">
              الكل
            </Badge>
          </button>
          {categories.map((cat) => (
            <button key={cat} type="button" onClick={() => setActiveCategory(cat)}>
              <Badge variant={activeCategory === cat ? 'brand' : 'neutral'} className="cursor-pointer">
                {cat}
              </Badge>
            </button>
          ))}
        </div>
      )}

      {!loading && filteredCourses.length === 0 && exams.length === 0 ? (
        <div className="bg-surface-muted rounded-2xl p-10 text-center text-ink-500">
          لا توجد دورات مطابقة
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCourses.map((course) => (
        <CourseCard
          key={course.id}
          course={course}
          platformLogoUrl={platformLogoUrl}
          openLabel={course.owned ? 'ادخل الكورس' : 'عرض التفاصيل'}
          singleAction={course.owned}
          onOpen={() => navigate(`/${instructorId}/courses/${course.id}`)}
          onEnroll={() => navigate(`/${instructorId}/checkout/${course.id}`)}
          status={course.hasPartialLectureAccess ? { label: `لديك وصول إلى ${course.partialLectureCount} محاضرة`, variant: 'info' } : null}
        />
          ))}
          {exams.map((exam) => (
            <CourseCard
              key={`exam-${exam._id || exam.id}`}
              course={{ ...exam, id: exam._id || exam.id, level: 'امتحان' }}
              hidePrice
              showInstructor={false}
              meta={`${exam.durationMinutes} دقيقة`}
              openLabel="تفاصيل الامتحان"
              enrollLabel="ابدأ الامتحان الآن"
              openDisabled
              status={{ label: 'امتحان مستقل', variant: 'info' }}
              onEnroll={() => navigate(`/${instructorId}/exams/${exam._id || exam.id}/take`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

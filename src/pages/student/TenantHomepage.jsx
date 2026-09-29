export const route = {
  path: '/:instructorId',
  index: true,
  auth: null,
  title: 'الصفحة الرئيسية'
};

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import CourseCard from '../../components/common/CourseCard.jsx';
import Button from '../../components/ui/Button';
import useTenantData from '../../hooks/useTenantData.js';
import { useAuth } from '../../hooks/useAuth';
import instructorService from '../../services/instructorService';
import standaloneExamService from '../../services/standaloneExamService';
import { egyptianWhatsappUrl } from '../../utils/phone';

export default function TenantHomepage() {
  const { instructorId } = useParams();
  const navigate = useNavigate();
  const { instructorProfile, catalogCourses, loading, error } = useTenantData(instructorId);
  const { user } = useAuth() || {};
  const [exams, setExams] = useState([]);
  const [featuredLectures, setFeaturedLectures] = useState([]);
  const suggestedCourses = catalogCourses.filter((course) => course.isPublished).slice(0, 6);

  useEffect(() => {
    let active = true;
    instructorService.getFeaturedLectures(instructorId)
      .then((response) => { if (active) setFeaturedLectures(response.data || []); })
      .catch(() => { if (active) setFeaturedLectures([]); });
    return () => { active = false; };
  }, [instructorId]);

  useEffect(() => {
    let active = true;
    if (user?.role !== 'student') { setExams([]); return () => { active = false; }; }
    standaloneExamService.getAvailable()
      .then((response) => { if (active) setExams(response.data?.data || []); })
      .catch(() => { if (active) setExams([]); });
    return () => { active = false; };
  }, [user?.role]);

  if (loading) {
    return (
      <div className="space-y-10">
        <div className="rounded-[var(--radius-xl)] bg-surface-muted p-8 sm:p-12 animate-pulse" style={{ minHeight: '240px' }} />
        <div className="space-y-4">
          <div className="h-12 rounded-2xl bg-surface-muted animate-pulse" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(3)].map((_, idx) => (
              <div key={idx} className="h-56 rounded-2xl bg-surface-muted animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !instructorProfile) {
    return (
      <div className="rounded-[var(--radius-xl)] bg-surface-muted p-8 sm:p-12 text-center text-ink-500">
        حدث خطأ أثناء تحميل الصفحة. يرجى إعادة المحاولة لاحقًا.
      </div>
    );
  }

  // Some existing tenants predate the stagesOffered setting. Keep their
  // homepage representative of the six standard school stages instead of
  // displaying a misleading zero.
  const stagesCount = instructorProfile.stagesOffered.length || 6;
  const supportHref = egyptianWhatsappUrl(instructorProfile.supportPhone || '201060369537');

  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-[var(--radius-xl)] bg-navy-900 shadow-panel">
        <div className="absolute -left-20 -top-24 h-72 w-72 rounded-full bg-brand-400/30 blur-3xl" />
        <div className="absolute -bottom-20 right-1/3 h-52 w-52 rounded-full bg-teal-DEFAULT/20 blur-3xl" />
        <div className="relative grid items-center gap-8 px-6 py-8 lg:grid-cols-[1.4fr_1fr] lg:px-10 lg:py-11">
          <div className="space-y-6">
            <div className="inline-flex w-fit items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold text-brand-100 ring-1 ring-white/15">
              ✦ منصة {instructorProfile.subject || instructorProfile.name}
            </div>

            <div className="space-y-4">
              <h1 className="max-w-3xl text-3xl font-display font-extrabold text-white sm:text-5xl">
                تعلّم مع {instructorProfile.name}
              </h1>
              <p className="max-w-2xl text-sm leading-7 text-white/75">
                {instructorProfile.bio || instructorProfile.tagline || 'اكتشف محتوى تعليميًا منظمًا يناسب احتياجاتك.'}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/10 p-4 text-center backdrop-blur-sm">
                <div className="text-sm text-white/65">الكورسات المتاحة</div>
                <div className="mt-2 text-xl font-bold text-white">{catalogCourses.length}</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/10 p-4 text-center backdrop-blur-sm">
                <div className="text-sm text-white/65">المراحل</div>
                <div className="mt-2 text-xl font-bold text-white">{stagesCount}</div>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button
                variant="primary"
                size="lg"
                className="min-w-[180px]"
                onClick={() => navigate(`/${instructorId}/catalog`)}
              >
                استعرض الكورسات
              </Button>
              <Button
                variant="ghost"
                size="lg"
                className="min-w-[180px] border-white/30 text-white hover:bg-white/10"
                onClick={() => { if (supportHref) window.open(supportHref, '_blank', 'noopener,noreferrer'); }}
              >
                تواصل مع الدعم
              </Button>
            </div>
          </div>

          <div className="rounded-[var(--radius-xl)] bg-white/10 p-3 ring-1 ring-white/15 backdrop-blur-sm">
            <div className="relative overflow-hidden rounded-[calc(var(--radius-xl)-8px)] bg-surface-default p-6">
              <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-brand-500/20 to-transparent" />
              <div className="relative flex flex-col items-center gap-4 text-center">
                <div className="h-40 w-40 overflow-hidden rounded-full border-4 border-surface-default bg-surface-muted">
                  {(instructorProfile.coverPhotoUrl || instructorProfile.avatar) ? <img src={instructorProfile.coverPhotoUrl || instructorProfile.avatar} alt={instructorProfile.name} className="h-full w-full object-cover" /> : <span className="grid h-full place-items-center text-5xl">📚</span>}
                </div>
                <div className="space-y-2">
                  <div className="text-xl font-semibold text-ink-900">{instructorProfile.name}</div>
                  <p className="text-sm text-ink-500">{instructorProfile.tagline}</p>
                </div>
              </div>
              {(instructorProfile.monthlyPrice != null || instructorProfile.perLecturePrice != null) && <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {instructorProfile.monthlyPrice != null &&
                <div className="rounded-3xl border border-surface-border bg-surface-muted p-4 text-center">
                  <div className="text-xs text-ink-500">سعر الاشتراك الشهري</div>
                  <div className="mt-2 text-lg font-semibold text-ink-900">{instructorProfile.monthlyPrice} ر.س</div>
                </div>}
                {instructorProfile.perLecturePrice != null &&
                <div className="rounded-3xl border border-surface-border bg-surface-muted p-4 text-center">
                  <div className="text-xs text-ink-500">سعر المحاضرة</div>
                  <div className="mt-2 text-lg font-semibold text-ink-900">{instructorProfile.perLecturePrice} ر.س</div>
                </div>}
              </div>}
            </div>
          </div>
        </div>
      </section>

      {suggestedCourses.length > 0 && <section className="rounded-[var(--radius-xl)] border border-surface-border bg-surface-default p-6 shadow-card">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2"><h2 className="font-display text-2xl font-semibold text-ink-900">كورسات مقترحة</h2><p className="text-sm text-ink-500">اختيارات مقترحة من أحدث كورسات المنصة.</p></div>
          <Button variant="subtle" size="md" onClick={() => navigate(`/${instructorId}/catalog`)}>عرض الكل</Button>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">{suggestedCourses.map((course) => <CourseCard key={course.id} course={course} openLabel={course.owned ? 'ادخل الكورس' : 'عرض التفاصيل'} enrollLabel="اشترك" singleAction={course.owned} onOpen={() => navigate(`/${instructorId}/courses/${course.id}`)} onEnroll={() => navigate(`/${instructorId}/checkout/${course.id}`)} status={course.hasPartialLectureAccess ? { label: `لديك وصول إلى ${course.partialLectureCount} محاضرة`, variant: 'info' } : null} />)}</div>
      </section>}

      {featuredLectures.length > 0 && <section className="rounded-[var(--radius-xl)] border border-surface-border bg-surface-default p-6 shadow-card">
        <div className="mb-6 space-y-2"><h2 className="font-display text-2xl font-semibold text-ink-900">محاضرات مقترحة</h2><p className="text-sm text-ink-500">محاضرات منشورة متاحة للشراء بشكل منفصل.</p></div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">{featuredLectures.map((lecture) => <CourseCard key={lecture.id} course={{ ...lecture, title: `${lecture.order}. ${lecture.title}`, level: 'محاضرة', levelVariant: 'info' }} showInstructor={false} meta={lecture.courseTitle ? `من دورة: ${lecture.courseTitle}` : 'محاضرة متاحة للشراء بشكل منفصل'} openLabel="عرض الكورس" enrollLabel="عرض المحاضرة" onOpen={() => navigate(`/${instructorId}/courses/${lecture.courseId}`)} onEnroll={() => navigate(`/${instructorId}/courses/${lecture.courseId}`)} />)}</div>
      </section>}

      <section className="rounded-[var(--radius-xl)] border border-surface-border bg-surface-default p-6 shadow-card">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <h2 className="font-display text-2xl font-semibold text-ink-900">الكورسات المتاحة</h2>
            <p className="text-sm text-ink-500">اختر من بين أحدث الدورات المصممة لتقوية مهاراتك الحسابية.</p>
          </div>
          <Button variant="subtle" size="md" onClick={() => navigate(`/${instructorId}/catalog`)}>
            عرض الكل
          </Button>
        </div>

        {catalogCourses.length === 0 && exams.length === 0 ? (
          <div className="rounded-2xl border border-surface-border bg-surface-muted p-10 text-center text-ink-500">
            لا توجد دورات منشورة بعد. تابعنا قريبًا للحصول على محتوى جديد.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {catalogCourses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                openLabel={course.owned ? 'ادخل الكورس' : 'عرض التفاصيل'}
                enrollLabel="اشترك"
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
      </section>
    </div>
  );
}

export const route = { path: '/', index: true, auth: null, title: 'ابدأ رحلتك' };

import React, { useContext, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { InstructorContext } from '../../contexts/InstructorContext';
import Button from '../../components/ui/Button';
import Footer from '../../components/common/Footer';
import CourseCard from '../../components/common/CourseCard';
import GeometricHero from '../../components/hero/GeometricHero';
import { landingAssets, landingFeatures } from '../../mocks/landingMockData';
import Navbar from '../../layouts/Navbar';
import instructorService from '../../services/instructorService';

const valuePoints = [
  ['محتوى مرتب', 'كل حاجة قدامك بشكل واضح عشان تركز في اللي يهمك.'],
  ['متابعة تفرق', 'شوف مستواك وتابع كل خطوة في رحلتك بسهولة.'],
  ['تعلّم يناسبك', 'اختار طريقتك وكمّل في الوقت اللي يناسبك.'],
];

export default function InstructorSelectorPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { instructors = [], loading, selectInstructor = () => {} } = useContext(InstructorContext) || {};
  const teachersRef = useRef(null);
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [featuredLectures, setFeaturedLectures] = useState([]);
  const scrollToTeachers = () => teachersRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  // Lets Footer.jsx (rendered on other routes too) navigate here and ask us
  // to scroll straight to the teachers section, e.g. `navigate('/', { state: { scrollTo: 'teachers-section' } })`.
  useEffect(() => {
    if (location.state?.scrollTo === 'teachers-section') {
      teachersRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [location.state]);

  useEffect(() => {
    let active = true;
    Promise.all([
      instructorService.getPublicFeaturedCourses(),
      instructorService.getPublicFeaturedLectures()
    ])
      .then(([coursesResponse, lecturesResponse]) => {
        if (!active) return;
        setFeaturedCourses(coursesResponse.data || []);
        setFeaturedLectures(lecturesResponse.data || []);
      })
      .catch(() => {
        if (!active) return;
        setFeaturedCourses([]);
        setFeaturedLectures([]);
      });
    return () => { active = false; };
  }, []);

  const handleSelect = (teacher) => {
    try {
      selectInstructor(teacher);
    } catch (error) {
      console.error('Failed to select instructor:', error);
      return;
    }
    navigate(`/${teacher.subdomain}`);
  };

  return (
    <div className="landing-page min-h-screen overflow-x-hidden bg-[#f5f9ff] text-[#102650]" dir="rtl">
      <div className="bg-[#0c254a] px-3 pb-14 sm:px-6 lg:px-10">
        <Navbar sticky />
        <section className="mx-auto grid max-w-7xl items-center gap-10 px-3 pb-6 pt-16 lg:grid-cols-2 lg:px-8 lg:pb-14 lg:pt-24">
          <div className="text-right">
            <span className="inline-flex rounded-full bg-white/10 px-4 py-2 text-sm font-bold text-[#b7e5ff]">تجربتك التعليمية من مكان واحد</span>
            <h1 className="mt-6 max-w-xl text-4xl font-extrabold leading-[1.28] text-white sm:text-5xl lg:text-6xl">اتعلّم بطريقتك <span className="text-[#9fe4ff]">ووصل لهدفك</span></h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-white/80 sm:text-lg">معانا هتلاقي المحتوى اللي محتاجه، وتقدر تتابع مستواك خطوة بخطوة من مكان واحد.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" onClick={() => navigate('/register')}>ابدأ دلوقتي</Button>
              <Button variant="ghost" size="lg" className="!bg-white/10 !text-white hover:!bg-white/20" onClick={scrollToTeachers}>شوف المحتوى</Button>
            </div>
          </div>
          <div className="relative rounded-[2rem] bg-white p-3 shadow-[0_25px_60px_rgba(0,0,0,.2)]">
            <img src={landingAssets.hero} alt="تجربة تعليمية منظمة" className="h-auto w-full rounded-[1.5rem] object-contain" />
            <div className="absolute -bottom-4 -right-3 rounded-2xl bg-[#43e7ad] px-4 py-3 text-sm font-extrabold text-[#102650] shadow-lg">تابع مستواك بسهولة</div>
          </div>
        </section>
      </div>

      <main>
        <section className="landing-light-section mx-auto max-w-7xl px-5 py-20 lg:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div className="rounded-[2rem] bg-white p-3 shadow-card">
              <img src={landingAssets.features} alt="مميزات المنصة" className="w-full rounded-[1.5rem] object-contain" />
            </div>
            <div className="text-right">
              <span className="text-sm font-extrabold text-[#1081f5]">التعلّم بشكل أبسط</span>
              <h2 className="mt-3 text-3xl font-extrabold leading-snug sm:text-4xl">كل اللي محتاجه عشان تطوّر مستواك في مكان واحد</h2>
              <p className="mt-5 max-w-xl text-base leading-8 text-[#526b8d]">محتوى واضح، أدوات تساعدك تتابع، وتجربة منظمة من أول خطوة لحد ما توصل لهدفك.</p>
              <div className="mt-7 grid gap-4 sm:grid-cols-3">
                {valuePoints.map(([title, text]) => (
                  <div key={title} className="rounded-2xl border border-[#dbeafb] bg-white p-4">
                    <h3 className="font-extrabold">{title}</h3>
                    <p className="mt-2 text-sm leading-6 text-[#607897]">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#1081f5] px-5 py-20 lg:px-8">
          <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-2">
            <div className="text-right text-white">
              <span className="text-sm font-extrabold text-[#9fe4ff]">ليه تختار منصتنا؟</span>
              <h2 className="mt-3 text-3xl font-extrabold leading-snug sm:text-4xl">عشان التعلّم يبقى أسهل وأوضح</h2>
              <div className="mt-7 space-y-4">
                {landingFeatures.slice(0, 3).map((feature) => (
                  <div key={feature.id} className="flex items-start gap-4 rounded-2xl bg-white/10 p-4">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#43e7ad] text-lg text-[#102650]">{feature.icon}</span>
                    <div>
                      <h3 className="font-extrabold">{feature.title}</h3>
                      <p className="mt-1 text-sm text-white/80">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-[2rem] bg-white p-3 shadow-xl">
              <img src={landingAssets.why} alt="مميزات تساعدك في التعلم" className="w-full rounded-[1.5rem] object-contain" />
            </div>
          </div>
        </section>

        <section className="landing-light-section mx-auto max-w-7xl px-5 py-20 lg:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div className="order-2 rounded-[2rem] bg-[#eaf5ff] p-3 lg:order-1">
              <img src={landingAssets.knowledge} alt="محتوى تعليمي متنوع" className="w-full rounded-[1.5rem] object-contain" />
            </div>
            <div className="order-1 text-right lg:order-2">
              <span className="text-sm font-extrabold text-[#1081f5]">محتوى يسهّل عليك</span>
              <h2 className="mt-3 text-3xl font-extrabold leading-snug sm:text-4xl">اكتشف كل المحتوى اللي مستنيك</h2>
              <p className="mt-5 text-base leading-8 text-[#526b8d]">اختار اللي يناسبك، وكمّل بطريقتك من غير تعقيد. كل حاجة متقسمة بشكل يساعدك تركز وتفهم.</p>
              <Button className="mt-7" onClick={scrollToTeachers}>اكتشف المحتوى</Button>
            </div>
          </div>
        </section>

        <section id="teachers-section" ref={teachersRef} className="landing-dark-section bg-[#102f5c] px-5 py-16 text-white lg:px-8 lg:py-20">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-2xl text-right">
              <span className="text-sm font-extrabold text-[#9fe4ff]">اختار اللي يناسبك</span>
              <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">تعلّم مع ناس فاهمة احتياجاتك</h2>
              <p className="mt-4 leading-8 text-white/75">شوف المحتوى المتاح واختار البداية اللي تناسب مستواك.</p>
            </div>
            <div className="mt-9 grid gap-8">
              {loading && <GeometricHero loading />}
              {!loading && instructors.length === 0 && <GeometricHero />}
              {instructors.map((teacher) => (
                <GeometricHero
                  key={teacher.subdomain}
                  personAlt={teacher.name}
                  instructorName={teacher.name}
                  subdomain={teacher.subdomain}
                  subject={teacher.subject}
                  location={teacher.location}
                  tagline={teacher.tagline}
                  onCtaClick={() => handleSelect(teacher)}
                />
              ))}
            </div>
          </div>
        </section>

        {featuredCourses.length > 0 && <section className="landing-light-section mx-auto max-w-7xl px-5 py-16 lg:px-8">
          <div className="rounded-[var(--radius-xl)] border border-surface-border bg-surface-default p-6 shadow-card">
            <div className="mb-6 space-y-2 text-right"><h2 className="font-display text-2xl font-semibold text-ink-900">كورسات مقترحة</h2><p className="text-sm text-ink-500">اختيارات من أحدث الكورسات المنشورة على منصات مدرسينا.</p></div>
            <div dir="rtl" className="flex gap-5 overflow-x-auto">{featuredCourses.map((course) => <div key={course.id} className="w-[360px] min-w-[320px] shrink-0"><CourseCard course={course} openLabel="عرض التفاصيل" enrollLabel="اشترك" onOpen={() => navigate(`/${course.subdomain}/courses/${course.id}`)} onEnroll={() => navigate(`/${course.subdomain}/checkout/${course.id}`)} /></div>)}</div>
          </div>
        </section>}

        <section className="landing-light-section mx-auto max-w-7xl px-5 py-20 lg:px-8">
          <div className="grid items-center gap-10 rounded-[2.25rem] bg-[#eaf5ff] p-7 lg:grid-cols-2 lg:p-12">
            <div className="text-right">
              <span className="text-sm font-extrabold text-[#1081f5]">تابع مستواك</span>
              <h2 className="mt-3 text-3xl font-extrabold leading-snug sm:text-4xl">كل خطوة بتقربك لهدفك</h2>
              <p className="mt-5 text-base leading-8 text-[#526b8d]">شوف تقدّمك بوضوح، واعرف أنت وصلت لفين وإيه الخطوة الجاية.</p>
            </div>
            <div className="rounded-[1.75rem] bg-white p-3">
              <img src={landingAssets.progress} alt="متابعة التقدم" className="w-full rounded-[1.25rem] object-contain" />
            </div>
          </div>
        </section>

        {featuredLectures.length > 0 && <section className="landing-light-section mx-auto max-w-7xl px-5 pb-16 lg:px-8">
          <div className="rounded-[var(--radius-xl)] border border-surface-border bg-surface-default p-6 shadow-card">
            <div className="mb-6 space-y-2 text-right"><h2 className="font-display text-2xl font-semibold text-ink-900">محاضرات مقترحة</h2><p className="text-sm text-ink-500">محاضرات منشورة متاحة للشراء بشكل منفصل.</p></div>
            <div dir="rtl" className="flex gap-5 overflow-x-auto">{featuredLectures.map((lecture) => <div key={lecture.id} className="w-[360px] min-w-[320px] shrink-0"><CourseCard course={{ ...lecture, title: `${lecture.order}. ${lecture.title}`, level: 'محاضرة', levelVariant: 'info' }} meta={lecture.courseTitle ? `من دورة: ${lecture.courseTitle}` : 'محاضرة متاحة للشراء بشكل منفصل'} openLabel="عرض الكورس" enrollLabel="عرض المحاضرة" onOpen={() => navigate(`/${lecture.subdomain}/courses/${lecture.courseId}`)} onEnroll={() => navigate(`/${lecture.subdomain}/courses/${lecture.courseId}`)} /></div>)}</div>
          </div>
        </section>}

        <section className="bg-[#1081f5] px-5 py-20 lg:px-8">
          <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-2">
            <div className="rounded-[2rem] bg-white p-3">
              <img src={landingAssets.platform} alt="تجربة تعليمية متكاملة" className="w-full rounded-[1.5rem] object-contain" />
            </div>
            <div className="text-right text-white">
              <h2 className="text-3xl font-extrabold leading-snug sm:text-4xl">ابدأ دلوقتي وخلي كل خطوة تقرّبك لهدفك</h2>
              <p className="mt-5 text-base leading-8 text-white/80">سجّل حسابك وابدأ تجربتك معانا في دقائق.</p>
              <Button className="mt-7" size="lg" onClick={() => navigate('/register')}>ابدأ رحلتك</Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

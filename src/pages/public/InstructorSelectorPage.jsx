export const route = { path: '/', index: true, auth: null, title: 'ابدأ رحلتك' };

import React, { useContext, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Users } from 'lucide-react';
import { InstructorContext } from '../../contexts/InstructorContext';
import Button from '../../components/ui/Button';
import Footer from '../../components/common/Footer';
import CourseCard from '../../components/common/CourseCard';
import GeometricHero from '../../components/hero/GeometricHero';
import AlMustasharIntroduction from '../../components/hero/AlMustasharIntroduction';
import { landingAssets, landingFeatures } from '../../mocks/landingMockData';
import Navbar from '../../layouts/Navbar';
import instructorService from '../../services/instructorService';
import Translator from '../../features/translator/Translator.jsx';

const valuePoints = [
  ['محتوى مرتب', 'كل حاجة قدامك بشكل واضح عشان تركز في اللي يهمك.'],
  ['متابعة تفرق', 'شوف مستواك وتابع كل خطوة في رحلتك بسهولة.'],
  ['تعلّم يناسبك', 'اختار طريقتك وكمّل في الوقت اللي يناسبك.'],
];

const ragabStages = [
  {
    id: 'grade-10',
    title: 'First Secondary',
    label: 'ثانوية عامة',
    image: '/assets/stages/first-secondary.jpeg',
    description: 'ابدأ تأسيسك في اللغة الإنجليزية وابنِ مهاراتك خطوة بخطوة خلال السنة.',
    topics: ['تأسيس القواعد والمفردات', 'تطوير القراءة والكتابة', 'تدريبات واختبارات دورية'],
  },
  {
    id: 'grade-11',
    title: 'Second Secondary',
    label: 'ثانوية عامة',
    image: '/assets/stages/second-secondary.jpeg',
    description: 'طوّر مستواك في اللغة واستعد لموضوعات ومهارات المرحلة المتقدمة.',
    topics: ['قواعد وتطبيقات متقدمة', 'مهارات القراءة والكتابة', 'تدريبات على أسلوب الامتحان'],
  },
  {
    id: 'grade-12',
    title: 'Third Secondary',
    label: 'ثانوية عامة',
    image: '/assets/stages/third-secondary.jpeg',
    description: 'استعداد كامل للامتحان: مراجعات مركزة، نماذج، وحل امتحانات السنين السابقة.',
    topics: ['مراجعات نهائية', 'حل نماذج الامتحانات', 'توقعات وأهم النقاط'],
  },
  {
    id: 'baccalaureate-2',
    title: 'Second Baccalaureate',
    label: 'بكالوريا',
    image: '/assets/stages/second-baccalaureate.jpeg',
    description: 'مراجعة منظمة وتدريب عملي على أسئلة البكالوريا ومهارات اللغة المطلوبة.',
    topics: ['مراجعة أهم موضوعات المنهج', 'حل نماذج البكالوريا', 'تدريب على أسئلة الامتحانات'],
  },
];

const ragabWhatsappGroups = [
  { title: 'الصف الأول الثانوي', url: 'https://chat.whatsapp.com/CVTAGolYyuS0lzuGur3FAP' },
  { title: 'الصف الثاني الثانوي عام', url: 'https://chat.whatsapp.com/CsyWqET6j686jgQgN9FDY0' },
  { title: 'الصف الثاني بكالوريا', url: 'https://chat.whatsapp.com/J704OEHi47yA6SKKMqjufn' },
  { title: 'الصف الثالث الثانوي', url: 'https://chat.whatsapp.com/F49VBaXN1wyCQQZJcslJZd' },
];

export default function InstructorSelectorPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { instructors = [], loading, selectInstructor = () => {} } = useContext(InstructorContext) || {};
  const ragabInstructor = instructors.find((teacher) => /ragab|رجب/i.test(`${teacher.name || ''} ${teacher.subdomain || ''}`));
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

  const handleStageSelect = (stage) => {
    if (!ragabInstructor) return;
    try {
      selectInstructor(ragabInstructor);
    } catch (error) {
      console.error('Failed to select instructor:', error);
      return;
    }
    navigate(`/${ragabInstructor.subdomain}/stages/${stage.id}/courses`);
  };

  return (
    <div className="landing-page min-h-screen overflow-x-hidden bg-[#f5f9ff] text-[#102650]" dir="rtl">
      <div className="bg-[#0c254a] px-3 pb-14 sm:px-6 lg:px-10">
        <Navbar sticky />
        <section className="mx-auto max-w-7xl px-3 pb-6 pt-10 lg:px-8 lg:pb-14 lg:pt-14">
          <AlMustasharIntroduction
            showActions
            onStart={() => navigate('/register')}
            onContent={scrollToTeachers}
          />
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

        {ragabInstructor && <section dir="rtl" className="landing-light-section mx-auto max-w-7xl px-5 py-14 lg:px-8" aria-labelledby="ragab-stages-title">
          <div className="mb-7 text-right">
            <span className="text-sm font-extrabold text-brand-500">ابدأ من مرحلتك</span>
            <h2 id="ragab-stages-title" className="mt-2 text-3xl font-extrabold text-ink-900">اختار صفك وشوف الكورسات المناسبة ليك</h2>
            <p className="mt-3 text-ink-600">محتوى متقسم حسب مرحلتك، من الشرح والتدريب لحد الاستعداد للامتحان.</p>
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            {ragabStages.map((stage) => <button
              key={stage.id}
              type="button"
              onClick={() => handleStageSelect(stage)}
              className="group overflow-hidden rounded-[2rem] border border-surface-border bg-surface-default text-right text-ink-900 shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              aria-label={`عرض كورسات ${stage.title}`}
            >
              <div className="relative aspect-[16/8] overflow-hidden bg-surface-muted">
                <img src={stage.image} alt={stage.label} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />
              </div>
              <div className="p-6 sm:p-7">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 dir="ltr" className="text-left text-2xl font-extrabold text-ink-900">{stage.title}</h3>
                  <span className="rounded-full bg-brand-50 px-3 py-1 text-sm font-bold text-brand-700">{stage.label}</span>
                </div>
                <p className="mt-3 min-h-12 leading-7 text-ink-600">{stage.description}</p>
                <ul className="mt-4 space-y-3 border-t border-surface-border pt-4 text-ink-800">
                  {stage.topics.map((topic) => <li key={topic} className="flex items-center gap-3">
                    <span aria-hidden="true" className="font-bold text-brand-500">✓</span>
                    <span>{topic}</span>
                  </li>)}
                </ul>
                <span className="mt-6 inline-flex items-center gap-2 font-extrabold text-brand-600 group-hover:text-brand-700">شوف الكورسات <span aria-hidden="true">←</span></span>
              </div>
            </button>)}
          </div>
        </section>}

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

        <section className="mx-auto max-w-7xl px-5 py-10 lg:px-8" aria-label="المترجم والقاموس الناطق">
          <Translator variant="compact" />
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

        {ragabInstructor && <section dir="rtl" className="landing-light-section px-5 py-12 lg:px-8 lg:py-[3.75rem]" aria-labelledby="ragab-whatsapp-title">
          <div className="mx-auto max-w-6xl">
            <div className="mb-7 text-right">
              <span className="inline-flex rounded-full bg-brand-50 px-3 py-1.5 text-xs font-bold text-brand-600">مجتمع المستشار</span>
              <h2 id="ragab-whatsapp-title" className="mt-4 text-2xl font-extrabold text-ink-900 sm:text-3xl">انضم إلى مجموعاتك الرسمية</h2>
              <p className="mt-2 text-sm text-ink-600">اختار صفك الدراسي للانضمام إلى جروب واتساب الرسمي.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {ragabWhatsappGroups.map((group, index) => <a
                key={group.url}
                href={group.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative min-h-[10.5rem] overflow-hidden rounded-[1.5rem] border border-surface-border bg-surface-default p-4 text-ink-900 shadow-card transition duration-300 hover:-translate-y-1 hover:border-brand-500 hover:shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              >
                <span aria-hidden="true" className="pointer-events-none absolute -left-2 top-2 text-6xl font-black leading-none text-brand-500/10">{String(index + 1).padStart(2, '0')}</span>
                <span className="relative grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-500"><Users size={19} strokeWidth={2.2} /></span>
                <h3 className="relative mt-3 text-base font-extrabold text-ink-900">{group.title}</h3>
                <span className="relative mt-1 inline-flex items-center gap-2 text-sm font-bold text-brand-600 group-hover:text-brand-700">انضم للجروب <span aria-hidden="true">←</span></span>
              </a>)}
            </div>
          </div>
        </section>}

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

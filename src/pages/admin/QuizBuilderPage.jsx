// src/pages/admin/QuizBuilderPage.jsx
export const route = {
  path: [
    '/:instructorId/admin/quiz-builder',
    '/:instructorId/admin/courses/:courseId/lectures/:lectureId/quizzes/manage'
  ],
  index: false,
  auth: 'required',
  roles: ['admin', 'assistant'],
  title: 'منشئ الاختبارات'
};

import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';
import courseService from '../../services/courseService';
import lectureService from '../../services/lectureService';
import QuestionBuilder from '../../components/admin/QuestionBuilder';

function makeEmptyQuestion() {
  return {
    id: `q-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    text: '',
    stemType: 'text',
    imageUrl: null,
    options: ['', '', '', ''],
    correctOptionIndex: 0,
    points: 1,
    explanation: ''
  };
}

export default function QuizBuilderPage() {
  const { instructorId, courseId, lectureId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth() || {};
  const lacksPermission = user?.role === 'assistant' && !user?.permissions?.includes('can_create_quizzes');

  const [quizId, setQuizId] = useState(null);
  const [courses, setCourses] = useState([]);
  const [lectures, setLectures] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState(courseId || searchParams.get('courseId') || '');
  const [selectedLectureId, setSelectedLectureId] = useState(lectureId || searchParams.get('lectureId') || '');
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingLectures, setLoadingLectures] = useState(false);
  const [title, setTitle] = useState('');
  const [passingScore, setPassingScore] = useState(50);
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(15);
  const [questions, setQuestions] = useState([makeEmptyQuestion()]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const [loadError, setLoadError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (lacksPermission) {
      navigate(`/${instructorId}/assistant/dashboard`, { replace: true });
      return undefined;
    }
    let active = true;
    async function loadCourses() {
      setLoading(true);
      setLoadError(null);
      try {
        const response = await courseService.list(instructorId);
        if (!active) return;
        setCourses(response.data.data || []);
      } catch (err) {
        if (active) setLoadError(err?.message || 'تعذر تحميل الكورسات.');
      } finally {
        if (active) { setLoading(false); setLoadingCourses(false); }
      }
    }
    loadCourses();
    return () => { active = false; };
  }, [instructorId, lacksPermission, navigate]);

  useEffect(() => {
    if (!selectedCourseId) { setLectures([]); setSelectedLectureId(''); return undefined; }
    let active = true;
    setLoadingLectures(true);
    lectureService.list(instructorId, selectedCourseId)
      .then((response) => { if (active) setLectures(response.data.data || []); })
      .catch((err) => { if (active) setLoadError(err?.message || 'تعذر تحميل محاضرات الكورس.'); })
      .finally(() => { if (active) setLoadingLectures(false); });
    return () => { active = false; };
  }, [instructorId, selectedCourseId]);

  useEffect(() => {
    if (!selectedCourseId || !selectedLectureId) { setQuizId(null); return undefined; }
    let active = true;
    setLoading(true);
    setLoadError(null);
    api.get(`/instructors/${instructorId}/courses/${selectedCourseId}/lectures/${selectedLectureId}/quiz`)
      .then((response) => {
        if (!active) return;
        const quiz = response.data.data;
        if (!quiz) { setQuizId(null); setTitle(''); setPassingScore(50); setTimeLimitMinutes(15); setQuestions([makeEmptyQuestion()]); return; }
        setQuizId(quiz._id);
        setTitle(quiz.title || '');
        setPassingScore(quiz.passingScore ?? 50);
        setTimeLimitMinutes(quiz.timeLimitMinutes ?? 15);
        setQuestions(quiz.questions.map((question) => ({ id: question._id || `q-${Date.now()}`, text: question.text || '', stemType: question.stemType || 'text', imageUrl: question.imageUrl || null, options: question.options, correctOptionIndex: question.correctOptionIndex, points: question.points, explanation: question.explanation || '' })));
      })
      .catch((err) => { if (active) setLoadError(err?.message || 'تعذر تحميل الاختبار.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [instructorId, selectedCourseId, selectedLectureId]);

  const updateQuestion = (qIndex, patch) => {
    setQuestions((prev) =>
      prev.map((q, idx) => (idx === qIndex ? { ...q, ...patch } : q))
    );
  };

  const updateOption = (qIndex, optIndex, value) => {
    setQuestions((prev) =>
      prev.map((q, idx) => {
        if (idx !== qIndex) return q;
        const nextOptions = [...q.options];
        nextOptions[optIndex] = value;
        return { ...q, options: nextOptions };
      })
    );
  };

  const addQuestion = () => {
    setQuestions((prev) => [...prev, makeEmptyQuestion()]);
  };

  const removeQuestion = (qIndex) => {
    setQuestions((prev) => prev.filter((_, idx) => idx !== qIndex));
  };

  const validate = () => {
    const nextErrors = {};
    if (!selectedCourseId) nextErrors.course = 'اختر الكورس أولاً';
    if (!selectedLectureId) nextErrors.lecture = 'اختر المحاضرة أولاً';
    if (!title.trim()) nextErrors.title = 'عنوان الاختبار مطلوب';
    if (!passingScore || passingScore < 1 || passingScore > 100) {
      nextErrors.passingScore = 'يجب أن تكون النسبة بين 1 و 100';
    }
    if (!timeLimitMinutes || timeLimitMinutes < 1) {
      nextErrors.timeLimitMinutes = 'مدة الاختبار غير صالحة';
    }
    if (questions.length === 0) nextErrors.questions = 'أضف سؤالاً واحداً على الأقل';

    questions.forEach((q, idx) => {
      if (q.stemType === 'image' ? !q.imageUrl : !q.text.trim()) nextErrors[`q-${idx}-text`] = q.stemType === 'image' ? 'ارفع صورة السؤال أولاً' : 'نص السؤال مطلوب';
      q.options.forEach((opt, optIdx) => {
        if (!opt.trim()) nextErrors[`q-${idx}-opt-${optIdx}`] = 'مطلوب';
      });
    });

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) {
      setShowSuccess(false);
      return;
    }

    const payload = {
      title,
      passingScore: Number(passingScore),
      timeLimitMinutes: Number(timeLimitMinutes),
      questions: questions.map((q) => ({
        text: q.text,
        stemType: q.stemType || 'text',
        imageUrl: q.stemType === 'image' ? q.imageUrl : null,
        options: q.options,
        correctOptionIndex: q.correctOptionIndex,
        points: Number(q.points) || 1,
        explanation: q.explanation
      }))
    };

    setSaving(true);
    setLoadError(null);
    try {
      const response = quizId
        ? await api.patch(`/quizzes/${quizId}`, payload)
        : await api.post(`/instructors/${instructorId}/courses/${selectedCourseId}/lectures/${selectedLectureId}/quiz`, payload);
      setQuizId(response.data.data._id);
      setShowSuccess(true);
      setTimeout(() => {
      navigate(`/${instructorId}/admin/courses`);
      }, 1200);
    } catch (err) {
      setLoadError(err?.message || 'تعذر حفظ الاختبار.');
    } finally {
      setSaving(false);
    }
  };

  if (lacksPermission || loadingCourses) return <div dir="rtl" className="max-w-3xl mx-auto p-6 text-ink-600">جارٍ تحميل منشئ الاختبارات...</div>;

  return (
    <div dir="rtl" className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-ink-900">منشئ الاختبارات</h1>
        <p className="text-sm text-ink-500 mt-1">إنشاء اختبار جديد للمحاضرة</p>
      </div>

      {showSuccess && (
        <div className="rounded-2xl bg-success-soft p-4 text-success-DEFAULT text-sm font-medium">
          تم حفظ الاختبار بنجاح، جارٍ التحويل...
        </div>
      )}
      {loadError && <div role="alert" className="rounded-2xl bg-danger-soft p-4 text-danger-DEFAULT text-sm">{loadError}</div>}

      <div className="bg-surface-default rounded-2xl shadow-card p-6 space-y-4">
        <h2 className="text-lg font-medium text-ink-900">ربط الاختبار</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="text-sm text-ink-700">الكورس
            <select className="input mt-1 w-full" value={selectedCourseId} disabled={Boolean(quizId)} onChange={(event) => { setSelectedCourseId(event.target.value); setSelectedLectureId(''); }}>
              <option value="">اختر الكورس</option>
              {courses.map((course) => <option key={course._id} value={course._id}>{course.title_ar || course.title_en}</option>)}
            </select>
            {errors.course && <p className="mt-1 text-xs text-danger-DEFAULT">{errors.course}</p>}
          </label>
          <label className="text-sm text-ink-700">المحاضرة
            <select className="input mt-1 w-full" value={selectedLectureId} disabled={!selectedCourseId || loadingLectures || Boolean(quizId)} onChange={(event) => setSelectedLectureId(event.target.value)}>
              <option value="">{loadingLectures ? 'جارٍ تحميل المحاضرات...' : 'اختر المحاضرة'}</option>
              {lectures.map((lecture) => <option key={lecture._id} value={lecture._id}>{lecture.order}. {lecture.title_ar || lecture.title_en}</option>)}
            </select>
            {errors.lecture && <p className="mt-1 text-xs text-danger-DEFAULT">{errors.lecture}</p>}
          </label>
        </div>
        {quizId && <p className="text-xs text-ink-500">لا يمكن تغيير ربط اختبار موجود؛ أنشئ اختبارًا جديدًا لمحاضرة أخرى.</p>}
      </div>

      {/* Basic settings */}
      <div className="bg-surface-default rounded-2xl shadow-card p-6 space-y-4">
        <h2 className="text-lg font-medium text-ink-900">إعدادات الاختبار</h2>

        <div>
          <label className="block text-sm text-ink-700 mb-1">عنوان الاختبار</label>
          <Input
            placeholder="مثال: اختبار الشهر الأول"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            error={errors.title}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-ink-700 mb-1">نسبة النجاح (%)</label>
            <Input
              type="number"
              min={1}
              max={100}
              value={passingScore}
              onChange={(e) => setPassingScore(e.target.value)}
              error={errors.passingScore}
            />
          </div>
          <div>
            <label className="block text-sm text-ink-700 mb-1">مدة الاختبار (بالدقائق)</label>
            <Input
              type="number"
              min={1}
              value={timeLimitMinutes}
              onChange={(e) => setTimeLimitMinutes(e.target.value)}
              error={errors.timeLimitMinutes}
            />
          </div>
        </div>
      </div>

      <QuestionBuilder instructorId={instructorId} scope="quiz" questions={questions} errors={errors} onUpdateQuestion={updateQuestion} onUpdateOption={updateOption} onAddQuestion={addQuestion} onRemoveQuestion={removeQuestion} />

      <div className="flex justify-end">
        <Button variant="primary" onClick={handleSave} disabled={saving || !selectedCourseId || !selectedLectureId}>
          {saving ? 'جارٍ الحفظ...' : 'حفظ الاختبار'}
        </Button>
      </div>
    </div>
  );
}

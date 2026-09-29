// src/pages/admin/CourseEditorPage.jsx
// Serves both "new course" and "edit course" — courseId is either a real id
// or the literal string "new" (see CourseManagementPage's "دورة جديدة" button,
// which navigates to `/${instructorId}/admin/courses/edit/new`).
//
// FIX: route path uses a plain :courseId (no "?") to match that actual
// navigation call, rather than relying on React Router's optional dynamic
// segment support, which behaves inconsistently across v6 versions.
export const route = {
  path: '/:instructorId/admin/courses/edit/:courseId',
  index: false,
  auth: 'required',
  roles: ['admin', 'teacher', 'assistant'],
  title: 'محرر الدورة'
};

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import courseService from '../../services/courseService';
import LectureManager from '../../components/admin/LectureManager';
import { STAGES } from '../../constants/stages';

// Tailwind classes matching Input.jsx's `.input` look, reused for the native
// <select> and <textarea> elements that Input doesn't cover.
const fieldClasses =
  'w-full rounded-md border border-surface-border bg-surface-default px-3 py-2 text-sm text-ink-900 outline-none focus:ring-2 focus:ring-brand-500';

function emptyQuestion() {
  return {
    id: `q-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    text: '',
    options: ['', '', '', ''],
    correctOptionIndex: 0,
    explanation: ''
  };
}

export default function CourseEditorPage() {
  const { instructorId, courseId } = useParams();
  const navigate = useNavigate();
  const isNew = !courseId || courseId === 'new';

  // ---- Basic info ----
  const [titleEn, setTitleEn] = useState('');
  const [titleAr, setTitleAr] = useState('');
  const [descriptionEn, setDescriptionEn] = useState('');
  const [descriptionAr, setDescriptionAr] = useState('');
  const [price, setPrice] = useState('');
  const [isFree, setIsFree] = useState(false);

  // ---- Stage & category ----
  const [stage, setStage] = useState(STAGES[0].id);
  const [categories, setCategories] = useState(['الشهر الأول', 'الوحدة الثانية']);
  const [category, setCategory] = useState(categories[0]);
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const handleAddCategory = () => {
    const name = newCategoryName.trim();
    if (!name) return;
    setCategories((prev) => [...prev, name]);
    setCategory(name);
    setNewCategoryName('');
    setShowNewCategoryInput(false);
  };

  // ---- Thumbnail ----
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);

  const handleThumbnailChange = (e) => {
    const f = e.target.files?.[0] ?? null;
    setThumbnailFile(f);
    setThumbnailPreview(f ? URL.createObjectURL(f) : null);
  };

  // ---- Exam / questions (answer key + explanations, feature #16) ----
  const [questions, setQuestions] = useState([]);

  const addQuestion = () => setQuestions((prev) => [...prev, emptyQuestion()]);
  const removeQuestion = (id) => setQuestions((prev) => prev.filter((q) => q.id !== id));
  const updateQuestionText = (id, text) =>
    setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, text } : q)));
  const updateOptionText = (id, optionIndex, value) =>
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== id) return q;
        const options = [...q.options];
        options[optionIndex] = value;
        return { ...q, options };
      })
    );
  const updateCorrectOption = (id, optionIndex) =>
    setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, correctOptionIndex: optionIndex } : q)));
  const updateExplanation = (id, explanation) =>
    setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, explanation } : q)));

  // ---- Access rules (feature #3) ----
  const [accessPeriodDays, setAccessPeriodDays] = useState(10);
  const [maxViews, setMaxViews] = useState(10);

  // ---- Publish toggle ----
  const [isPublished, setIsPublished] = useState(false);

  // ---- Submit ----
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    // Release the object URL when the component unmounts or the file changes,
    // to avoid leaking blob URLs.
    return () => {
      if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview);
    };
  }, [thumbnailPreview]);

  useEffect(() => {
    if (isNew) return undefined;
    let active = true;
    courseService.get(instructorId, courseId)
      .then((response) => {
        if (!active) return;
        const course = response.data.data;
        setTitleEn(course.title_en || '');
        setTitleAr(course.title_ar || '');
        setDescriptionEn(course.description_en || '');
        setDescriptionAr(course.description_ar || '');
        setPrice(course.price ?? '');
        setIsFree(Number(course.price) === 0);
        setStage(course.stage || STAGES[0].id);
        const courseCategory = course.categoryId?.name || categories[0];
        setCategories((previous) => previous.includes(courseCategory) ? previous : [...previous, courseCategory]);
        setCategory(courseCategory);
        setAccessPeriodDays(course.accessPeriodDays ?? 10);
        setMaxViews(course.maxViews ?? 10);
        setIsPublished(Boolean(course.isPublished));
      })
      .catch((requestError) => { if (active) setLoadError(requestError.message || 'تعذر تحميل الدورة.'); });
    return () => { active = false; };
  }, [courseId, instructorId, isNew]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      title_en: titleEn,
      title_ar: titleAr,
      description_en: descriptionEn,
      description_ar: descriptionAr,
      price: isFree ? 0 : Number(price) || 0,
      stage,
      category,
      questions,
      accessPeriodDays: Number(accessPeriodDays) || 0,
      maxViews: Number(maxViews) || 0,
      isPublished,
    };

    try {
      if (isNew) await courseService.create(instructorId, payload, { thumbnail: thumbnailFile });
      else {
        // The current PATCH controller does not accept or return quiz questions;
        // do not imply that question edits have been persisted.
        const { questions: ignoredQuestions, ...courseFields } = payload;
        void ignoredQuestions;
        await courseService.update(instructorId, courseId, courseFields, { thumbnail: thumbnailFile });
      }
      setSuccessMessage('تم حفظ الدورة بنجاح');
      navigate(`/${instructorId}/admin/courses`);
    } catch (requestError) {
      setLoadError(requestError.message || 'تعذر حفظ الدورة.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-canvas text-ink-900" dir="rtl">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="text-right">
            <h1 className="text-2xl font-semibold">{isNew ? 'دورة جديدة' : 'تعديل الدورة'}</h1>
            <p className="text-sm text-ink-500 mt-1">إدارة محتوى الدورة ومتطلباتها</p>
          </div>
          <Button variant="ghost" onClick={() => navigate(`/${instructorId}/admin/courses`)}>
            العودة للقائمة
          </Button>
        </div>

        {successMessage && (
          <div className="rounded-md p-3 bg-success-soft text-success-DEFAULT mb-4 text-sm">{successMessage}</div>
        )}
        {loadError && <div role="alert" className="rounded-md p-3 bg-danger-soft text-danger-DEFAULT mb-4 text-sm">{loadError}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 1. Basic info */}
          <section className="rounded-2xl bg-surface-default shadow-card p-6">
            <h2 className="text-lg font-semibold text-ink-900 mb-4">معلومات أساسية</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="title_ar" className="block text-sm font-medium text-ink-700 mb-1">العنوان (عربي)</label>
                <Input id="title_ar" value={titleAr} onChange={(e) => setTitleAr(e.target.value)} required />
              </div>
              <div>
                <label htmlFor="title_en" className="block text-sm font-medium text-ink-700 mb-1">العنوان (إنجليزي)</label>
                <Input id="title_en" value={titleEn} onChange={(e) => setTitleEn(e.target.value)} />
              </div>
              <div>
                <label htmlFor="description_ar" className="block text-sm font-medium text-ink-700 mb-1">الوصف (عربي)</label>
                <textarea
                  id="description_ar"
                  rows={4}
                  value={descriptionAr}
                  onChange={(e) => setDescriptionAr(e.target.value)}
                  className={fieldClasses}
                />
              </div>
              <div>
                <label htmlFor="description_en" className="block text-sm font-medium text-ink-700 mb-1">الوصف (إنجليزي)</label>
                <textarea
                  id="description_en"
                  rows={4}
                  value={descriptionEn}
                  onChange={(e) => setDescriptionEn(e.target.value)}
                  className={fieldClasses}
                />
              </div>
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-ink-700 mb-1">السعر</label>
                <Input id="price" type="number" min={0} value={price} disabled={isFree} onChange={(e) => setPrice(e.target.value)} />
                <label className="mt-3 inline-flex items-center gap-2 text-sm text-ink-700">
                  <input
                    type="checkbox"
                    checked={isFree}
                    onChange={(e) => {
                      setIsFree(e.target.checked);
                      if (e.target.checked) setPrice(0);
                    }}
                    className="h-4 w-4 accent-brand-500"
                  />
                  كورس مجاني — يَشترك الطالب فورًا من دون وسيلة دفع
                </label>
              </div>
            </div>
          </section>

          {/* 2. Stage & category */}
          <section className="rounded-2xl bg-surface-default shadow-card p-6">
            <h2 className="text-lg font-semibold text-ink-900 mb-4">المرحلة والتصنيف</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="stage" className="block text-sm font-medium text-ink-700 mb-1">المرحلة الدراسية</label>
                <select id="stage" value={stage} onChange={(e) => setStage(e.target.value)} className={fieldClasses}>
                  {STAGES.map((s) => (
                    <option key={s.id} value={s.id}>{s.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-ink-700 mb-1">التصنيف</label>
                {!showNewCategoryInput ? (
                  <div className="flex items-center gap-2">
                    <select id="category" value={category} onChange={(e) => setCategory(e.target.value)} className={fieldClasses}>
                      {categories.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    <Button type="button" variant="subtle" size="sm" onClick={() => setShowNewCategoryInput(true)}>
                      إنشاء تصنيف جديد
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="اسم التصنيف الجديد"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                    />
                    <Button type="button" variant="primary" size="sm" onClick={handleAddCategory}>إضافة</Button>
                    <Button type="button" variant="ghost" size="sm" onClick={() => setShowNewCategoryInput(false)}>إلغاء</Button>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* 3. Media uploads */}
          <section className="rounded-2xl bg-surface-default shadow-card p-6">
            <h2 className="text-lg font-semibold text-ink-900 mb-4">الوسائط</h2>

            <div>
              {/* Thumbnail */}
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1">صورة مصغرة</label>
                <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleThumbnailChange} className="w-full text-sm" />
                {thumbnailPreview && (
                  <img src={thumbnailPreview} alt="معاينة الصورة المصغرة" className="mt-3 w-full h-32 object-cover rounded-lg border border-surface-border" />
                )}
              </div>
            </div>
          </section>

          {/* 4. Exam builder — questions, answer key, explanations */}
          <section className="rounded-2xl bg-surface-default shadow-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-ink-900">الاختبار وبنك الأسئلة</h2>
              <Button type="button" variant="primary" size="sm" onClick={addQuestion}>إضافة سؤال جديد</Button>
            </div>

            {questions.length === 0 ? (
              <p className="text-sm text-ink-500">لا توجد أسئلة بعد. اضغط "إضافة سؤال جديد" للبدء.</p>
            ) : (
              <div className="space-y-6">
                {questions.map((q, qIndex) => (
                  <div key={q.id} className="rounded-xl border border-surface-border p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-ink-900">سؤال {qIndex + 1}</span>
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeQuestion(q.id)}>حذف</Button>
                    </div>

                    <div className="mb-3">
                      <label className="block text-sm font-medium text-ink-700 mb-1">نص السؤال</label>
                      <Input value={q.text} onChange={(e) => updateQuestionText(q.id, e.target.value)} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                      {q.options.map((opt, optIndex) => (
                        <div key={optIndex} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name={`correct-${q.id}`}
                            checked={q.correctOptionIndex === optIndex}
                            onChange={() => updateCorrectOption(q.id, optIndex)}
                            aria-label={`الخيار الصحيح ${optIndex + 1}`}
                          />
                          <Input
                            placeholder={`خيار ${optIndex + 1}`}
                            value={opt}
                            onChange={(e) => updateOptionText(q.id, optIndex, e.target.value)}
                            className="flex-1"
                          />
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-ink-500 mb-3">حدد الدائرة بجانب الإجابة الصحيحة لتكون مفتاح التصحيح.</p>

                    <div>
                      <label className="block text-sm font-medium text-ink-700 mb-1">شرح الإجابة</label>
                      <textarea
                        rows={3}
                        value={q.explanation}
                        onChange={(e) => updateExplanation(q.id, e.target.value)}
                        placeholder="يظهر هذا الشرح للطالب إذا أخطأ في المحاولة الثانية"
                        className={fieldClasses}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* 6. Access rules */}
          <section className="rounded-2xl bg-surface-default shadow-card p-6">
            <h2 className="text-lg font-semibold text-ink-900 mb-4">قواعد الوصول</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="accessPeriodDays" className="block text-sm font-medium text-ink-700 mb-1">مدة الوصول (بالأيام)</label>
                <Input id="accessPeriodDays" type="number" min={1} value={accessPeriodDays} onChange={(e) => setAccessPeriodDays(e.target.value)} />
              </div>
              <div>
                <label htmlFor="maxViews" className="block text-sm font-medium text-ink-700 mb-1">الحد الأقصى للمشاهدات</label>
                <Input id="maxViews" type="number" min={1} value={maxViews} onChange={(e) => setMaxViews(e.target.value)} />
              </div>
            </div>
          </section>

          {/* 7. Publish toggle */}
          <section className="rounded-2xl bg-surface-default shadow-card p-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-ink-900">النشر</h2>
              <p className="text-sm text-ink-500 mt-1">عند التفعيل، ستكون الدورة مرئية للطلاب فورًا.</p>
            </div>
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="w-5 h-5 accent-brand-500"
              />
              <span className="text-sm text-ink-900">نشر الدورة الآن</span>
            </label>
          </section>

          {!isNew && <LectureManager instructorId={instructorId} courseId={courseId} />}
          {isNew && <section className="rounded-2xl bg-surface-muted p-6 text-sm text-ink-600">احفظ الدورة أولاً، ثم افتحها مرة أخرى لإضافة عدد غير محدود من المحاضرات وإدارة ترتيبها.</section>}

          <div className="flex items-center gap-3">
            <Button type="submit" variant="primary" disabled={saving}>
              {saving ? 'جارِ الحفظ...' : 'حفظ الدورة'}
            </Button>
            <Button type="button" variant="ghost" onClick={() => navigate(`/${instructorId}/admin/courses`)}>
              إلغاء
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

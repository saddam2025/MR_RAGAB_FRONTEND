// src/components/forms/RegisterForm.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Input from '../ui/Input';
import PasswordInput from '../ui/PasswordInput';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
// FIX: real hook file is src/hooks/useAuth.js (there is no src/contexts/AuthContext.jsx —
// the context itself lives in AuthProvider.jsx and is exposed via this hook).
import { useAuth } from '../../hooks/useAuth';
import { STAGES as stageDefinitions } from '../../constants/stages';
import { hasValidPassword, PASSWORD_POLICY_MESSAGE, passwordRequirements } from '../../utils/passwordPolicy';

const TRACK_STAGE_IDS = new Set(['grade-10', 'baccalaureate-1', 'baccalaureate-2', 'grade-11', 'grade-12']);
const TRACKS = ['علمي علوم', 'علمي رياضة', 'أدبي'];

export default function RegisterForm({ instructorId: propInstructorId, instructors = [], onInstructorChange }) {
  const auth = useAuth() || {};
  const registerFn = auth.register || null;

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    parentAccessCode: '',
    // Student-only fields (match the student sign-up design)
    phone: '',
    guardianPhone: '',
    guardianJob: '',
    schoolName: '',
    governorate: '',
    gender: '',
    stage: '',
    track: '',
    photo: null
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const passwordStatus = passwordRequirements(form.password);

  const onChange = (key) => (e) => {
    const value = e?.target?.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((s) => ({ ...s, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: '' }));
    setServerError('');
  };

  const onPhotoChange = (e) => {
    const file = e?.target?.files?.[0] || null;
    setForm((s) => ({ ...s, photo: file }));
    setErrors((prev) => ({ ...prev, photo: '' }));
  };

  // Static option lists for the student sign-up fields
  const GOVERNORATES = [
    'القاهرة', 'الجيزة', 'الإسكندرية', 'الدقهلية', 'البحر الأحمر', 'البحيرة',
    'الفيوم', 'الغربية', 'الإسماعيلية', 'المنوفية', 'المنيا', 'القليوبية',
    'الوادي الجديد', 'السويس', 'اسوان', 'اسيوط', 'بني سويف', 'بورسعيد',
    'دمياط', 'الشرقية', 'جنوب سيناء', 'كفر الشيخ', 'مطروح', 'الأقصر',
    'قنا', 'شمال سيناء', 'سوهاج'
  ];
  // Keep the canonical `{ id, label }` shape. `id` is what the API stores
  // and validates; `label` is Arabic display text only.
  const stages = stageDefinitions;

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'الاسم مطلوب';
    if (!form.email.trim()) e.email = 'البريد الإلكتروني مطلوب';
    else if (!validateEmail(form.email.trim())) e.email = 'البريد الإلكتروني غير صالح';
    if (!form.password) e.password = 'كلمة المرور مطلوبة';
    else if (!hasValidPassword(form.password)) e.password = PASSWORD_POLICY_MESSAGE;
    if (!form.confirmPassword) e.confirmPassword = 'تأكيد كلمة المرور مطلوب';
    if (form.password && form.confirmPassword && form.password !== form.confirmPassword) {
      e.confirmPassword = 'كلمتا المرور غير متطابقتين';
    }
    if (!propInstructorId) e.instructorId = 'اختر المنصة أولاً';
    if (form.role === 'parent' && !form.parentAccessCode.trim()) {
      e.parentAccessCode = 'كود ربط الطالب مطلوب لولي الأمر';
    }

    if (form.role === 'student') {
      if (!form.phone.trim()) e.phone = 'رقم هاتف الطالب مطلوب';
      if (!form.guardianPhone.trim()) e.guardianPhone = 'رقم ولي الأمر مطلوب';
      if (!form.guardianJob.trim()) e.guardianJob = 'مهنة ولي الأمر مطلوبة';
      if (!form.schoolName.trim()) e.schoolName = 'اسم المدرسة مطلوب';
      if (!form.governorate) e.governorate = 'المحافظة مطلوبة';
      if (!form.gender) e.gender = 'النوع مطلوب';
      if (!form.stage) e.stage = 'الصف الدراسي مطلوب';
      if (TRACK_STAGE_IDS.has(form.stage) && !form.track) e.track = 'الشعبة مطلوبة';
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;

    setSubmitting(true);
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role,
        instructorId: propInstructorId || null,
        // TODO(backend): parentAccessCode must be validated against a real student
        // record and used to set parent.childId — do not store as a loose string.
        ...(form.role === 'parent' ? { parentAccessCode: form.parentAccessCode.trim() } : {}),
        ...(form.role === 'student'
          ? {
              phone: form.phone.trim(),
              guardianPhone: form.guardianPhone.trim(),
              guardianJob: form.guardianJob.trim(),
              schoolName: form.schoolName.trim(),
              governorate: form.governorate,
              gender: form.gender,
              stage: form.stage,
              track: TRACK_STAGE_IDS.has(form.stage) ? form.track : null
            }
          : {})
      };

      // If a profile photo was attached, send multipart/form-data instead of JSON
      // so the file travels with the rest of the fields in one request.
      let body = payload;
      if (form.role === 'student' && form.photo) {
        const fd = new FormData();
        Object.entries(payload).forEach(([key, value]) => {
          if (value !== null && value !== undefined) fd.append(key, value);
        });
        fd.append('photo', form.photo);
        body = fd;
      }

      // FIX: api.js baseURL already resolves to `${VITE_API_URL}` which itself
      // already ends in /api/v1 — prefixing '/api/v1' again here would call
      // /api/v1/api/v1/auth/register and 404. Use the relative path only.
      if (!registerFn) {
        setServerError('خدمة التسجيل غير متاحة. يرجى تحديث الصفحة والمحاولة مرة أخرى.');
        return;
      }

      // The successful registration response already includes a token. Do not
      // make a second login request, which could fail independently after the
      // account has been created and incorrectly look like registration failed.
      const registrationResult = await registerFn(body);
      if (!registrationResult?.ok) {
        setServerError(registrationResult?.error || 'تعذر إنشاء الحساب. يرجى المحاولة لاحقًا.');
      }
    } catch (err) {
      // FIX: api.js's response interceptor already normalizes axios errors into
      // a plain { message, status } object before rejecting (see api.js), so the
      // caught error here is NOT a raw axios error — err.response does not exist.
      const msg = err?.message || 'فشل التسجيل. حاول مرة أخرى.';
      setServerError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" dir="rtl">
      {serverError && (
        <div className="rounded-md p-3 bg-danger-soft text-danger-DEFAULT text-sm">
          {serverError}
        </div>
      )}

      {/* Role selector — student / parent only. Assistants are invited by
          instructors (see the Assistant Manager flow), never self-register. */}
      <div>
        <div className="text-right text-sm font-medium text-ink-900 mb-3">نوع الحساب</div>
        <div className="flex items-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={() => setForm((s) => ({ ...s, role: 'student' }))}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              form.role === 'student' ? 'bg-brand-500 text-ink-900' : 'bg-surface-muted border border-surface-border text-ink-700'
            }`}
            aria-pressed={form.role === 'student'}
          >
            طالب
          </button>

          <button
            type="button"
            onClick={() => setForm((s) => ({ ...s, role: 'parent' }))}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              form.role === 'parent' ? 'bg-brand-500 text-ink-900' : 'bg-surface-muted border border-surface-border text-ink-700'
            }`}
            aria-pressed={form.role === 'parent'}
          >
            ولي أمر
          </button>

          <Badge variant="neutral" className="text-xs">المساعدون يتم دعوتهم من قبل المدرسين</Badge>
        </div>
      </div>

      {/* Form fields */}
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label htmlFor="instructorId" className="block text-sm font-medium text-ink-700 mb-2">المنصة التعليمية</label>
          <select
            id="instructorId"
            name="instructorId"
            value={propInstructorId || ''}
            onChange={(event) => onInstructorChange?.(event.target.value)}
            required
            className="w-full rounded-xl border border-surface-border bg-surface-muted text-ink-900 text-right p-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="" disabled>اختر المنصة التعليمية</option>
            {instructors.map((instructor) => (
              <option key={instructor.id} value={instructor.id}>{instructor.name}</option>
            ))}
          </select>
          {errors.instructorId && <p className="text-xs text-danger-DEFAULT mt-1">{errors.instructorId}</p>}
        </div>

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-ink-700 mb-2">الاسم الكامل</label>
          <Input id="name" name="name" placeholder="الاسم رباعي" value={form.name} onChange={onChange('name')} error={errors.name} required />
        </div>

        {form.role === 'student' && (
          <>
            {/* Student / parent phones */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-ink-700 mb-2">رقم هاتف الطالب</label>
                <Input id="phone" name="phone" type="tel" value={form.phone} onChange={onChange('phone')} error={errors.phone} required />
              </div>
              <div>
                <label htmlFor="guardianPhone" className="block text-sm font-medium text-ink-700 mb-2">رقم ولي الأمر</label>
                <Input id="guardianPhone" name="guardianPhone" type="tel" value={form.guardianPhone} onChange={onChange('guardianPhone')} error={errors.guardianPhone} required />
              </div>
            </div>

            {/* Guardian job / school name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="guardianJob" className="block text-sm font-medium text-ink-700 mb-2">مهنة ولي الأمر</label>
                <Input id="guardianJob" name="guardianJob" value={form.guardianJob} onChange={onChange('guardianJob')} error={errors.guardianJob} required />
              </div>
              <div>
                <label htmlFor="schoolName" className="block text-sm font-medium text-ink-700 mb-2">اسم المدرسة</label>
                <Input id="schoolName" name="schoolName" value={form.schoolName} onChange={onChange('schoolName')} error={errors.schoolName} required />
              </div>
            </div>

            {/* Governorate / gender / grade */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label htmlFor="governorate" className="block text-sm font-medium text-ink-700 mb-2">المحافظة</label>
                <select
                  id="governorate"
                  name="governorate"
                  value={form.governorate}
                  onChange={onChange('governorate')}
                  required
                  className="w-full rounded-xl border border-surface-border bg-surface-muted text-ink-900 text-right p-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="" disabled>اختر المحافظة</option>
                  {GOVERNORATES.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
                {errors.governorate && <p className="text-xs text-danger-DEFAULT mt-1">{errors.governorate}</p>}
              </div>

              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-ink-700 mb-2">النوع</label>
                <select
                  id="gender"
                  name="gender"
                  value={form.gender}
                  onChange={onChange('gender')}
                  required
                  className="w-full rounded-xl border border-surface-border bg-surface-muted text-ink-900 text-right p-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="" disabled>اختر النوع</option>
                  <option value="male">ولد</option>
                  <option value="female">بنت</option>
                </select>
                {errors.gender && <p className="text-xs text-danger-DEFAULT mt-1">{errors.gender}</p>}
              </div>

              <div>
                <label htmlFor="stage" className="block text-sm font-medium text-ink-700 mb-2">الصف الدراسي</label>
                <select
                  id="stage"
                  name="stage"
                  value={form.stage}
                  onChange={onChange('stage')}
                  required
                  className="w-full rounded-xl border border-surface-border bg-surface-muted text-ink-900 text-right p-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="" disabled>اختر الصف</option>
                  {stages.map((stage) => (
                    <option key={stage.id} value={stage.id}>{stage.label}</option>
                  ))}
                </select>
                {errors.stage && <p className="text-xs text-danger-DEFAULT mt-1">{errors.stage}</p>}
              </div>
            </div>

            {/* Track / email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {TRACK_STAGE_IDS.has(form.stage) && <div>
                <label htmlFor="track" className="block text-sm font-medium text-ink-700 mb-2">اختر الشعبة</label>
                <select
                  id="track"
                  name="track"
                  value={form.track}
                  onChange={onChange('track')}
                  required
                  className="w-full rounded-xl border border-surface-border bg-surface-muted text-ink-900 text-right p-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="" disabled>اختر الشعبة</option>
                  {TRACKS.map((track) => (
                    <option key={track} value={track}>{track}</option>
                  ))}
                </select>
                {errors.track && <p className="text-xs text-danger-DEFAULT mt-1">{errors.track}</p>}
              </div>}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-ink-700 mb-2">البريد الإلكتروني</label>
                <Input id="email" name="email" type="email" value={form.email} onChange={onChange('email')} error={errors.email} required />
              </div>
            </div>
          </>
        )}

        {form.role !== 'student' && (
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-ink-700 mb-2">البريد الإلكتروني</label>
            <Input id="email" name="email" type="email" value={form.email} onChange={onChange('email')} error={errors.email} required />
          </div>
        )}

        {/* Two password fields side by side on desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-ink-700 mb-2">كلمة السر</label>
            <PasswordInput id="password" name="password" value={form.password} onChange={onChange('password')} error={errors.password} required />
            <div className="mt-2 space-y-1 text-xs text-ink-500" aria-live="polite">
              <p className={passwordStatus.minLength ? 'text-success-text' : undefined}>12 حرفًا على الأقل {passwordStatus.minLength ? '✓' : '✗'}</p>
              <p className={passwordStatus.hasLetter ? 'text-success-text' : undefined}>يحتوي على حروف {passwordStatus.hasLetter ? '✓' : '✗'}</p>
              <p className={passwordStatus.hasDigit ? 'text-success-text' : undefined}>يحتوي على أرقام {passwordStatus.hasDigit ? '✓' : '✗'}</p>
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-ink-700 mb-2">تأكيد كلمة السر</label>
            <PasswordInput id="confirmPassword" name="confirmPassword" value={form.confirmPassword} onChange={onChange('confirmPassword')} error={errors.confirmPassword} required />
          </div>
        </div>

        {/* Profile photo upload (student only, matches the design) */}
        {form.role === 'student' && (
          <div className="rounded-2xl border border-dashed border-surface-border p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-surface-muted flex items-center justify-center text-ink-500 shrink-0">
                📷
              </div>
              <div className="text-right">
                <p className="text-sm text-ink-700">
                  {form.photo ? form.photo.name : 'صورة شخصية ان وجدت'}
                </p>
                <p className="text-xs text-ink-500">JPG, PNG بحد أقصى 2MB</p>
              </div>
            </div>

            <label
              htmlFor="photo"
              className="cursor-pointer px-4 py-2 rounded-full border border-surface-border text-sm font-medium text-ink-700 hover:bg-surface-muted transition-colors shrink-0"
            >
              رفع
              <input
                id="photo"
                name="photo"
                type="file"
                accept="image/jpeg,image/png"
                onChange={onPhotoChange}
                className="hidden"
              />
            </label>
          </div>
        )}
        {errors.photo && <p className="text-xs text-danger-DEFAULT">{errors.photo}</p>}
      </div>

      {/* Conditional parent access code field */}
      {form.role === 'parent' && (
        <div>
          <label htmlFor="parentAccessCode" className="block text-sm font-medium text-ink-700 mb-2">كود ربط الطالب</label>
          <Input
            id="parentAccessCode"
            name="parentAccessCode"
            value={form.parentAccessCode}
            onChange={onChange('parentAccessCode')}
            required
            error={errors.parentAccessCode}
          />
          {/* helperText isn't a supported Input prop, so it's rendered manually here,
              same pattern used for the error message inside Input.jsx itself. */}
          {!errors.parentAccessCode && (
            <p className="text-xs text-ink-500 mt-2">احصل على هذا الكود من ابنك/ابنتك داخل لوحة الطالب</p>
          )}
        </div>
      )}

      {/* Submit button */}
      <div>
        <Button type="submit" variant="primary" className="w-full" disabled={submitting}>
          {submitting ? 'جارٍ الإنشاء...' : 'إنشاء حساب'}
        </Button>
      </div>

      {/* Login link */}
      <div className="text-center text-sm text-ink-500">
        لديك حساب بالفعل؟{' '}
        <Link to={propInstructorId ? `/${propInstructorId}/login` : '/login'} className="text-brand-700 font-medium hover:underline">
          تسجيل الدخول
        </Link>
      </div>
    </form>
  );
}

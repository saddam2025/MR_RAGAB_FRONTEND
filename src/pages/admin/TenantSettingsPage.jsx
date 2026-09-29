// src/pages/admin/TenantSettingsPage.jsx
export const route = {
  path: '/:instructorId/admin/settings',
  index: false,
  auth: 'admin',
  title: 'إعدادات المنصة'
};

import React, { useContext, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Avatar from '../../components/ui/Avatar';
import ConfirmModal from '../../components/ui/ConfirmModal';
import api from '../../services/api';
import authService from '../../services/authService';
// FIX: real hook file is src/hooks/useAuth.js — there is no src/contexts/AuthContext.jsx.
import { useAuth } from '../../hooks/useAuth';
import { normalizeEgyptianPhone } from '../../utils/phone';
import { ThemeContext } from '../../contexts/ThemeProvider';

// Shared select/textarea styling matching Input.jsx's `.input` look.
const fieldClasses =
  'w-full rounded-md border border-surface-border bg-surface-default px-3 py-2 text-sm text-ink-900 outline-none focus:ring-2 focus:ring-brand-500';

const ASSISTANT_PERMISSION_KEYS = [
  'can_upload_video',
  'can_grade_exams',
  'can_create_quizzes',
  'can_generate_access_codes',
  'can_generate_wallet_codes'
];

function normalizeAssistantPermissions(permissions) {
  return ASSISTANT_PERMISSION_KEYS.reduce((result, key) => {
    result[key] = Array.isArray(permissions) ? permissions.includes(key) : Boolean(permissions?.[key]);
    return result;
  }, {});
}

function normalizeAssistant(assistant) {
  return {
    ...assistant,
    id: String(assistant?._id || assistant?.id || ''),
    permissions: normalizeAssistantPermissions(assistant?.permissions)
  };
}

function AssistantActionModal({ action, onCancel, onConfirm, working }) {
  if (!action) return null;
  const isDelete = action.type === 'delete';
  const isSuspend = action.type === 'suspend';
  const description = isDelete
    ? `سيتم حذف ${action.assistant.name} حذفاً منطقياً ومنع دخوله نهائياً.`
    : isSuspend
      ? `سيتم تعليق ${action.assistant.name} ومنعه من الدخول حتى إعادة تفعيله.`
      : `سيتم إعادة تفعيل ${action.assistant.name} والسماح له بالدخول.`;
  return <ConfirmModal description={description} busy={working} onConfirm={onConfirm} onCancel={onCancel} />;
}

export default function TenantSettingsPage() {
  const { instructorId } = useParams();
  const { user, updateUser = () => {} } = useAuth() || {};

  // ============================================================
  // My Profile — avatar upload (independent from tenant branding)
  // ============================================================
  const avatarInputRef = useRef(null);
  const avatarObjectUrlRef = useRef(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState('');
  const [avatarSuccess, setAvatarSuccess] = useState('');

  const clearAvatarPreview = () => {
    if (avatarObjectUrlRef.current) {
      URL.revokeObjectURL(avatarObjectUrlRef.current);
      avatarObjectUrlRef.current = null;
    }
    setAvatarPreview(null);
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0] || null;
    setAvatarError('');
    setAvatarSuccess('');
    clearAvatarPreview();
    setAvatarFile(null);

    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setAvatarError('يرجى اختيار صورة بصيغة JPEG أو PNG أو WebP فقط.');
      event.target.value = '';
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      setAvatarError('حجم الصورة يجب ألا يتجاوز 3 ميجابايت.');
      event.target.value = '';
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    avatarObjectUrlRef.current = previewUrl;
    setAvatarFile(file);
    setAvatarPreview(previewUrl);
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile || avatarUploading) return;
    setAvatarUploading(true);
    setAvatarError('');
    setAvatarSuccess('');
    try {
      const response = await authService.uploadAvatar(avatarFile);
      const avatarUrl = response?.data?.data?.avatarUrl;
      if (!avatarUrl) throw new Error('لم يُرجع الخادم رابط الصورة الجديدة.');

      // Keep both field names during the transition from older mock user data.
      updateUser({ avatarUrl, avatar: avatarUrl });
      clearAvatarPreview();
      setAvatarFile(null);
      if (avatarInputRef.current) avatarInputRef.current.value = '';
      setAvatarSuccess('تم تحديث صورتك الشخصية بنجاح.');
    } catch (error) {
      // api.js rejects with the backend JSON body, so this preserves its
      // specific validation message when one is available.
      setAvatarError(error?.message || 'تعذر رفع الصورة. حاول مرة أخرى.');
    } finally {
      setAvatarUploading(false);
    }
  };

  // ============================================================
  // Section 1 — Branding
  // ============================================================
  const { theme, toggleTheme } = useContext(ThemeContext) || {};
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [faviconFile, setFaviconFile] = useState(null);
  const [faviconUrl, setFaviconUrl] = useState('');
  const [brandingUploading, setBrandingUploading] = useState('');
  const [brandName, setBrandName] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [supportPhone, setSupportPhone] = useState('');
  const [supportEmail, setSupportEmail] = useState('');
  const [videoDelivery, setVideoDelivery] = useState({ provider: '', pullZone: '', maxViewsPerLesson: 10, accessWindowDays: 10 });
  const [documentDelivery, setDocumentDelivery] = useState({ provider: '', publicBaseUrl: '' });
  const [notificationPreferences, setNotificationPreferences] = useState({ smsEnabled: false, emailEnabled: true, whatsappEnabled: false });
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsError, setSettingsError] = useState('');
  const [settingsSuccess, setSettingsSuccess] = useState('');
  const [courses, setCourses] = useState([]);

  const applySettings = (payload) => {
    const tenant = payload?.tenant || {};
    const gateway = payload?.gateway || {};
    setBrandName(tenant.name || '');
    setLogoUrl(tenant.logoUrl || '');
    setFaviconUrl(tenant.faviconUrl || '');
    setSupportPhone(normalizeEgyptianPhone(tenant.supportPhone));
    setSupportEmail(tenant.supportEmail || '');
    setVideoDelivery({ provider: tenant.videoDelivery?.provider || '', pullZone: tenant.videoDelivery?.pullZone || '', maxViewsPerLesson: tenant.videoDelivery?.maxViewsPerLesson ?? 10, accessWindowDays: tenant.videoDelivery?.accessWindowDays ?? 10 });
    setDocumentDelivery({ provider: tenant.documentDelivery?.provider || '', publicBaseUrl: tenant.documentDelivery?.publicBaseUrl || '' });
    setNotificationPreferences({ smsEnabled: !!tenant.notificationPreferences?.smsEnabled, emailEnabled: tenant.notificationPreferences?.emailEnabled !== false, whatsappEnabled: !!tenant.notificationPreferences?.whatsappEnabled });
    setPaymobIntegrationId(gateway.paymobIntegrationId || '');
  };

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const [settingsResponse, coursesResponse, assistantsResponse] = await Promise.all([api.get(`/instructors/${instructorId}/settings`), api.get(`/instructors/${instructorId}/courses`), api.get(`/instructors/${instructorId}/assistants`)]);
        if (!active) return;
        applySettings(settingsResponse.data.data);
        const loadedCourses = coursesResponse.data.data || [];
        setCourses(loadedCourses);
        setCodeCourseId(loadedCourses[0]?._id || '');
        setAssistants((assistantsResponse.data.data || []).map(normalizeAssistant));
      } catch (error) {
        if (active) setSettingsError(error?.message || 'تعذر تحميل إعدادات المنصة.');
      } finally {
        if (active) setSettingsLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, [instructorId]);

  const saveSettings = async (overrides = {}) => {
    setSettingsSaving(true);
    setSettingsError('');
    setSettingsSuccess('');
    try {
      const response = await api.patch(`/instructors/${instructorId}/settings`, {
        name: brandName,
        logoUrl: logoUrl || null,
        faviconUrl: faviconUrl || null,
        supportPhone: normalizeEgyptianPhone(supportPhone),
        supportEmail,
        videoDelivery: { ...videoDelivery, maxViewsPerLesson: Number(videoDelivery.maxViewsPerLesson), accessWindowDays: Number(videoDelivery.accessWindowDays) },
        documentDelivery,
        notificationPreferences,
        ...overrides
      });
      applySettings(response.data.data);
      setSettingsSuccess('تم حفظ إعدادات المنصة بنجاح.');
    } catch (error) {
      setSettingsError(error?.message || 'تعذر حفظ إعدادات المنصة.');
    } finally {
      setSettingsSaving(false);
    }
  };

  const handleLogoChange = (e) => {
    const f = e.target.files?.[0] ?? null;
    setLogoFile(f);
    setLogoPreview(f ? URL.createObjectURL(f) : null);
  };

  // ThemeContext only exposes a toggle function (see Navbar.jsx), not a direct
  // setter, so selecting a specific option here only calls toggleTheme() when
  // it actually differs from the current theme.
  const handleThemeSelect = (nextTheme) => {
    if (nextTheme !== theme && typeof toggleTheme === 'function') {
      toggleTheme();
    }
  };

  // ============================================================
  // Section 2 — Paymob Gateway Integration
  // ============================================================
  const [paymobApiKey, setPaymobApiKey] = useState('');
  const [paymobIntegrationId, setPaymobIntegrationId] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [paymentSaved, setPaymentSaved] = useState(false);

  const handleSavePayment = async () => {
    await saveSettings({ paymobApiKey, paymobIntegrationId });
    setPaymentSaved(true);
    setTimeout(() => setPaymentSaved(false), 3000);
  };

  // ============================================================
  // Section 3 — Assistant Manager
  // ============================================================
  const [assistants, setAssistants] = useState([]);

  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [inviteLink, setInviteLink] = useState('');
  const [formError, setFormError] = useState('');
  const [form, setForm] = useState({
    name: '',
    email: '',
    can_upload_video: false,
    can_grade_exams: false,
    can_create_quizzes: false,
    can_generate_access_codes: false,
    can_generate_wallet_codes: false
  });
  const [editingId, setEditingId] = useState(null);
  const [editingPermissions, setEditingPermissions] = useState({});
  const [editError, setEditError] = useState('');
  const [assistantAction, setAssistantAction] = useState(null);
  const [assistantActionError, setAssistantActionError] = useState('');
  const [assistantActionWorking, setAssistantActionWorking] = useState(false);

  const resetForm = () => {
    setForm({
      name: '',
      email: '',
      can_upload_video: false,
      can_grade_exams: false,
      can_create_quizzes: false,
      can_generate_access_codes: false,
      can_generate_wallet_codes: false
    });
    setInviteLink('');
    setFormError('');
  };

  const handleFormChange = (key) => (e) => {
    const value = e?.target?.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((s) => ({ ...s, [key]: value }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    setFormError('');
    setInviteLink('');
    try {
      const payload = {
        name: form.name,
        email: form.email,
        permissions: ASSISTANT_PERMISSION_KEYS.filter((key) => form[key])
      };

      // FIX: api.js's baseURL already includes /api/v1 — prefixing it again
      // here would call /api/v1/api/v1/instructors/... and 404.
      const res = await api.post(`/instructors/${instructorId}/assistants`, payload);

      const data = res?.data || res;
      const newAssistant = normalizeAssistant(data.assistant || {
        id: `a-${Date.now()}`,
        name: payload.name,
        email: payload.email,
        inviteStatus: 'pending',
        permissions: payload.permissions
      });

      setAssistants((s) => [newAssistant, ...s]);
      if (data.inviteLink) {
        setInviteLink(data.inviteLink);
      } else {
        setInviteLink(`${window.location.origin}/invite/${newAssistant.id}`);
      }
      setForm({
        name: '',
        email: '',
        can_upload_video: false,
        can_grade_exams: false,
        can_generate_access_codes: false
      });
      setFormError('');
      setShowForm(true); // keep the panel open so the invite link stays visible
    } catch (err) {
      // FIX: replaced alert() with an inline banner, consistent with the
      // pattern used across every other page (RegisterForm, AssignmentGradingPage, etc.)
      setFormError(err?.message || 'فشل إنشاء المساعد. حاول مرة أخرى.');
    } finally {
      setCreating(false);
    }
  };

  const [copyFeedback, setCopyFeedback] = useState('');
  const copyInvite = async () => {
    if (!inviteLink) return;
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopyFeedback('تم نسخ رابط الدعوة');
    } catch {
      setCopyFeedback('فشل النسخ');
    }
    setTimeout(() => setCopyFeedback(''), 2500);
  };

  const startEdit = (assistant) => {
    setEditingId(assistant.id);
    setEditingPermissions({ ...assistant.permissions });
    setEditError('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingPermissions({});
    setEditError('');
  };

  const toggleEditPermission = (key) => {
    setEditingPermissions((p) => ({ ...p, [key]: !p[key] }));
  };

  const savePermissions = async (assistantId) => {
    const assistant = assistants.find((a) => a.id === assistantId);
    if (!assistant) return;
    try {
      const payload = { permissions: ASSISTANT_PERMISSION_KEYS.filter((key) => editingPermissions[key]) };
      // FIX: same double /api/v1 issue as the create call above.
      const res = await api.patch(`/instructors/${instructorId}/assistants/${assistantId}`, payload);
      const updated = normalizeAssistant(res?.data?.data || { ...assistant, permissions: editingPermissions });
      setAssistants((list) => list.map((a) => (a.id === assistantId ? updated : a)));
      setEditingId(null);
      setEditingPermissions({});
    } catch (err) {
      setEditError(err?.message || 'فشل تحديث الصلاحيات. حاول مرة أخرى.');
    }
  };

  const permissionLabel = (key) => {
    if (key === 'can_upload_video') return 'رفع الفيديوهات';
    if (key === 'can_grade_exams') return 'تصحيح الاختبارات';
    if (key === 'can_create_quizzes') return 'إنشاء اختبارات المحاضرات';
    if (key === 'can_generate_access_codes') return 'توليد أكواد الوصول';
    if (key === 'can_generate_wallet_codes') return 'توليد أكواد شحن المحفظة';
    return key;
  };

  const uploadBrandAsset = async (assetType, file) => {
    if (!file || brandingUploading) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 3 * 1024 * 1024) {
      setSettingsError('اختر صورة JPEG أو PNG أو WebP لا يتجاوز حجمها 3 ميجابايت.');
      return;
    }
    setBrandingUploading(assetType);
    setSettingsError('');
    try {
      const form = new FormData();
      form.append('image', file);
      const response = await api.post(`/instructors/${instructorId}/settings/branding/${assetType}`, form, { headers: { 'Content-Type': 'multipart/form-data' } });
      const url = response.data.data?.[assetType === 'logo' ? 'logoUrl' : 'faviconUrl'];
      if (!url) throw new Error('لم يُرجع الخادم رابط الصورة.');
      if (assetType === 'logo') setLogoUrl(url); else setFaviconUrl(url);
      setSettingsSuccess('تم رفع صورة الهوية وحفظها بنجاح.');
    } catch (error) {
      setSettingsError(error?.message || 'تعذر رفع الصورة. حاول مرة أخرى.');
    } finally {
      setBrandingUploading('');
    }
  };

  const executeAssistantAction = async () => {
    if (!assistantAction) return;
    const { type, assistant } = assistantAction;
    setAssistantActionWorking(true);
    setAssistantActionError('');
    try {
      if (type === 'delete') {
        await api.delete(`/instructors/${instructorId}/assistants/${assistant.id}`);
        setAssistants((list) => list.filter((item) => item.id !== assistant.id));
      } else {
        const endpoint = type === 'suspend' ? 'suspend' : 'reactivate';
        const response = await api.patch(`/instructors/${instructorId}/assistants/${assistant.id}/${endpoint}`);
        const updated = normalizeAssistant(response.data.data);
        setAssistants((list) => list.map((item) => (item.id === assistant.id ? updated : item)));
      }
      setAssistantAction(null);
    } catch (error) {
      setAssistantActionError(error?.message || 'تعذر تنفيذ الإجراء على المساعد.');
    } finally {
      setAssistantActionWorking(false);
    }
  };

  // ============================================================
  // Section 4 — Lecture Access Codes
  // ============================================================
  const [codeCount, setCodeCount] = useState(5);
  const [codeCourseId, setCodeCourseId] = useState('');
  const [generatedCodes, setGeneratedCodes] = useState([]);
  const [codesCopyFeedback, setCodesCopyFeedback] = useState('');
  const [copiedGeneratedCode, setCopiedGeneratedCode] = useState('');

  const handleGenerateCodes = async () => {
    if (!codeCourseId) return;
    try {
      const response = await api.post(`/instructors/${instructorId}/courses/${codeCourseId}/access-codes/generate`, { count: Math.max(1, Number(codeCount) || 1) });
      setGeneratedCodes(response.data.data.codes || []);
    } catch (error) {
      setSettingsError(error?.message || 'تعذر توليد أكواد الوصول.');
    }
  };

  const copyGeneratedCode = async (code) => { try { await navigator.clipboard.writeText(code); setCopiedGeneratedCode(code); setTimeout(() => setCopiedGeneratedCode(''), 1500); } catch { setCodesCopyFeedback('تعذر نسخ الكود'); } };

  const copyAllCodes = async () => {
    if (generatedCodes.length === 0) return;
    try {
      await navigator.clipboard.writeText(generatedCodes.join('\n'));
      setCodesCopyFeedback('تم نسخ جميع الأكواد');
    } catch {
      setCodesCopyFeedback('فشل النسخ');
    }
    setTimeout(() => setCodesCopyFeedback(''), 2500);
  };

  return (
    <div className="min-h-screen bg-surface-canvas text-ink-900" dir="rtl">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">إعدادات المنصة</h1>
          <p className="text-sm text-ink-500 mt-1">
            {user?.name ? `مرحباً ${user.name} — ` : ''}إدارة الهوية البصرية والدفع والمساعدين وأكواد الوصول
          </p>
        </div>
        {settingsError && <div role="alert" className="rounded-md p-3 bg-danger-soft text-danger-DEFAULT mb-4 text-sm">{settingsError}</div>}
        {settingsSuccess && <div role="status" className="rounded-md p-3 bg-success-soft text-success-DEFAULT mb-4 text-sm">{settingsSuccess}</div>}

        {/* Separate personal profile from tenant-wide branding settings. */}
        <section className="rounded-2xl bg-surface-default shadow-card p-6 mb-4">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <Avatar
                avatarUrl={avatarPreview || user?.avatarUrl || user?.avatar}
                name={user?.name || 'المستخدم'}
                size="lg"
              />
              <div>
                <h2 className="text-lg font-semibold text-ink-900">ملفي الشخصي</h2>
                <p className="mt-1 text-sm text-ink-500">غيّر صورتك الشخصية. الصيغ المدعومة: JPEG وPNG وWebP، حتى 3 ميجابايت.</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <input
                ref={avatarInputRef}
                id="avatarUpload"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                onChange={handleAvatarChange}
              />
              <Button type="button" variant="ghost" onClick={() => avatarInputRef.current?.click()} disabled={avatarUploading}>
                تغيير الصورة
              </Button>
              <Button type="button" variant="primary" onClick={handleAvatarUpload} disabled={!avatarFile || avatarUploading}>
                {avatarUploading ? 'جاري الرفع...' : 'حفظ الصورة'}
              </Button>
            </div>
          </div>

          {avatarError && <div role="alert" className="mt-4 rounded-md bg-danger-soft p-3 text-sm text-danger-DEFAULT">{avatarError}</div>}
          {avatarSuccess && <div role="status" className="mt-4 rounded-md bg-success-soft p-3 text-sm text-success-DEFAULT">{avatarSuccess}</div>}
        </section>

        {/* Section 1: Branding */}
        <section className="rounded-2xl bg-surface-default shadow-card p-6 mb-4">
          <h2 className="text-lg font-semibold text-ink-900 mb-4">الهوية البصرية</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1">شعار المنصة</label>
              <input type="file" accept="image/*" onChange={handleLogoChange} className="w-full text-sm" />
              {logoPreview && (
                <img src={logoPreview} alt="معاينة الشعار" className="mt-3 w-24 h-24 object-cover rounded-lg border border-surface-border" />
              )}
              <Input value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder="رابط الشعار الحالي (اختياري)" className="mt-2" />
              <Button type="button" variant="primary" className="mt-2" onClick={() => uploadBrandAsset('logo', logoFile)} disabled={!logoFile || brandingUploading === 'logo'}>{brandingUploading === 'logo' ? 'جارٍ رفع الشعار...' : 'رفع الشعار'}</Button>
            </div>

            <div>
              <label htmlFor="brandName" className="block text-sm font-medium text-ink-700 mb-1">اسم العلامة التجارية</label>
              <Input id="brandName" value={brandName} onChange={(e) => setBrandName(e.target.value)} />
              <label className="mt-4 block text-sm font-medium text-ink-700 mb-1">أيقونة المتصفح (صورة مربعة صغيرة)</label>
              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setFaviconFile(e.target.files?.[0] || null)} className="w-full text-sm" />
              <Button type="button" variant="primary" className="mt-2" onClick={() => uploadBrandAsset('favicon', faviconFile)} disabled={!faviconFile || brandingUploading === 'favicon'}>{brandingUploading === 'favicon' ? 'جارٍ رفع الأيقونة...' : 'رفع أيقونة المتصفح'}</Button>
              {faviconUrl && <p className="mt-2 text-xs text-ink-500">تم حفظ أيقونة المتصفح.</p>}
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-ink-700 mb-2">المظهر الافتراضي</label>
            <div className="flex items-center gap-4">
              <label className="inline-flex items-center gap-2 text-sm text-ink-700">
                <input type="radio" name="theme" checked={theme === 'light'} onChange={() => handleThemeSelect('light')} />
                فاتح
              </label>
              <label className="inline-flex items-center gap-2 text-sm text-ink-700">
                <input type="radio" name="theme" checked={theme === 'dark'} onChange={() => handleThemeSelect('dark')} />
                داكن
              </label>
            </div>
          </div>
          <div className="mt-4"><Button type="button" variant="primary" onClick={() => saveSettings()} disabled={settingsSaving || settingsLoading}>{settingsSaving ? 'جارٍ الحفظ...' : 'حفظ إعدادات الهوية'}</Button></div>
        </section>

        {/* Section 2: Paymob Gateway Integration */}
        <section className="rounded-2xl bg-surface-default shadow-card p-6 mb-4">
          <h2 className="text-lg font-semibold text-ink-900 mb-4">بوابة الدفع (Paymob)</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="paymobApiKey" className="block text-sm font-medium text-ink-700 mb-1">مفتاح Paymob API</label>
              <div className="relative">
                <Input
                  id="paymobApiKey"
                  type={showApiKey ? 'text' : 'password'}
                  value={paymobApiKey}
                  onChange={(e) => setPaymobApiKey(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey((s) => !s)}
                  className="absolute inset-y-0 left-3 flex items-center text-xs text-ink-500"
                  aria-label={showApiKey ? 'إخفاء المفتاح' : 'إظهار المفتاح'}
                >
                  {showApiKey ? 'إخفاء' : 'إظهار'}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="paymobIntegrationId" className="block text-sm font-medium text-ink-700 mb-1">معرّف التكامل (Integration ID)</label>
              <Input id="paymobIntegrationId" value={paymobIntegrationId} onChange={(e) => setPaymobIntegrationId(e.target.value)} />
            </div>
          </div>

          <p className="text-xs text-ink-500 mt-3">
            هذه البيانات تضمن تحويل جميع المبيعات مباشرة إلى حسابك الخاص دون عمولة المنصة.
          </p>

          {paymentSaved && (
            <div className="rounded-md p-3 bg-success-soft text-success-DEFAULT mt-3 text-sm">تم حفظ إعدادات الدفع بنجاح.</div>
          )}

          <div className="mt-4">
            <Button type="button" variant="primary" onClick={handleSavePayment}>حفظ إعدادات الدفع</Button>
          </div>
        </section>

        <section className="rounded-2xl bg-surface-default shadow-card p-6 mb-4 space-y-4">
          <h2 className="text-lg font-semibold text-ink-900">الدعم وقواعد الفيديو والإشعارات</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><Input value={supportPhone} onChange={(e) => setSupportPhone(e.target.value)} placeholder="هاتف الدعم" /><Input value={supportEmail} onChange={(e) => setSupportEmail(e.target.value)} placeholder="بريد الدعم" /><select value={videoDelivery.provider} onChange={(e) => setVideoDelivery((v) => ({ ...v, provider: e.target.value }))} className={fieldClasses}><option value="">رفع محلي</option><option value="bunny">Bunny Stream/CDN</option><option value="cloudflare_stream">Cloudflare Stream</option><option value="external">رابط فيديو خارجي</option></select><Input value={videoDelivery.pullZone} onChange={(e) => setVideoDelivery((v) => ({ ...v, pullZone: e.target.value }))} placeholder="Bunny Pull Zone أو نطاق الفيديو" /><Input type="number" min={1} value={videoDelivery.maxViewsPerLesson} onChange={(e) => setVideoDelivery((v) => ({ ...v, maxViewsPerLesson: e.target.value }))} placeholder="عدد المشاهدات" /><Input type="number" min={1} value={videoDelivery.accessWindowDays} onChange={(e) => setVideoDelivery((v) => ({ ...v, accessWindowDays: e.target.value }))} placeholder="أيام الوصول" /><select value={documentDelivery.provider} onChange={(e) => setDocumentDelivery((d) => ({ ...d, provider: e.target.value }))} className={fieldClasses}><option value="">مرفقات محلية</option><option value="cloudflare_r2">Cloudflare R2</option><option value="external">رابط مستند خارجي</option></select><Input value={documentDelivery.publicBaseUrl} onChange={(e) => setDocumentDelivery((d) => ({ ...d, publicBaseUrl: e.target.value }))} placeholder="رابط نطاق R2 العام أو custom domain" /></div>
          <p className="text-xs text-ink-500">المفاتيح السرية لا تُكتب هنا. استخدم روابط Bunny أو Cloudflare Stream للفيديو وروابط R2 العامة أو الموقعة لملفات PDF داخل محرر الكورس.</p>
          <div className="flex flex-wrap gap-4">{[['smsEnabled', 'رسائل SMS'], ['emailEnabled', 'البريد الإلكتروني'], ['whatsappEnabled', 'واتساب']].map(([key, label]) => <label key={key} className="inline-flex items-center gap-2 text-sm"><input type="checkbox" checked={notificationPreferences[key]} onChange={(e) => setNotificationPreferences((n) => ({ ...n, [key]: e.target.checked }))} />{label}</label>)}</div>
          <Button type="button" variant="primary" onClick={() => saveSettings()} disabled={settingsSaving || settingsLoading}>{settingsSaving ? 'جارٍ الحفظ...' : 'حفظ هذه الإعدادات'}</Button>
        </section>

        {/* Section 3: Assistant Manager */}
        <section className="rounded-2xl bg-surface-default shadow-card p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-ink-900">إدارة المساعدين</h2>
              <div className="text-sm text-ink-500 mt-1">أضف أو عدل صلاحيات المساعدين هنا</div>
            </div>
            {/* FIX: previously two separate buttons both toggled showForm and did
                the same thing (one in the page header, one here) — consolidated
                into a single toggle to avoid duplicated, confusing controls. */}
            <Button onClick={() => setShowForm((s) => !s)} variant="primary">
              {showForm ? 'إغلاق النموذج' : 'إضافة مساعد'}
            </Button>
          </div>

          {showForm && (
            <form onSubmit={handleCreate} className="mb-4 border border-surface-border rounded-lg p-4">
              {formError && (
                <div className="rounded-md p-3 bg-danger-soft text-danger-DEFAULT mb-3 text-sm">{formError}</div>
              )}

              {/* FIX: Input.jsx has no `label` prop — wrapped with explicit <label>s. */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="assistantName" className="block text-sm font-medium text-ink-700 mb-1">الاسم</label>
                  <Input id="assistantName" name="name" value={form.name} onChange={handleFormChange('name')} required />
                </div>
                <div>
                  <label htmlFor="assistantEmail" className="block text-sm font-medium text-ink-700 mb-1">البريد الإلكتروني</label>
                  <Input id="assistantEmail" name="email" type="email" value={form.email} onChange={handleFormChange('email')} required />
                </div>
              </div>

              <div className="mt-3">
                <div className="text-sm font-medium text-ink-900 mb-2">الصلاحيات</div>
                <div className="flex items-center gap-3 flex-wrap">
                  <label className="inline-flex items-center gap-2">
                    <input type="checkbox" checked={form.can_upload_video} onChange={handleFormChange('can_upload_video')} />
                    <span className="text-sm text-ink-700">رفع الفيديوهات</span>
                  </label>
                  <label className="inline-flex items-center gap-2">
                    <input type="checkbox" checked={form.can_grade_exams} onChange={handleFormChange('can_grade_exams')} />
                    <span className="text-sm text-ink-700">تصحيح الاختبارات</span>
                  </label>
                  <label className="inline-flex items-center gap-2">
                    <input type="checkbox" checked={form.can_create_quizzes} onChange={handleFormChange('can_create_quizzes')} />
                    <span className="text-sm text-ink-700">إنشاء اختبارات المحاضرات</span>
                  </label>
                  <label className="inline-flex items-center gap-2">
                    <input type="checkbox" checked={form.can_generate_access_codes} onChange={handleFormChange('can_generate_access_codes')} />
                    <span className="text-sm text-ink-700">توليد أكواد الوصول</span>
                  </label>
                  <label className="inline-flex items-center gap-2">
                    <input type="checkbox" checked={form.can_generate_wallet_codes} onChange={handleFormChange('can_generate_wallet_codes')} />
                    <span className="text-sm text-ink-700">توليد أكواد شحن المحفظة</span>
                  </label>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-3">
                <Button type="submit" variant="primary" disabled={creating}>
                  {creating ? 'جاري الإنشاء...' : 'إنشاء ودعوة'}
                </Button>
                {/* FIX: variant="outline" doesn't exist in Button.jsx (only primary/ghost/subtle). */}
                <Button type="button" variant="ghost" onClick={() => { setShowForm(false); resetForm(); }}>
                  إلغاء
                </Button>
              </div>

              {inviteLink && (
                <div className="mt-4">
                  <label htmlFor="inviteLink" className="block text-sm font-medium text-ink-700 mb-1">رابط الدعوة</label>
                  <div className="flex items-center gap-3">
                    <Input id="inviteLink" value={inviteLink} readOnly />
                    <Button type="button" variant="primary" onClick={copyInvite}>نسخ</Button>
                  </div>
                  {copyFeedback && <p className="text-xs text-ink-500 mt-1">{copyFeedback}</p>}
                </div>
              )}
            </form>
          )}

          {editError && (
            <div className="rounded-md p-3 bg-danger-soft text-danger-DEFAULT mb-3 text-sm">{editError}</div>
          )}
          {assistantActionError && (
            <div role="alert" className="rounded-md p-3 bg-danger-soft text-danger-DEFAULT mb-3 text-sm">{assistantActionError}</div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-right" dir="rtl">
              <thead>
                <tr className="text-xs text-ink-500">
                  <th className="py-2 px-3">الاسم</th>
                  <th className="py-2 px-3">البريد</th>
                  <th className="py-2 px-3">الحالة</th>
                  <th className="py-2 px-3">الصلاحيات</th>
                  <th className="py-2 px-3">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {assistants.map((a) => (
                  <tr key={a.id} className="border-t border-surface-border">
                    <td className="py-3 px-3 text-sm font-medium">{a.name}</td>
                    <td className="py-3 px-3 text-sm text-ink-700">{a.email}</td>
                    <td className="py-3 px-3">
                      {a.inviteStatus === 'pending' ? (
                        <Badge variant="neutral">قيد الدعوة</Badge>
                      ) : a.isActive === false ? (
                        <Badge variant="danger">معلّق</Badge>
                      ) : (
                        <Badge variant="success">نشط</Badge>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      {editingId === a.id ? (
                        <div className="flex items-center gap-2 flex-wrap">
                          {ASSISTANT_PERMISSION_KEYS.map((key) => (
                            <label key={key} className="inline-flex items-center gap-2 text-sm">
                              <input
                                type="checkbox"
                                checked={!!editingPermissions[key]}
                                onChange={() => toggleEditPermission(key)}
                              />
                              <span>{permissionLabel(key)}</span>
                            </label>
                          ))}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 flex-wrap">
                          {Object.entries(a.permissions || {}).map(([k, v]) => (
                            <Badge key={k} variant={v ? 'brand' : 'neutral'} className="text-xs">
                              {permissionLabel(k)}{v ? '' : ' (مقيد)'}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      {editingId === a.id ? (
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="primary" onClick={() => savePermissions(a.id)}>حفظ</Button>
                          <Button size="sm" variant="ghost" onClick={cancelEdit}>إلغاء</Button>
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          <Button size="sm" variant="ghost" onClick={() => startEdit(a)}>تعديل الصلاحيات</Button>
                          {a.inviteStatus !== 'pending' && (a.isActive === false ? (
                            <Button size="sm" variant="primary" onClick={() => setAssistantAction({ type: 'reactivate', assistant: a })}>إعادة تفعيل</Button>
                          ) : (
                            <Button size="sm" variant="ghost" onClick={() => setAssistantAction({ type: 'suspend', assistant: a })}>تعليق</Button>
                          ))}
                          <Button size="sm" variant="subtle" className="text-danger-DEFAULT" onClick={() => setAssistantAction({ type: 'delete', assistant: a })}>حذف</Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {assistants.length === 0 && (
                  <tr>
                    <td colSpan="5" className="py-6 text-center text-ink-500">لا يوجد مساعدين بعد</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <AssistantActionModal action={assistantAction} onCancel={() => setAssistantAction(null)} onConfirm={executeAssistantAction} working={assistantActionWorking} />
        </section>

        {/* Section 4: Lecture Access Codes */}
        <section className="rounded-2xl bg-surface-default shadow-card p-6 mb-4">
          <h2 className="text-lg font-semibold text-ink-900 mb-4">أكواد الوصول للمحاضرات</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
            <div>
              <label htmlFor="codeCount" className="block text-sm font-medium text-ink-700 mb-1">عدد الأكواد</label>
              <Input id="codeCount" type="number" min={1} value={codeCount} onChange={(e) => setCodeCount(e.target.value)} />
            </div>
            <div>
              <label htmlFor="codeCourse" className="block text-sm font-medium text-ink-700 mb-1">المحاضرة</label>
              <select id="codeCourse" value={codeCourseId} onChange={(e) => setCodeCourseId(e.target.value)} className={fieldClasses}>
                {courses.map((c) => (
                  <option key={c._id} value={c._id}>{c.title_ar || c.title_en}</option>
                ))}
              </select>
            </div>
            <Button type="button" variant="primary" onClick={handleGenerateCodes}>توليد</Button>
          </div>

          {generatedCodes.length > 0 && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-ink-700">{generatedCodes.length} كود تم توليده</span>
                <Button size="sm" variant="subtle" onClick={copyAllCodes}>نسخ الكل</Button>
              </div>
              {codesCopyFeedback && <p className="text-xs text-ink-500 mb-2">{codesCopyFeedback}</p>}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {generatedCodes.map((code) => (
                  <div key={code} className="flex items-center justify-between rounded-md bg-surface-muted px-3 py-2 text-sm font-mono text-ink-900">
                    <code>{code}</code><Button type="button" size="sm" variant="ghost" onClick={() => copyGeneratedCode(code)} aria-label="نسخ الكود">{copiedGeneratedCode === code ? '✓' : 'نسخ'}</Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Logo from './Logo';
import ConfirmModal from '../ui/ConfirmModal';

export default function Footer() {
  const [showParentGuide, setShowParentGuide] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const goHome = (event) => {
    event.preventDefault();
    if (location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/');
    }
  };

  const goToTeachers = (event) => {
    event.preventDefault();
    if (location.pathname === '/') {
      document.getElementById('teachers-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      navigate('/', { state: { scrollTo: 'teachers-section' } });
    }
  };

  return (
    <footer className="border-t border-surface-border bg-surface-default text-ink-900">
      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-5">
          <div className="text-right">
            <Logo className="mb-3" />
            <p className="text-sm leading-6 text-ink-600">كل اللي محتاجه عشان تتعلم وتطوّر مستواك، موجود في مكان واحد.</p>
          </div>

          <div className="text-right">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-ink-900">روابط سريعة</h3>
            <ul className="mt-4 space-y-3 text-sm text-ink-600">
              <li><a href="/" onClick={goHome} className="transition hover:text-ink-900">الصفحة الرئيسية</a></li>
              <li><a href="/#teachers-section" onClick={goToTeachers} className="transition hover:text-ink-900">تصفح المعلمين</a></li>
            </ul>
          </div>

          <div className="text-right">
            <ul className="mt-4 space-y-3 text-sm text-ink-600">
              <li><button type="button" onClick={() => setShowParentGuide(true)} className="text-right transition hover:text-ink-900">لو انت ولي امر تقدر تتابع ابنك ازاي؟</button></li>
            </ul>
          </div>

          <div className="text-right">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-ink-900">الدعم الفني</h3>
            <ul className="mt-4 space-y-3 text-sm text-ink-600">
              <li><a href="https://wa.me/201060369537" target="_blank" rel="noopener noreferrer" className="transition hover:text-ink-900">تواصل مع الدعم الفني</a></li>
            </ul>
          </div>

          <div className="text-right">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-ink-900">لو عايز تبدأ منصتك تواصل معانا</h3>
            <ul className="mt-4 space-y-3 text-sm text-ink-600">
              <li><a href="https://wa.me/201060369537" target="_blank" rel="noopener noreferrer" className="transition hover:text-ink-900">01060369537</a></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-surface-border bg-surface-muted px-4 py-4 text-center text-xs text-ink-500 sm:px-6 lg:px-8">
        <div>© {new Date().getFullYear()} <Logo className="inline-flex align-middle" />. كل الحقوق محفوظة.</div>
        <div>تم إنشاء المنصة بواسطة المهندس عبدالرحمن محسن زغلول</div>
      </div>
      {showParentGuide && <ConfirmModal title="متابعة ابنك من حساب ولي الأمر" description={<ol className="list-inside list-decimal space-y-2 text-right"><li>أنشئ حسابًا جديدًا أو سجّل الدخول كولي أمر.</li><li>اطلب من ابنك كود الربط الذي يظهر له في لوحة الطالب؛ هذا هو <span dir="ltr">parentAccessCode</span> الخاص بحسابه.</li><li>أدخل كود الربط عند التسجيل ليتم ربط حسابك بحساب ابنك.</li><li>بعد الدخول، ستجد في لوحة ولي الأمر دورات ابنك ودرجاته.</li></ol>} confirmLabel="حسنًا" cancelLabel="إغلاق" onConfirm={() => setShowParentGuide(false)} onCancel={() => setShowParentGuide(false)} />}
    </footer>
  );
}

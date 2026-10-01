export const route = {
  path: '/:instructorId/translator',
  index: false,
  auth: 'student',
  title: 'المترجم والقاموس الناطق',
};

import React from 'react';
import Translator from '../../features/translator/Translator.jsx';

export default function TranslatorPage() {
  return <main dir="rtl" className="mx-auto max-w-7xl space-y-5">
    <div>
      <p className="text-sm font-semibold text-brand-600">أداة مجانية للتعلّم</p>
      <h1 className="mt-1 text-2xl font-extrabold text-ink-900 sm:text-3xl">المترجم والقاموس الناطق</h1>
      <p className="mt-2 text-sm leading-6 text-ink-500">ترجمة عربية وإنجليزية مع نطق واضح وتفاصيل الكلمات.</p>
    </div>
    <Translator />
  </main>;
}

// src/pages/public/StageSelectorPage.jsx
export const route = {
  path: '/:instructorId/stages',
  index: false,
  auth: null,
  title: 'اختر المرحلة الدراسية'
};

import React, { useContext, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { InstructorContext } from '../../contexts/InstructorContext';
import Avatar from '../../components/ui/Avatar';
import Button from '../../components/ui/Button';
import { STAGES as stages } from '../../constants/stages';

export default function StageSelectorPage() {
  const { instructorId } = useParams();
  const navigate = useNavigate();
  const { selected } = useContext(InstructorContext) || {};
  const instructor = selected || null;

  const handleChoose = (stage) => {
    const id = instructorId || (instructor && (instructor.id || instructor._id || instructor.name));
    if (!id) return;
    navigate(`/${id}/stages/${stage.id}/plans`);
  };

  const gridCols = 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6';

  return (
    <div className="min-h-screen bg-surface-canvas text-ink-900" dir="rtl">
      {/* Header banner */}
      <header className="bg-surface-default border-b border-surface-border">
        <div className="container mx-auto px-4 py-6 flex items-center gap-4">
          <Avatar src={instructor?.avatar} name={instructor?.name || 'المدرس'} size="lg" />
          <div className="flex-1 text-right">
            <div className="text-2xl font-semibold text-ink-900">{instructor?.name || 'اختر مدرس'}</div>
            <div className="text-sm text-ink-600 mt-1">اختر مرحلتك الدراسية للانتقال إلى المسارات والدورات المناسبة</div>
          </div>
          <div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/')}>تغيير المدرس</Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6 text-right">
          <h1 className="text-xl font-semibold text-ink-900">اختر المرحلة الدراسية</h1>
          <p className="text-sm text-ink-600 mt-1">اختر المرحلة المناسبة لعرض المسارات والدورات المتاحة</p>
        </div>

        <div className={gridCols}>
          {stages.map((stage) => (
            <button
              key={stage.id}
              onClick={() => handleChoose(stage)}
              className="bg-surface-default rounded-2xl shadow-card p-6 text-center hover:scale-[1.02] transition-transform flex flex-col items-center justify-center"
            >
              <div className="text-lg font-semibold text-ink-900">{stage.label}</div>
              <div className="text-sm text-ink-600 mt-2">محتوى مُنسق حسب المرحلة</div>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}

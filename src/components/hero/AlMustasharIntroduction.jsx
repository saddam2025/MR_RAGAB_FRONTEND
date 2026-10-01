import React, { useRef } from 'react';
import { Star } from 'lucide-react';
import Button from '../ui/Button';
import useHeroParallax from '../../hooks/useHeroParallax';
import BigBen from './illustrations/BigBen';
import TowerBridge from './illustrations/TowerBridge';
import LondonDecorations from './LondonDecorations';
import './GeometricHero.css';
import './AlMustasharIntroduction.css';

export default function AlMustasharIntroduction({ showActions = false, onStart, onContent }) {
  const artRef = useRef(null);
  useHeroParallax(artRef);

  return <div className="relative grid items-center gap-8 px-6 py-8 lg:grid-cols-[1.05fr_.95fr] lg:gap-12 lg:px-10 lg:py-11" dir="ltr">
    <div ref={artRef} className="ragab-intro__art" dir="ltr" aria-label="معالم لندن وزخارف تعليمية باللغة الإنجليزية">
      <div className="ragab-intro__glow" aria-hidden="true" />
      <LondonDecorations />
      <div className="ragab-intro__landmark ragab-intro__landmark--bridge hero-parallax" data-depth="0.3" data-range="8">
        <div className="hero-float" style={{ '--float-duration': '12s', '--float-delay': '-4s' }}><TowerBridge /></div>
      </div>
      <div className="ragab-intro__landmark ragab-intro__landmark--big-ben hero-parallax" data-depth="0.35" data-range="7">
        <div className="hero-float" style={{ '--float-duration': '10s', '--float-delay': '-2s' }}><BigBen /></div>
      </div>
      <div className="ragab-intro__person">
        <img
          className="ragab-intro__person-image hero-parallax"
          src="/assets/instructor-transparent.png"
          alt="مستر رجب صديق"
          width="800"
          height="1280"
          loading="eager"
          data-depth="0.2"
          data-range="5"
        />
      </div>
    </div>

    <div className="ragab-intro__copy" dir="rtl">
      <span className="ragab-intro__badge">اللغة الإنجليزية</span>
      <h1 className="ragab-intro__title"><span>رجب صديق</span><span>المستشار</span></h1>
      <div className="ragab-intro__paragraphs">
        <p>معلم خبير في تدريس اللغة الإنجليزية، متخصص في المرحلة الثانوية: البكالوريا والثانوية العامة والأزهر الشريف.</p>
        <p>حاصل على تمهيدي الماجستير في اللغة الإنجليزية من جامعة سوهاج، ودبلومة تربوية في تدريس اللغة الإنجليزية (<bdi dir="ltr">Micro-teaching</bdi>) من جامعة ستراثكلايد — اسكتلندا — المملكة المتحدة.</p>
        <p>هدفي إن كل طالب يفهم مش يحفظ، ويتدرب على أفكار الامتحان، ويشوف تقدمه بنفسه خطوة بخطوة.</p>
      </div>
      <blockquote className="ragab-intro__quote">
        <Star size={20} aria-hidden="true" />
        <p>«ما كُتب لك سيأتيك.. فاجتهد وثق بالله واستمر في المحاولة»</p>
      </blockquote>
      <p className="ragab-intro__signature">المستشار رجب صديق</p>
      {showActions && <div className="ragab-intro__actions">
        <Button size="lg" onClick={onStart}>ابدأ دلوقتي</Button>
        <Button variant="ghost" size="lg" className="!bg-white/10 !text-white hover:!bg-white/20" onClick={onContent}>شوف المحتوى</Button>
      </div>}
    </div>
  </div>;
}

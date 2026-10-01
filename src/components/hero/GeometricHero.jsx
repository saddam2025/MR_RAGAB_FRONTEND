import React, { useRef } from 'react';
import useHeroParallax from '../../hooks/useHeroParallax';
import BigBen from './illustrations/BigBen';
import TowerBridge from './illustrations/TowerBridge';
import LondonDecorations from './LondonDecorations';
import './GeometricHero.css';

export default function GeometricHero({ personSrc = '/assets/instructor-transparent.png', personAlt = 'مدرس المنصة', instructorName, subdomain, subject, location, tagline, onCtaClick, ctaLabel = 'شوف المحتوى', targetId = 'content', loading = false }) {
  const ref = useRef(null);
  useHeroParallax(ref);

  const handleCtaClick = () => {
    if (onCtaClick) {
      onCtaClick();
      return;
    }
    document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return <section ref={ref} className="geometric-hero" dir="rtl">
    <div className="geometric-hero__art" dir="ltr" aria-hidden="true">
      <LondonDecorations />
      <div className="geometric-hero__landmark geometric-hero__landmark--bridge hero-parallax" data-depth="0.38" data-range="8">
        <div className="hero-float" style={{ '--float-duration': '12s', '--float-delay': '-4s' }}><TowerBridge /></div>
      </div>
      <div className="geometric-hero__landmark geometric-hero__landmark--big-ben hero-parallax" data-depth="0.62" data-range="7">
        <div className="hero-float" style={{ '--float-duration': '10s', '--float-delay': '-2s' }}><BigBen /></div>
      </div>
    </div>
    <div className="geometric-hero__glow" aria-hidden="true" />
    {!loading && <img src={personSrc} alt={personAlt} width="1141" height="1280" loading="eager" fetchPriority="high" className="geometric-hero__person hero-parallax" data-depth="0.3" data-range="6" />}
    <div className="geometric-hero__identity" aria-live="polite">
      {loading ? <span>جارٍ تحميل المنصات المتاحة...</span> : instructorName ? <><h3>{instructorName}</h3>{subdomain && <p dir="ltr">{subdomain}</p>}{(subject || location || tagline) && <small>{[subject, location, tagline].filter(Boolean).join(' · ')}</small>}</> : <span>لا توجد منصات متاحة حاليًا.</span>}
    </div>
    {!loading && instructorName && <button type="button" onClick={handleCtaClick} className="geometric-hero__cta hero-parallax" data-depth="0.4" data-range="6">{ctaLabel}</button>}
  </section>;
}

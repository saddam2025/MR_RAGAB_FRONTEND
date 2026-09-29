import React, { useRef } from 'react';
import useHeroParallax from '../../hooks/useHeroParallax';
import './GeometricHero.css';

const SHAPES = [
  { id: 'orb', type: 'circle', cx: 588, cy: 520, r: 372, fill: true, depth: 0.3, duration: 12 },
  { id: 'triangle-nw', type: 'polygon', points: '325,132 155,400 470,400', fill: true, depth: 0.5, duration: 9 },
  { id: 'circle-nw', type: 'circle', cx: 200, cy: 255, r: 48, depth: 0.9, duration: 8 },
  { id: 'triangle-w', type: 'polygon', points: '310,312 90,545 335,545', fill: true, depth: 0.7, duration: 10 },
  { id: 'square-sw', type: 'rect', x: 168, y: 567, width: 100, height: 98, fill: true, strong: true, depth: 1, duration: 10 },
  { id: 'triangle-sw', type: 'polygon', points: '320,690 225,790 420,790', depth: 0.5, duration: 11 },
  { id: 'rect-n', type: 'rect', x: 365, y: 272, width: 165, height: 118, fill: true, depth: 0.6, duration: 9 },
  { id: 'triangle-ne', type: 'polygon', points: '790,125 680,320 905,320', fill: true, depth: 0.6, duration: 10 },
  { id: 'hexagon-e', type: 'polygon', points: '748,232 948,232 1042,396 948,560 748,560 654,396', fill: true, depth: 0.45, duration: 12 },
  { id: 'rect-e', type: 'rect', x: 855, y: 435, width: 200, height: 160, depth: 0.8, duration: 8 },
  { id: 'circle-se', type: 'circle', cx: 1035, cy: 577, r: 48, depth: 1, duration: 9 },
  { id: 'small-circle', type: 'circle', cx: 1003, cy: 647, r: 11, depth: 1.1, duration: 8, mobileHide: true },
];
const dots = (x, y, cols, rows, gap = 18) => Array.from({ length: cols * rows }, (_, i) => ({ cx: x + (i % cols) * gap, cy: y + Math.floor(i / cols) * gap }));
const DOTS = [
  ...dots(820, 105, 8, 4).map((dot) => ({ ...dot, group: 'dots-ne', depth: 0.8, mobileHide: true })),
  ...dots(85, 325, 7, 6).map((dot) => ({ ...dot, group: 'dots-w', depth: 0.8 })),
  ...dots(915, 685, 9, 2).map((dot) => ({ ...dot, group: 'dots-se', depth: 0.8, mobileHide: true })),
];

export default function GeometricHero({ personSrc = '/assets/instructor-transparent.png', personAlt = 'مدرس المنصة', instructorName, subdomain, subject, location, tagline, onCtaClick, loading = false }) {
  const ref = useRef(null);
  useHeroParallax(ref);
  return <section ref={ref} className="geometric-hero" dir="rtl">
    <svg dir="ltr" viewBox="0 0 1152 928" preserveAspectRatio="xMidYMid slice" className="geometric-hero__shapes" aria-hidden="true">
      {SHAPES.map((shape) => <g key={shape.id} className={`hero-parallax ${shape.mobileHide ? 'hero-shape--small' : ''}`} data-depth={shape.depth} data-range="24">
        <g className="hero-shape-float" style={{ '--float-duration': `${shape.duration}s`, '--float-delay': `${-shape.duration / 2}s` }}>
          {shape.type === 'circle' && <circle cx={shape.cx} cy={shape.cy} r={shape.r} className={`hero-shape ${shape.fill ? 'hero-shape--fill' : ''} ${shape.strong ? 'hero-shape--strong' : ''}`} />}
          {shape.type === 'polygon' && <polygon points={shape.points} className={`hero-shape ${shape.fill ? 'hero-shape--fill' : ''} ${shape.strong ? 'hero-shape--strong' : ''}`} />}
          {shape.type === 'rect' && <rect x={shape.x} y={shape.y} width={shape.width} height={shape.height} className={`hero-shape ${shape.fill ? 'hero-shape--fill' : ''} ${shape.strong ? 'hero-shape--strong' : ''}`} />}
        </g>
      </g>)}
      <g className="hero-parallax hero-decoration--line" data-depth="0.4" data-range="24"><line x1="60" y1="545" x2="275" y2="830" /></g>
      <g className="hero-parallax hero-decoration--line hero-shape--small" data-depth="0.4" data-range="24"><line x1="1015" y1="275" x2="870" y2="560" /></g>
      <g className="hero-parallax hero-dots" data-depth="0.8" data-range="24"><circle cx="413" cy="133" r="3" /></g>
      <g className="hero-parallax hero-dots" data-depth="0.8" data-range="24"><circle cx="885" cy="188" r="3" /></g>
      <g className="hero-parallax hero-dots" data-depth="0.8" data-range="24"><circle cx="113" cy="641" r="3" /></g>
      {DOTS.map((dot, index) => <g key={`${dot.group}-${index}`} className={`hero-parallax hero-dots ${dot.mobileHide ? 'hero-shape--small' : ''}`} data-depth={dot.depth} data-range="24" style={{ '--dot-delay': `${-index * 0.07}s` }}><circle cx={dot.cx} cy={dot.cy} r="1.6" /></g>)}
    </svg>
    <div className="geometric-hero__glow" aria-hidden="true" />
    {!loading && <img src={personSrc} alt={personAlt} width="1141" height="1280" loading="eager" fetchPriority="high" className="geometric-hero__person hero-parallax" data-depth="0.3" data-range="8" />}
    <div className="geometric-hero__identity" aria-live="polite">
      {loading ? <span>جارٍ تحميل المنصات المتاحة...</span> : instructorName ? <><h3>{instructorName}</h3>{subdomain && <p dir="ltr">{subdomain}</p>}{(subject || location || tagline) && <small>{[subject, location, tagline].filter(Boolean).join(' · ')}</small>}</> : <span>لا توجد منصات متاحة حاليًا.</span>}
    </div>
    {!loading && instructorName && <button type="button" onClick={onCtaClick} className="geometric-hero__cta hero-parallax" data-depth="0.4" data-range="10">شوف المحتوى</button>}
  </section>;
}

import React from 'react';

const DECORATIONS = [
  { id: 'book', x: '7%', y: '72%', depth: '.6', duration: '9s', type: 'book', className: 'deco--book' },
  { id: 'letters', x: '28%', y: '14%', depth: '.9', duration: '8s', type: 'letters', className: 'deco--letters' },
  { id: 'bubble', x: '76%', y: '13%', depth: '.8', duration: '10s', type: 'bubble', className: 'deco--bubble' },
  { id: 'bus', x: '59%', y: '70%', depth: '.4', duration: '11s', type: 'bus', className: 'deco--bus' },
  { id: 'booth', x: '22%', y: '79%', depth: '1', duration: '7s', type: 'booth', className: 'deco--booth' },
  { id: 'postbox', x: '88%', y: '80%', depth: '1', duration: '8s', type: 'postbox', className: 'deco--postbox' },
  { id: 'flag', x: '31%', y: '5%', depth: '.3', duration: '12s', type: 'flag', className: 'deco--flag' },
  { id: 'cap', x: '48%', y: '34%', depth: '.7', duration: '9s', type: 'cap', className: 'deco--cap' },
  { id: 'cloud-one', x: '6%', y: '25%', depth: '.5', duration: '25s', type: 'cloud', className: 'deco--cloud deco--drift' },
  { id: 'cloud-two', x: '83%', y: '39%', depth: '.35', duration: '28s', type: 'cloud', className: 'deco--cloud deco--drift' },
  { id: 'birds-one', x: '58%', y: '10%', depth: '.2', duration: '19s', type: 'birds', className: 'deco--birds deco--drift' },
  { id: 'birds-two', x: '40%', y: '21%', depth: '.25', duration: '22s', type: 'birds', className: 'deco--birds deco--drift' },
];

function DecorationShape({ type }) {
  if (type === 'letters') return <span className="deco-letters"><span>A</span><span>B</span><span>C</span></span>;
  if (type === 'bubble') return <span className="deco-bubble">Hello</span>;
  if (type === 'book') return <svg viewBox="0 0 90 64"><path className="deco-book-cover" d="M5 12q19-9 40 3v42Q24 45 5 55zm80 0q-19-9-40 3v42q21-12 40-2z" /><path className="deco-book-page" d="M12 18q14-5 27 2v29q-14-7-27-1zm66 0q-14-5-27 2v29q14-7 27-1z" /><path className="deco-book-line" d="M18 26h16m-16 7h16m22-7h16m-16 7h16" /></svg>;
  if (type === 'bus') return <svg viewBox="0 0 120 70"><path className="deco-red" d="M13 9h94q6 0 6 7v40H7V15q0-6 6-6" /><path className="deco-glass" d="M15 16h42v19H15zm49 0h41v19H64z" /><path className="deco-gold" d="M13 40h94v9H13z" /><path className="deco-wheel" d="M23 51a9 9 0 1 0 0 18 9 9 0 0 0 0-18m73 0a9 9 0 1 0 0 18 9 9 0 0 0 0-18" /></svg>;
  if (type === 'booth') return <svg viewBox="0 0 64 110"><path className="deco-red" d="M12 7h40l5 96H7z" /><path className="deco-red-shadow" d="M18 14h28v79H18z" /><path className="deco-glass" d="M22 20h20v18H22zm0 25h20v18H22z" /><path className="deco-gold" d="M15 10h34v6H15z" /></svg>;
  if (type === 'postbox') return <svg viewBox="0 0 65 90"><path className="deco-red" d="M13 30a19 19 0 0 1 39 0v52H13z" /><path className="deco-red-shadow" d="M18 45h29v5H18z" /><path className="deco-gold" d="M23 23h19v4H23z" /></svg>;
  if (type === 'flag') return <svg viewBox="0 0 80 62"><path className="deco-pole" d="M14 7v50" /><path className="deco-flag" d="M17 10h54v34H17z" /><path className="deco-flag-cross" d="m18 11 52 32M70 11 18 43M44 10v34M18 27h53" /><path className="deco-flag-red-cross" d="m18 11 52 32M70 11 18 43M44 10v34M18 27h53" /></svg>;
  if (type === 'cap') return <svg viewBox="0 0 90 64"><path className="deco-navy" d="m5 24 40-19 40 19-40 20z" /><path className="deco-gold" d="M22 34v14q23 18 46 0V34L45 46z" /><path className="deco-cap-tassel" d="M82 26v20" /></svg>;
  if (type === 'cloud') return <svg viewBox="0 0 110 60"><path className="deco-cloud-shape" d="M20 47a15 15 0 0 1-2-30 25 25 0 0 1 47-4 18 18 0 0 1 27 17 15 15 0 0 1-3 17z" /></svg>;
  return <svg viewBox="0 0 80 40"><path className="deco-bird" d="m5 22 13-12 14 11 14-11 13 12m-2 9 9-8 9 8" /></svg>;
}

export default function LondonDecorations() {
  const renderItem = (item) => <div key={item.id} className={`london-deco ${item.className} hero-parallax`} data-depth={item.depth} data-range="20" style={{ left: item.x, top: item.y }}>
    <div className="hero-float" style={{ '--float-duration': item.duration, '--float-delay': `-${Number.parseFloat(item.duration) / 2}s` }}><DecorationShape type={item.type} /></div>
  </div>;

  return <div className="london-decorations" dir="ltr" aria-hidden="true">
    <div className="london-decorations__ambient">{DECORATIONS.filter((item) => ['cloud', 'birds'].includes(item.type)).map(renderItem)}</div>
    <div className="london-decorations__foreground">{DECORATIONS.filter((item) => !['cloud', 'birds'].includes(item.type)).map(renderItem)}</div>
  </div>;
}

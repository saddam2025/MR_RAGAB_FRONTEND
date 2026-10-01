import React from 'react';

export default function BigBen() {
  return <svg className="london-illustration london-illustration--big-ben" viewBox="0 0 280 840" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false">
    <path className="lm-outline" d="M46 824 55 370 72 321 72 245 91 220 91 176 108 143 108 96 140 16 172 96 172 143 189 176 189 220 208 245 208 321 225 370 234 824Z" />
    <path className="lm-stone" d="M58 812 66 374 82 326 82 250 101 225 101 180 118 148 118 100 140 43 162 100 162 148 179 180 179 225 198 250 198 326 214 374 222 812Z" />
    <path className="lm-stone-shadow" d="M58 812 66 374 82 326 82 250 101 225 101 180 118 148 118 100 140 43 140 812Z" opacity=".24" />
    <path className="lm-roof" d="m112 102 28-77 28 77-9 8h-38z" />
    <path className="lm-gold-stroke" d="M140 25V5m-9 13h18" />
    <path className="lm-outline" d="M107 149h66m-78 33h90m-97 45h104m-116 25h128m-136 77h144m-153 48h162m-169 425h180" />
    <path className="lm-roof" d="M108 177h64v48h-64zm-18 68h100v14H90z" />
    <path className="lm-dial-frame" d="M102 278h76v76h-76z" />
    <circle className="lm-dial" cx="140" cy="316" r="30" />
    <circle className="lm-gold-stroke" cx="140" cy="316" r="32" />
    <g className="lm-clock-markers">
      <text x="140" y="295" textAnchor="middle">XII</text>
      <text x="164" y="319" textAnchor="middle">III</text>
      <text x="140" y="342" textAnchor="middle">VI</text>
      <text x="116" y="319" textAnchor="middle">IX</text>
      <path d="m140 316 0-16m0 16 13 8" className="lm-clock-hands" />
    </g>
    <path className="lm-window" d="M118 400q22-32 44 0v37h-44zm0 96q22-32 44 0v37h-44zm0 96q22-32 44 0v37h-44zm0 96q22-32 44 0v37h-44z" />
    <path className="lm-outline" d="M108 439h64m-64 96h64m-64 96h64m-64 96h64M88 388h104m-104 56h104m-104 96h104m-104 96h104m-104 96h104M76 796h128" />
    <path className="lm-roof" d="m62 376 18-53 18 53zm120 0 18-53 18 53z" />
    <path className="lm-stone-shadow" d="M48 824h184v-13H48z" />
    <path className="lm-outline" d="M42 824h196" />
  </svg>;
}

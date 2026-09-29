import React from 'react';
import PropTypes from 'prop-types';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import normalizeMathLatex from './normalizeMathLatex';
import MATH_MACROS from './mathMacros';

const MATH_SEGMENT_PATTERN = /(\$[^$\r\n]+\$)/g;

export default function MathText({ content, className = '' }) {
  const parts = String(content || '').split(MATH_SEGMENT_PATTERN);

  return <span dir="auto" className={className}>{parts.map((part, index) => {
    if (part.startsWith('$') && part.endsWith('$')) {
      const math = normalizeMathLatex(part.slice(1, -1));
      const markup = katex.renderToString(math, { throwOnError: false, trust: false, strict: 'ignore', macros: MATH_MACROS });
      return <span key={`${part}-${index}`} dir="ltr" className="inline-block max-w-full align-middle [unicode-bidi:isolate]" dangerouslySetInnerHTML={{ __html: markup }} />;
    }
    return <React.Fragment key={`${part}-${index}`}>{part}</React.Fragment>;
  })}</span>;
}

MathText.propTypes = {
  content: PropTypes.string,
  className: PropTypes.string,
};

import React from 'react';
import PropTypes from 'prop-types';
import MathText from '../math/MathText';
import { resolveApiAssetUrl } from '../../services/api';

export default function QuestionStemDisplay({ question }) {
  if (question?.stemType === 'image' && question.imageUrl) {
    return <div className="overflow-hidden rounded-xl border border-surface-border bg-surface-muted p-3 sm:p-4"><img src={resolveApiAssetUrl(question.imageUrl)} alt="صورة السؤال" className="mx-auto max-h-[70vh] w-full object-contain" /></div>;
  }
  return <MathText content={question?.text || ''} />;
}

QuestionStemDisplay.propTypes = { question: PropTypes.shape({ text: PropTypes.string, stemType: PropTypes.string, imageUrl: PropTypes.string }).isRequired };

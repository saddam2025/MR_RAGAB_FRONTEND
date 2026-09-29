import React from 'react';
import PropTypes from 'prop-types';
import Button from '../ui/Button';
import MathText from '../math/MathText';
import QuestionStemDisplay from './QuestionStemDisplay';

export default function QuizQuestionNavigator({ questions, currentIndex, answers, onSelect, onPrevious, onNext, submitting, submitLabel }) {
  const question = questions[currentIndex];
  const isLast = currentIndex === questions.length - 1;
  if (!question) return null;

  return (
    <>
      <div className="flex items-center gap-2" aria-label="تقدم الإجابة">
        {questions.map((item, index) => <span key={item._id || item.id || index} className={`h-2.5 w-2.5 rounded-full ${index === currentIndex ? 'bg-brand-500' : answers[index] != null ? 'bg-brand-200' : 'bg-surface-muted'}`} />)}
      </div>
      <div className="space-y-4 rounded-2xl bg-surface-default p-6 shadow-card">
        <div className="text-lg font-medium text-ink-900"><QuestionStemDisplay question={question} /></div>
        <div className="space-y-2">
          {question.options.map((option, optionIndex) => {
            const selected = answers[currentIndex] === optionIndex;
            return <button key={optionIndex} type="button" disabled={submitting} onClick={() => onSelect(optionIndex)} className={`w-full rounded-lg border px-4 py-3 text-right transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-brand-500/50 ${selected ? 'border-brand-500 bg-brand-50 text-ink-900' : 'border-transparent bg-surface-muted text-ink-700 hover:border-surface-border'}`}><MathText content={option} /></button>;
          })}
        </div>
      </div>
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onPrevious} disabled={currentIndex === 0 || submitting}>السابق</Button>
        <Button variant="primary" onClick={onNext} disabled={answers[currentIndex] == null || submitting}>{isLast ? submitLabel : 'التالي'}</Button>
      </div>
    </>
  );
}

QuizQuestionNavigator.propTypes = {
  questions: PropTypes.arrayOf(PropTypes.shape({ text: PropTypes.string, options: PropTypes.arrayOf(PropTypes.string) })).isRequired,
  currentIndex: PropTypes.number.isRequired,
  answers: PropTypes.arrayOf(PropTypes.number),
  onSelect: PropTypes.func.isRequired,
  onPrevious: PropTypes.func.isRequired,
  onNext: PropTypes.func.isRequired,
  submitting: PropTypes.bool,
  submitLabel: PropTypes.string,
};

QuizQuestionNavigator.defaultProps = { answers: [], submitting: false, submitLabel: 'إنهاء الاختبار' };

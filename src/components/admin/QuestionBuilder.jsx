import React from 'react';
import PropTypes from 'prop-types';
import Button from '../ui/Button';
import Input from '../ui/Input';
import MathEquationInput from '../math/MathEquationInput';
import QuestionStemInput from './QuestionStemInput';

// Shared by lecture quizzes and standalone exams so question shape and authoring
// behavior remain identical across both features.
export default function QuestionBuilder({ instructorId, scope, questions, errors = {}, onUpdateQuestion, onUpdateOption, onAddQuestion, onRemoveQuestion, showExplanation = true }) {
  return <div className="bg-surface-default rounded-2xl shadow-card p-6 space-y-6">
    <div className="flex items-center justify-between"><h2 className="text-lg font-medium text-ink-900">الأسئلة</h2>{errors.questions && <span className="text-xs text-danger-DEFAULT">{errors.questions}</span>}</div>
    {questions.map((question, questionIndex) => <div key={question.id || question._id || questionIndex} className="border border-surface-border rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between"><h3 className="text-sm font-semibold text-ink-900">السؤال {questionIndex + 1}</h3>{questions.length > 1 && <Button variant="ghost" size="sm" className="text-danger-DEFAULT" onClick={() => onRemoveQuestion(questionIndex)}>حذف</Button>}</div>
      <QuestionStemInput instructorId={instructorId} scope={scope} question={question} onChange={(patch) => onUpdateQuestion(questionIndex, patch)} error={errors[`q-${questionIndex}-text`]} />
      <div className="grid grid-cols-1 gap-3">{question.options.map((option, optionIndex) => <div key={optionIndex} className="rounded-lg border border-surface-border p-3"><div className="mb-2 flex items-center gap-2"><input type="radio" name={`correct-${question.id || questionIndex}`} checked={question.correctOptionIndex === optionIndex} onChange={() => onUpdateQuestion(questionIndex, { correctOptionIndex: optionIndex })} className="shrink-0" aria-label={`تحديد الخيار ${optionIndex + 1} كإجابة صحيحة`} /><span className="text-sm font-medium text-ink-700">الخيار {optionIndex + 1}</span></div><MathEquationInput label={`نص الخيار ${optionIndex + 1}`} placeholder={`اكتب الخيار ${optionIndex + 1}`} value={option} onChange={(value) => onUpdateOption(questionIndex, optionIndex, value)} error={errors[`q-${questionIndex}-opt-${optionIndex}`]} maxLength={500} /></div>)}</div>
      <div className={`grid grid-cols-1 gap-3 ${showExplanation ? 'sm:grid-cols-3' : ''}`}><div><label className="block text-sm text-ink-700 mb-1">الدرجة</label><Input type="number" min={1} value={question.points} onChange={(event) => onUpdateQuestion(questionIndex, { points: event.target.value })} /></div>{showExplanation && <div className="sm:col-span-2"><MathEquationInput label="الشرح" placeholder="اشرح سبب الإجابة الصحيحة" value={question.explanation || ''} onChange={(explanation) => onUpdateQuestion(questionIndex, { explanation })} maxLength={1000} /></div>}</div>
    </div>)}
    <Button variant="ghost" onClick={onAddQuestion}>إضافة سؤال</Button>
  </div>;
}

QuestionBuilder.propTypes = {
  questions: PropTypes.arrayOf(PropTypes.object).isRequired,
  instructorId: PropTypes.string.isRequired,
  scope: PropTypes.oneOf(['quiz', 'exam']).isRequired,
  errors: PropTypes.object,
  onUpdateQuestion: PropTypes.func.isRequired,
  onUpdateOption: PropTypes.func.isRequired,
  onAddQuestion: PropTypes.func.isRequired,
  onRemoveQuestion: PropTypes.func.isRequired,
  showExplanation: PropTypes.bool
};

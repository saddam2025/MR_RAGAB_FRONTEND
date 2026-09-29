import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Button from '../ui/Button';
import MathEquationInput from '../math/MathEquationInput';
import { resolveApiAssetUrl } from '../../services/api';
import standaloneExamAdminService from '../../services/standaloneExamAdminService';

export default function QuestionStemInput({ instructorId, scope, question, onChange, error }) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [preview, setPreview] = useState(null);
  const imageMode = question.stemType === 'image';

  useEffect(() => () => { if (preview?.startsWith('blob:')) URL.revokeObjectURL(preview); }, [preview]);

  const selectMode = (stemType) => {
    setUploadError('');
    onChange({ stemType });
  };

  const onFileChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);
    setUploadError('');
    setUploading(true);
    try {
      const response = await standaloneExamAdminService.uploadQuestionImage(instructorId, file, scope);
      onChange({ stemType: 'image', imageUrl: response.data?.data?.imageUrl || '' });
    } catch (requestError) {
      setUploadError(requestError?.message || 'تعذر رفع صورة السؤال.');
      onChange({ stemType: 'image', imageUrl: '' });
    } finally {
      setUploading(false);
    }
  };

  const imageSrc = preview || (question.imageUrl ? resolveApiAssetUrl(question.imageUrl) : null);
  return <div className="space-y-3">
    <div className="flex flex-wrap gap-2" role="tablist" aria-label="نوع نص السؤال">
      <Button type="button" size="sm" variant={!imageMode ? 'primary' : 'subtle'} onClick={() => selectMode('text')}>اكتب السؤال</Button>
      <Button type="button" size="sm" variant={imageMode ? 'primary' : 'subtle'} onClick={() => selectMode('image')}>ارفع صورة السؤال</Button>
    </div>
    {!imageMode ? <MathEquationInput label="نص السؤال" placeholder="اكتب نص السؤال هنا" value={question.text || ''} onChange={(text) => onChange({ text, stemType: 'text' })} error={error} /> : <div className="space-y-3 rounded-xl border border-surface-border bg-surface-muted p-4">
      <label className="block text-sm font-medium text-ink-700">صورة السؤال (اختياري)</label>
      <input type="file" accept="image/jpeg,image/png,image/webp" onChange={onFileChange} disabled={uploading} className="block w-full text-sm text-ink-700" />
      {uploading && <p className="text-xs text-ink-500">جارٍ رفع الصورة...</p>}
      {uploadError && <p role="alert" className="text-xs text-danger-DEFAULT">{uploadError}</p>}
      {imageSrc && <img src={imageSrc} alt="معاينة صورة السؤال" className="max-h-80 w-full rounded-lg border border-surface-border bg-white object-contain" />}
      {!imageSrc && !uploading && <p className="text-sm text-ink-500">اختر صورة واضحة للسؤال.</p>}
      {error && <p className="text-xs text-danger-DEFAULT">{error}</p>}
    </div>}
  </div>;
}

QuestionStemInput.propTypes = {
  instructorId: PropTypes.string.isRequired,
  scope: PropTypes.oneOf(['quiz', 'exam']).isRequired,
  question: PropTypes.shape({ text: PropTypes.string, stemType: PropTypes.string, imageUrl: PropTypes.string }).isRequired,
  onChange: PropTypes.func.isRequired,
  error: PropTypes.string
};

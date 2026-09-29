import api from './api';

function toFormData(fields, thumbnail) {
  const formData = new FormData();
  Object.entries(fields).forEach(([key, value]) => {
    if (value !== undefined && value !== null) formData.append(key, key === 'questions' ? JSON.stringify(value) : String(value));
  });
  if (thumbnail) formData.append('thumbnail', thumbnail);
  return formData;
}

// Text-only saves use JSON.  This avoids turning every draft save into a
// multipart request and lets Express parse the exact fields directly.  When
// there is an image, leave the Content-Type unset so the browser supplies the
// required multipart boundary.
function requestBody(fields, thumbnail) {
  return thumbnail ? toFormData(fields, thumbnail) : fields;
}

const standaloneExamAdminService = {
  uploadQuestionImage: (instructorId, file, scope = 'exam') => {
    const formData = new FormData();
    formData.append('questionImage', file);
    const path = scope === 'quiz' ? `/instructors/${encodeURIComponent(instructorId)}/courses/question-image` : `/instructors/${encodeURIComponent(instructorId)}/exams/question-image`;
    // Remove the JSON default so the browser can add the multipart boundary.
    return api.post(path, formData, { headers: { 'Content-Type': undefined } });
  },
  list: (instructorId) => api.get(`/instructors/${encodeURIComponent(instructorId)}/exams`),
  get: async (instructorId, examId) => {
    const response = await api.get(`/instructors/${encodeURIComponent(instructorId)}/exams`);
    const exam = (response.data?.data || []).find((item) => String(item._id || item.id) === String(examId));
    if (!exam) throw new Error('الامتحان غير موجود أو لا تملك صلاحية الوصول إليه.');
    return { data: { data: exam } };
  },
  create: (instructorId, fields, thumbnail) => api.post(`/instructors/${encodeURIComponent(instructorId)}/exams`, requestBody(fields, thumbnail)),
  update: (instructorId, examId, fields, thumbnail) => api.patch(`/instructors/${encodeURIComponent(instructorId)}/exams/${encodeURIComponent(examId)}`, requestBody(fields, thumbnail)),
  publish: (instructorId, examId) => api.patch(`/instructors/${encodeURIComponent(instructorId)}/exams/${encodeURIComponent(examId)}/publish`, {}),
  close: (instructorId, examId) => api.patch(`/instructors/${encodeURIComponent(instructorId)}/exams/${encodeURIComponent(examId)}/close`, {}),
  remove: (instructorId, examId) => api.delete(`/instructors/${encodeURIComponent(instructorId)}/exams/${encodeURIComponent(examId)}`)
};

export default standaloneExamAdminService;

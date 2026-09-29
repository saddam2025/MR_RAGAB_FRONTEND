import api from './api';

function toCourseFormData(fields, files = {}) {
  const formData = new FormData();
  Object.entries(fields).forEach(([key, value]) => {
    if (value !== undefined && value !== null) formData.append(key, key === 'questions' ? JSON.stringify(value) : String(value));
  });
  ['thumbnail'].forEach((field) => {
    if (files[field]) formData.append(field, files[field]);
  });
  return formData;
}

const courseService = {
  list: (instructorId) => api.get(`/instructors/${encodeURIComponent(instructorId)}/courses`),
  get: (instructorId, courseId) => api.get(`/instructors/${encodeURIComponent(instructorId)}/courses/${encodeURIComponent(courseId)}`),
  create: (instructorId, fields, files) => api.post(
    `/instructors/${encodeURIComponent(instructorId)}/courses`,
    toCourseFormData(fields, files),
    { headers: { 'Content-Type': 'multipart/form-data' } }
  ),
  update: (instructorId, courseId, fields, files) => api.patch(
    `/instructors/${encodeURIComponent(instructorId)}/courses/${encodeURIComponent(courseId)}`,
    toCourseFormData(fields, files),
    { headers: { 'Content-Type': 'multipart/form-data' } }
  ),
  remove: (instructorId, courseId) => api.delete(`/instructors/${encodeURIComponent(instructorId)}/courses/${encodeURIComponent(courseId)}`)
};

export default courseService;

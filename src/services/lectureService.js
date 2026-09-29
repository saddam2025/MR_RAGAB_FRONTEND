import api from './api';

function formData(fields, files = {}) {
  const data = new FormData();
  Object.entries(fields).forEach(([key, value]) => { if (value !== undefined && value !== null) data.append(key, String(value)); });
  ['thumbnail', 'homework'].forEach((key) => { if (files[key]) data.append(key, files[key]); });
  return data;
}

const base = (instructorId, courseId) => `/instructors/${encodeURIComponent(instructorId)}/courses/${encodeURIComponent(courseId)}/lectures`;
export default {
  list: (instructorId, courseId) => api.get(base(instructorId, courseId)),
  create: (instructorId, courseId, fields, files) => api.post(base(instructorId, courseId), formData(fields, files), { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (instructorId, courseId, lectureId, fields, files) => api.patch(`${base(instructorId, courseId)}/${encodeURIComponent(lectureId)}`, formData(fields, files), { headers: { 'Content-Type': 'multipart/form-data' } }),
  initVideoUpload: (instructorId, courseId, lectureId, title) => api.post(`${base(instructorId, courseId)}/${encodeURIComponent(lectureId)}/video-upload-init`, { title }),
  confirmVideoUpload: (instructorId, courseId, lectureId, uploadId) => api.post(`${base(instructorId, courseId)}/${encodeURIComponent(lectureId)}/confirm-video-upload`, { uploadId }),
  reorder: (instructorId, courseId, lectureIds) => api.patch(`${base(instructorId, courseId)}/reorder`, { lectureIds }),
  remove: (instructorId, courseId, lectureId) => api.delete(`${base(instructorId, courseId)}/${encodeURIComponent(lectureId)}`)
};

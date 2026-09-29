import api from './api';

const profileService = {
  getStudentProfile: async (instructorId, studentId) => {
    if (!instructorId || !studentId) throw new Error('معرّف المدرس والطالب مطلوبان.');
    return api.get(`/instructors/${instructorId}/students/${studentId}/profile`);
  },

  getAssistantProfile: async (assistantId) => {
    if (!assistantId) throw new Error('معرّف المساعد مطلوب.');
    return api.get(`/instructors/${assistantId}/assistant-profile`);
  },
};

export default profileService;

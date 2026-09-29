import api from './api';

const leaderboardService = {
  list: async (instructorId, stage) => {
    if (!instructorId) throw new Error('معرّف المدرس مطلوب.');
    return api.get(`/instructors/${instructorId}/leaderboard`, {
      params: stage && stage !== 'all' ? { stage } : undefined,
    });
  },
};

export default leaderboardService;

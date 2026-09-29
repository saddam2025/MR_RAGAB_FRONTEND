import api from './api';
import { uploadVideoToBunny } from './bunnyUploadService';

const reelService = {
  list: (instructorId, page = 1, limit = 10) => (
    api.get(`/instructors/${instructorId}/reels`, { params: { page, limit } })
  ),

  upload: async (instructorId, { video, caption, stage }, onProgress) => {
    let initialized;
    try {
      initialized = await api.post(`/instructors/${instructorId}/reels/upload-init`, { caption, stage, title: video.name });
    } catch (error) {
      throw { ...error, uploadStage: 'init' };
    }
    const payload = initialized.data.data;
    try {
      await uploadVideoToBunny(video, payload.upload, onProgress);
    } catch (error) {
      throw { message: error?.message || 'فشل النقل المباشر إلى Bunny Stream.', uploadStage: 'transfer' };
    }
    try {
      return await api.post(`/instructors/${instructorId}/reels/confirm-upload`, { uploadId: payload.uploadId });
    } catch (error) {
      throw { ...error, uploadStage: 'confirm' };
    }
  },

  trackView: (reelId) => api.patch(`/reels/${reelId}/view`),
  remove: (reelId) => api.delete(`/reels/${reelId}`),
};

export default reelService;

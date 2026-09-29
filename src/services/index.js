// src/services/index.js
import api, { setAuthToken } from './api';
import authService from './authService';
import instructorService from './instructorService';
import notificationService from './notificationService';
import quizService from './quizService';
import reelService from './reelService';

export { api, setAuthToken, authService, instructorService, notificationService, quizService, reelService };
export default { api, setAuthToken, authService, instructorService, notificationService, quizService, reelService };

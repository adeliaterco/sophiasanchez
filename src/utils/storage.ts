import { QuizData, UTMParams } from '../types/quiz';

const STORAGE_KEYS = {
  QUIZ_DATA: 'quiz_data',
  UTM_PARAMS: 'utm_params',
  USER_COUNT: 'user_count',
  SPOTS_LEFT: 'spots_left',
};

export const storage = {
  saveQuizData: (data: Partial<QuizData>) => {
    const existing = storage.getQuizData();
    const updated = { ...existing, ...data };
    localStorage.setItem(STORAGE_KEYS.QUIZ_DATA, JSON.stringify(updated));
  },

  getQuizData: (): QuizData => {
    const data = localStorage.getItem(STORAGE_KEYS.QUIZ_DATA);
    if (!data) {
      return {
        gender: '',
        timeSeparation: '',
        whoEnded: '',
        relationshipDuration: '',
        currentSituation: '',
        exSituation: '',
        commitmentLevel: '',
        answers: [],
      };
    }
    return JSON.parse(data);
  },

  saveUTMParams: (params: UTMParams) => {
    localStorage.setItem(STORAGE_KEYS.UTM_PARAMS, JSON.stringify(params));
  },

  getUTMParams: (): UTMParams => {
    const data = localStorage.getItem(STORAGE_KEYS.UTM_PARAMS);
    return data ? JSON.parse(data) : {};
  },

  getUserCount: (): number => {
    const count = localStorage.getItem(STORAGE_KEYS.USER_COUNT);
    return count ? parseInt(count, 10) : 23;
  },

  setUserCount: (count: number) => {
    localStorage.setItem(STORAGE_KEYS.USER_COUNT, count.toString());
  },

  getSpotsLeft: (): number => {
    const spots = localStorage.getItem(STORAGE_KEYS.SPOTS_LEFT);
    return spots ? parseInt(spots, 10) : 50;
  },

  setSpotsLeft: (spots: number) => {
    localStorage.setItem(STORAGE_KEYS.SPOTS_LEFT, spots.toString());
  },

  clear: () => {
    localStorage.removeItem(STORAGE_KEYS.QUIZ_DATA);
  },
};

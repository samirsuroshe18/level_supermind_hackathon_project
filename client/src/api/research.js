import api from './client';

// enabled sources, the daily limit and how many researches are left today
export const getMeta = async () => (await api.get('/research/meta')).data.data;

export const listResearch = async () => (await api.get('/research')).data.data.researches;

// answers at once with the id; the research itself runs in the background
export const startResearch = async (topic) => (await api.post('/research', { topic })).data.data;

export const getResearch = async (id) => (await api.get(`/research/${id}`)).data.data.research;

export const deleteResearch = async (id) => api.delete(`/research/${id}`);

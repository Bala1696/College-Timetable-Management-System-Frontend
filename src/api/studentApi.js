import api from './axios';

export const getStudentsApi = (year, section, token) => api.get('/students', {
    params: { year, section },
    headers: { Authorization: `Bearer ${token}` }
});

export const createStudentApi = (data, token) => api.post('/students', data, {
    headers: { Authorization: `Bearer ${token}` }
});

export const updateStudentApi = (id, data, token) => api.put(`/students/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` }
});

export const deleteStudentApi = (id, token) => api.delete(`/students/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
});

export const exportExcelApi = (year, section, token) => api.get('/students/export/excel', {
    params: { year, section },
    headers: { Authorization: `Bearer ${token}` },
    responseType: 'blob'
});

export const exportPDFApi = (year, section, token) => api.get('/students/export/pdf', {
    params: { year, section },
    headers: { Authorization: `Bearer ${token}` },
    responseType: 'blob'
});

export const exportWordApi = (year, section, token) => api.get('/students/export/word', {
    params: { year, section },
    headers: { Authorization: `Bearer ${token}` },
    responseType: 'blob'
});


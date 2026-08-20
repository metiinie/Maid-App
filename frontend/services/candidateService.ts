import api from './api';

export const candidateService = {
    getPublicCandidates: (params = {}) =>
        api.get('/candidates', { params }),

    getFeaturedCandidates: () =>
        api.get('/candidates/featured'),

    getCandidateDetails: (id: string) =>
        api.get(`/candidates/${id}`),

    submitInquiry: (candidateId: string, data: any) =>
        api.post(`/candidates/${candidateId}/inquiry`, data),

    getCategories: () =>
        api.get('/categories'),

    getAgencies: () =>
        api.get('/agencies'),

    getAdminCandidates: (params = {}) =>
        api.get('/admin/candidates', { params }),

    createAdminCandidate: (formData: FormData) =>
        api.post('/admin/candidates', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }),

    updateAdminCandidate: (id: string, formData: FormData) =>
        api.put(`/admin/candidates/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }),

    deleteAdminCandidate: (id: string) =>
        api.delete(`/admin/candidates/${id}`),

    toggleAdminCandidateStatus: (id: string, data: any) =>
        api.patch(`/admin/candidates/${id}/status`, data),
};

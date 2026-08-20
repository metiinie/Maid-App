import api from './api';

export const candidateService = {
    // Public Candidates Search
    getPublicCandidates: (params = {}) =>
        api.get('/candidates', { params }),

    // Featured Candidates
    getFeaturedCandidates: () =>
        api.get('/candidates/featured'),

    // Public Candidate Details
    getCandidateDetails: (id) =>
        api.get(`/candidates/${id}`),

    // Submit Candidate Inquiry
    submitInquiry: (candidateId, data) =>
        api.post(`/candidates/${candidateId}/inquiry`, data),

    // Categories Catalog
    getCategories: () =>
        api.get('/categories'),

    // Agencies Directory
    getAgencies: () =>
        api.get('/agencies'),

    // Admin List Candidates
    getAdminCandidates: (params = {}) =>
        api.get('/admin/candidates', { params }),

    // Admin Create Candidate (Multipart Form Data)
    createAdminCandidate: (formData) =>
        api.post('/admin/candidates', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }),

    // Admin Update Candidate
    updateAdminCandidate: (id, formData) =>
        api.put(`/admin/candidates/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }),

    // Admin Delete Candidate
    deleteAdminCandidate: (id) =>
        api.delete(`/admin/candidates/${id}`),

    // Admin Toggle Active / Featured Status
    toggleAdminCandidateStatus: (id, data) =>
        api.patch(`/admin/candidates/${id}/status`, data)
};

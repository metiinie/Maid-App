import api from './api';

export const vacancyService = {
    // Public Vacancies Search
    getPublicVacancies: (params = {}) =>
        api.get('/vacancies', { params }),

    // Featured Vacancies
    getFeaturedVacancies: () =>
        api.get('/vacancies/featured'),

    // Public Vacancy Details
    getVacancyDetails: (id) =>
        api.get(`/vacancies/${id}`),

    // Apply to Job Vacancy
    applyToVacancy: (id, data = {}) =>
        api.post(`/vacancies/${id}/apply`, data),

    // User Applications History
    getUserApplications: () =>
        api.get('/users/me/applications'),

    // Admin List Vacancies
    getAdminVacancies: (params = {}) =>
        api.get('/admin/vacancies', { params }),

    // Admin Create Vacancy
    createAdminVacancy: (data) =>
        api.post('/admin/vacancies', data),

    // Admin Update Vacancy
    updateAdminVacancy: (id, data) =>
        api.put(`/admin/vacancies/${id}`, data),

    // Admin Vacancy Applications List
    getAdminVacancyApplications: (id) =>
        api.get(`/admin/vacancies/${id}/applications`),

    // Admin Update Application Status
    updateApplicationStatus: (applicationId, status, notes = '') =>
        api.patch(`/admin/vacancies/applications/${applicationId}/status`, { status, notes })
};

import api from './api';

export const vacancyService = {
    getPublicVacancies: (params = {}) =>
        api.get('/vacancies', { params }),

    getFeaturedVacancies: () =>
        api.get('/vacancies/featured'),

    getVacancyDetails: (id: string) =>
        api.get(`/vacancies/${id}`),

    applyToVacancy: (id: string, data = {}) =>
        api.post(`/vacancies/${id}/apply`, data),

    getUserApplications: () =>
        api.get('/users/me/applications'),

    getAdminVacancies: (params = {}) =>
        api.get('/admin/vacancies', { params }),

    createAdminVacancy: (data: any) =>
        api.post('/admin/vacancies', data),

    updateAdminVacancy: (id: string, data: any) =>
        api.put(`/admin/vacancies/${id}`, data),

    getAdminVacancyApplications: (id: string) =>
        api.get(`/admin/vacancies/${id}/applications`),

    updateApplicationStatus: (applicationId: string, status: string, notes = '') =>
        api.patch(`/admin/vacancies/applications/${applicationId}/status`, { status, notes }),
};

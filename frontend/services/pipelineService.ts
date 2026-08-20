import api from './api';

export const pipelineService = {
    getAdminPipelines: (params = {}) =>
        api.get('/admin/pipelines', { params }),

    createAdminPipeline: (data: any) =>
        api.post('/admin/pipelines', data),

    getAdminPipelineDetails: (id: string) =>
        api.get(`/admin/pipelines/${id}`),

    advancePipelineStage: (id: string, data: any) =>
        api.patch(`/admin/pipelines/${id}/stage`, data),

    uploadPipelineDocument: (id: string, formData: FormData) =>
        api.post(`/admin/pipelines/${id}/documents`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }),

    updatePipelineOutcome: (id: string, data: any) =>
        api.patch(`/admin/pipelines/${id}/outcome`, data),

    getUserPipelines: () =>
        api.get('/users/me/pipelines'),

    getUserPipelineDetails: (id: string) =>
        api.get(`/users/me/pipelines/${id}`),
};

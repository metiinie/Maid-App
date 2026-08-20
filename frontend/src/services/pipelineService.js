import api from './api';

export const pipelineService = {
    // Admin List Pipelines
    getAdminPipelines: (params = {}) =>
        api.get('/admin/pipelines', { params }),

    // Admin Create Pipeline
    createAdminPipeline: (data) =>
        api.post('/admin/pipelines', data),

    // Admin Get Single Pipeline Details
    getAdminPipelineDetails: (id) =>
        api.get(`/admin/pipelines/${id}`),

    // Admin Advance Pipeline Stage
    advancePipelineStage: (id, data) =>
        api.patch(`/admin/pipelines/${id}/stage`, data),

    // Admin Upload Pipeline Document (Multipart)
    uploadPipelineDocument: (id, formData) =>
        api.post(`/admin/pipelines/${id}/documents`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }),

    // Admin Update Pipeline Outcome
    updatePipelineOutcome: (id, data) =>
        api.patch(`/admin/pipelines/${id}/outcome`, data),

    // User Get My Pipelines Timeline
    getUserPipelines: () =>
        api.get('/users/me/pipelines'),

    // User Get Single Pipeline Detail
    getUserPipelineDetails: (id) =>
        api.get(`/users/me/pipelines/${id}`)
};

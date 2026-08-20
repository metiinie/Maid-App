const db = require('../config/db');
const { successResponse, errorResponse } = require('../utils/response');

// GET /api/users/me/pipelines
async function getUserPipelines(req, res) {
    try {
        const userId = req.user.id;

        const { rows } = await db.query(
            `SELECT p.*,
              c.first_name as candidate_first_name, c.last_name as candidate_last_name, c.profile_photo_url as candidate_photo,
              v.title as vacancy_title,
              g.name as agency_name, g.logo_url as agency_logo, g.phone as agency_phone
       FROM hiring_pipelines p
       JOIN candidates c ON c.id = p.candidate_id
       JOIN agencies g ON g.id = p.agency_id
       LEFT JOIN job_vacancies v ON v.id = p.vacancy_id
       WHERE p.employer_user_id = $1
       ORDER BY p.created_at DESC`,
            [userId]
        );

        return successResponse(res, { data: rows });
    } catch (err) {
        console.error('getUserPipelines error:', err);
        return errorResponse(res, { statusCode: 500, message: 'Failed to fetch user pipelines' });
    }
}

// GET /api/users/me/pipelines/:id
async function getUserPipelineById(req, res) {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const { rows } = await db.query(
            `SELECT p.*,
              c.first_name as candidate_first_name, c.last_name as candidate_last_name, c.profile_photo_url as candidate_photo,
              v.title as vacancy_title, v.destination_country as vacancy_country,
              g.name as agency_name, g.logo_url as agency_logo, g.phone as agency_phone, g.email as agency_email
       FROM hiring_pipelines p
       JOIN candidates c ON c.id = p.candidate_id
       JOIN agencies g ON g.id = p.agency_id
       LEFT JOIN job_vacancies v ON v.id = p.vacancy_id
       WHERE p.id = $1 AND p.employer_user_id = $2`,
            [id, userId]
        );

        const pipeline = rows[0];
        if (!pipeline) {
            return errorResponse(res, { statusCode: 404, message: 'Hiring pipeline record not found' });
        }

        const [stageHistory, documents] = await Promise.all([
            db.query(
                `SELECT stage, entered_at, exited_at, duration_days, notes
         FROM pipeline_stage_history
         WHERE pipeline_id = $1
         ORDER BY entered_at ASC`,
                [id]
            ),
            db.query(
                `SELECT id, document_type, document_name, document_url, created_at
         FROM pipeline_documents
         WHERE pipeline_id = $1
         ORDER BY created_at DESC`,
                [id]
            )
        ]);

        pipeline.stage_history = stageHistory.rows;
        pipeline.documents = documents.rows;

        return successResponse(res, { data: pipeline });
    } catch (err) {
        console.error('getUserPipelineById error:', err);
        return errorResponse(res, { statusCode: 500, message: 'Failed to fetch user pipeline details' });
    }
}

module.exports = {
    getUserPipelines,
    getUserPipelineById
};

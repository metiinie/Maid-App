const db = require('../config/db');
const { uploadToS3 } = require('../services/storage.service');
const { successResponse, errorResponse } = require('../utils/response');

// GET /api/admin/pipelines
async function getPipelines(req, res) {
    try {
        const agencyId = req.agencyId;
        const {
            page = 1,
            limit = 10,
            search = '',
            current_stage,
            outcome,
            is_active,
            candidate_id,
            sort_by = 'created_at',
            sort_order = 'DESC'
        } = req.query;

        const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
        const params = [agencyId];
        let queryWhere = 'WHERE p.agency_id = $1';
        let paramIndex = 2;

        if (search) {
            queryWhere += ` AND (c.first_name ILIKE $${paramIndex} OR c.last_name ILIKE $${paramIndex} OR p.employer_name ILIKE $${paramIndex})`;
            params.push(`%${search}%`);
            paramIndex++;
        }

        if (current_stage) {
            queryWhere += ` AND p.current_stage = $${paramIndex}`;
            params.push(current_stage);
            paramIndex++;
        }

        if (outcome) {
            queryWhere += ` AND p.outcome = $${paramIndex}`;
            params.push(outcome);
            paramIndex++;
        }

        if (is_active !== undefined) {
            queryWhere += ` AND p.is_active = $${paramIndex}`;
            params.push(is_active === 'true');
            paramIndex++;
        }

        if (candidate_id) {
            queryWhere += ` AND p.candidate_id = $${paramIndex}`;
            params.push(candidate_id);
            paramIndex++;
        }

        const countRes = await db.query(
            `SELECT COUNT(*)
       FROM hiring_pipelines p
       JOIN candidates c ON c.id = p.candidate_id
       ${queryWhere}`,
            params
        );
        const totalItems = parseInt(countRes.rows[0].count, 10);

        const validSortFields = ['created_at', 'current_stage', 'expected_deployment_date'];
        const orderField = validSortFields.includes(sort_by) ? sort_by : 'created_at';
        const orderDirection = sort_order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

        const itemsQuery = `
      SELECT p.*,
             c.first_name as candidate_first_name, c.last_name as candidate_last_name, c.profile_photo_url as candidate_photo,
             v.title as vacancy_title,
             u.first_name as employer_user_first_name, u.last_name as employer_user_last_name, u.phone as employer_user_phone
      FROM hiring_pipelines p
      JOIN candidates c ON c.id = p.candidate_id
      LEFT JOIN job_vacancies v ON v.id = p.vacancy_id
      LEFT JOIN users u ON u.id = p.employer_user_id
      ${queryWhere}
      ORDER BY p.${orderField} ${orderDirection}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

        params.push(parseInt(limit, 10), offset);
        const { rows: pipelines } = await db.query(itemsQuery, params);

        return successResponse(res, {
            data: pipelines,
            meta: {
                page: parseInt(page, 10),
                limit: parseInt(limit, 10),
                totalItems,
                totalPages: Math.ceil(totalItems / parseInt(limit, 10))
            }
        });
    } catch (err) {
        console.error('getPipelines error:', err);
        return errorResponse(res, { statusCode: 500, message: 'Failed to fetch hiring pipelines' });
    }
}

// POST /api/admin/pipelines
async function createPipeline(req, res) {
    const client = await db.pool.connect();
    try {
        const agencyId = req.agencyId;
        const adminUserId = req.admin.id;
        const {
            candidate_id,
            vacancy_id,
            application_id,
            inquiry_id,
            employer_user_id,
            employer_name,
            employer_country,
            employer_city,
            employer_contact,
            current_stage = 'interviewing',
            expected_deployment_date,
            notes
        } = req.body;

        await client.query('BEGIN');

        // Verify candidate exists and belongs to agency
        const { rows: candidateRows } = await client.query(
            'SELECT id, first_name, last_name FROM candidates WHERE id = $1 AND agency_id = $2',
            [candidate_id, agencyId]
        );

        if (candidateRows.length === 0) {
            await client.query('ROLLBACK');
            return errorResponse(res, { statusCode: 404, message: 'Candidate not found or does not belong to your agency' });
        }

        const { rows } = await client.query(
            `INSERT INTO hiring_pipelines (
         agency_id, candidate_id, vacancy_id, application_id, inquiry_id, employer_user_id,
         employer_name, employer_country, employer_city, employer_contact,
         current_stage, expected_deployment_date, notes
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING *`,
            [
                agencyId, candidate_id, vacancy_id || null, application_id || null, inquiry_id || null, employer_user_id || null,
                employer_name || null, employer_country || null, employer_city || null, employer_contact || null,
                current_stage, expected_deployment_date || null, notes || null
            ]
        );

        const pipeline = rows[0];

        // Create initial stage history entry
        await client.query(
            `INSERT INTO pipeline_stage_history (pipeline_id, stage, notes, updated_by)
       VALUES ($1, $2, $3, $4)`,
            [pipeline.id, current_stage, 'Pipeline created', adminUserId]
        );

        await client.query('COMMIT');

        return successResponse(res, {
            statusCode: 201,
            message: 'Hiring pipeline initialized successfully',
            data: pipeline
        });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('createPipeline error:', err);
        return errorResponse(res, { statusCode: 500, message: 'Failed to initialize hiring pipeline' });
    } finally {
        client.release();
    }
}

// GET /api/admin/pipelines/:id
async function getPipelineById(req, res) {
    try {
        const agencyId = req.agencyId;
        const { id } = req.params;

        const { rows } = await db.query(
            `SELECT p.*,
              c.first_name as candidate_first_name, c.last_name as candidate_last_name, c.profile_photo_url as candidate_photo, c.phone as candidate_phone,
              v.title as vacancy_title, v.destination_country as vacancy_country,
              u.first_name as employer_user_first_name, u.last_name as employer_user_last_name, u.phone as employer_user_phone, u.email as employer_user_email
       FROM hiring_pipelines p
       JOIN candidates c ON c.id = p.candidate_id
       LEFT JOIN job_vacancies v ON v.id = p.vacancy_id
       LEFT JOIN users u ON u.id = p.employer_user_id
       WHERE p.id = $1 AND p.agency_id = $2`,
            [id, agencyId]
        );

        const pipeline = rows[0];
        if (!pipeline) {
            return errorResponse(res, { statusCode: 404, message: 'Hiring pipeline record not found' });
        }

        const [stageHistory, documents] = await Promise.all([
            db.query(
                `SELECT h.*, a.first_name as updated_by_first_name, a.last_name as updated_by_last_name
         FROM pipeline_stage_history h
         LEFT JOIN admin_users a ON a.id = h.updated_by
         WHERE h.pipeline_id = $1
         ORDER BY h.entered_at ASC`,
                [id]
            ),
            db.query(
                `SELECT d.*, a.first_name as uploaded_by_first_name, a.last_name as uploaded_by_last_name
         FROM pipeline_documents d
         LEFT JOIN admin_users a ON a.id = d.uploaded_by
         WHERE d.pipeline_id = $1
         ORDER BY d.created_at DESC`,
                [id]
            )
        ]);

        pipeline.stage_history = stageHistory.rows;
        pipeline.documents = documents.rows;

        return successResponse(res, { data: pipeline });
    } catch (err) {
        console.error('getPipelineById error:', err);
        return errorResponse(res, { statusCode: 500, message: 'Failed to fetch pipeline details' });
    }
}

// PATCH /api/admin/pipelines/:id/stage
async function updatePipelineStage(req, res) {
    const client = await db.pool.connect();
    try {
        const agencyId = req.agencyId;
        const adminUserId = req.admin.id;
        const { id } = req.params;
        const { stage, notes } = req.body;

        await client.query('BEGIN');

        // Get active pipeline
        const { rows: pipelineRows } = await client.query(
            'SELECT id, current_stage FROM hiring_pipelines WHERE id = $1 AND agency_id = $2',
            [id, agencyId]
        );

        const pipeline = pipelineRows[0];
        if (!pipeline) {
            await client.query('ROLLBACK');
            return errorResponse(res, { statusCode: 404, message: 'Pipeline record not found' });
        }

        // Close previous stage history entry
        await client.query(
            `UPDATE pipeline_stage_history
       SET exited_at = NOW(), duration_days = EXTRACT(DAY FROM NOW() - entered_at)
       WHERE pipeline_id = $1 AND exited_at IS NULL`,
            [id]
        );

        // Update current stage on pipeline
        const actualDeploymentDate = stage === 'deployed' ? new Date() : null;
        const { rows: updatedRows } = await client.query(
            `UPDATE hiring_pipelines
       SET current_stage = $1, actual_deployment_date = COALESCE(actual_deployment_date, $2), updated_at = NOW()
       WHERE id = $3 AND agency_id = $4
       RETURNING *`,
            [stage, actualDeploymentDate, id, agencyId]
        );

        // Insert new stage history entry
        await client.query(
            `INSERT INTO pipeline_stage_history (pipeline_id, stage, notes, updated_by)
       VALUES ($1, $2, $3, $4)`,
            [id, stage, notes || null, adminUserId]
        );

        // If stage is 'deployed', mark candidate as deployed
        if (stage === 'deployed') {
            await client.query(
                'UPDATE candidates SET is_deployed = true WHERE id = $1',
                [updatedRows[0].candidate_id]
            );
        }

        await client.query('COMMIT');

        return successResponse(res, {
            message: `Pipeline stage updated to ${stage}`,
            data: updatedRows[0]
        });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('updatePipelineStage error:', err);
        return errorResponse(res, { statusCode: 500, message: 'Failed to advance pipeline stage' });
    } finally {
        client.release();
    }
}

// PATCH /api/admin/pipelines/:id/outcome
async function updatePipelineOutcome(req, res) {
    try {
        const agencyId = req.agencyId;
        const { id } = req.params;
        const { outcome, outcome_notes } = req.body;

        const { rows } = await db.query(
            `UPDATE hiring_pipelines
       SET outcome = $1, outcome_notes = $2, outcome_date = NOW(), is_active = false, updated_at = NOW()
       WHERE id = $3 AND agency_id = $4
       RETURNING *`,
            [outcome, outcome_notes || null, id, agencyId]
        );

        if (rows.length === 0) {
            return errorResponse(res, { statusCode: 404, message: 'Pipeline record not found' });
        }

        return successResponse(res, {
            message: `Pipeline finalized with outcome: ${outcome}`,
            data: rows[0]
        });
    } catch (err) {
        console.error('updatePipelineOutcome error:', err);
        return errorResponse(res, { statusCode: 500, message: 'Failed to update pipeline outcome' });
    }
}

// POST /api/admin/pipelines/:id/documents
async function uploadPipelineDocument(req, res) {
    try {
        const agencyId = req.agencyId;
        const adminUserId = req.admin.id;
        const { id } = req.params;
        const { document_type, document_name, notes, document_url: bodyUrl } = req.body;

        let documentUrl = bodyUrl;
        if (req.file) {
            documentUrl = await uploadToS3(req.file, 'pipeline-documents');
        }

        if (!documentUrl) {
            return errorResponse(res, { statusCode: 400, message: 'Document file or URL is required' });
        }

        // Verify pipeline exists
        const { rows: pipelineRows } = await db.query(
            'SELECT id FROM hiring_pipelines WHERE id = $1 AND agency_id = $2',
            [id, agencyId]
        );

        if (pipelineRows.length === 0) {
            return errorResponse(res, { statusCode: 404, message: 'Pipeline record not found' });
        }

        const { rows } = await db.query(
            `INSERT INTO pipeline_documents (pipeline_id, document_type, document_name, document_url, uploaded_by, notes)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
            [id, document_type, document_name || document_type, documentUrl, adminUserId, notes || null]
        );

        return successResponse(res, {
            statusCode: 201,
            message: 'Pipeline document uploaded successfully',
            data: rows[0]
        });
    } catch (err) {
        console.error('uploadPipelineDocument error:', err);
        return errorResponse(res, { statusCode: 500, message: 'Failed to upload pipeline document' });
    }
}

// DELETE /api/admin/pipelines/:id/documents/:docId
async function deletePipelineDocument(req, res) {
    try {
        const agencyId = req.agencyId;
        const { id, docId } = req.params;

        const { rowCount } = await db.query(
            `DELETE FROM pipeline_documents
       WHERE id = $1 AND pipeline_id IN (SELECT id FROM hiring_pipelines WHERE id = $2 AND agency_id = $3)`,
            [docId, id, agencyId]
        );

        if (rowCount === 0) {
            return errorResponse(res, { statusCode: 404, message: 'Pipeline document not found' });
        }

        return successResponse(res, { message: 'Pipeline document deleted successfully' });
    } catch (err) {
        console.error('deletePipelineDocument error:', err);
        return errorResponse(res, { statusCode: 500, message: 'Failed to delete pipeline document' });
    }
}

module.exports = {
    getPipelines,
    createPipeline,
    getPipelineById,
    updatePipelineStage,
    updatePipelineOutcome,
    uploadPipelineDocument,
    deletePipelineDocument
};

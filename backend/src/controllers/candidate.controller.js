const db = require('../config/db');
const { successResponse, errorResponse } = require('../utils/response');
const { uploadFile, deleteFile } = require('../services/storage.service');

// GET /api/admin/candidates
async function getCandidates(req, res) {
    try {
        const agencyId = req.agencyId;
        const {
            page = 1,
            limit = 10,
            search = '',
            gender,
            medical_status,
            is_featured,
            is_active,
            category_id
        } = req.query;

        const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
        const params = [agencyId];
        let queryWhere = 'WHERE c.agency_id = $1';
        let paramIndex = 2;

        if (search) {
            queryWhere += ` AND (c.first_name ILIKE $${paramIndex} OR c.last_name ILIKE $${paramIndex} OR c.passport_number ILIKE $${paramIndex})`;
            params.push(`%${search}%`);
            paramIndex++;
        }

        if (gender) {
            queryWhere += ` AND c.gender = $${paramIndex}`;
            params.push(gender);
            paramIndex++;
        }

        if (medical_status) {
            queryWhere += ` AND c.medical_clearance_status = $${paramIndex}`;
            params.push(medical_status);
            paramIndex++;
        }

        if (is_featured !== undefined) {
            queryWhere += ` AND c.is_featured = $${paramIndex}`;
            params.push(is_featured === 'true');
            paramIndex++;
        }

        if (is_active !== undefined) {
            queryWhere += ` AND c.is_active = $${paramIndex}`;
            params.push(is_active === 'true');
            paramIndex++;
        }

        if (category_id) {
            queryWhere += ` AND EXISTS (SELECT 1 FROM candidate_categories cc WHERE cc.candidate_id = c.id AND cc.category_id = $${paramIndex})`;
            params.push(category_id);
            paramIndex++;
        }

        // Count query
        const countRes = await db.query(
            `SELECT COUNT(*) FROM candidates c ${queryWhere}`,
            params
        );
        const totalItems = parseInt(countRes.rows[0].count, 10);

        // Items query
        const itemsQuery = `
      SELECT c.id, c.first_name, c.last_name, c.date_of_birth, c.gender, c.nationality,
             c.religion, c.profile_photo_url, c.introduction_video_url, c.current_country,
             c.city, c.education_level, c.years_of_experience, c.passport_number,
             c.medical_clearance_status, c.visa_status, c.availability_date,
             c.is_active, c.is_featured, c.is_deployed, c.view_count, c.inquiry_count, c.created_at
      FROM candidates c
      ${queryWhere}
      ORDER BY c.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

        params.push(parseInt(limit, 10), offset);
        const { rows: candidates } = await db.query(itemsQuery, params);

        return successResponse(res, {
            data: candidates,
            meta: {
                page: parseInt(page, 10),
                limit: parseInt(limit, 10),
                totalItems,
                totalPages: Math.ceil(totalItems / parseInt(limit, 10))
            }
        });
    } catch (err) {
        console.error('getCandidates error:', err);
        return errorResponse(res, { statusCode: 500, message: 'Failed to retrieve candidates' });
    }
}

// GET /api/admin/candidates/:id
async function getCandidateById(req, res) {
    try {
        const { id } = req.params;
        const agencyId = req.agencyId;

        const { rows } = await db.query(
            'SELECT * FROM candidates WHERE id = $1 AND agency_id = $2',
            [id, agencyId]
        );

        const candidate = rows[0];
        if (!candidate) {
            return errorResponse(res, { statusCode: 404, message: 'Candidate not found' });
        }

        // Fetch related items
        const [categories, skills, languages, experience, education, documents] = await Promise.all([
            db.query('SELECT cat.*, cc.is_primary FROM candidate_categories cc JOIN categories cat ON cat.id = cc.category_id WHERE cc.candidate_id = $1', [id]),
            db.query('SELECT * FROM candidate_skills WHERE candidate_id = $1', [id]),
            db.query('SELECT * FROM candidate_languages WHERE candidate_id = $1', [id]),
            db.query('SELECT * FROM candidate_experience WHERE candidate_id = $1 ORDER BY start_date DESC', [id]),
            db.query('SELECT * FROM candidate_education WHERE candidate_id = $1 ORDER BY start_year DESC', [id]),
            db.query('SELECT * FROM candidate_documents WHERE candidate_id = $1 ORDER BY created_at DESC', [id])
        ]);

        candidate.categories = categories.rows;
        candidate.skills = skills.rows;
        candidate.languages = languages.rows;
        candidate.experience = experience.rows;
        candidate.education = education.rows;
        candidate.documents = documents.rows;

        return successResponse(res, { data: candidate });
    } catch (err) {
        console.error('getCandidateById error:', err);
        return errorResponse(res, { statusCode: 500, message: 'Failed to fetch candidate details' });
    }
}

// POST /api/admin/candidates
async function createCandidate(req, res) {
    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');
        const agencyId = req.agencyId;
        const uploadedBy = req.admin.id;

        const {
            first_name, last_name, date_of_birth, gender, nationality = 'Ethiopian', religion,
            current_country, city, summary, education_level, years_of_experience = 0,
            passport_number, passport_expiry, medical_clearance_status = 'pending',
            visa_status, availability_date, category_ids = [], skills = [], languages = [],
            experience = [], education = []
        } = req.body;

        const candidateRes = await client.query(
            `INSERT INTO candidates (
         agency_id, uploaded_by, first_name, last_name, date_of_birth, gender, nationality,
         religion, current_country, city, summary, education_level, years_of_experience,
         passport_number, passport_expiry, medical_clearance_status, visa_status, availability_date
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
       RETURNING *`,
            [
                agencyId, uploadedBy, first_name, last_name, date_of_birth, gender, nationality,
                religion, current_country, city, summary, education_level, years_of_experience,
                passport_number, passport_expiry, medical_clearance_status, visa_status, availability_date
            ]
        );

        const candidate = candidateRes.rows[0];
        const candidateId = candidate.id;

        // Link categories
        for (let i = 0; i < category_ids.length; i++) {
            await client.query(
                'INSERT INTO candidate_categories (candidate_id, category_id, is_primary) VALUES ($1, $2, $3)',
                [candidateId, category_ids[i], i === 0]
            );
        }

        // Insert skills
        for (const sk of skills) {
            await client.query(
                'INSERT INTO candidate_skills (candidate_id, skill_name, proficiency_level, years_experience) VALUES ($1, $2, $3, $4)',
                [candidateId, sk.skill_name, sk.proficiency_level, sk.years_experience]
            );
        }

        // Insert languages
        for (const lang of languages) {
            await client.query(
                'INSERT INTO candidate_languages (candidate_id, language, proficiency) VALUES ($1, $2, $3)',
                [candidateId, lang.language, lang.proficiency]
            );
        }

        // Insert experience
        for (const exp of experience) {
            await client.query(
                `INSERT INTO candidate_experience (candidate_id, job_title, employer_name, country, start_date, end_date, is_current, description)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                [candidateId, exp.job_title, exp.employer_name, exp.country, exp.start_date, exp.end_date, exp.is_current || false, exp.description]
            );
        }

        // Insert education
        for (const edu of education) {
            await client.query(
                `INSERT INTO candidate_education (candidate_id, institution, degree, field_of_study, start_year, end_year, grade)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                [candidateId, edu.institution, edu.degree, edu.field_of_study, edu.start_year, edu.end_year, edu.grade]
            );
        }

        await client.query('COMMIT');
        return successResponse(res, { statusCode: 201, message: 'Candidate created successfully', data: candidate });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('createCandidate error:', err);
        return errorResponse(res, { statusCode: 500, message: 'Failed to create candidate profile' });
    } finally {
        client.release();
    }
}

// PUT /api/admin/candidates/:id
async function updateCandidate(req, res) {
    try {
        const { id } = req.params;
        const agencyId = req.agencyId;
        const {
            first_name, last_name, date_of_birth, gender, nationality, religion,
            current_country, city, summary, education_level, years_of_experience,
            passport_number, passport_expiry, visa_status, availability_date
        } = req.body;

        const { rows } = await db.query(
            `UPDATE candidates SET
         first_name = COALESCE($1, first_name),
         last_name = COALESCE($2, last_name),
         date_of_birth = COALESCE($3, date_of_birth),
         gender = COALESCE($4, gender),
         nationality = COALESCE($5, nationality),
         religion = COALESCE($6, religion),
         current_country = COALESCE($7, current_country),
         city = COALESCE($8, city),
         summary = COALESCE($9, summary),
         education_level = COALESCE($10, education_level),
         years_of_experience = COALESCE($11, years_of_experience),
         passport_number = COALESCE($12, passport_number),
         passport_expiry = COALESCE($13, passport_expiry),
         visa_status = COALESCE($14, visa_status),
         availability_date = COALESCE($15, availability_date),
         updated_at = NOW()
       WHERE id = $16 AND agency_id = $17
       RETURNING *`,
            [
                first_name, last_name, date_of_birth, gender, nationality, religion,
                current_country, city, summary, education_level, years_of_experience,
                passport_number, passport_expiry, visa_status, availability_date,
                id, agencyId
            ]
        );

        if (rows.length === 0) {
            return errorResponse(res, { statusCode: 404, message: 'Candidate not found or access denied' });
        }

        return successResponse(res, { message: 'Candidate updated successfully', data: rows[0] });
    } catch (err) {
        console.error('updateCandidate error:', err);
        return errorResponse(res, { statusCode: 500, message: 'Failed to update candidate' });
    }
}

// DELETE /api/admin/candidates/:id
async function deleteCandidate(req, res) {
    try {
        const { id } = req.params;
        const agencyId = req.agencyId;

        const { rowCount } = await db.query(
            'DELETE FROM candidates WHERE id = $1 AND agency_id = $2',
            [id, agencyId]
        );

        if (rowCount === 0) {
            return errorResponse(res, { statusCode: 404, message: 'Candidate not found or access denied' });
        }

        return successResponse(res, { message: 'Candidate deleted successfully' });
    } catch (err) {
        console.error('deleteCandidate error:', err);
        return errorResponse(res, { statusCode: 500, message: 'Failed to delete candidate' });
    }
}

// POST /api/admin/candidates/:id/photo
async function uploadPhoto(req, res) {
    try {
        const { id } = req.params;
        const agencyId = req.agencyId;
        if (!req.file) {
            return errorResponse(res, { statusCode: 400, message: 'Photo file is required' });
        }

        const photoUrl = await uploadFile({
            buffer: req.file.buffer,
            mimetype: req.file.mimetype,
            folder: `candidates/${agencyId}/photos`
        });

        const { rows } = await db.query(
            'UPDATE candidates SET profile_photo_url = $1, updated_at = NOW() WHERE id = $2 AND agency_id = $3 RETURNING id, profile_photo_url',
            [photoUrl, id, agencyId]
        );

        if (rows.length === 0) {
            return errorResponse(res, { statusCode: 404, message: 'Candidate not found' });
        }

        return successResponse(res, { message: 'Profile photo uploaded', data: rows[0] });
    } catch (err) {
        console.error('uploadPhoto error:', err);
        return errorResponse(res, { statusCode: 500, message: 'Failed to upload photo' });
    }
}

// POST /api/admin/candidates/:id/video
async function uploadVideo(req, res) {
    try {
        const { id } = req.params;
        const agencyId = req.agencyId;
        if (!req.file) {
            return errorResponse(res, { statusCode: 400, message: 'Video file is required' });
        }

        const videoUrl = await uploadFile({
            buffer: req.file.buffer,
            mimetype: req.file.mimetype,
            folder: `candidates/${agencyId}/videos`
        });

        const { rows } = await db.query(
            'UPDATE candidates SET introduction_video_url = $1, updated_at = NOW() WHERE id = $2 AND agency_id = $3 RETURNING id, introduction_video_url',
            [videoUrl, id, agencyId]
        );

        if (rows.length === 0) {
            return errorResponse(res, { statusCode: 404, message: 'Candidate not found' });
        }

        return successResponse(res, { message: 'Introduction video uploaded', data: rows[0] });
    } catch (err) {
        console.error('uploadVideo error:', err);
        return errorResponse(res, { statusCode: 500, message: 'Failed to upload video' });
    }
}

// POST /api/admin/candidates/:id/documents
async function uploadDocument(req, res) {
    try {
        const { id } = req.params;
        const agencyId = req.agencyId;
        const { document_type, document_name, expiry_date, notes } = req.body;

        if (!req.file) {
            return errorResponse(res, { statusCode: 400, message: 'Document file is required' });
        }

        const documentUrl = await uploadFile({
            buffer: req.file.buffer,
            mimetype: req.file.mimetype,
            folder: `candidates/${agencyId}/documents`
        });

        const { rows } = await db.query(
            `INSERT INTO candidate_documents (
         candidate_id, document_type, document_name, document_url, expiry_date, is_verified, verified_by, verified_at, notes
       ) VALUES ($1, $2, $3, $4, $5, true, $6, NOW(), $7)
       RETURNING *`,
            [id, document_type || 'other', document_name || req.file.originalname, documentUrl, expiry_date, req.admin.id, notes]
        );

        return successResponse(res, { statusCode: 201, message: 'Document uploaded', data: rows[0] });
    } catch (err) {
        console.error('uploadDocument error:', err);
        return errorResponse(res, { statusCode: 500, message: 'Failed to upload document' });
    }
}

// DELETE /api/admin/candidates/:id/documents/:docId
async function deleteDocument(req, res) {
    try {
        const { id, docId } = req.params;
        const { rows } = await db.query(
            'SELECT document_url FROM candidate_documents WHERE id = $1 AND candidate_id = $2',
            [docId, id]
        );

        if (rows.length === 0) {
            return errorResponse(res, { statusCode: 404, message: 'Document not found' });
        }

        await deleteFile(rows[0].document_url);
        await db.query('DELETE FROM candidate_documents WHERE id = $1', [docId]);

        return successResponse(res, { message: 'Document deleted successfully' });
    } catch (err) {
        console.error('deleteDocument error:', err);
        return errorResponse(res, { statusCode: 500, message: 'Failed to delete document' });
    }
}

// PATCH /api/admin/candidates/:id/medical
async function updateMedicalStatus(req, res) {
    try {
        const { id } = req.params;
        const agencyId = req.agencyId;
        const { status, clearance_date, expiry_date } = req.body;

        const { rows } = await db.query(
            `UPDATE candidates SET
         medical_clearance_status = $1,
         medical_clearance_date = COALESCE($2, medical_clearance_date),
         medical_clearance_expiry = COALESCE($3, medical_clearance_expiry),
         updated_at = NOW()
       WHERE id = $4 AND agency_id = $5
       RETURNING id, medical_clearance_status, medical_clearance_date, medical_clearance_expiry`,
            [status, clearance_date, expiry_date, id, agencyId]
        );

        if (rows.length === 0) {
            return errorResponse(res, { statusCode: 404, message: 'Candidate not found' });
        }

        return successResponse(res, { message: 'Medical clearance updated', data: rows[0] });
    } catch (err) {
        console.error('updateMedicalStatus error:', err);
        return errorResponse(res, { statusCode: 500, message: 'Failed to update medical status' });
    }
}

// PATCH /api/admin/candidates/:id/featured
async function toggleFeatured(req, res) {
    try {
        const { id } = req.params;
        const agencyId = req.agencyId;
        const { is_featured } = req.body;

        const { rows } = await db.query(
            'UPDATE candidates SET is_featured = $1, updated_at = NOW() WHERE id = $2 AND agency_id = $3 RETURNING id, is_featured',
            [is_featured, id, agencyId]
        );

        if (rows.length === 0) {
            return errorResponse(res, { statusCode: 404, message: 'Candidate not found' });
        }

        return successResponse(res, { message: `Featured status updated to ${is_featured}`, data: rows[0] });
    } catch (err) {
        console.error('toggleFeatured error:', err);
        return errorResponse(res, { statusCode: 500, message: 'Failed to update featured status' });
    }
}

// PATCH /api/admin/candidates/:id/active
async function toggleActive(req, res) {
    try {
        const { id } = req.params;
        const agencyId = req.agencyId;
        const { is_active } = req.body;

        const { rows } = await db.query(
            'UPDATE candidates SET is_active = $1, updated_at = NOW() WHERE id = $2 AND agency_id = $3 RETURNING id, is_active',
            [is_active, id, agencyId]
        );

        if (rows.length === 0) {
            return errorResponse(res, { statusCode: 404, message: 'Candidate not found' });
        }

        return successResponse(res, { message: `Active status updated to ${is_active}`, data: rows[0] });
    } catch (err) {
        console.error('toggleActive error:', err);
        return errorResponse(res, { statusCode: 500, message: 'Failed to update active status' });
    }
}

module.exports = {
    getCandidates,
    getCandidateById,
    createCandidate,
    updateCandidate,
    deleteCandidate,
    uploadPhoto,
    uploadVideo,
    uploadDocument,
    deleteDocument,
    updateMedicalStatus,
    toggleFeatured,
    toggleActive
};

const fs = require('fs');
const path = require('path');
const { pool } = require('../config/db');

async function runMigrations() {
    console.log('🚀 Starting Database Migration...');
    const client = await pool.connect();
    try {
        // 1. Create tracking table
        await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

        // 2. Read migration file
        const migrationFile = path.resolve(__dirname, '../../../database/migrations/001_initial_schema.sql');
        if (fs.existsSync(migrationFile)) {
            const filename = path.basename(migrationFile);
            const { rows } = await client.query('SELECT id FROM schema_migrations WHERE filename = $1', [filename]);
            if (rows.length === 0) {
                console.log(`📦 Running migration: ${filename}`);
                const sql = fs.readFileSync(migrationFile, 'utf8');
                await client.query(sql);
                await client.query('INSERT INTO schema_migrations (filename) VALUES ($1)', [filename]);
                console.log(`✓ Completed migration: ${filename}`);
            } else {
                console.log(`ℹ Migration ${filename} already applied.`);
            }
        } else {
            console.warn(`⚠️ Migration file not found at ${migrationFile}`);
        }

        // 3. Seed data
        const seedFiles = [
            path.resolve(__dirname, '../../../database/seeds/subscription_plans.sql'),
            path.resolve(__dirname, '../../../database/seeds/categories.sql')
        ];

        for (const seedFile of seedFiles) {
            if (fs.existsSync(seedFile)) {
                const seedFilename = `seed_${path.basename(seedFile)}`;
                const { rows } = await client.query('SELECT id FROM schema_migrations WHERE filename = $1', [seedFilename]);
                if (rows.length === 0) {
                    console.log(`🌱 Seeding data: ${path.basename(seedFile)}`);
                    const seedSql = fs.readFileSync(seedFile, 'utf8');
                    await client.query(seedSql);
                    await client.query('INSERT INTO schema_migrations (filename) VALUES ($1)', [seedFilename]);
                    console.log(`✓ Completed seed: ${path.basename(seedFile)}`);
                } else {
                    console.log(`ℹ Seed ${path.basename(seedFile)} already applied.`);
                }
            }
        }

        console.log('✅ All migrations & seeds applied successfully.');
    } catch (err) {
        console.error('❌ Migration failed:', err);
        throw err;
    } finally {
        client.release();
    }
}

if (require.main === module) {
    runMigrations()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
}

module.exports = runMigrations;

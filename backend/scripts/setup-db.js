const { Client } = require('pg');
require('dotenv').config();

async function setupDatabase() {
    const client = new Client({
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432', 10),
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || '1832',
        database: 'postgres'
    });

    try {
        await client.connect();
        console.log('🔌 Connected to local PostgreSQL instance.');

        const res = await client.query(
            "SELECT 1 FROM pg_database WHERE datname = $1",
            [process.env.DB_NAME || 'recruitment_db']
        );

        if (res.rows.length === 0) {
            await client.query(`CREATE DATABASE "${process.env.DB_NAME || 'recruitment_db'}"`);
            console.log(`✅ Database "${process.env.DB_NAME || 'recruitment_db'}" created successfully.`);
        } else {
            console.log(`ℹ Database "${process.env.DB_NAME || 'recruitment_db'}" already exists.`);
        }
    } catch (err) {
        console.error('❌ Failed to setup database:', err.message);
        process.exit(1);
    } finally {
        await client.end();
    }
}

setupDatabase();

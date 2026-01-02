const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

const applyPatch = async () => {
    if (!process.env.DATABASE_URL) {
        console.error('DATABASE_URL not found in .env.local');
        process.exit(1);
    }

    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        const sql = fs.readFileSync('COMPLETE_INITIALIZATION_V4.sql', 'utf8');
        await client.query(sql);
        console.log('✅ COMPLETE INITIALIZATION V4 applied successfully (Tables + RLS + Columns).');
    } catch (err) {
        console.error('❌ Error applying patch:', err);
    } finally {
        await client.end();
    }
};

applyPatch();

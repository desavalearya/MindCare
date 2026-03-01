import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const candidates = [join(process.cwd(), 'server', '.env'), join(process.cwd(), '.env')];
for (const p of candidates) {
    if (existsSync(p)) {
        dotenv.config({ path: p });
        break;
    }
}

const MYSQL_CONFIG = {
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'MindMate',
};

async function checkDb() {
    try {
        const conn = await mysql.createConnection(MYSQL_CONFIG);
        console.log('Connected to DB');
        const [rows] = await conn.query('SELECT id, name, email, role FROM users');
        console.log('Users:', rows);
        await conn.end();
    } catch (err) {
        console.error('Error:', err);
    }
}

checkDb();

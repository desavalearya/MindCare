import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { existsSync } from 'node:fs';
import path, { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import bcrypt from 'bcryptjs';

{
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const candidates = [
    path.join(__dirname, '.env'),
    path.join(process.cwd(), '.env'),
    path.join(process.cwd(), 'server', '.env')
  ];
  for (const p of candidates) {
    if (existsSync(p)) {
      dotenv.config({ path: p });
      break;
    }
  }
}

const MYSQL_CONFIG = {
  host: process.env.DB_HOST || process.env.MYSQL_HOST || '127.0.0.1',
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : (process.env.MYSQL_PORT ? Number(process.env.MYSQL_PORT) : 3306),
  user: process.env.DB_USER || process.env.MYSQL_USER || 'root',
  password: process.env.DB_PASSWORD || process.env.MYSQL_PASSWORD || '',
};
const DATABASE_NAME = process.env.DB_NAME || process.env.MYSQL_DB || 'MindMate';

const db = {
  pool: null,
};

async function initDb() {
  console.log('Connecting to MySQL', { host: MYSQL_CONFIG.host, port: MYSQL_CONFIG.port, user: MYSQL_CONFIG.user, hasPassword: !!MYSQL_CONFIG.password });
  const conn = await mysql.createConnection(MYSQL_CONFIG);
  await conn.query(`CREATE DATABASE IF NOT EXISTS \`${DATABASE_NAME}\``);
  await conn.query(`USE \`${DATABASE_NAME}\``);
  await conn.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      role ENUM('user','counsellor','admin') NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;
  `);
  await conn.end();

  db.pool = mysql.createPool({ ...MYSQL_CONFIG, database: DATABASE_NAME, waitForConnections: true, connectionLimit: 10 });

  // Seed an admin if none exists
  const [rows] = await db.pool.query('SELECT id FROM users WHERE role = "admin" LIMIT 1');
  if (Array.isArray(rows) && rows.length === 0) {
    const hash = await bcrypt.hash('admin123', 12);
    await db.pool.query('INSERT INTO users (name, email, password, role) VALUES (?,?,?,?)', [
      'Administrator',
      'admin@mindmate.local',
      hash,
      'admin',
    ]);
    console.log('Seeded default admin: admin@mindmate.local / admin123');
  }
}

export { initDb, db };

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const host = process.env.DB_HOST || process.env.MYSQL_HOST || '127.0.0.1';
const port = Number(process.env.DB_PORT || process.env.MYSQL_PORT || 3306);
const user = process.env.DB_USER || process.env.MYSQL_USER || 'root';
const password = process.env.DB_PASSWORD || process.env.MYSQL_PASSWORD || '';
const database = process.env.DB_NAME || process.env.MYSQL_DB || 'MindMate';

export const pool = mysql.createPool({ host, port, user, password, database, waitForConnections: true, connectionLimit: 10 });

export async function verifyConnection() {
  const conn = await pool.getConnection();
  try {
    await conn.query('SELECT 1');
  } finally {
    conn.release();
  }
}
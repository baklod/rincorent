import mysql, { type Pool } from "mysql2/promise";

const schemaVersion = 2;

const globalForMysql = globalThis as unknown as {
  mysqlPool?: Pool;
  mysqlReady?: Promise<void>;
  mysqlSchemaVersion?: number;
};

function databaseName() {
  const name = process.env.MYSQL_DATABASE ?? "practice_app";
  if (!/^[A-Za-z0-9_]+$/.test(name)) {
    throw new Error("MYSQL_DATABASE may only contain letters, numbers, and underscores.");
  }
  return name;
}

function connectionOptions() {
  return {
    host: process.env.MYSQL_HOST ?? "127.0.0.1",
    port: Number(process.env.MYSQL_PORT ?? 3306),
    user: process.env.MYSQL_USER ?? "root",
    password: process.env.MYSQL_PASSWORD ?? "",
  };
}

export function getPool() {
  if (!globalForMysql.mysqlPool) {
    globalForMysql.mysqlPool = mysql.createPool({
      ...connectionOptions(),
      database: databaseName(),
      waitForConnections: true,
      connectionLimit: 10,
    });
  }

  return globalForMysql.mysqlPool;
}

export async function ensureSchema() {
  if (globalForMysql.mysqlSchemaVersion !== schemaVersion) {
    globalForMysql.mysqlReady = undefined;
  }

  if (!globalForMysql.mysqlReady) {
    globalForMysql.mysqlSchemaVersion = schemaVersion;
    globalForMysql.mysqlReady = setupSchema().catch((error: unknown) => {
      globalForMysql.mysqlReady = undefined;
      globalForMysql.mysqlSchemaVersion = undefined;
      throw error;
    });
  }

  await globalForMysql.mysqlReady;
}

async function setupSchema() {
  const name = databaseName();
  const admin = await mysql.createConnection(connectionOptions());

  try {
    await admin.query(
      `CREATE DATABASE IF NOT EXISTS \`${name}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
    );
  } finally {
    await admin.end();
  }

  const pool = getPool();
  await pool.query("DROP TABLE IF EXISTS notes");
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT UNSIGNED NOT NULL AUTO_INCREMENT,
      name VARCHAR(80) NOT NULL,
      email VARCHAR(255) NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY users_email (email)
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS sessions (
      id CHAR(64) NOT NULL,
      user_id INT UNSIGNED NOT NULL,
      expires_at DATETIME NOT NULL,
      PRIMARY KEY (id),
      KEY sessions_user_id (user_id),
      CONSTRAINT sessions_user_fk FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `);
}

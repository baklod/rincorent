import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { cookies } from "next/headers";
import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { ensureSchema, getPool } from "@/lib/db";

const scryptAsync = promisify(scrypt);
const sessionCookie = "practice_session";
const sessionDays = 7;

export const demoAccount = {
  name: "Demo",
  email: "demo@practice.local",
  password: "practice123",
};

export type CurrentUser = {
  id: number;
  name: string;
  email: string;
};

type UserRow = RowDataPacket & {
  id: number;
  name: string;
  email: string;
  passwordHash: string;
};

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scryptAsync(password, salt, 64)) as Buffer;
  return `scrypt:${salt}:${derived.toString("hex")}`;
}

async function verifyPassword(password: string, stored: string) {
  const [scheme, salt, hash] = stored.split(":");
  if (scheme !== "scrypt" || !salt || !hash) {
    return false;
  }

  const derived = (await scryptAsync(password, salt, 64)) as Buffer;
  const expected = Buffer.from(hash, "hex");
  if (derived.length !== expected.length) {
    return false;
  }

  return timingSafeEqual(derived, expected);
}

async function ensureDemoUser() {
  const [rows] = await getPool().query<RowDataPacket[]>(
    "SELECT COUNT(*) AS count FROM users",
  );
  if (Number(rows[0]?.count ?? 0) > 0) {
    return;
  }

  await getPool().execute(
    "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
    [
      demoAccount.name,
      demoAccount.email,
      await hashPassword(demoAccount.password),
    ],
  );
}

async function ready() {
  await ensureSchema();
  await ensureDemoUser();
}

export async function authenticate(email: string, password: string) {
  await ready();
  const [rows] = await getPool().execute<UserRow[]>(
    `SELECT id, name, email, password_hash AS passwordHash
     FROM users
     WHERE email = ?
     LIMIT 1`,
    [email],
  );
  const user = rows[0];
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return null;
  }

  return {
    id: Number(user.id),
    name: String(user.name),
    email: String(user.email),
  } satisfies CurrentUser;
}

export async function registerUser(
  name: string,
  email: string,
  password: string,
) {
  await ready();

  try {
    const [result] = await getPool().execute<ResultSetHeader>(
      "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
      [name, email, await hashPassword(password)],
    );

    return {
      id: Number(result.insertId),
      name,
      email,
    } satisfies CurrentUser;
  } catch (error) {
    if (isDuplicateEmail(error)) {
      return null;
    }
    throw error;
  }
}

function isDuplicateEmail(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "ER_DUP_ENTRY"
  );
}

export async function createSession(userId: number) {
  const token = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + sessionDays * 24 * 60 * 60 * 1000);
  await getPool().execute(
    "INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)",
    [token, userId, expires],
  );

  const cookieStore = await cookies();
  cookieStore.set(sessionCookie, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires,
  });
}

export async function getCurrentUser() {
  await ready();
  const cookieStore = await cookies();
  const token = cookieStore.get(sessionCookie)?.value;
  if (!token || !/^[a-f0-9]{64}$/.test(token)) {
    return null;
  }

  const [rows] = await getPool().execute<Array<RowDataPacket & CurrentUser>>(
    `SELECT u.id, u.name, u.email
     FROM sessions s
     INNER JOIN users u ON u.id = s.user_id
     WHERE s.id = ? AND s.expires_at > NOW()
     LIMIT 1`,
    [token],
  );
  const user = rows[0];
  if (!user) {
    return null;
  }

  return {
    id: Number(user.id),
    name: String(user.name),
    email: String(user.email),
  } satisfies CurrentUser;
}

export async function destroySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(sessionCookie)?.value;
  if (token && /^[a-f0-9]{64}$/.test(token)) {
    await ensureSchema();
    await getPool().execute("DELETE FROM sessions WHERE id = ?", [token]);
  }
  cookieStore.delete(sessionCookie);
}

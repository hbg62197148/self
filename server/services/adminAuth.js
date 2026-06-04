import bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";
import { db } from "../db.js";

const SESSION_COOKIE = "personal_issue_admin";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 12;
const sessions = new Map();

function now() {
  return new Date().toISOString();
}

export function ensureDefaultAdmin() {
  const exists = db.prepare("SELECT id FROM admin_users LIMIT 1").get();

  if (exists) return;

  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;

  if (!username || !password) {
    throw new Error("请在 .env 中配置 ADMIN_USERNAME 和 ADMIN_PASSWORD");
  }

  db.prepare(`
    INSERT INTO admin_users (username, password_hash, created_at)
    VALUES (?, ?, ?)
  `).run(username, bcrypt.hashSync(password, 12), now());
}

function parseCookies(cookieHeader = "") {
  return cookieHeader
    .split(";")
    .map((item) => item.trim())
    .filter(Boolean)
    .reduce((cookies, item) => {
      const [name, ...rest] = item.split("=");
      cookies[name] = decodeURIComponent(rest.join("="));
      return cookies;
    }, {});
}

function cleanupExpiredSessions() {
  const current = Date.now();

  for (const [token, session] of sessions.entries()) {
    if (session.expiresAt <= current) {
      sessions.delete(token);
    }
  }
}

function buildCookie(token, maxAgeSeconds) {
  return `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAgeSeconds}`;
}

export function loginAdmin(username, password) {
  const user = db.prepare("SELECT * FROM admin_users WHERE username = ?").get(username);

  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return null;
  }

  cleanupExpiredSessions();

  const token = randomUUID();

  sessions.set(token, {
    username: user.username,
    expiresAt: Date.now() + SESSION_MAX_AGE_SECONDS * 1000
  });

  return token;
}

export function changeAdminPassword(username, currentPassword, nextPassword) {
  const user = db.prepare("SELECT * FROM admin_users WHERE username = ?").get(username);

  if (!user || !bcrypt.compareSync(currentPassword, user.password_hash)) {
    return false;
  }

  db.prepare("UPDATE admin_users SET password_hash = ? WHERE id = ?").run(bcrypt.hashSync(nextPassword, 12), user.id);

  for (const [token, session] of sessions.entries()) {
    if (session.username === username) {
      sessions.delete(token);
    }
  }

  return true;
}

export function getAdminSession(request) {
  cleanupExpiredSessions();

  const cookies = parseCookies(request.headers.cookie ?? "");
  const token = cookies[SESSION_COOKIE];

  if (!token) return null;

  const session = sessions.get(token);

  if (!session) return null;

  return {
    token,
    ...session
  };
}

export function setAdminSessionCookie(response, token) {
  response.setHeader("Set-Cookie", buildCookie(token, SESSION_MAX_AGE_SECONDS));
}

export function clearAdminSession(request, response) {
  const session = getAdminSession(request);

  if (session?.token) {
    sessions.delete(session.token);
  }

  response.setHeader("Set-Cookie", buildCookie("", 0));
}

export function requireAdminSession(request, response, next) {
  const session = getAdminSession(request);

  if (!session) {
    response.status(401).json({
      message: "请先登录后台。"
    });
    return;
  }

  request.adminSession = session;
  next();
}

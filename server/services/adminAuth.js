import { randomUUID } from "node:crypto";

const ADMIN_USERNAME = "hbg62197148";
const ADMIN_PASSWORD = "62197148ax.";
const SESSION_COOKIE = "personal_issue_admin";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 12;
const sessions = new Map();

// 用最小代价解析 Cookie，给后台登录态做会话识别。
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
  const now = Date.now();

  Array.from(sessions.entries()).forEach(([token, session]) => {
    if (session.expiresAt <= now) {
      sessions.delete(token);
    }
  });
}

function buildCookie(token, maxAgeSeconds) {
  return `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAgeSeconds}`;
}

// 只有账号密码完全匹配时，才会创建后台会话。
export function loginAdmin(username, password) {
  if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
    return null;
  }

  cleanupExpiredSessions();

  const token = randomUUID();
  sessions.set(token, {
    username: ADMIN_USERNAME,
    expiresAt: Date.now() + SESSION_MAX_AGE_SECONDS * 1000
  });

  return token;
}

export function getAdminSession(request) {
  cleanupExpiredSessions();

  const cookies = parseCookies(request.headers.cookie ?? "");
  const token = cookies[SESSION_COOKIE];

  if (!token) {
    return null;
  }

  const session = sessions.get(token);

  if (!session) {
    return null;
  }

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

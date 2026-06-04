import "dotenv/config";
import express from "express";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  changeAdminPassword,
  clearAdminSession,
  ensureDefaultAdmin,
  getAdminSession,
  loginAdmin,
  requireAdminSession,
  setAdminSessionCookie
} from "./services/adminAuth.js";
import { createContactChallenge, verifyContactChallenge } from "./services/contactProtection.js";
import {
  getDraftProfile,
  getPublishedProfile,
  listProfileVersions,
  publishProfile,
  saveDraftProfile
} from "./services/profileStore.js";
import { sanitizeProfileForPublic } from "./services/publicProfile.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const distDir = path.join(rootDir, "dist");
const app = express();
const port = Number(process.env.PORT) || 3001;

ensureDefaultAdmin();

app.use(express.json({ limit: "2mb" }));

app.post("/api/admin/login", (request, response) => {
  const username = request.body?.username?.trim?.() ?? "";
  const password = request.body?.password ?? "";

  if (!username || !password) {
    response.status(400).json({
      message: "请输入账号和密码。"
    });
    return;
  }

  const token = loginAdmin(username, password);

  if (!token) {
    response.status(401).json({
      message: "账号或密码错误。"
    });
    return;
  }

  setAdminSessionCookie(response, token);
  response.json({
    message: "登录成功。",
    data: {
      username
    }
  });
});

app.get("/api/admin/session", (request, response) => {
  const session = getAdminSession(request);

  if (!session) {
    response.status(401).json({
      message: "当前未登录后台。"
    });
    return;
  }

  response.json({
    data: {
      username: session.username
    }
  });
});

app.post("/api/admin/logout", (request, response) => {
  clearAdminSession(request, response);
  response.json({
    message: "已退出后台登录。"
  });
});

app.post("/api/admin/change-password", requireAdminSession, (request, response) => {
  const currentPassword = request.body?.currentPassword ?? "";
  const nextPassword = request.body?.newPassword ?? "";

  if (!currentPassword || !nextPassword) {
    response.status(400).json({
      message: "请输入当前密码和新密码。"
    });
    return;
  }

  if (nextPassword.length < 8) {
    response.status(400).json({
      message: "新密码至少需要 8 位。"
    });
    return;
  }

  if (currentPassword === nextPassword) {
    response.status(400).json({
      message: "新密码不能和当前密码相同。"
    });
    return;
  }

  const changed = changeAdminPassword(request.adminSession.username, currentPassword, nextPassword);

  if (!changed) {
    response.status(400).json({
      message: "当前密码不正确。"
    });
    return;
  }

  clearAdminSession(request, response);
  response.json({
    message: "密码已修改，请重新登录。",
    data: {
      username: request.adminSession.username
    }
  });
});

app.post("/api/contact/challenge", async (request, response) => {
  try {
    const label = request.body?.label?.trim?.() ?? "";
    const profile = getPublishedProfile();
    const challenge = createContactChallenge(profile, label);

    if (!challenge) {
      response.status(404).json({
        message: "未找到需要保护的联系方式。"
      });
      return;
    }

    response.json({
      data: challenge
    });
  } catch (error) {
    response.status(500).json({
      message: "验证码创建失败，请稍后重试。",
      error: error instanceof Error ? error.message : "未知错误"
    });
  }
});

app.post("/api/contact/access", async (request, response) => {
  try {
    const label = request.body?.label?.trim?.() ?? "";
    const answer = request.body?.answer ?? "";
    const challengeId = request.body?.challengeId ?? "";
    const profile = getPublishedProfile();
    const result = verifyContactChallenge(profile, challengeId, label, answer);

    if (!result.success) {
      response.status(400).json({
        message: result.message
      });
      return;
    }

    response.json({
      data: result.item
    });
  } catch (error) {
    response.status(500).json({
      message: "联系方式验证失败，请稍后重试。",
      error: error instanceof Error ? error.message : "未知错误"
    });
  }
});

app.get("/api/profile", (request, response) => {
  try {
    response.json({
      data: sanitizeProfileForPublic(getPublishedProfile())
    });
  } catch (error) {
    response.status(500).json({
      message: "读取内容失败",
      error: error instanceof Error ? error.message : "未知错误"
    });
  }
});

app.get("/api/admin/profile/draft", requireAdminSession, (request, response) => {
  try {
    response.json({
      data: getDraftProfile()
    });
  } catch (error) {
    response.status(500).json({
      message: "读取草稿失败",
      error: error instanceof Error ? error.message : "未知错误"
    });
  }
});

app.put("/api/admin/profile/draft", requireAdminSession, (request, response) => {
  try {
    response.json({
      message: "草稿已保存",
      data: saveDraftProfile(request.body)
    });
  } catch (error) {
    response.status(500).json({
      message: "保存草稿失败",
      error: error instanceof Error ? error.message : "未知错误"
    });
  }
});

app.post("/api/admin/profile/publish", requireAdminSession, (request, response) => {
  try {
    response.json({
      message: "内容已发布",
      data: publishProfile(request.body)
    });
  } catch (error) {
    response.status(500).json({
      message: "发布失败",
      error: error instanceof Error ? error.message : "未知错误"
    });
  }
});

app.get("/api/admin/profile/versions", requireAdminSession, (request, response) => {
  try {
    response.json({
      data: listProfileVersions()
    });
  } catch (error) {
    response.status(500).json({
      message: "读取历史版本失败",
      error: error instanceof Error ? error.message : "未知错误"
    });
  }
});

if (existsSync(distDir)) {
  // 生产环境下由同一个服务同时提供前台页面和内容接口。
  app.use(express.static(distDir));

  app.use((request, response) => {
    response.sendFile(path.join(distDir, "index.html"));
  });
}

app.listen(port, () => {
  console.log(`Content server is running at http://127.0.0.1:${port}`);
});

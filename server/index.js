import express from "express";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readProfile, writeProfile } from "./services/profileStore.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const distDir = path.join(rootDir, "dist");
const app = express();
const port = Number(process.env.PORT) || 3001;

app.use(express.json({ limit: "2mb" }));

app.get("/api/profile", async (request, response) => {
  try {
    const profile = await readProfile();
    response.json({ data: profile });
  } catch (error) {
    response.status(500).json({
      message: "读取内容失败",
      error: error instanceof Error ? error.message : "未知错误"
    });
  }
});

app.put("/api/profile", async (request, response) => {
  try {
    const profile = await writeProfile(request.body);
    response.json({
      message: "内容已发布",
      data: profile
    });
  } catch (error) {
    response.status(500).json({
      message: "保存内容失败",
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

# Personal Issue

一个基于 `Vue 3 + Vite + Express + SQLite + GSAP + Three.js` 的个人主页与轻量后台内容管理项目。

项目分为前台展示和后台编辑两部分：前台通过接口读取已发布内容，后台登录后维护草稿、发布版本和账号密码。内容不再依赖重新打包，也不再以单个 JSON 文件作为主要运行数据源。

## 项目概览

- 前台个人主页：`/`
- 后台内容管理页：`/admin`
- Express 接口服务：`server/index.js`
- 运行时数据库：`server/data/app.sqlite`
- 默认内容模板：`src/data/profile.js`

`server/data/profile.json` 是旧版本遗留数据文件，当前服务代码不再主要读取它。现在真正使用的是 SQLite。

## 技术栈

前端：

- `Vue 3`
- `Vue Router`
- `Vite`
- `GSAP / ScrollTrigger`
- `Three.js`
- 原生 `CSS`
- `@fontsource/bebas-neue`
- `@fontsource/manrope`

后端：

- `Express`
- `better-sqlite3`
- `bcryptjs`
- `dotenv`
- Cookie 会话登录

## 当前功能

### 前台展示

前台由 6 个主要区块组成：

- `Hero`：首页标题、CTA、Three.js 信号核心和个人信息卡片
- `Identity`：身份字母拆解、中文释义和交互反馈
- `About`：个人介绍、问答切换和 Profile Map 视觉层
- `Skills`：Three.js 技能宇宙、技能节点联动和技能卡片
- `Projects`：项目列表、详情面板和移动端抽屉详情
- `Contact`：联系方式展示、复制/跳转和验证码保护

相关目录：

- [src/components/sections](./src/components/sections)
- [src/views/ProfilePage.vue](./src/views/ProfilePage.vue)

### 中英文切换

前台支持中文 / 英文切换。后台仍维护一份基础内容，前台通过本地化映射生成当前语言的展示文案。

相关文件：

- [src/composables/useLocale.js](./src/composables/useLocale.js)
- [src/i18n/profileLocale.js](./src/i18n/profileLocale.js)
- [src/components/layout/SiteHeader.vue](./src/components/layout/SiteHeader.vue)

### 后台内容管理

后台支持编辑：

- 首页资料
- 身份拆解
- 个人介绍
- 问答内容
- 技能内容
- 项目内容
- 联系方式

后台现在区分“保存草稿”和“发布内容”：

- 保存草稿：写入 `draft` 版本，前台不会更新
- 发布内容：写入 `published` 版本，前台读取最新发布版
- 历史版本：后台会读取最近的版本列表

相关文件：

- [src/views/AdminPage.vue](./src/views/AdminPage.vue)
- [src/components/admin](./src/components/admin)
- [src/services/profileApi.js](./src/services/profileApi.js)
- [src/utils/profileValidation.js](./src/utils/profileValidation.js)
- [server/services/profileStore.js](./server/services/profileStore.js)

### 登录与账号安全

后台登录使用 SQLite + bcrypt hash：

- 首次启动时从 `.env` 读取 `ADMIN_USERNAME` 和 `ADMIN_PASSWORD`
- 初始化后写入 `admin_users.password_hash`
- 后续登录校验数据库中的 hash
- 后台提供“账号安全”面板，可以修改登录密码
- 修改密码成功后会清空当前用户 session，需要重新登录

`.env` 示例：

```env
ADMIN_USERNAME=admin
ADMIN_PASSWORD=change-me-please
PORT=3001
```

注意：`.env` 只用于首次初始化管理员账号。数据库已经存在管理员后，直接改 `.env` 不会自动修改登录密码。忘记密码时，应通过本地数据库重置或专门的本地重置脚本处理，不建议在公开登录页放“忘记密码”入口。

相关文件：

- [server/services/adminAuth.js](./server/services/adminAuth.js)
- [src/services/adminAuthApi.js](./src/services/adminAuthApi.js)
- [src/components/admin/AdminLoginForm.vue](./src/components/admin/AdminLoginForm.vue)
- [src/components/admin/AdminPasswordEditor.vue](./src/components/admin/AdminPasswordEditor.vue)

### 联系方式保护

前台不会直接暴露完整的受保护联系方式。

流程：

1. `GET /api/profile` 返回已发布内容，并对受保护联系方式脱敏。
2. 用户点击复制或发送。
3. 前台调用 `POST /api/contact/challenge` 创建验证码。
4. 用户提交答案到 `POST /api/contact/access`。
5. 验证通过后服务端返回真实联系方式，前台再复制或跳转。

相关文件：

- [src/composables/useProtectedContactAction.js](./src/composables/useProtectedContactAction.js)
- [src/components/contact/ContactCaptchaDialog.vue](./src/components/contact/ContactCaptchaDialog.vue)
- [server/services/contactProtection.js](./server/services/contactProtection.js)
- [server/services/publicProfile.js](./server/services/publicProfile.js)

### 动效系统

项目保留了较丰富的动效，但目前主线更清晰：

- 首页模块切换以 `ScrollTrigger` 面板切换为主
- 桌面端滚动到模块底部时，当前模块 pin 住并缩放淡出
- 内容高于视口的模块会先做内部假滚动，再切换到下一模块
- 移动端和 `Lite` 模式会降级为更自然的滚动体验
- Hero 首屏、CTA、Identity、Projects、Skills 等内部交互动画继续保留

主要文件：

- [src/composables/useSectionTransitionMotion.js](./src/composables/useSectionTransitionMotion.js)
- [src/composables/useHeroMotion.js](./src/composables/useHeroMotion.js)
- [src/composables/useIdentityMotion.js](./src/composables/useIdentityMotion.js)
- [src/composables/useProjectPanelMotion.js](./src/composables/useProjectPanelMotion.js)
- [src/composables/useSurfaceMotion.js](./src/composables/useSurfaceMotion.js)
- [src/composables/useMotionPreference.js](./src/composables/useMotionPreference.js)

左下角动效开关可在完整动效和 `Lite` 模式之间切换，偏好会写入 `localStorage`。

### Three.js 视觉层

Three.js 用在前台重点视觉区：

- Hero 的信号核心
- Skills 的技能宇宙
- About 的 Profile Map

相关文件：

- [src/components/visuals/HeroSignalCoreScene.vue](./src/components/visuals/HeroSignalCoreScene.vue)
- [src/components/visuals/SkillUniverseScene.vue](./src/components/visuals/SkillUniverseScene.vue)
- [src/components/visuals/ProfileMapScene.vue](./src/components/visuals/ProfileMapScene.vue)

## 数据存储

当前运行数据存放在 SQLite：

```text
server/data/app.sqlite
server/data/app.sqlite-wal
server/data/app.sqlite-shm
```

主要表：

- `admin_users`：后台账号和 `password_hash`
- `profile_versions`：内容版本，`status` 为 `draft` 或 `published`

不要直接删除这些 SQLite 文件，否则会丢失后台账号、草稿、发布内容和历史版本。

`server/data/profile.json` 是旧版本 JSON 数据，当前代码不再主要使用。需要保留历史参考时可以改名为 `profile.legacy.json`。

## 数据流

1. 后台 `/admin` 登录。
2. 后台读取 `GET /api/admin/profile/draft`。
3. 点击“保存草稿”调用 `PUT /api/admin/profile/draft`，前台不更新。
4. 点击“发布内容”调用 `POST /api/admin/profile/publish`。
5. 前台通过 `GET /api/profile` 读取最新已发布版本。
6. `useProfileContent` 会定时轮询，发布后前台可自动刷新。

## 接口说明

后台账号：

- `POST /api/admin/login`：登录
- `GET /api/admin/session`：读取当前登录状态
- `POST /api/admin/logout`：退出登录
- `POST /api/admin/change-password`：修改后台密码，需要登录

内容管理：

- `GET /api/profile`：读取前台公开内容，只返回已发布版本
- `GET /api/admin/profile/draft`：读取后台草稿，需要登录
- `PUT /api/admin/profile/draft`：保存草稿，需要登录
- `POST /api/admin/profile/publish`：发布内容，需要登录
- `GET /api/admin/profile/versions`：读取历史版本列表，需要登录

联系方式保护：

- `POST /api/contact/challenge`：创建验证码挑战
- `POST /api/contact/access`：验证通过后返回真实联系方式

## 本地开发

环境要求：

- `Node.js 18+`
- `npm 9+`

安装依赖：

```bash
npm install
```

创建 `.env`：

```env
ADMIN_USERNAME=admin
ADMIN_PASSWORD=change-me-please
PORT=3001
```

启动开发环境：

```bash
npm run dev
```

这个命令会同时启动：

- Vite 前端：`http://127.0.0.1:5173/`
- Express 服务：`http://127.0.0.1:3001/`

后台地址：

```text
http://127.0.0.1:5173/admin
```

不要直接打开 `dist/index.html` 文件访问后台，否则接口、路由和 Cookie 行为都可能不正常。

## 手机访问本地页面

一个终端启动后端：

```bash
npm run dev:server
```

另一个终端启动前端并监听局域网：

```bash
npm run dev:client -- --host 0.0.0.0
```

然后用 `ipconfig` 找到电脑的 IPv4 地址，手机和电脑连接同一个 Wi-Fi 后访问：

```text
http://你的电脑IPv4地址:5173
```

## 构建与生产运行

构建前端：

```bash
npm run build
```

预览前端构建结果：

```bash
npm run preview
```

启动 Express 生产服务：

```bash
npm run start
```

如果存在 `dist/`，Express 会同时托管前端静态页面和 `/api` 接口。

## 路由

前端路由：

- `/`：前台个人主页
- `/admin`：后台内容管理页

配置文件：

- [src/router/index.js](./src/router/index.js)

## 目录结构

```text
.
├── public/                      # 公共静态资源
├── server/                      # Express 服务
│   ├── data/
│   │   ├── app.sqlite           # SQLite 主数据库
│   │   ├── app.sqlite-wal       # SQLite WAL 文件
│   │   ├── app.sqlite-shm       # SQLite 共享内存文件
│   │   └── profile.json         # 旧版本遗留 JSON 数据
│   ├── services/
│   │   ├── adminAuth.js         # 后台登录、会话、修改密码
│   │   ├── contactProtection.js # 联系方式验证码保护
│   │   ├── profileStore.js      # SQLite 内容版本读写
│   │   └── publicProfile.js     # 前台公开数据脱敏
│   ├── db.js                    # SQLite 初始化
│   └── index.js                 # 服务入口
├── src/
│   ├── components/
│   │   ├── admin/               # 后台编辑组件
│   │   ├── contact/             # 联系验证码弹窗
│   │   ├── layout/              # 页头、页脚、加载层、动效开关
│   │   ├── sections/            # 前台主要区块
│   │   └── visuals/             # Three.js 视觉层
│   ├── composables/             # 页面逻辑、数据和动效逻辑
│   ├── data/                    # 默认内容模板
│   ├── i18n/                    # 前台语言映射
│   ├── router/                  # 前端路由
│   ├── services/                # 前端 API 封装
│   ├── utils/                   # 内容校验
│   ├── views/                   # 页面级视图
│   ├── App.vue
│   ├── fonts.css
│   ├── main.js
│   └── styles.css
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## 关键文件

前台页面：

- [src/views/ProfilePage.vue](./src/views/ProfilePage.vue)
- [src/components/sections](./src/components/sections)

后台页面：

- [src/views/AdminPage.vue](./src/views/AdminPage.vue)
- [src/components/admin](./src/components/admin)

API 封装：

- [src/services/profileApi.js](./src/services/profileApi.js)
- [src/services/adminAuthApi.js](./src/services/adminAuthApi.js)
- [src/services/contactAccessApi.js](./src/services/contactAccessApi.js)

后端服务：

- [server/index.js](./server/index.js)
- [server/db.js](./server/db.js)
- [server/services/adminAuth.js](./server/services/adminAuth.js)
- [server/services/profileStore.js](./server/services/profileStore.js)
- [server/services/publicProfile.js](./server/services/publicProfile.js)

## 可继续优化

- 增加本地管理员密码重置脚本
- 增加登录失败限频
- 增加联系接口限频
- 增加图片上传能力
- 增加历史版本查看详情和回滚
- 增加项目详情页或文章模块
- 对低性能设备进一步自动降级动画

## License

如果后续公开发布，建议补充或确认许可证内容是否符合你的使用场景。

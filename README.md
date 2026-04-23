# Personal Issue

一个基于 `Vue 3 + Vite + Express` 搭建的个人主页项目。  
它既是一个前台展示站，也是一个带后台内容管理能力的轻量内容系统。

项目当前包含这些核心能力：

- 前台个人主页展示
- 后台内容编辑与发布
- 运行时读取内容，不用每次改完都重新打包
- 后台登录鉴权
- 联系方式脱敏与验证码保护

## 项目定位

这个项目的目标不是做一个通用博客框架，而是围绕“个人主页 / 作品集 / 求职展示”这类场景，做一套：

- 表达力更强的前台页面
- 可维护的 Vue 组件结构
- 可以直接编辑内容的后台能力
- 轻量但完整的前后端数据流

## 技术栈

### 前端

- `Vue 3`
- `Vue Router`
- `Vite`
- 原生 `CSS`

### 后端

- `Express`
- 本地 `JSON` 文件持久化

### 运行方式

- 开发环境：Vite 前端 + Node 内容服务并行启动
- 生产环境：构建前端后，由 Node 服务同时提供页面与接口

## 项目架构

### 1. 前台展示层

前台页面使用 Vue 单页应用实现，主要负责：

- 首页视觉展示
- 身份拆解模块
- About 模块互动
- 技能宇宙模块互动
- 项目展示
- 联系方式保护交互

主要入口：

- [src/main.js](./src/main.js)
- [src/App.vue](./src/App.vue)
- [src/router/index.js](./src/router/index.js)
- [src/views/ProfilePage.vue](./src/views/ProfilePage.vue)

### 2. 后台内容管理层

后台页面用于编辑站点内容，支持修改：

- Hero 区内容
- Identity 区内容
- About 区内容
- Skills 区内容
- Projects 区内容
- Questions 区内容
- Contact 区内容

主要入口：

- [src/views/AdminPage.vue](./src/views/AdminPage.vue)
- [src/components/admin](./src/components/admin)

### 3. 内容接口层

Node 服务负责：

- 提供内容读取接口
- 处理后台登录与会话
- 接收后台发布内容
- 保护联系方式数据

主要文件：

- [server/index.js](./server/index.js)
- [server/services/adminAuth.js](./server/services/adminAuth.js)
- [server/services/profileStore.js](./server/services/profileStore.js)
- [server/services/publicProfile.js](./server/services/publicProfile.js)
- [server/services/contactProtection.js](./server/services/contactProtection.js)

### 4. 数据存储层

项目当前使用本地 JSON 文件做内容存储：

- [server/data/profile.json](./server/data/profile.json)

也就是说，后台发布后的内容会直接写入这个文件，前台通过接口读取最新内容。

## 核心功能

### 1. 前台展示页面

前台页面采用单页结构，包含多个分区：

- `Hero`
- `Identity`
- `About`
- `Skills`
- `Projects`
- `Contact`

对应组件目录：

- [src/components/sections](./src/components/sections)

### 2. 后台内容管理

后台支持直接编辑前台内容，并通过接口发布。

发布链路如下：

1. 在 `/admin` 页面编辑内容
2. 前端调用 `PUT /api/profile`
3. 服务端写入 `server/data/profile.json`
4. 前台通过 `GET /api/profile` 获取最新内容

这样就实现了：

- 修改内容不再依赖手改源码
- 不用每次重新打包前端
- 前台展示的数据和后台编辑的数据保持一致

### 3. 后台登录鉴权

后台页面带登录保护，只有正确登录后才能进入编辑页和发布内容。

当前账号密码写在：

- [server/services/adminAuth.js](./server/services/adminAuth.js)

当前默认账号：

- 账号：`hbg62197148`
- 密码：`62197148ax.`

说明：

- 当前版本适合本地演示和作品展示
- 如果后续部署到公网，建议改成环境变量或数据库配置，不要继续硬编码

### 4. 联系方式保护

为了避免前台公开暴露真实邮箱和微信，项目增加了联系方式保护逻辑：

- 前台默认展示脱敏后的联系方式
- 点击复制或发送前，需要先完成验证码校验
- 公共接口返回的是脱敏数据，不直接暴露真实联系方式

对应文件：

- [src/components/sections/ContactSection.vue](./src/components/sections/ContactSection.vue)
- [src/components/contact/ContactCaptchaDialog.vue](./src/components/contact/ContactCaptchaDialog.vue)
- [src/composables/useProtectedContactAction.js](./src/composables/useProtectedContactAction.js)
- [server/services/publicProfile.js](./server/services/publicProfile.js)
- [server/services/contactProtection.js](./server/services/contactProtection.js)

### 5. 页面互动效果

项目当前已经做了一些局部交互动效，例如：

- 首页主视觉球体缓慢漂移并碰壁反弹
- About 模块蜘蛛点击后吐丝下落并回弹
- Skills 模块节点联动、动态连线、核心脉冲
- Identity 模块字母翻面、行级横向视差、非当前行降亮

相关逻辑主要放在：

- [src/composables/useBouncingDisc.js](./src/composables/useBouncingDisc.js)
- [src/composables/useSkillUniverse.js](./src/composables/useSkillUniverse.js)
- [src/components/sections/AboutSection.vue](./src/components/sections/AboutSection.vue)
- [src/components/sections/IdentitySection.vue](./src/components/sections/IdentitySection.vue)
- [src/components/sections/SkillsSection.vue](./src/components/sections/SkillsSection.vue)

## 接口说明

### 后台登录相关

- `POST /api/admin/login`
  - 后台登录
- `GET /api/admin/session`
  - 获取当前登录状态
- `POST /api/admin/logout`
  - 退出后台登录

### 内容相关

- `GET /api/profile`
  - 获取前台内容
  - 未登录时返回脱敏后的公共数据
  - 已登录时返回完整数据
- `PUT /api/profile`
  - 发布后台编辑内容
  - 需要登录态

### 联系方式保护相关

- `POST /api/contact/challenge`
  - 创建验证码挑战
- `POST /api/contact/access`
  - 验证通过后返回真实联系方式

## 本地开发

### 环境要求

- `Node.js 18+` 推荐
- `npm 9+` 推荐

### 安装依赖

```bash
npm install
```

### 启动开发环境

```bash
npm run dev
```

这个命令会同时启动：

- Vite 前端开发服务
- Node 内容服务

默认可访问地址：

- 前台：`http://127.0.0.1:5173/`
- 后台：`http://127.0.0.1:5173/admin`
- 内容服务：`http://127.0.0.1:3001/`

### 构建项目

```bash
npm run build
```

### 预览构建结果

```bash
npm run preview
```

### 启动生产服务

```bash
npm run start
```

说明：

- 该命令会启动 `server/index.js`
- 如果本地存在 `dist/`，服务端会同时托管前端页面和接口

## 项目结构

```text
.
├─ public/                         # 公共静态资源
├─ server/                         # Node 内容服务
│  ├─ data/
│  │  └─ profile.json              # 运行时内容数据
│  ├─ services/
│  │  ├─ adminAuth.js              # 后台登录与会话
│  │  ├─ contactProtection.js      # 联系方式验证码保护
│  │  ├─ profileStore.js           # 内容读写
│  │  └─ publicProfile.js          # 前台公开数据脱敏
│  └─ index.js                     # 服务入口
├─ src/
│  ├─ components/
│  │  ├─ admin/                    # 后台编辑组件
│  │  ├─ contact/                  # 联系方式弹窗组件
│  │  ├─ layout/                   # 布局组件
│  │  └─ sections/                 # 前台页面分区组件
│  ├─ composables/                 # 可复用交互逻辑
│  ├─ data/                        # 默认内容模板
│  ├─ router/                      # 路由配置
│  ├─ services/                    # 前端接口请求封装
│  ├─ utils/                       # 校验与工具函数
│  ├─ views/                       # 页面级视图
│  ├─ App.vue                      # 应用壳组件
│  ├─ main.js                      # 前端入口
│  └─ styles.css                   # 全局样式
├─ index.html
├─ package.json
└─ README.md
```

## 组件化说明

项目已经按功能拆成多个层次：

### 页面级

- [src/views/ProfilePage.vue](./src/views/ProfilePage.vue)
- [src/views/AdminPage.vue](./src/views/AdminPage.vue)

### 区块级

- [src/components/sections/HeroSection.vue](./src/components/sections/HeroSection.vue)
- [src/components/sections/IdentitySection.vue](./src/components/sections/IdentitySection.vue)
- [src/components/sections/AboutSection.vue](./src/components/sections/AboutSection.vue)
- [src/components/sections/SkillsSection.vue](./src/components/sections/SkillsSection.vue)
- [src/components/sections/ProjectsSection.vue](./src/components/sections/ProjectsSection.vue)
- [src/components/sections/ContactSection.vue](./src/components/sections/ContactSection.vue)

### 逻辑级

- [src/composables/useProfileContent.js](./src/composables/useProfileContent.js)
- [src/composables/useRevealOnScroll.js](./src/composables/useRevealOnScroll.js)
- [src/composables/useActiveSection.js](./src/composables/useActiveSection.js)
- [src/composables/usePointerGlow.js](./src/composables/usePointerGlow.js)
- [src/composables/useClipboard.js](./src/composables/useClipboard.js)
- [src/composables/useProtectedContactAction.js](./src/composables/useProtectedContactAction.js)
- [src/composables/useBouncingDisc.js](./src/composables/useBouncingDisc.js)
- [src/composables/useSkillUniverse.js](./src/composables/useSkillUniverse.js)

## 后续可以继续扩展的方向

如果继续往完整作品集或内容系统推进，这个项目很适合继续加：

- 管理员账号改为环境变量
- 登录失败次数限制
- 接口限频
- 更完整的表单校验
- 图片上传
- 内容版本记录
- 项目详情页
- 博客 / 文章模块

## License

当前仓库中已包含 [LICENSE](./LICENSE) 文件。  
如果你准备公开发布项目，建议再根据实际用途确认许可证内容是否符合你的预期。

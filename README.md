# Personal Issue

一个基于 `Vue 3 + Vite + Express + GSAP` 搭建的个人主页项目。

它不只是一个前台展示页，也包含了一套可用的后台内容管理能力：可以在后台编辑首页文案、身份拆解、About、技能、项目、问答和联系方式，发布后前台会直接读取最新内容，不需要每次都重新改源码再打包。

## 项目概览

当前项目主要由四部分组成：

- 前台展示站点：`/`
- 后台管理页面：`/admin`
- Express 内容服务与鉴权接口：`server/index.js`
- 独立的休闲实验目录：`unknown/`

其中 `unknown/` 下的内容和主站没有耦合，只是单独放着玩的小游戏。

## 当前能力

### 前台展示

前台目前包含这些模块：

- `Hero`
- `Identity`
- `About`
- `Skills`
- `Projects`
- `Contact`

对应目录：

- [src/components/sections](./src/components/sections)

### 后台内容管理

后台支持编辑并发布以下内容：

- Hero 区域
- Identity 区域
- About 区域
- Skills 区域
- Projects 区域
- Questions 区域
- Contact 区域

对应目录：

- [src/views/AdminPage.vue](./src/views/AdminPage.vue)
- [src/components/admin](./src/components/admin)

### 联系方式保护

为了避免在前台直接暴露真实微信和邮箱，项目实现了联系方式保护流程：

- 前台默认只展示脱敏内容
- 点击复制或发送前，先弹出验证码
- 验证通过后，才执行复制或邮件跳转
- 公共接口默认返回脱敏后的 profile 数据

对应文件：

- [src/components/sections/ContactSection.vue](./src/components/sections/ContactSection.vue)
- [src/components/contact/ContactCaptchaDialog.vue](./src/components/contact/ContactCaptchaDialog.vue)
- [src/components/contact/ContactGuardMascot.vue](./src/components/contact/ContactGuardMascot.vue)
- [src/composables/useProtectedContactAction.js](./src/composables/useProtectedContactAction.js)
- [server/services/publicProfile.js](./server/services/publicProfile.js)
- [server/services/contactProtection.js](./server/services/contactProtection.js)

### 前台交互动效

目前前台已经接入了一批以 `GSAP` 为主的交互动效：

- Hero 首屏文案时间线入场
- Hero 小球缓慢漂移、碰壁反弹、鼠标视差
- CTA 按钮磁吸与光斑跟随
- Identity 字母翻面与整行横向视差
- About 蜘蛛点击后吐丝下坠再回弹
- Skills 技能节点联动、核心脉冲、动态连线
- Projects 项目详情抽屉式切换与卡片分层入场
- 各模块之间的滚动切换过渡
- 联系方式验证码弹窗中的小人物状态反馈

主要逻辑集中在：

- [src/composables/useHeroMotion.js](./src/composables/useHeroMotion.js)
- [src/composables/useIdentityMotion.js](./src/composables/useIdentityMotion.js)
- [src/composables/useProjectPanelMotion.js](./src/composables/useProjectPanelMotion.js)
- [src/composables/useSectionTransitionMotion.js](./src/composables/useSectionTransitionMotion.js)
- [src/composables/useSkillUniverse.js](./src/composables/useSkillUniverse.js)

## 技术栈

### 前端

- `Vue 3`
- `Vue Router`
- `Vite`
- `GSAP`
- 原生 `CSS`

### 后端

- `Express`
- 本地 `JSON` 文件持久化

### 运行方式

- 开发环境：Vite 前端 + Node 服务并行启动
- 生产环境：先构建前端，再由 Express 同时托管静态页面和接口

## 路由

当前前端路由很简单，只有两个页面：

- `/`：前台个人主页
- `/admin`：后台编辑页

路由文件：

- [src/router/index.js](./src/router/index.js)

## 数据流

当前项目的数据流是这条链路：

1. 在后台 `/admin` 编辑内容
2. 前端调用 `PUT /api/profile`
3. 服务端写入 [server/data/profile.json](./server/data/profile.json)
4. 前台通过 `GET /api/profile` 获取最新内容
5. 页面运行时刷新显示，不依赖重新打包

这意味着：

- 修改内容不需要手动改源码
- 发布后前台会直接使用新数据
- 后台和前台使用的是同一份运行时内容源

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

## 默认后台账号

当前项目里后台账号密码仍然是本地演示用写死配置，位置在：

- [server/services/adminAuth.js](./server/services/adminAuth.js)

当前默认账号密码：

- 账号：`hbg62197148`
- 密码：`62197148ax.`

说明：

- 这适合本地演示和个人作品展示
- 如果后续部署到公网，建议改成环境变量或数据库配置

## 本地开发

### 环境要求

- `Node.js 18+`
- `npm 9+`

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

这个命令会同时启动：

- Vite 前端开发服务：`http://127.0.0.1:5173/`
- Express 内容服务：`http://127.0.0.1:3001/`

后台页面地址：

- `http://127.0.0.1:5173/admin`

### 构建

```bash
npm run build
```

### 预览前端构建结果

```bash
npm run preview
```

### 启动生产服务

```bash
npm run start 
```

这个命令会启动：

- [server/index.js](./server/index.js)

如果本地存在 `dist/`，Express 会同时托管前端页面和接口。

## 目录结构

```text
.
├── public/                         # 公共静态资源
├── server/                         # Express 内容服务
│   ├── data/
│   │   └── profile.json            # 运行时内容数据
│   ├── services/
│   │   ├── adminAuth.js            # 后台登录与会话
│   │   ├── contactProtection.js    # 联系方式验证码保护
│   │   ├── profileStore.js         # 内容读写
│   │   └── publicProfile.js        # 公共 profile 脱敏
│   └── index.js                    # 服务入口
├── src/
│   ├── components/
│   │   ├── admin/                  # 后台编辑组件
│   │   ├── contact/                # 联系方式弹窗与小人物
│   │   ├── layout/                 # 页头、页脚、加载层等布局组件
│   │   └── sections/               # 前台六大区块组件
│   ├── composables/                # 前台交互与页面逻辑
│   ├── data/                       # 默认内容模板
│   ├── router/                     # 前端路由
│   ├── services/                   # 前端接口请求封装
│   ├── utils/                      # 校验与工具函数
│   ├── views/                      # 页面级视图
│   ├── App.vue                     # 应用壳组件
│   ├── main.js                     # 前端入口
│   └── styles.css                  # 全局样式
├── index.html
├── package.json
└── README.md
```

## 组件化说明

项目目前已经按“页面层 / 区块层 / 逻辑层”拆分。

### 页面层

- [src/views/ProfilePage.vue](./src/views/ProfilePage.vue)
- [src/views/AdminPage.vue](./src/views/AdminPage.vue)

### 区块层

- [src/components/sections/HeroSection.vue](./src/components/sections/HeroSection.vue)
- [src/components/sections/IdentitySection.vue](./src/components/sections/IdentitySection.vue)
- [src/components/sections/AboutSection.vue](./src/components/sections/AboutSection.vue)
- [src/components/sections/SkillsSection.vue](./src/components/sections/SkillsSection.vue)
- [src/components/sections/ProjectsSection.vue](./src/components/sections/ProjectsSection.vue)
- [src/components/sections/ContactSection.vue](./src/components/sections/ContactSection.vue)

### 后台编辑层

- [src/components/admin/AdminHeroEditor.vue](./src/components/admin/AdminHeroEditor.vue)
- [src/components/admin/AdminIdentityEditor.vue](./src/components/admin/AdminIdentityEditor.vue)
- [src/components/admin/AdminAboutEditor.vue](./src/components/admin/AdminAboutEditor.vue)
- [src/components/admin/AdminSkillsEditor.vue](./src/components/admin/AdminSkillsEditor.vue)
- [src/components/admin/AdminProjectsEditor.vue](./src/components/admin/AdminProjectsEditor.vue)
- [src/components/admin/AdminQuestionsEditor.vue](./src/components/admin/AdminQuestionsEditor.vue)
- [src/components/admin/AdminContactEditor.vue](./src/components/admin/AdminContactEditor.vue)
- [src/components/admin/AdminValidationSummary.vue](./src/components/admin/AdminValidationSummary.vue)
- [src/components/admin/AdminLoginForm.vue](./src/components/admin/AdminLoginForm.vue)

### 逻辑层

- [src/composables/useLoadingGate.js](./src/composables/useLoadingGate.js)
- [src/composables/useActiveSection.js](./src/composables/useActiveSection.js)
- [src/composables/useRevealOnScroll.js](./src/composables/useRevealOnScroll.js)
- [src/composables/usePointerGlow.js](./src/composables/usePointerGlow.js)
- [src/composables/useClipboard.js](./src/composables/useClipboard.js)
- [src/composables/useProfileContent.js](./src/composables/useProfileContent.js)
- [src/composables/useProtectedContactAction.js](./src/composables/useProtectedContactAction.js)
- [src/composables/useHeroMotion.js](./src/composables/useHeroMotion.js)
- [src/composables/useIdentityMotion.js](./src/composables/useIdentityMotion.js)
- [src/composables/useProjectPanelMotion.js](./src/composables/useProjectPanelMotion.js)
- [src/composables/useSectionTransitionMotion.js](./src/composables/useSectionTransitionMotion.js)
- [src/composables/useSkillUniverse.js](./src/composables/useSkillUniverse.js)
- [src/composables/useBouncingDisc.js](./src/composables/useBouncingDisc.js)

## 还可以继续扩展什么

如果后续想把它继续往完整作品集或轻 CMS 推进，当前项目很适合继续加：

- 后台账号改为环境变量
- 登录失败次数限制
- 联系接口限频
- 图片上传
- 内容版本记录
- 项目详情页
- 博客 / 文章模块
- 更完整的表单校验

## License

仓库中已包含许可证文件；如果后续要公开发布，建议再确认一次许可证内容是否符合你的使用场景。

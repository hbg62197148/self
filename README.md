# Personal Issue

一个基于 `Vue 3 + Vite + Express + GSAP` 搭建的个人主页与轻量内容管理项目。

它不只是静态展示页：前台展示个人介绍、身份拆解、技能、项目和联系方式；后台可以编辑并发布内容，前台通过接口读取最新 JSON 数据，不需要每次改代码后重新打包。

## 项目概览

当前项目主要由三部分组成：

- 前台个人主页：`/`
- 后台内容管理页：`/admin`
- Express 内容服务与接口：`server/index.js`

前端源码位于 `src/`，运行时内容数据位于 `server/data/profile.json`。

## 技术栈

前端：

- `Vue 3`
- `Vue Router`
- `Vite`
- `GSAP`
- 原生 `CSS`
- `@fontsource/bebas-neue`
- `@fontsource/manrope`

后端：

- `Express`
- 本地 JSON 文件持久化
- Cookie 会话登录

## 当前功能

### 前台展示

前台页面由这些区块组成：

- `Hero`：首页标题、CTA、漂浮球和个人信息卡片
- `Identity`：字母拆解与中文释义悬停反馈
- `About`：个人介绍、问答切换、互动信号探针扫描
- `Skills`：技能宇宙节点、核心块和技能卡片
- `Projects`：项目 tab、详情抽屉切换和信号卡
- `Contact`：联系方式展示、复制/发送保护

对应目录：

- [src/components/sections](./src/components/sections)

### 后台内容管理

后台支持编辑：

- Hero 首页内容
- Identity 身份拆解
- About 介绍内容
- Skills 技能内容
- Projects 项目内容
- Questions 问答内容
- Contact 联系方式

对应文件：

- [src/views/AdminPage.vue](./src/views/AdminPage.vue)
- [src/components/admin](./src/components/admin)
- [src/utils/profileValidation.js](./src/utils/profileValidation.js)

### 登录与表单校验

后台页面有登录保护和基础表单校验。未登录时不能进入后台编辑页，也不能发布内容。

默认演示账号：

- 账号：`hbg62197148`
- 密码：`62197148ax.`

账号密码目前写在：

- [server/services/adminAuth.js](./server/services/adminAuth.js)

如果后续部署到公网，建议把账号密码改成环境变量或数据库配置。

### 联系方式保护

前台默认不会直接暴露完整邮箱或微信。用户点击复制或发送时，会先弹出验证码窗口。

流程：

1. 前台展示脱敏后的联系方式。
2. 用户点击 `copy` 或 `send`。
3. 调用 `POST /api/contact/challenge` 创建验证码。
4. 用户输入正确答案后调用 `POST /api/contact/access`。
5. 验证通过后才返回真实联系方式并执行复制或跳转。

相关文件：

- [src/components/sections/ContactSection.vue](./src/components/sections/ContactSection.vue)
- [src/components/contact/ContactCaptchaDialog.vue](./src/components/contact/ContactCaptchaDialog.vue)
- [src/components/contact/ContactGuardMascot.vue](./src/components/contact/ContactGuardMascot.vue)
- [src/composables/useProtectedContactAction.js](./src/composables/useProtectedContactAction.js)
- [server/services/contactProtection.js](./server/services/contactProtection.js)
- [server/services/publicProfile.js](./server/services/publicProfile.js)

### GSAP 动效

项目目前接入了较多 GSAP 动效：

- Hero 标题逐字入场
- Hero 漂浮球随机缓慢移动、碰撞反弹和鼠标视差
- CTA 按钮磁吸和光斑跟随
- 左下角悬浮球可切换完整动效 / 弱化动效，并支持拖拽吸边
- Identity 字母翻面、行级视差和聚焦降亮
- About 信号探针点击后向下发出扫描光束
- Skills 技能节点联动和连线反馈
- Projects 详情抽屉切换、项目预览层飞入、信号卡延迟亮起
- 章节滚动时的扫描光和分层入场
- 顶部导航 active 指示器滑动
- 右下角章节指示器翻入和光晕反馈
- 前台主要卡片 hover 光斑、轻微磁吸和 3D 倾斜
- 联系验证码弹窗小人物状态反馈

主要逻辑集中在：

- [src/composables/useHeroMotion.js](./src/composables/useHeroMotion.js)
- [src/composables/useMotionPreference.js](./src/composables/useMotionPreference.js)
- [src/composables/useIdentityMotion.js](./src/composables/useIdentityMotion.js)
- [src/composables/useProjectPanelMotion.js](./src/composables/useProjectPanelMotion.js)
- [src/composables/useSectionTransitionMotion.js](./src/composables/useSectionTransitionMotion.js)
- [src/composables/useSurfaceMotion.js](./src/composables/useSurfaceMotion.js)
- [src/composables/useSkillUniverse.js](./src/composables/useSkillUniverse.js)

## 性能建议

当前动效偏丰富，如果电脑打开页面出现卡顿，可以优先关闭较重的全局动效。

最直接的做法是在 [src/views/ProfilePage.vue](./src/views/ProfilePage.vue) 中暂时注释：

```js
// useSurfaceMotion();
```

如果还想继续降负载，可以再考虑：

- 关闭 [src/composables/usePointerGlow.js](./src/composables/usePointerGlow.js)
- 简化 [src/composables/useSectionTransitionMotion.js](./src/composables/useSectionTransitionMotion.js) 的滚动动画
- 减少大面积 `filter: blur()`、`box-shadow`、`backdrop-filter`
- 对低性能设备自动关闭部分动效

目前项目已经内置动效模式开关：

- 点击左下角悬浮球可在 `FX` 和 `Lite` 之间切换
- `Lite` 模式会弱化部分全局动效，降低页面负载
- 悬浮球支持拖拽，松手后会自动吸附到屏幕左右边缘

## 数据流

项目的核心数据流如下：

1. 后台 `/admin` 编辑内容。
2. 前台调用 `PUT /api/profile` 发布。
3. 服务端写入 [server/data/profile.json](./server/data/profile.json)。
4. 前台通过 `GET /api/profile` 获取最新内容。
5. `useProfileContent` 会定时轮询刷新，前台不需要重新打包。

未登录访问 `GET /api/profile` 时，服务端会返回脱敏后的公共数据；后台登录后会返回完整数据。

## 接口说明

后台登录：

- `POST /api/admin/login`：后台登录
- `GET /api/admin/session`：获取当前登录状态
- `POST /api/admin/logout`：退出后台登录

内容管理：

- `GET /api/profile`：获取前台内容
- `PUT /api/profile`：发布后台编辑内容，需要登录

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

## 手机访问本地页面

如果想在手机上预览，需要让 Vite 监听局域网地址。

一个终端启动后端：

```bash
npm run dev:server
```

另一个终端启动前端：

```bash
npm run dev:client -- --host 0.0.0.0
```

然后在电脑上运行：

```bash
ipconfig
```

找到当前 Wi-Fi 的 `IPv4 地址`，手机和电脑连接同一个 Wi-Fi 后，在手机浏览器访问：

```text
http://你的电脑IPv4地址:5173
```

例如：

```text
http://192.168.1.23:5173
```

## 构建与预览

构建前端：

```bash
npm run build
```

预览构建结果：

```bash
npm run preview
```

启动生产服务：

```bash
npm run start
```

如果本地存在 `dist/`，Express 会同时托管前端静态页面和接口。

## 路由

前端路由位于：

- [src/router/index.js](./src/router/index.js)

当前路由：

- `/`：前台个人主页
- `/admin`：后台内容管理页

## 目录结构

```text
.
├── public/                     # 公共静态资源
├── server/                     # Express 内容服务
│   ├── data/
│   │   └── profile.json        # 运行时内容数据
│   ├── services/
│   │   ├── adminAuth.js        # 后台登录和会话
│   │   ├── contactProtection.js # 联系方式验证码保护
│   │   ├── profileStore.js     # 内容读写
│   │   └── publicProfile.js    # 公共 profile 脱敏
│   └── index.js                # 服务入口
├── src/
│   ├── components/
│   │   ├── admin/              # 后台编辑组件
│   │   ├── contact/            # 联系验证码弹窗与小人物
│   │   ├── layout/             # 页头、页脚、加载层与全局控件
│   │   └── sections/           # 前台主要区块组件
│   ├── composables/            # 页面逻辑与动效逻辑
│   ├── data/                   # 默认内容模板
│   ├── router/                 # 前端路由
│   ├── services/               # 前端 API 请求封装
│   ├── utils/                  # 校验与工具函数
│   ├── views/                  # 页面级视图
│   ├── App.vue
│   ├── fonts.css
│   ├── main.js
│   └── styles.css
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## 组件化说明

页面层：

- [src/views/ProfilePage.vue](./src/views/ProfilePage.vue)
- [src/views/AdminPage.vue](./src/views/AdminPage.vue)

前台区块：

- [src/components/sections/HeroSection.vue](./src/components/sections/HeroSection.vue)
- [src/components/sections/IdentitySection.vue](./src/components/sections/IdentitySection.vue)
- [src/components/sections/AboutSection.vue](./src/components/sections/AboutSection.vue)
- [src/components/sections/SkillsSection.vue](./src/components/sections/SkillsSection.vue)
- [src/components/sections/ProjectsSection.vue](./src/components/sections/ProjectsSection.vue)
- [src/components/sections/ContactSection.vue](./src/components/sections/ContactSection.vue)

后台编辑：

- [src/components/admin/AdminHeroEditor.vue](./src/components/admin/AdminHeroEditor.vue)
- [src/components/admin/AdminIdentityEditor.vue](./src/components/admin/AdminIdentityEditor.vue)
- [src/components/admin/AdminAboutEditor.vue](./src/components/admin/AdminAboutEditor.vue)
- [src/components/admin/AdminSkillsEditor.vue](./src/components/admin/AdminSkillsEditor.vue)
- [src/components/admin/AdminProjectsEditor.vue](./src/components/admin/AdminProjectsEditor.vue)
- [src/components/admin/AdminQuestionsEditor.vue](./src/components/admin/AdminQuestionsEditor.vue)
- [src/components/admin/AdminContactEditor.vue](./src/components/admin/AdminContactEditor.vue)
- [src/components/admin/AdminValidationSummary.vue](./src/components/admin/AdminValidationSummary.vue)
- [src/components/admin/AdminLoginForm.vue](./src/components/admin/AdminLoginForm.vue)

逻辑层：

- [src/composables/useProfileContent.js](./src/composables/useProfileContent.js)
- [src/composables/useProtectedContactAction.js](./src/composables/useProtectedContactAction.js)
- [src/composables/useMotionPreference.js](./src/composables/useMotionPreference.js)
- [src/composables/useHeroMotion.js](./src/composables/useHeroMotion.js)
- [src/composables/useIdentityMotion.js](./src/composables/useIdentityMotion.js)
- [src/composables/useProjectPanelMotion.js](./src/composables/useProjectPanelMotion.js)
- [src/composables/useSectionTransitionMotion.js](./src/composables/useSectionTransitionMotion.js)
- [src/composables/useSurfaceMotion.js](./src/composables/useSurfaceMotion.js)
- [src/composables/useSkillUniverse.js](./src/composables/useSkillUniverse.js)

## 可继续优化

- 将后台账号密码改为环境变量
- 增加登录失败限频
- 增加联系接口限频
- 增加图片上传能力
- 增加内容版本记录和回滚
- 增加项目详情页
- 建立统一动效开关配置
- 对低性能设备自动降级动画

## License

仓库中已经包含许可文件；如果后续公开发布，建议再确认许可证内容是否符合你的使用场景。

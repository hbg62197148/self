const normalizeLocale = (locale) => (locale === "en" ? "en" : "zh");

export const siteCopy = {
  zh: {
    header: {
      brandTitle: "个人专刊",
      brandSubtitle: "Personal Issue",
      navAriaLabel: "页面导航",
      adminLabel: "后台"
    },
    loading: {
      label: "加载中",
      text: "个人专刊正在组装..."
    },
    navItems: [
      { id: "home", label: "首页" },
      { id: "identity", label: "身份" },
      { id: "about", label: "关于我" },
      { id: "skills", label: "技能星系" },
      { id: "projects", label: "项目章节" },
      { id: "contact", label: "联系" }
    ],
    sectionMeta: {
      home: "开场信号",
      identity: "身份拆解",
      about: "个人内核",
      skills: "技能星系",
      projects: "精选章节",
      contact: "联系终章"
    },
    footer: "个人专刊 | Personal Issue | HBG",
    copied: "已复制",
    captcha: {
      emptyTitle: "联系方式验证",
      titleSuffix: "验证",
      titleSeparator: "",
      kicker: "真人验证",
      subtitle: "为了避免前台联系方式被随意抓取，请先完成一次验证码校验。",
      challengeLabel: "验证码",
      loading: "正在生成...",
      inputLabel: "输入结果",
      placeholder: "请输入上方验证码结果",
      refresh: "换一个验证码",
      cancel: "取消",
      submit: "确认继续",
      submitting: "验证中..."
    }
  },
  en: {
    header: {
      brandTitle: "Personal Issue",
      brandSubtitle: "Profile Dossier",
      navAriaLabel: "Page navigation",
      adminLabel: "Admin"
    },
    loading: {
      label: "LOADING",
      text: "Vite profile issue is assembling..."
    },
    navItems: [
      { id: "home", label: "Home" },
      { id: "identity", label: "Identity" },
      { id: "about", label: "About" },
      { id: "skills", label: "Skill Universe" },
      { id: "projects", label: "Chapters" },
      { id: "contact", label: "Contact" }
    ],
    sectionMeta: {
      home: "Opening Signal",
      identity: "Identity Breakdown",
      about: "Profile Interior",
      skills: "Skill Universe",
      projects: "Selected Chapters",
      contact: "Contact Finale"
    },
    footer: "Personal Issue | Profile Dossier | HBG",
    copied: "Copied",
    captcha: {
      emptyTitle: "Contact Check",
      titleSuffix: "Check",
      titleSeparator: " ",
      kicker: "Human Check",
      subtitle: "Please finish a quick verification before revealing protected contact details.",
      challengeLabel: "Challenge",
      loading: "Generating...",
      inputLabel: "Your answer",
      placeholder: "Enter the result shown above",
      refresh: "New challenge",
      cancel: "Cancel",
      submit: "Continue",
      submitting: "Checking..."
    }
  }
};

const localizedProfiles = {
  zh: {
    edition: "个人专刊",
    role: "前端开发者 / 注重体验的实现者",
    hero: {
      issue: "第 01 期 / 个人信息",
      eyebrow: "把简历内容转化为更清晰、更有记忆点的阅读体验。",
      title: ["个人", "信息", "系统"],
      subtitle: "把表达做得更有记忆点，把信息做得更有秩序，把联系做得更直接，让个人主页更像一个真正可进入的职业入口。",
      primaryCta: {
        label: "我的标签"
      },
      secondaryCta: {
        label: "直接联系"
      },
      profilePulseLabel: "个人状态",
      pulse: "正在寻找全职机会",
      summary: "目前正在寻找更合适的全职机会，方向偏前端开发与体验实现，也愿意和有想法、有完成度要求的团队一起做长期投入的产品。",
      stats: [
        {
          label: "所在地",
          value: "中国广州"
        },
        {
          label: "开放方向",
          value: "全职机会、精选合作"
        },
        {
          label: "回复",
          value: "通常 24 小时内"
        }
      ],
      tags: ["身份设计", "创意编码", "叙事排版", "作品集策略", "前端系统"]
    },
    deconstruction: {
      issue: "第 02 期 / 身份拆解",
      title: "把我的能力拆成几条更容易理解的线索。",
      copy: "将各种能力拆成一套更容易被理解的标签系统。",
      cards: [
        {
          letter: "P",
          word: "个人定位",
          zh: "个人定位",
          text: "我希望页面在第一眼就能传达出清晰的个人气质，让人知道我适合做什么、擅长什么。"
        },
        {
          letter: "R",
          word: "能力范围",
          zh: "能力范围",
          text: "我的能力覆盖信息整理、页面表达、交互细节和前端实现，能够把想法一路推进到可交付状态。"
        },
        {
          letter: "O",
          word: "输出能力",
          zh: "输出能力",
          text: "我更在意真正能落地的结果，而不是停留在概念层，所以会把页面做成可运行、可维护的完整成品。"
        },
        {
          letter: "F",
          word: "关注重点",
          zh: "关注重点",
          text: "我会优先处理信息层级、阅读路径和重点表达，让页面既好理解，也更容易留下印象。"
        },
        {
          letter: "I",
          word: "视觉判断",
          zh: "视觉判断",
          text: "我喜欢有明确个性的页面，但不会为了装饰而装饰，风格应该服务内容和目标。"
        },
        {
          letter: "L",
          word: "协作方式",
          zh: "协作方式",
          text: "我习惯先对齐目标和边界，再快速推进细节，用更清楚的沟通减少来回成本。"
        },
        {
          letter: "E",
          word: "持续进化",
          zh: "持续进化",
          text: "我会把个人站和项目页面都当成可持续维护的系统，而不是一次性展示物。"
        }
      ]
    },
    about: {
      issue: "第 03 期 / 关于我",
      title: "我更希望别人看到的，不只是我做过什么，还有我是怎么做成的。",
      copy: "这便是我的工作方式和判断标准。",
      portraitLabel: "能力画像",
      askLabel: "向档案提问",
      profileMap: {
        axisX: ["表达判断", "工程落地"],
        axisY: ["结构思维", "体验细节"],
        coreKicker: "Profile Core",
        coreTitle: "前端体验实现",
        coreText: "把信息、视觉和代码合成可交付页面",
        nodes: [
          { label: "结构", detail: "信息层级", tone: "#f6c85f" },
          { label: "视觉", detail: "风格判断", tone: "#ff8cb7" },
          { label: "前端", detail: "组件实现", tone: "#7bf7d4" },
          { label: "体验", detail: "交互节奏", tone: "#69d2ff" },
          { label: "交付", detail: "上线维护", tone: "#ff6a3d" }
        ]
      },
      paragraphs: [
        "我目前在寻找更适合长期投入的前端方向机会，尤其是那些既重视产品体验，也重视页面完成度和工程质量的团队或项目。",
        "我擅长把信息结构、视觉表达和前端实现放到同一条链路里思考，让页面不仅有风格，也真正可用、可维护、可持续扩展。"
      ],
      snippets: ["前端实现与体验并重", "结构、视觉、落地一体化", "正在寻找合适的全职机会"],
      quickFacts: [
        {
          label: "工作方式",
          value: "全职 / 远程协作 / 快速迭代"
        },
        {
          label: "偏好范围",
          value: "前端页面、作品集站、产品展示页"
        },
        {
          label: "当前主题",
          value: "正在求职，关注前端与体验实现方向"
        }
      ]
    },
    questions: [
      {
        id: "what",
        prompt: "你最适合做什么类型的项目？",
        answer: "我比较适合做既要表达清楚、又要真正落地的项目，比如个人品牌站、作品集站、产品展示页，以及偏体验和视觉表现的前端页面。对我来说，好的页面不只是能看，还要能上线、能维护、能传达价值。"
      },
      {
        id: "how",
        prompt: "你的工作方式是什么？",
        answer: "我的工作方式通常是先确定信息层级和页面骨架，再决定视觉语言和交互节奏，最后把细节与实现打磨完整。这样能保证页面既有清晰结构，也有比较高的完成度，而不是只停留在概念层。"
      },
      {
        id: "why",
        prompt: "你最在意页面的哪件事？",
        answer: "我最在意的是页面有没有把这个人或这个产品真正的气质传达出来。如果打开之后只剩下模板感，说明它还没有完成最关键的任务。对我来说，结构清楚和风格准确，应该同时成立。"
      },
      {
        id: "next",
        prompt: "这页后续还能怎么扩展？",
        answer: "这页后面还可以继续扩展成更完整的个人站，比如加入项目详情页、文章模块、求职信息，或者接入更方便维护的内容配置。现在这一版先把首页的身份表达和核心信息入口搭起来，后续延展空间是足够的。"
      }
    ],
    skills: {
      issue: "第 04 期 / 技能星系",
      title: "把技能看成一套协同工作的系统，而不是一串孤立的名词。",
      copy: "我更关注能力之间如何配合，而不是单点技能本身。结构、视觉、交互和前端实现组合在一起，才是我真正的优势。",
      coreLabel: "核心系统",
      core: "结构 x 视觉 x 前端",
      coreNote: "我更擅长把页面从概念推进到可落地状态，让内容表达和实现质量一起成立。",
      nodes: [
        {
          label: "产品",
          detail: "结构"
        },
        {
          label: "视觉",
          detail: "氛围"
        },
        {
          label: "前端",
          detail: "实现"
        },
        {
          label: "动效",
          detail: "节奏"
        },
        {
          label: "内容",
          detail: "叙事"
        },
        {
          label: "系统",
          detail: "扩展"
        }
      ],
      groups: [
        {
          title: "叙事层",
          note: "把设计路线组织成更容易被理解的叙事结构。",
          items: ["栏目结构", "文案组织", "信息层级", "阅读节奏", "个人表达"]
        },
        {
          title: "视觉层",
          note: "建立更明确的页面气质，而不是落回模板感。",
          items: ["版式系统", "视觉氛围", "字体选择", "信息对比", "风格统一"]
        },
        {
          title: "构建层",
          note: "可运行的前端项目，兼顾组件拆分、交互状态和响应式适配。",
          items: ["Vue", "Vite", "组件拆分", "交互状态", "响应式适配"]
        },
        {
          title: "交付层",
          note: "页面易于替换内容、扩展模块和持续迭代，不是一次性展示品。",
          items: ["数据配置", "模块复用", "维护成本", "内容替换", "持续更新"]
        }
      ]
    },
    projects: {
      issue: "第 05 期 / 精选章节",
      title: "项目和经历不是罗列，而是用来证明我的节奏、判断和完成度。",
      copy: "让别人不只是知道我做过什么，也能更快理解我适合怎样的工作内容。",
      items: [
        {
          id: "identity-site",
          category: "个人品牌",
          title: "个人主页重构",
          subtitle: "把普通简介页升级成更有识别度的线上身份入口",
          description: "用更清楚的结构、更稳定的风格和更完整的实现，把个人介绍整理成一套真正能被阅读的入口。",
          signals: [
            {
              label: "结构",
              value: "编辑式单页"
            },
            {
              label: "气质",
              value: "鲜明且有秩序"
            },
            {
              label: "实现",
              value: "Vite + Vue"
            }
          ],
          stack: ["Vue", "Vite", "CSS", "交互设计"],
          details: [
            "重新组织首页、身份拆解、问答区和联系区，让阅读节奏更清楚。",
            "通过分批入场、章节切换和信息卡片提升页面的完成度与记忆点。",
            "把内容单独抽到数据层，后续替换个人资料更轻松。"
          ]
        },
        {
          id: "portfolio-system",
          category: "作品集策略",
          title: "作品集结构整理",
          subtitle: "让项目展示更有主次，而不是简单地平铺罗列",
          description: "作品集最重要的不是展示数量，而是展示判断。通过更合理的排序和叙事结构，可以让重点项目更容易被看见。",
          signals: [
            {
              label: "目标",
              value: "更清楚的项目阅读"
            },
            {
              label: "重点",
              value: "记忆点与层级"
            },
            {
              label: "结果",
              value: "更有说服力的展示"
            }
          ],
          stack: ["内容设计", "信息架构", "视觉系统"],
          details: [
            "让项目的顺序和层级服务于你想传达的职业方向。",
            "通过标题、标签和摘要帮助访客更快进入重点。",
            "让页面既适合快速扫读，也能承载更深入的了解。"
          ]
        },
        {
          id: "launch-page",
          category: "产品发布",
          title: "产品展示页表达",
          subtitle: "把产品信息整理成更有节奏和重点的页面",
          description: "兼顾信息密度和视觉节奏，让用户不只是看见内容，还能更顺畅地理解重点与价值。",
          signals: [
            {
              label: "方法",
              value: "故事驱动的布局"
            },
            {
              label: "视觉",
              value: "高对比编辑感"
            },
            {
              label: "产出",
              value: "更清晰的产品信息"
            }
          ],
          stack: ["落地页", "前端实现", "叙事设计"],
          details: [
            "先建立用户理解路径，再安排页面区块和表达顺序。",
            "通过视觉对比和交互节奏控制阅读体验。",
            "适合需要兼顾展示效果和信息效率的场景。"
          ]
        },
        {
          id: "creative-collab",
          category: "创意协作",
          title: "表达型前端页面",
          subtitle: "当页面本身也需要成为作品的一部分",
          description: "有些项目不适合只做成标准模板，它们需要更强的风格、更明确的叙事和更有层次的视觉节奏来承载内容。",
          signals: [
            {
              label: "个性",
              value: "明确且有表达力"
            },
            {
              label: "交互",
              value: "动效与层叠卡片"
            },
            {
              label: "受众",
              value: "创意与产品团队"
            }
          ],
          stack: ["创意方向", "网页视觉", "叙事体验"],
          details: [
            "让页面不只是信息容器，也能体现项目本身的气质。",
            "通过版式、动效和装饰元素建立更强的记忆点。",
            "适合既重视表达、又要求落地质量的场景。"
          ]
        }
      ]
    },
    contact: {
      issue: "第 06 期 / 联系",
      title: "如果你觉得我的方向合适，欢迎直接联系我。",
      copy: "我目前在开放求职状态，也欢迎围绕前端开发、作品集页面、产品展示和创意型网页表达进行交流或合作。",
      display: "一起做清晰、有冲击力、真正有用的东西。",
      intro: "下面是我目前常用的联系方式。如果你有合适的岗位、项目或合作想法，可以直接发邮件，或者先通过微信和 GitHub 找到我。",
      items: [
        {
          displayLabel: "邮箱",
          displayAction: "验证后发送"
        },
        {
          displayLabel: "微信",
          displayAction: "验证后复制"
        },
        {
          displayLabel: "GitHub",
          displayAction: "打开 GitHub"
        }
      ]
    }
  },
  en: {
    edition: "PERSONAL ISSUE",
    role: "Frontend Developer / Design-minded Builder",
    hero: {
      issue: "Issue 01 / Personal Signal",
      eyebrow: "A profile page that turns resume content into a clearer, more memorable reading experience.",
      title: ["PERSONAL", "SIGNAL", "SYSTEM"],
      subtitle: "I shape expression into something memorable, organize information with a clear hierarchy, and make contact direct so this personal site feels like a real career entry point.",
      primaryCta: {
        label: "Identity Tags"
      },
      secondaryCta: {
        label: "Contact Me"
      },
      profilePulseLabel: "Profile Pulse",
      pulse: "Open to full-time opportunities",
      summary: "I am currently looking for a stronger full-time fit around frontend development and experience implementation, and I am open to building long-term products with thoughtful, quality-driven teams.",
      stats: [
        {
          label: "Base",
          value: "Guangzhou, China"
        },
        {
          label: "Open To",
          value: "Full-time, selected collaborations"
        },
        {
          label: "Response",
          value: "Usually within 24 hours"
        }
      ],
      tags: ["Identity Design", "Creative Coding", "Narrative Layout", "Portfolio Strategy", "Frontend Systems"]
    },
    deconstruction: {
      issue: "Issue 02 / Deconstruction",
      title: "I break my ability into signals that are easier to read.",
      copy: "A compact label system for understanding the way I think, build, and deliver.",
      cards: [
        {
          letter: "P",
          word: "Presence",
          zh: "Positioning",
          text: "I want the first glance to communicate a clear personal presence, so visitors can quickly understand what I am good at and where I fit."
        },
        {
          letter: "R",
          word: "Range",
          zh: "Range",
          text: "My range covers information structure, page expression, interaction detail, and frontend execution, which lets me carry an idea toward a shippable result."
        },
        {
          letter: "O",
          word: "Output",
          zh: "Output",
          text: "I care about outcomes that actually land, so I build pages as complete, runnable, maintainable products instead of leaving them at the concept stage."
        },
        {
          letter: "F",
          word: "Focus",
          zh: "Focus",
          text: "I prioritize hierarchy, reading paths, and key messages so a page feels easy to understand and easier to remember."
        },
        {
          letter: "I",
          word: "Instinct",
          zh: "Visual Judgment",
          text: "I like pages with a distinct personality, but the style should always serve the content and the goal."
        },
        {
          letter: "L",
          word: "Link",
          zh: "Collaboration",
          text: "I usually align goals and boundaries first, then move quickly through details with clear communication that reduces back and forth."
        },
        {
          letter: "E",
          word: "Evolution",
          zh: "Evolution",
          text: "I treat personal sites and project pages as systems that can keep evolving, not as one-off showcases."
        }
      ]
    },
    about: {
      issue: "Issue 03 / About Me",
      title: "I want people to see not only what I made, but how I make things work.",
      copy: "This is the working method and judgment behind the pages.",
      portraitLabel: "Capability Portrait",
      askLabel: "Ask The Profile",
      profileMap: {
        axisX: ["Expression", "Delivery"],
        axisY: ["Structure", "Experience"],
        coreKicker: "Profile Core",
        coreTitle: "Frontend Experience Builder",
        coreText: "Turning structure, visuals, and code into shippable pages",
        nodes: [
          { label: "Structure", detail: "Hierarchy", tone: "#f6c85f" },
          { label: "Visual", detail: "Style judgment", tone: "#ff8cb7" },
          { label: "Frontend", detail: "Component build", tone: "#7bf7d4" },
          { label: "Experience", detail: "Interaction rhythm", tone: "#69d2ff" },
          { label: "Delivery", detail: "Launch + upkeep", tone: "#ff6a3d" }
        ]
      },
      paragraphs: [
        "I am looking for frontend opportunities worth investing in long term, especially with teams that care about product experience, page finish, and engineering quality.",
        "I think across information structure, visual expression, and frontend implementation as one continuous path, so the page has style while remaining usable, maintainable, and ready to grow."
      ],
      snippets: ["Frontend craft meets experience", "Structure, visuals, and delivery together", "Open to the right full-time role"],
      quickFacts: [
        {
          label: "Work Mode",
          value: "Full-time / Remote / Fast iteration"
        },
        {
          label: "Preferred Scope",
          value: "Frontend pages, portfolio sites, product showcases"
        },
        {
          label: "Current Theme",
          value: "Job seeking, frontend and experience implementation"
        }
      ]
    },
    questions: [
      {
        id: "what",
        prompt: "What kind of projects fit you best?",
        answer: "I fit projects that need both clear expression and real delivery, such as personal brand sites, portfolio sites, product showcase pages, and frontend pages with strong experience or visual direction. A good page should not only look right, it should ship, stay maintainable, and communicate value."
      },
      {
        id: "how",
        prompt: "How do you usually work?",
        answer: "I usually define the information hierarchy and page structure first, then decide the visual language and interaction rhythm, and finally polish the implementation details. That keeps the page structured and finished instead of stopping at a concept."
      },
      {
        id: "why",
        prompt: "What matters most to you on a page?",
        answer: "I care most about whether the page communicates the real character of the person or product. If it only feels like a template, it has missed the most important job. Clear structure and accurate style should work together."
      },
      {
        id: "next",
        prompt: "How could this page grow next?",
        answer: "This page can grow into a fuller personal site with project detail pages, writing, hiring information, an English version, or a more convenient content setup. This version builds the identity expression and core entry points first, with enough room to extend."
      }
    ],
    skills: {
      issue: "Issue 04 / Skill Universe",
      title: "I see skills as a collaborative system, not a list of isolated names.",
      copy: "I care more about how abilities work together than any single skill by itself. Structure, visuals, interaction, and frontend execution are strongest when they operate as one system.",
      coreLabel: "Core System",
      core: "Structure x Visual x Frontend",
      coreNote: "I am strongest at moving a page from concept into a shippable state where content expression and implementation quality both hold up.",
      nodes: [
        {
          label: "Product",
          detail: "Structure"
        },
        {
          label: "Visual",
          detail: "Atmosphere"
        },
        {
          label: "Frontend",
          detail: "Execution"
        },
        {
          label: "Motion",
          detail: "Rhythm"
        },
        {
          label: "Content",
          detail: "Story"
        },
        {
          label: "Systems",
          detail: "Scalability"
        }
      ],
      groups: [
        {
          title: "Narrative Layer",
          note: "Organizing a design direction into a story structure that is easier to understand.",
          items: ["Section structure", "Copy organization", "Information hierarchy", "Reading rhythm", "Personal expression"]
        },
        {
          title: "Visual Layer",
          note: "Building a clearer page personality instead of falling back into a template feel.",
          items: ["Layout system", "Visual atmosphere", "Typography choice", "Information contrast", "Style consistency"]
        },
        {
          title: "Build Layer",
          note: "Runnable frontend projects with component structure, interactive state, and responsive behavior.",
          items: ["Vue", "Vite", "Component structure", "Interactive state", "Responsive adaptation"]
        },
        {
          title: "Delivery Layer",
          note: "Pages that are easy to update, extend, and keep evolving rather than one-time displays.",
          items: ["Data configuration", "Reusable modules", "Maintenance cost", "Content replacement", "Continuous updates"]
        }
      ]
    },
    projects: {
      issue: "Issue 05 / Selected Chapters",
      title: "Projects and experience should prove rhythm, judgment, and finish.",
      copy: "The goal is not only to show what I have done, but to make it easier to understand the kind of work I am suited for.",
      items: [
        {
          id: "identity-site",
          category: "Personal Branding",
          title: "Personal Homepage Rebuild",
          subtitle: "Turning a standard profile page into a more recognizable identity entry point",
          description: "A clearer structure, steadier visual voice, and fuller implementation turn the personal introduction into an entry point people can actually read.",
          signals: [
            {
              label: "Structure",
              value: "Editorial single-page"
            },
            {
              label: "Tone",
              value: "Bold + structured"
            },
            {
              label: "Build",
              value: "Vite + Vue"
            }
          ],
          stack: ["Vue", "Vite", "CSS", "Interaction Design"],
          details: [
            "Reorganized the hero, identity breakdown, question area, and contact section into a clearer reading rhythm.",
            "Used staged entrance, section shifts, and information cards to make the page feel more finished and memorable.",
            "Moved content into a data layer so personal information can be replaced more easily later."
          ]
        },
        {
          id: "portfolio-system",
          category: "Portfolio Strategy",
          title: "Portfolio Structure System",
          subtitle: "Giving project showcases stronger priority instead of laying everything out flat",
          description: "A portfolio is less about quantity and more about judgment. Better ordering and narrative structure help the most important work become easier to notice.",
          signals: [
            {
              label: "Goal",
              value: "Clearer project reading"
            },
            {
              label: "Focus",
              value: "Memory + hierarchy"
            },
            {
              label: "Result",
              value: "More convincing presentation"
            }
          ],
          stack: ["Content Design", "Information Architecture", "Visual System"],
          details: [
            "Make project order and hierarchy support the professional direction you want to communicate.",
            "Use titles, tags, and summaries to help visitors enter the key points faster.",
            "Keep the page friendly to quick scanning while still supporting deeper reading."
          ]
        },
        {
          id: "launch-page",
          category: "Product Launch",
          title: "Product Launch Page Narrative",
          subtitle: "Organizing product information into a page with stronger rhythm and focus",
          description: "Balancing information density and visual rhythm helps users not only see the content, but understand its value more smoothly.",
          signals: [
            {
              label: "Approach",
              value: "Story-driven layout"
            },
            {
              label: "Visual",
              value: "High contrast editorial"
            },
            {
              label: "Outcome",
              value: "Clearer product message"
            }
          ],
          stack: ["Landing Page", "Frontend", "Narrative Design"],
          details: [
            "Build the user's understanding path first, then arrange sections and message order.",
            "Use visual contrast and interaction rhythm to control the reading experience.",
            "Fit scenarios that need both presentation quality and information efficiency."
          ]
        },
        {
          id: "creative-collab",
          category: "Creative Collaboration",
          title: "Expressive Frontend Page",
          subtitle: "When the page itself needs to become part of the work",
          description: "Some projects do not fit a standard template. They need stronger style, clearer narrative, and layered visual rhythm to carry the content.",
          signals: [
            {
              label: "Character",
              value: "Distinctive and expressive"
            },
            {
              label: "Interaction",
              value: "Motion + layered cards"
            },
            {
              label: "Audience",
              value: "Creative and product teams"
            }
          ],
          stack: ["Creative Direction", "Web Styling", "Narrative UX"],
          details: [
            "Let the page express the character of the project instead of acting only as an information container.",
            "Use layout, motion, and decorative elements to create stronger memory points.",
            "Fit scenarios that care about expression while still requiring delivery quality."
          ]
        }
      ]
    },
    contact: {
      issue: "Issue 06 / Contact",
      title: "If my direction feels right, feel free to reach out.",
      copy: "I am currently open to job opportunities and conversations around frontend development, portfolio pages, product showcases, and expressive web experiences.",
      display: "LET'S BUILD SOMETHING CLEAR, STRIKING, AND USEFUL.",
      intro: "These are the channels I use most often. If you have a fitting role, project, or collaboration idea, you can email me directly or find me through WeChat and GitHub first.",
      items: [
        {
          displayLabel: "Email",
          displayAction: "Verify to Email"
        },
        {
          displayLabel: "WeChat",
          displayAction: "Verify to Copy"
        },
        {
          displayLabel: "GitHub",
          displayAction: "Open GitHub"
        }
      ]
    }
  }
};

const mergeIndexedArray = (baseItems = [], localizedItems = []) =>
  localizedItems.map((item, index) => ({
    ...(baseItems[index] ?? {}),
    ...item
  }));

const mergeById = (baseItems = [], localizedItems = []) =>
  localizedItems.map((item) => ({
    ...(baseItems.find((baseItem) => baseItem.id === item.id) ?? {}),
    ...item
  }));

const mergeSkillNodes = (baseItems = [], localizedItems = []) =>
  localizedItems.map((item, index) => ({
    ...(baseItems[index] ?? {}),
    ...item,
    id: baseItems[index]?.id ?? baseItems[index]?.label ?? item.label
  }));

const mergeContactItems = (baseItems = [], localizedItems = []) =>
  localizedItems.map((item, index) => ({
    ...(baseItems[index] ?? {}),
    ...item,
    label: baseItems[index]?.label ?? item.label ?? item.displayLabel,
    action: baseItems[index]?.action ?? item.action ?? item.displayAction,
    value: baseItems[index]?.value ?? item.value,
    href: baseItems[index]?.href ?? item.href,
    copy: baseItems[index]?.copy ?? item.copy,
    protected: baseItems[index]?.protected ?? item.protected,
    masked: baseItems[index]?.masked ?? item.masked
  }));

export function getSiteCopy(locale) {
  return siteCopy[normalizeLocale(locale)];
}

export function buildLocalizedProfile(profile, locale) {
  const normalizedLocale = normalizeLocale(locale);
  const localized = localizedProfiles[normalizedLocale];
  const base = profile ?? {};

  return {
    ...base,
    ...localized,
    hero: {
      ...(base.hero ?? {}),
      ...localized.hero,
      primaryCta: {
        ...(base.hero?.primaryCta ?? {}),
        ...localized.hero.primaryCta
      },
      secondaryCta: {
        ...(base.hero?.secondaryCta ?? {}),
        ...localized.hero.secondaryCta
      }
    },
    deconstruction: {
      ...(base.deconstruction ?? {}),
      ...localized.deconstruction,
      cards: mergeIndexedArray(base.deconstruction?.cards, localized.deconstruction.cards)
    },
    about: {
      ...(base.about ?? {}),
      ...localized.about
    },
    questions: mergeById(base.questions, localized.questions),
    skills: {
      ...(base.skills ?? {}),
      ...localized.skills,
      nodes: mergeSkillNodes(base.skills?.nodes, localized.skills.nodes),
      groups: mergeIndexedArray(base.skills?.groups, localized.skills.groups)
    },
    projects: {
      ...(base.projects ?? {}),
      ...localized.projects,
      items: mergeById(base.projects?.items, localized.projects.items)
    },
    contact: {
      ...(base.contact ?? {}),
      ...localized.contact,
      items: mergeContactItems(base.contact?.items, localized.contact.items)
    }
  };
}

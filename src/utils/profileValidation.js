const isBlank = (value) => typeof value !== "string" || value.trim() === "";

function pushRequiredError(errors, sectionId, sectionLabel, fieldLabel, value) {
  if (isBlank(value)) {
    errors.push({
      sectionId,
      sectionLabel,
      message: `${fieldLabel}不能为空`
    });
  }
}

function pushArrayItemError(errors, sectionId, sectionLabel, fieldLabel, list) {
  if (!Array.isArray(list) || list.length === 0) {
    errors.push({
      sectionId,
      sectionLabel,
      message: `${fieldLabel}至少保留一项`
    });
  }
}

export function validateProfileDraft(profile) {
  const errors = [];

  pushRequiredError(errors, "basic", "首页资料", "站点期号", profile.edition);
  pushRequiredError(errors, "basic", "首页资料", "中文名", profile.nameCn);
  pushRequiredError(errors, "basic", "首页资料", "英文名", profile.nameEn);
  pushRequiredError(errors, "basic", "首页资料", "角色标题", profile.role);
  pushRequiredError(errors, "basic", "首页资料", "首页章节标签", profile.hero.issue);
  pushRequiredError(errors, "basic", "首页资料", "首页引导文案", profile.hero.eyebrow);
  pushRequiredError(errors, "basic", "首页资料", "首页主标题说明", profile.hero.subtitle);
  pushRequiredError(errors, "basic", "首页资料", "首页侧边摘要", profile.hero.summary);
  pushArrayItemError(errors, "basic", "首页资料", "首页标题分行", profile.hero.title);
  pushArrayItemError(errors, "basic", "首页资料", "首页统计信息", profile.hero.stats);
  pushArrayItemError(errors, "basic", "首页资料", "首页标签条", profile.hero.tags);

  profile.hero.title.forEach((item, index) => {
    pushRequiredError(errors, "basic", "首页资料", `首页标题第 ${index + 1} 行`, item);
  });

  profile.hero.stats.forEach((item, index) => {
    pushRequiredError(errors, "basic", "首页资料", `统计信息 ${index + 1} 的标签`, item.label);
    pushRequiredError(errors, "basic", "首页资料", `统计信息 ${index + 1} 的内容`, item.value);
  });

  profile.hero.tags.forEach((item, index) => {
    pushRequiredError(errors, "basic", "首页资料", `标签条第 ${index + 1} 项`, item);
  });

  pushRequiredError(errors, "identity", "身份拆解", "章节标签", profile.deconstruction.issue);
  pushRequiredError(errors, "identity", "身份拆解", "标题", profile.deconstruction.title);
  pushRequiredError(errors, "identity", "身份拆解", "说明文案", profile.deconstruction.copy);
  pushArrayItemError(errors, "identity", "身份拆解", "拆解卡片", profile.deconstruction.cards);

  profile.deconstruction.cards.forEach((item, index) => {
    pushRequiredError(errors, "identity", "身份拆解", `卡片 ${index + 1} 的字母`, item.letter);
    pushRequiredError(errors, "identity", "身份拆解", `卡片 ${index + 1} 的英文词`, item.word);
    pushRequiredError(errors, "identity", "身份拆解", `卡片 ${index + 1} 的中文名`, item.zh);
    pushRequiredError(errors, "identity", "身份拆解", `卡片 ${index + 1} 的说明`, item.text);
  });

  pushRequiredError(errors, "about", "个人介绍", "章节标签", profile.about.issue);
  pushRequiredError(errors, "about", "个人介绍", "标题", profile.about.title);
  pushRequiredError(errors, "about", "个人介绍", "说明文案", profile.about.copy);
  pushRequiredError(errors, "about", "个人介绍", "视觉说明标签", profile.about.portraitLabel);
  pushArrayItemError(errors, "about", "个人介绍", "正文段落", profile.about.paragraphs);
  pushArrayItemError(errors, "about", "个人介绍", "摘要标签", profile.about.snippets);
  pushArrayItemError(errors, "about", "个人介绍", "快速信息", profile.about.quickFacts);

  profile.about.paragraphs.forEach((item, index) => {
    pushRequiredError(errors, "about", "个人介绍", `正文段落 ${index + 1}`, item);
  });

  profile.about.snippets.forEach((item, index) => {
    pushRequiredError(errors, "about", "个人介绍", `摘要标签 ${index + 1}`, item);
  });

  profile.about.quickFacts.forEach((item, index) => {
    pushRequiredError(errors, "about", "个人介绍", `快速信息 ${index + 1} 的标签`, item.label);
    pushRequiredError(errors, "about", "个人介绍", `快速信息 ${index + 1} 的内容`, item.value);
  });

  pushArrayItemError(errors, "questions", "问答区", "问题列表", profile.questions);
  const questionIds = new Set();
  profile.questions.forEach((item, index) => {
    pushRequiredError(errors, "questions", "问答区", `问题 ${index + 1} 的 ID`, item.id);
    pushRequiredError(errors, "questions", "问答区", `问题 ${index + 1} 的题目`, item.prompt);
    pushRequiredError(errors, "questions", "问答区", `问题 ${index + 1} 的答案`, item.answer);

    if (!isBlank(item.id)) {
      if (questionIds.has(item.id.trim())) {
        errors.push({
          sectionId: "questions",
          sectionLabel: "问答区",
          message: `问题 ID "${item.id}" 重复，请修改为唯一值`
        });
      }

      questionIds.add(item.id.trim());
    }
  });

  pushRequiredError(errors, "skills", "技能宇宙", "章节标签", profile.skills.issue);
  pushRequiredError(errors, "skills", "技能宇宙", "标题", profile.skills.title);
  pushRequiredError(errors, "skills", "技能宇宙", "说明文案", profile.skills.copy);
  pushRequiredError(errors, "skills", "技能宇宙", "核心标题", profile.skills.core);
  pushRequiredError(errors, "skills", "技能宇宙", "核心说明", profile.skills.coreNote);
  pushArrayItemError(errors, "skills", "技能宇宙", "技能节点", profile.skills.nodes);
  pushArrayItemError(errors, "skills", "技能宇宙", "能力分组", profile.skills.groups);

  profile.skills.nodes.forEach((item, index) => {
    pushRequiredError(errors, "skills", "技能宇宙", `技能节点 ${index + 1} 的名称`, item.label);
    pushRequiredError(errors, "skills", "技能宇宙", `技能节点 ${index + 1} 的副标题`, item.detail);
    pushRequiredError(errors, "skills", "技能宇宙", `技能节点 ${index + 1} 的 X 位置`, item.x);
    pushRequiredError(errors, "skills", "技能宇宙", `技能节点 ${index + 1} 的 Y 位置`, item.y);
    pushRequiredError(errors, "skills", "技能宇宙", `技能节点 ${index + 1} 的色值`, item.tone);
  });

  profile.skills.groups.forEach((group, groupIndex) => {
    pushRequiredError(errors, "skills", "技能宇宙", `能力分组 ${groupIndex + 1} 的标题`, group.title);
    pushRequiredError(errors, "skills", "技能宇宙", `能力分组 ${groupIndex + 1} 的说明`, group.note);
    pushArrayItemError(errors, "skills", "技能宇宙", `能力分组 ${groupIndex + 1} 的条目`, group.items);

    group.items.forEach((item, itemIndex) => {
      pushRequiredError(errors, "skills", "技能宇宙", `能力分组 ${groupIndex + 1} 的条目 ${itemIndex + 1}`, item);
    });
  });

  pushRequiredError(errors, "projects", "项目章节", "章节标签", profile.projects.issue);
  pushRequiredError(errors, "projects", "项目章节", "标题", profile.projects.title);
  pushRequiredError(errors, "projects", "项目章节", "说明文案", profile.projects.copy);
  pushArrayItemError(errors, "projects", "项目章节", "项目列表", profile.projects.items);

  const projectIds = new Set();
  profile.projects.items.forEach((project, projectIndex) => {
    pushRequiredError(errors, "projects", "项目章节", `项目 ${projectIndex + 1} 的 ID`, project.id);
    pushRequiredError(errors, "projects", "项目章节", `项目 ${projectIndex + 1} 的序号`, project.index);
    pushRequiredError(errors, "projects", "项目章节", `项目 ${projectIndex + 1} 的分类`, project.category);
    pushRequiredError(errors, "projects", "项目章节", `项目 ${projectIndex + 1} 的标题`, project.title);
    pushRequiredError(errors, "projects", "项目章节", `项目 ${projectIndex + 1} 的副标题`, project.subtitle);
    pushRequiredError(errors, "projects", "项目章节", `项目 ${projectIndex + 1} 的简介`, project.description);
    pushArrayItemError(errors, "projects", "项目章节", `项目 ${projectIndex + 1} 的信号卡片`, project.signals);
    pushArrayItemError(errors, "projects", "项目章节", `项目 ${projectIndex + 1} 的技术栈`, project.stack);
    pushArrayItemError(errors, "projects", "项目章节", `项目 ${projectIndex + 1} 的详情段落`, project.details);

    if (!isBlank(project.id)) {
      if (projectIds.has(project.id.trim())) {
        errors.push({
          sectionId: "projects",
          sectionLabel: "项目章节",
          message: `项目 ID "${project.id}" 重复，请修改为唯一值`
        });
      }

      projectIds.add(project.id.trim());
    }

    project.signals.forEach((signal, signalIndex) => {
      pushRequiredError(errors, "projects", "项目章节", `项目 ${projectIndex + 1} 的信号 ${signalIndex + 1} 标签`, signal.label);
      pushRequiredError(errors, "projects", "项目章节", `项目 ${projectIndex + 1} 的信号 ${signalIndex + 1} 内容`, signal.value);
    });

    project.stack.forEach((item, itemIndex) => {
      pushRequiredError(errors, "projects", "项目章节", `项目 ${projectIndex + 1} 的技术栈 ${itemIndex + 1}`, item);
    });

    project.details.forEach((item, itemIndex) => {
      pushRequiredError(errors, "projects", "项目章节", `项目 ${projectIndex + 1} 的详情段落 ${itemIndex + 1}`, item);
    });
  });

  pushRequiredError(errors, "contact", "联系信息", "章节标签", profile.contact.issue);
  pushRequiredError(errors, "contact", "联系信息", "标题", profile.contact.title);
  pushRequiredError(errors, "contact", "联系信息", "说明文案", profile.contact.copy);
  pushRequiredError(errors, "contact", "联系信息", "主显示文案", profile.contact.display);
  pushRequiredError(errors, "contact", "联系信息", "联系引导", profile.contact.intro);
  pushArrayItemError(errors, "contact", "联系信息", "联系卡片", profile.contact.items);

  profile.contact.items.forEach((item, index) => {
    pushRequiredError(errors, "contact", "联系信息", `联系卡片 ${index + 1} 的标签`, item.label);
    pushRequiredError(errors, "contact", "联系信息", `联系卡片 ${index + 1} 的展示值`, item.value);
    pushRequiredError(errors, "contact", "联系信息", `联系卡片 ${index + 1} 的按钮文案`, item.action);

    if (!item.copy) {
      pushRequiredError(errors, "contact", "联系信息", `联系卡片 ${index + 1} 的链接`, item.href);
    }
  });

  return errors;
}

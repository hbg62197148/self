<script setup>
const props = defineProps({
  model: {
    type: Object,
    required: true
  }
});

const createSignal = () => ({
  label: "Signal",
  value: ""
});

const createProject = () => ({
  id: `project-${Date.now()}`,
  index: "01",
  category: "New Category",
  title: "新项目",
  subtitle: "",
  description: "",
  signals: [createSignal()],
  stack: ["Vue"],
  details: [""]
});

const addProject = () => {
  props.model.items.push(createProject());
};

const removeProject = (index) => {
  props.model.items.splice(index, 1);
};

const addSignal = (project) => {
  project.signals.push(createSignal());
};

const removeSignal = (project, index) => {
  project.signals.splice(index, 1);
};

const addStackItem = (project) => {
  project.stack.push("新技术");
};

const removeStackItem = (project, index) => {
  project.stack.splice(index, 1);
};

const addDetail = (project) => {
  project.details.push("");
};

const removeDetail = (project, index) => {
  project.details.splice(index, 1);
};
</script>

<template>
  <div class="admin-stack">
    <div class="admin-form-grid">
      <label class="admin-field">
        <span>章节标签</span>
        <input v-model="model.issue" class="admin-input" type="text">
      </label>
      <label class="admin-field admin-field--full">
        <span>标题</span>
        <textarea v-model="model.title" class="admin-textarea" rows="2"></textarea>
      </label>
      <label class="admin-field admin-field--full">
        <span>说明文案</span>
        <textarea v-model="model.copy" class="admin-textarea" rows="3"></textarea>
      </label>
    </div>

    <div class="admin-group">
      <div class="admin-group-head">
        <strong>项目列表</strong>
        <button type="button" class="admin-add" @click="addProject">新增项目</button>
      </div>

      <div class="admin-card-list">
        <article v-for="(project, projectIndex) in model.items" :key="project.id" class="admin-item-card">
          <div class="admin-inline-grid admin-inline-grid--three">
            <label class="admin-field">
              <span>ID</span>
              <input v-model="project.id" class="admin-input" type="text">
            </label>
            <label class="admin-field">
              <span>序号</span>
              <input v-model="project.index" class="admin-input" type="text">
            </label>
            <label class="admin-field">
              <span>分类</span>
              <input v-model="project.category" class="admin-input" type="text">
            </label>
            <label class="admin-field">
              <span>项目标题</span>
              <input v-model="project.title" class="admin-input" type="text">
            </label>
            <label class="admin-field admin-field--full">
              <span>副标题</span>
              <textarea v-model="project.subtitle" class="admin-textarea" rows="2"></textarea>
            </label>
            <label class="admin-field admin-field--full">
              <span>简介</span>
              <textarea v-model="project.description" class="admin-textarea" rows="4"></textarea>
            </label>
          </div>

          <div class="admin-group">
            <div class="admin-group-head">
              <strong>信号卡片</strong>
              <button type="button" class="admin-add" @click="addSignal(project)">新增信号</button>
            </div>
            <div class="admin-card-list">
              <article v-for="(signal, signalIndex) in project.signals" :key="`${signal.label}-${signalIndex}`" class="admin-item-card admin-item-card--subtle">
                <div class="admin-inline-grid">
                  <label class="admin-field">
                    <span>标签</span>
                    <input v-model="signal.label" class="admin-input" type="text">
                  </label>
                  <label class="admin-field">
                    <span>内容</span>
                    <input v-model="signal.value" class="admin-input" type="text">
                  </label>
                </div>
                <button type="button" class="admin-remove" @click="removeSignal(project, signalIndex)">删除信号</button>
              </article>
            </div>
          </div>

          <div class="admin-group">
            <div class="admin-group-head">
              <strong>技术栈</strong>
              <button type="button" class="admin-add" @click="addStackItem(project)">新增技术</button>
            </div>
            <div class="admin-repeat-list">
              <div v-for="(item, itemIndex) in project.stack" :key="`${item}-${itemIndex}`" class="admin-inline-row">
                <input v-model="project.stack[itemIndex]" class="admin-input" type="text">
                <button type="button" class="admin-remove" @click="removeStackItem(project, itemIndex)">删除</button>
              </div>
            </div>
          </div>

          <div class="admin-group">
            <div class="admin-group-head">
              <strong>详情段落</strong>
              <button type="button" class="admin-add" @click="addDetail(project)">新增段落</button>
            </div>
            <div class="admin-repeat-list">
              <div v-for="(item, itemIndex) in project.details" :key="`detail-${itemIndex}`" class="admin-stack">
                <textarea v-model="project.details[itemIndex]" class="admin-textarea" rows="3"></textarea>
                <button type="button" class="admin-remove" @click="removeDetail(project, itemIndex)">删除段落</button>
              </div>
            </div>
          </div>

          <button type="button" class="admin-remove" @click="removeProject(projectIndex)">删除项目</button>
        </article>
      </div>
    </div>
  </div>
</template>

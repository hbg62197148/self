<script setup>
const props = defineProps({
  model: {
    type: Object,
    required: true
  }
});

// 编辑页直接修改父级草稿对象，保存时再统一提交。
const createStat = () => ({
  label: "New Label",
  value: ""
});

const addTitleLine = () => {
  props.model.hero.title.push("NEW LINE");
};

const removeTitleLine = (index) => {
  props.model.hero.title.splice(index, 1);
};

const addStat = () => {
  props.model.hero.stats.push(createStat());
};

const removeStat = (index) => {
  props.model.hero.stats.splice(index, 1);
};

const addTag = () => {
  props.model.hero.tags.push("New Tag");
};

const removeTag = (index) => {
  props.model.hero.tags.splice(index, 1);
};
</script>

<template>
  <div class="admin-stack">
    <div class="admin-form-grid">
      <label class="admin-field">
        <span>站点期号</span>
        <input v-model="model.edition" class="admin-input" type="text">
      </label>
      <label class="admin-field">
        <span>中文名</span>
        <input v-model="model.nameCn" class="admin-input" type="text">
      </label>
      <label class="admin-field">
        <span>英文名</span>
        <input v-model="model.nameEn" class="admin-input" type="text">
      </label>
      <label class="admin-field">
        <span>角色标题</span>
        <input v-model="model.role" class="admin-input" type="text">
      </label>
    </div>

    <div class="admin-form-grid">
      <label class="admin-field">
        <span>章节标签</span>
        <input v-model="model.hero.issue" class="admin-input" type="text">
      </label>
      <label class="admin-field admin-field--full">
        <span>首屏引导文案</span>
        <textarea v-model="model.hero.eyebrow" class="admin-textarea" rows="3"></textarea>
      </label>
      <label class="admin-field admin-field--full">
        <span>主标题说明</span>
        <textarea v-model="model.hero.subtitle" class="admin-textarea" rows="4"></textarea>
      </label>
      <label class="admin-field admin-field--full">
        <span>侧边摘要</span>
        <textarea v-model="model.hero.summary" class="admin-textarea" rows="4"></textarea>
      </label>
    </div>

    <div class="admin-group">
      <div class="admin-group-head">
        <strong>主标题分行</strong>
        <button type="button" class="admin-add" @click="addTitleLine">新增一行</button>
      </div>
      <div class="admin-repeat-list">
        <div v-for="(line, index) in model.hero.title" :key="`${line}-${index}`" class="admin-inline-row">
          <input v-model="model.hero.title[index]" class="admin-input" type="text">
          <button type="button" class="admin-remove" @click="removeTitleLine(index)">删除</button>
        </div>
      </div>
    </div>

    <div class="admin-form-grid">
      <label class="admin-field">
        <span>主按钮文案</span>
        <input v-model="model.hero.primaryCta.label" class="admin-input" type="text">
      </label>
      <label class="admin-field">
        <span>主按钮链接</span>
        <input v-model="model.hero.primaryCta.href" class="admin-input" type="text">
      </label>
      <label class="admin-field">
        <span>次按钮文案</span>
        <input v-model="model.hero.secondaryCta.label" class="admin-input" type="text">
      </label>
      <label class="admin-field">
        <span>次按钮链接</span>
        <input v-model="model.hero.secondaryCta.href" class="admin-input" type="text">
      </label>
    </div>

    <div class="admin-group">
      <div class="admin-group-head">
        <strong>统计信息</strong>
        <button type="button" class="admin-add" @click="addStat">新增统计</button>
      </div>
      <div class="admin-card-list">
        <article v-for="(item, index) in model.hero.stats" :key="`${item.label}-${index}`" class="admin-item-card">
          <div class="admin-inline-grid">
            <label class="admin-field">
              <span>标签</span>
              <input v-model="item.label" class="admin-input" type="text">
            </label>
            <label class="admin-field">
              <span>内容</span>
              <input v-model="item.value" class="admin-input" type="text">
            </label>
          </div>
          <button type="button" class="admin-remove" @click="removeStat(index)">删除统计</button>
        </article>
      </div>
    </div>

    <div class="admin-group">
      <div class="admin-group-head">
        <strong>标签条</strong>
        <button type="button" class="admin-add" @click="addTag">新增标签</button>
      </div>
      <div class="admin-repeat-list">
        <div v-for="(item, index) in model.hero.tags" :key="`${item}-${index}`" class="admin-inline-row">
          <input v-model="model.hero.tags[index]" class="admin-input" type="text">
          <button type="button" class="admin-remove" @click="removeTag(index)">删除</button>
        </div>
      </div>
    </div>
  </div>
</template>

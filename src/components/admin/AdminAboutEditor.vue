<script setup>
const props = defineProps({
  model: {
    type: Object,
    required: true
  }
});

const createFact = () => ({
  label: "New Fact",
  value: ""
});

const addParagraph = () => {
  props.model.paragraphs.push("");
};

const removeParagraph = (index) => {
  props.model.paragraphs.splice(index, 1);
};

const addSnippet = () => {
  props.model.snippets.push("新摘要");
};

const removeSnippet = (index) => {
  props.model.snippets.splice(index, 1);
};

const addFact = () => {
  props.model.quickFacts.push(createFact());
};

const removeFact = (index) => {
  props.model.quickFacts.splice(index, 1);
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
      <label class="admin-field admin-field--full">
        <span>视觉说明标签</span>
        <input v-model="model.portraitLabel" class="admin-input" type="text">
      </label>
    </div>

    <div class="admin-group">
      <div class="admin-group-head">
        <strong>正文段落</strong>
        <button type="button" class="admin-add" @click="addParagraph">新增段落</button>
      </div>
      <div class="admin-repeat-list">
        <div v-for="(paragraph, index) in model.paragraphs" :key="`paragraph-${index}`" class="admin-stack">
          <textarea v-model="model.paragraphs[index]" class="admin-textarea" rows="4"></textarea>
          <button type="button" class="admin-remove" @click="removeParagraph(index)">删除段落</button>
        </div>
      </div>
    </div>

    <div class="admin-group">
      <div class="admin-group-head">
        <strong>摘要标签</strong>
        <button type="button" class="admin-add" @click="addSnippet">新增标签</button>
      </div>
      <div class="admin-repeat-list">
        <div v-for="(item, index) in model.snippets" :key="`${item}-${index}`" class="admin-inline-row">
          <input v-model="model.snippets[index]" class="admin-input" type="text">
          <button type="button" class="admin-remove" @click="removeSnippet(index)">删除</button>
        </div>
      </div>
    </div>

    <div class="admin-group">
      <div class="admin-group-head">
        <strong>快速信息</strong>
        <button type="button" class="admin-add" @click="addFact">新增信息</button>
      </div>
      <div class="admin-card-list">
        <article v-for="(item, index) in model.quickFacts" :key="`${item.label}-${index}`" class="admin-item-card">
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
          <button type="button" class="admin-remove" @click="removeFact(index)">删除信息</button>
        </article>
      </div>
    </div>
  </div>
</template>

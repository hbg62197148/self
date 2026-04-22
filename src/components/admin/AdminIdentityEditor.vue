<script setup>
const props = defineProps({
  model: {
    type: Object,
    required: true
  }
});

const createCard = () => ({
  letter: "N",
  word: "New",
  zh: "新标签",
  text: ""
});

const addCard = () => {
  props.model.cards.push(createCard());
};

const removeCard = (index) => {
  props.model.cards.splice(index, 1);
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
        <strong>拆解卡片</strong>
        <button type="button" class="admin-add" @click="addCard">新增卡片</button>
      </div>

      <div class="admin-card-list">
        <article v-for="(item, index) in model.cards" :key="`${item.word}-${index}`" class="admin-item-card">
          <div class="admin-inline-grid admin-inline-grid--three">
            <label class="admin-field">
              <span>字母</span>
              <input v-model="item.letter" class="admin-input" type="text">
            </label>
            <label class="admin-field">
              <span>英文词</span>
              <input v-model="item.word" class="admin-input" type="text">
            </label>
            <label class="admin-field">
              <span>中文名</span>
              <input v-model="item.zh" class="admin-input" type="text">
            </label>
          </div>

          <label class="admin-field">
            <span>说明文案</span>
            <textarea v-model="item.text" class="admin-textarea" rows="4"></textarea>
          </label>

          <button type="button" class="admin-remove" @click="removeCard(index)">删除卡片</button>
        </article>
      </div>
    </div>
  </div>
</template>

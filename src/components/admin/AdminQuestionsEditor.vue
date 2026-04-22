<script setup>
const props = defineProps({
  model: {
    type: Array,
    required: true
  }
});

const createQuestion = () => ({
  id: `question-${Date.now()}`,
  prompt: "新问题",
  answer: ""
});

const addQuestion = () => {
  props.model.push(createQuestion());
};

const removeQuestion = (index) => {
  props.model.splice(index, 1);
};
</script>

<template>
  <div class="admin-group">
    <div class="admin-group-head">
      <strong>问题列表</strong>
      <button type="button" class="admin-add" @click="addQuestion">新增问题</button>
    </div>

    <div class="admin-card-list">
      <article v-for="(item, index) in model" :key="item.id" class="admin-item-card">
        <div class="admin-inline-grid">
          <label class="admin-field">
            <span>ID</span>
            <input v-model="item.id" class="admin-input" type="text">
          </label>
          <label class="admin-field">
            <span>问题</span>
            <input v-model="item.prompt" class="admin-input" type="text">
          </label>
        </div>

        <label class="admin-field">
          <span>答案</span>
          <textarea v-model="item.answer" class="admin-textarea" rows="4"></textarea>
        </label>

        <button type="button" class="admin-remove" @click="removeQuestion(index)">删除问题</button>
      </article>
    </div>
  </div>
</template>

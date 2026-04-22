<script setup>
const props = defineProps({
  model: {
    type: Object,
    required: true
  }
});

const createContactItem = () => ({
  label: "New Contact",
  value: "",
  href: "",
  action: "Open",
  copy: false
});

const addContactItem = () => {
  props.model.items.push(createContactItem());
};

const removeContactItem = (index) => {
  props.model.items.splice(index, 1);
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
        <span>主显示文案</span>
        <textarea v-model="model.display" class="admin-textarea" rows="3"></textarea>
      </label>
      <label class="admin-field admin-field--full">
        <span>联系引导</span>
        <textarea v-model="model.intro" class="admin-textarea" rows="3"></textarea>
      </label>
    </div>

    <div class="admin-group">
      <div class="admin-group-head">
        <strong>联系卡片</strong>
        <button type="button" class="admin-add" @click="addContactItem">新增联系卡片</button>
      </div>

      <div class="admin-card-list">
        <article v-for="(item, index) in model.items" :key="`${item.label}-${index}`" class="admin-item-card">
          <div class="admin-inline-grid admin-inline-grid--three">
            <label class="admin-field">
              <span>标签</span>
              <input v-model="item.label" class="admin-input" type="text">
            </label>
            <label class="admin-field">
              <span>展示值</span>
              <input v-model="item.value" class="admin-input" type="text">
            </label>
            <label class="admin-field">
              <span>按钮文案</span>
              <input v-model="item.action" class="admin-input" type="text">
            </label>
            <label class="admin-field admin-field--full">
              <span>链接</span>
              <input v-model="item.href" class="admin-input" type="text">
            </label>
            <label class="admin-check">
              <input v-model="item.copy" type="checkbox">
              <span>改为复制按钮</span>
            </label>
          </div>
          <button type="button" class="admin-remove" @click="removeContactItem(index)">删除联系卡片</button>
        </article>
      </div>
    </div>
  </div>
</template>

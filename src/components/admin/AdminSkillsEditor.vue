<script setup>
const props = defineProps({
  model: {
    type: Object,
    required: true
  }
});

const createNode = () => ({
  label: "New Node",
  detail: "Detail",
  x: "50%",
  y: "50%",
  tone: "#ffffff"
});

const createGroup = () => ({
  title: "New Group",
  note: "",
  items: ["新能力"]
});

const addNode = () => {
  props.model.nodes.push(createNode());
};

const removeNode = (index) => {
  props.model.nodes.splice(index, 1);
};

const addGroup = () => {
  props.model.groups.push(createGroup());
};

const removeGroup = (index) => {
  props.model.groups.splice(index, 1);
};

const addGroupItem = (group) => {
  group.items.push("新能力");
};

const removeGroupItem = (group, index) => {
  group.items.splice(index, 1);
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
      <label class="admin-field">
        <span>核心标题</span>
        <input v-model="model.core" class="admin-input" type="text">
      </label>
      <label class="admin-field admin-field--full">
        <span>核心说明</span>
        <textarea v-model="model.coreNote" class="admin-textarea" rows="3"></textarea>
      </label>
    </div>

    <div class="admin-group">
      <div class="admin-group-head">
        <strong>技能节点</strong>
        <button type="button" class="admin-add" @click="addNode">新增节点</button>
      </div>
      <div class="admin-card-list">
        <article v-for="(item, index) in model.nodes" :key="`${item.label}-${index}`" class="admin-item-card">
          <div class="admin-inline-grid admin-inline-grid--three">
            <label class="admin-field">
              <span>名称</span>
              <input v-model="item.label" class="admin-input" type="text">
            </label>
            <label class="admin-field">
              <span>副标题</span>
              <input v-model="item.detail" class="admin-input" type="text">
            </label>
            <label class="admin-field">
              <span>色值</span>
              <input v-model="item.tone" class="admin-input" type="text">
            </label>
            <label class="admin-field">
              <span>X 位置</span>
              <input v-model="item.x" class="admin-input" type="text">
            </label>
            <label class="admin-field">
              <span>Y 位置</span>
              <input v-model="item.y" class="admin-input" type="text">
            </label>
          </div>
          <button type="button" class="admin-remove" @click="removeNode(index)">删除节点</button>
        </article>
      </div>
    </div>

    <div class="admin-group">
      <div class="admin-group-head">
        <strong>能力分组</strong>
        <button type="button" class="admin-add" @click="addGroup">新增分组</button>
      </div>
      <div class="admin-card-list">
        <article v-for="(group, groupIndex) in model.groups" :key="`${group.title}-${groupIndex}`" class="admin-item-card">
          <div class="admin-inline-grid">
            <label class="admin-field">
              <span>分组标题</span>
              <input v-model="group.title" class="admin-input" type="text">
            </label>
            <label class="admin-field">
              <span>分组说明</span>
              <textarea v-model="group.note" class="admin-textarea" rows="3"></textarea>
            </label>
          </div>

          <div class="admin-group">
            <div class="admin-group-head">
              <strong>分组条目</strong>
              <button type="button" class="admin-add" @click="addGroupItem(group)">新增条目</button>
            </div>
            <div class="admin-repeat-list">
              <div v-for="(item, itemIndex) in group.items" :key="`${item}-${itemIndex}`" class="admin-inline-row">
                <input v-model="group.items[itemIndex]" class="admin-input" type="text">
                <button type="button" class="admin-remove" @click="removeGroupItem(group, itemIndex)">删除</button>
              </div>
            </div>
          </div>

          <button type="button" class="admin-remove" @click="removeGroup(groupIndex)">删除分组</button>
        </article>
      </div>
    </div>
  </div>
</template>

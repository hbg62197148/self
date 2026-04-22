<script setup>
defineProps({
  errors: {
    type: Array,
    default: () => []
  }
});
</script>

<template>
  <aside v-if="errors.length" class="admin-validation panel-inset">
    <div class="admin-group-head">
      <strong>发布前需要修正的内容</strong>
      <span>{{ errors.length }} 项</span>
    </div>

    <div class="admin-validation-list">
      <a
        v-for="(item, index) in errors"
        :key="`${item.sectionId}-${index}`"
        class="admin-validation-link"
        :href="`#${item.sectionId}`"
      >
        <strong>{{ item.sectionLabel }}</strong>
        <span>{{ item.message }}</span>
      </a>
    </div>
  </aside>
</template>

<script setup>
defineProps({
  activeMeta: {
    type: Object,
    required: true
  }
});
</script>

<template>
  <aside class="chapter-beacon" aria-hidden="true">
    <span>{{ activeMeta.index }}</span>
    <strong>{{ activeMeta.label }}</strong>
  </aside>
</template>

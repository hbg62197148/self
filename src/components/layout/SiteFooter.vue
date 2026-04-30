<script setup>
defineProps({
  currentYear: {
    type: Number,
    default: 0
  },
  copy: {
    type: String,
    default: "Personal Issue | 个人专刊 | HBG"
  }
});
</script>

<template>
  <footer class="site-footer">
    <span>{{ copy }}</span>
    <span>{{ currentYear }}</span>
  </footer>
</template>

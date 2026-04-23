<script setup>
defineProps({
  currentYear: {
    type: Number,
    default: 0
  }
});
</script>

<template>
  <footer class="site-footer">
    <span>Personal Issue | 个人专刊 | HBG</span>
    <span>{{ currentYear }}</span>
  </footer>
</template>

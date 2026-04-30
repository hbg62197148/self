<script setup>
defineProps({
  loading: {
    type: Boolean,
    default: true
  },
  edition: {
    type: String,
    default: ""
  },
  copy: {
    type: Object,
    default: () => ({
      label: "LOADING",
      text: "Vite profile issue is assembling..."
    })
  }
});
</script>

<template>
  <div class="loading-screen" :class="{ 'is-hidden': !loading }" :aria-hidden="!loading">
    <div class="loading-stack">
      <span class="loading-label">{{ copy.label }}</span>
      <strong>{{ edition }}</strong>
      <p>{{ copy.text }}</p>
    </div>
  </div>
</template>

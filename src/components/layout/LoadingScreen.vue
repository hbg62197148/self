<script setup>
defineProps({
  loading: {
    type: Boolean,
    default: true
  },
  edition: {
    type: String,
    default: ""
  }
});
</script>

<template>
  <div class="loading-screen" :class="{ 'is-hidden': !loading }" :aria-hidden="!loading">
    <div class="loading-stack">
      <span class="loading-label">LOADING</span>
      <strong>{{ edition }}</strong>
      <p>Vite profile issue is assembling...</p>
    </div>
  </div>
</template>

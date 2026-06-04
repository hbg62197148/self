<script setup>
import Staged from "./Staged.vue";

defineProps({
  issue: {
    type: String,
    default: ""
  },
  title: {
    type: String,
    default: ""
  },
  copy: {
    type: String,
    default: ""
  }
});
</script>

<template>
  <header class="section-heading">
    <Staged :order="0">
      <p class="section-kicker">{{ issue }}</p>
      <h2 class="section-title">{{ title }}</h2>
    </Staged>
    <Staged as="p" class="section-copy" :order="1">{{ copy }}</Staged>
  </header>
</template>

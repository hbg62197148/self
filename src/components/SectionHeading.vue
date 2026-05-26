<script setup>
import { ref } from "vue";
import { useSplitTextReveal } from "../composables/useSplitTextReveal";
import Staged from "./Staged.vue";

const props = defineProps({
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

const headingRef = ref(null);

useSplitTextReveal(headingRef, () => [props.issue, props.title, props.copy]);
</script>

<template>
  <header ref="headingRef" class="section-heading">
    <Staged :order="0">
      <p class="section-kicker">{{ issue }}</p>
      <h2 class="section-title">{{ title }}</h2>
    </Staged>
    <Staged as="p" class="section-copy" :order="1">{{ copy }}</Staged>
  </header>
</template>

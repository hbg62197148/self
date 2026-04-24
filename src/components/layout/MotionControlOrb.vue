<script setup>
import { useMotionPreference } from "../../composables/useMotionPreference";

const { isMotionLite, motionModeLabel, toggleMotionMode } = useMotionPreference();
</script>

<template>
  <button
    type="button"
    :class="['motion-orb', { 'is-lite': isMotionLite }]"
    :aria-pressed="isMotionLite"
    :aria-label="motionModeLabel"
    :title="motionModeLabel"
    @click="toggleMotionMode"
  >
    <span class="motion-orb-ring" aria-hidden="true" />
    <span class="motion-orb-core" aria-hidden="true">
      <span class="motion-orb-wave" />
      <span class="motion-orb-dot" />
    </span>
    <span class="motion-orb-copy">{{ isMotionLite ? "Lite" : "FX" }}</span>
  </button>
</template>

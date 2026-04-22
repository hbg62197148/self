<script setup>
import { computed, useAttrs } from "vue";

defineOptions({
  inheritAttrs: false
});

const props = defineProps({
  as: {
    type: String,
    default: "div"
  },
  order: {
    type: Number,
    default: 0
  }
});

const attrs = useAttrs();

const forwardedAttrs = computed(() => {
  const { class: className, style, ...rest } = attrs;
  return rest;
});

const mergedClass = computed(() => ["stage-item", attrs.class]);

const mergedStyle = computed(() => {
  const orderStyle = { "--stage-order": props.order };
  return attrs.style ? [attrs.style, orderStyle] : orderStyle;
});
</script>

<template>
  <component :is="as" v-bind="forwardedAttrs" :class="mergedClass" :style="mergedStyle">
    <slot />
  </component>
</template>

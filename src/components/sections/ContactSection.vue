<script setup>
import Staged from "../Staged.vue";
import SectionHeading from "../SectionHeading.vue";

defineProps({
  contact: {
    type: Object,
    required: true
  },
  copiedLabel: {
    type: String,
    default: null
  }
});

const emit = defineEmits(["copy"]);

// 只有外部跳转才需要打开新标签页。
const isExternalLink = (href) => Boolean(href) && /^(https?:|mailto:)/.test(href);

// 复制动作交回页面级逻辑统一处理。
const handleCopy = (item) => {
  emit("copy", item.value, item.label);
};
</script>

<template>
  <section class="section panel contact-section" id="contact" data-reveal>
    <SectionHeading
      :issue="contact.issue"
      :title="contact.title"
      :copy="contact.copy"
    />

    <div class="contact-layout">
      <Staged as="article" class="contact-display panel-inset" :order="2">
        <p>{{ contact.display }}</p>
        <span>{{ contact.intro }}</span>
      </Staged>

      <div class="contact-grid">
        <Staged
          v-for="(item, index) in contact.items"
          :key="item.label"
          as="article"
          class="contact-card panel-inset"
          :order="3 + index"
        >
          <span>{{ item.label }}</span>
          <strong>{{ item.value }}</strong>
          <button
            v-if="item.copy"
            type="button"
            class="contact-action"
            @click="handleCopy(item)"
          >
            {{ copiedLabel === item.label ? "Copied" : item.action }}
          </button>
          <a
            v-else
            class="contact-action"
            :href="item.href"
            :target="isExternalLink(item.href) ? '_blank' : undefined"
            :rel="isExternalLink(item.href) ? 'noreferrer' : undefined"
          >
            {{ item.action }}
          </a>
        </Staged>
      </div>
    </div>
  </section>
</template>

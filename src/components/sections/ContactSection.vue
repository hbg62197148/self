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

const emit = defineEmits(["copy", "protected-action"]);

// 只有外部跳转才需要打开新标签页。
const isExternalLink = (href) => Boolean(href) && /^(https?:|mailto:)/.test(href);

// 复制动作交回页面级逻辑统一处理。
const handleCopy = (item) => {
  emit("copy", item.value, item.label);
};

// 前台展示时对受保护联系方式做脱敏，避免直接暴露真实信息。
const getDisplayValue = (item) => {
  if (item.masked) {
    return item.value;
  }

  if (!item.protected) {
    return item.value;
  }

  if (item.href?.startsWith("mailto:") || item.value.includes("@")) {
    const [localPart = "", domain = ""] = item.value.split("@");
    const visiblePrefix = localPart.slice(0, 3);
    return `${visiblePrefix}${"*".repeat(Math.max(localPart.length - visiblePrefix.length, 4))}@${domain}`;
  }

  if (item.copy) {
    const digits = item.value.replace(/\s+/g, "");
    return `${digits.slice(0, 3)}****${digits.slice(-2)}`;
  }

  return `${item.value.slice(0, 2)}***${item.value.slice(-2)}`;
};

const handleProtectedAction = (item) => {
  emit("protected-action", item);
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
          <strong>{{ getDisplayValue(item) }}</strong>
          <button
            v-if="item.copy && !item.protected"
            type="button"
            class="contact-action"
            @click="handleCopy(item)"
          >
            {{ copiedLabel === item.label ? "Copied" : item.action }}
          </button>
          <button
            v-else-if="item.protected"
            type="button"
            class="contact-action"
            @click="handleProtectedAction(item)"
          >
            {{ item.action }}
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

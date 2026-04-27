<script setup>
import { nextTick, onBeforeUnmount, ref } from "vue";
import SectionHeading from "../SectionHeading.vue";
import Staged from "../Staged.vue";

defineProps({
  about: {
    type: Object,
    required: true
  },
  questions: {
    type: Array,
    default: () => []
  },
  activeQuestion: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(["update:activeQuestion"]);
const isProbeScanning = ref(false);
const probeScanDuration = 2750;

let probeResetTimer = 0;

// 切换问答内容时，仍由父组件统一维护当前激活的问题。
const selectQuestion = (question) => {
  emit("update:activeQuestion", question);
};

// 点击探针后触发一次向下扫描的信号动画。
const triggerProbeScan = async () => {
  if (probeResetTimer) {
    window.clearTimeout(probeResetTimer);
  }

  if (isProbeScanning.value) {
    isProbeScanning.value = false;
    await nextTick();
  }

  isProbeScanning.value = true;

  probeResetTimer = window.setTimeout(() => {
    isProbeScanning.value = false;
  }, probeScanDuration);
};

onBeforeUnmount(() => {
  if (probeResetTimer) {
    window.clearTimeout(probeResetTimer);
  }
});
</script>

<template>
  <section class="section panel" id="about" data-reveal>
    <SectionHeading
      :issue="about.issue"
      :title="about.title"
      :copy="about.copy"
    />

    <div class="about-layout">
      <Staged as="article" class="panel-inset about-story" :order="2">
        <Staged class="about-visual stage-subitem" :order="0">
          <span class="mini-label">{{ about.portraitLabel }}</span>
          <div class="about-frame">
            <button
              type="button"
              :class="['about-probe-shell', { 'is-scanning': isProbeScanning }]"
              aria-label="点击触发信号探针扫描"
              @click="triggerProbeScan"
            >
              <span class="about-probe-beam" aria-hidden="true" />
              <span class="about-probe-sweep" aria-hidden="true" />
              <span class="about-probe-body" aria-hidden="true">
                <span class="about-probe-core" />
                <span class="about-probe-ring about-probe-ring-a" />
                <span class="about-probe-ring about-probe-ring-b" />
                <span class="about-probe-tip" />
              </span>
            </button>
            <div class="about-frame-core" />
            <div class="about-frame-outline" />
            <div class="about-frame-cross" />
          </div>
          <div class="snippet-stack">
            <span v-for="item in about.snippets" :key="item" class="snippet-chip">
              {{ item }}
            </span>
          </div>
        </Staged>

        <div class="story-copy">
          <Staged
            v-for="(paragraph, index) in about.paragraphs"
            :key="paragraph"
            as="p"
            class="stage-subitem"
            :order="1 + index"
          >
            {{ paragraph }}
          </Staged>
        </div>
      </Staged>

      <Staged as="article" class="panel-inset ask-panel" :order="3">
        <Staged class="ask-panel-head stage-subitem" :order="0">
          <p class="mini-label">Ask The Profile</p>
          <span class="status-pill">Interactive</span>
        </Staged>

        <div :key="activeQuestion.id" class="answer-stage stage-subitem stage-swap" :style="{ '--stage-order': 1 }">
          <h3>{{ activeQuestion.prompt }}</h3>
          <p>{{ activeQuestion.answer }}</p>
        </div>

        <div class="question-list">
          <button
            v-for="(item, index) in questions"
            :key="item.id"
            type="button"
            :class="['stage-subitem', 'question-button', { 'is-active': item.id === activeQuestion.id }]"
            :style="{ '--stage-order': 2 + index }"
            @click="selectQuestion(item)"
          >
            <span>{{ item.prompt }}</span>
          </button>
        </div>

        <div class="fact-grid">
          <Staged
            v-for="(item, index) in about.quickFacts"
            :key="item.label"
            as="article"
            class="fact-card stage-subitem"
            :order="6 + index"
          >
            <span>{{ item.label }}</span>
            <strong>{{ item.value }}</strong>
          </Staged>
        </div>
      </Staged>
    </div>
  </section>
</template>

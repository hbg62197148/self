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
const isSpiderDropping = ref(false);
const spiderDropDuration = 2750;

let spiderResetTimer = 0;

// 切换问答内容时，仍由父组件统一维护当前激活的问题。
const selectQuestion = (question) => {
  emit("update:activeQuestion", question);
};

// 点击蜘蛛后触发一次顺滑的吐丝下落动画。
const triggerSpiderDrop = async () => {
  if (spiderResetTimer) {
    window.clearTimeout(spiderResetTimer);
  }

  if (isSpiderDropping.value) {
    isSpiderDropping.value = false;
    await nextTick();
  }

  isSpiderDropping.value = true;

  spiderResetTimer = window.setTimeout(() => {
    isSpiderDropping.value = false;
  }, spiderDropDuration);
};

onBeforeUnmount(() => {
  if (spiderResetTimer) {
    window.clearTimeout(spiderResetTimer);
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
              :class="['about-spider-shell', { 'is-dropping': isSpiderDropping }]"
              aria-label="点击触发蜘蛛吐丝下落"
              @click="triggerSpiderDrop"
            >
              <span class="about-spider-web" aria-hidden="true" />
              <span class="about-spider-body" aria-hidden="true">
                <img
                  class="about-spider"
                  src="/about-spider.svg"
                  alt=""
                  loading="lazy"
                  decoding="async"
                />
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

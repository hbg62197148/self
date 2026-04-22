<script setup>
import SectionHeading from "../SectionHeading.vue";
import Staged from "../Staged.vue";

const props = defineProps({
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

// 切换问答内容时，不直接修改原始问题数组。
const selectQuestion = (question) => {
  emit("update:activeQuestion", question);
};
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
            <div class="about-spider-shell" aria-hidden="true">
              <img
                class="about-spider"
                src="/about-spider.svg"
                alt=""
                loading="lazy"
                decoding="async"
              />
            </div>
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
            {{ item.prompt }}
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

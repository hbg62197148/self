<script setup>
import { ref } from "vue";
import SectionHeading from "../SectionHeading.vue";
import Staged from "../Staged.vue";
import ProfileMapScene from "../visuals/ProfileMapScene.vue";

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
const activeProfileNodeIndex = ref(-1);

// 切换问答内容时，仍由父组件统一维护当前激活的问题。
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
            <ProfileMapScene
              :nodes="about.profileMap?.nodes ?? []"
              :active-index="activeProfileNodeIndex"
            />
            <div class="profile-map-grid" aria-hidden="true" />
            <div class="profile-map-axis profile-map-axis-x" aria-hidden="true">
              <span>{{ about.profileMap?.axisX?.[0] }}</span>
              <span>{{ about.profileMap?.axisX?.[1] }}</span>
            </div>
            <div class="profile-map-axis profile-map-axis-y" aria-hidden="true">
              <span>{{ about.profileMap?.axisY?.[0] }}</span>
              <span>{{ about.profileMap?.axisY?.[1] }}</span>
            </div>
            <div class="profile-core-card">
              <span>{{ about.profileMap?.coreKicker }}</span>
              <strong>{{ about.profileMap?.coreTitle }}</strong>
              <p>{{ about.profileMap?.coreText }}</p>
            </div>
            <div class="profile-orbit profile-orbit-a" aria-hidden="true" />
            <div class="profile-orbit profile-orbit-b" aria-hidden="true" />
            <article
              v-for="(node, index) in about.profileMap?.nodes ?? []"
              :key="node.label"
              :class="['profile-node', `profile-node-${index + 1}`]"
              :style="{ '--node-tone': node.tone }"
              @pointerenter="activeProfileNodeIndex = index"
              @pointerleave="activeProfileNodeIndex = -1"
              @focusin="activeProfileNodeIndex = index"
              @focusout="activeProfileNodeIndex = -1"
            >
              <span>{{ node.label }}</span>
              <small>{{ node.detail }}</small>
            </article>
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
          <p class="mini-label">{{ about.askLabel ?? "Ask The Profile" }}</p>
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

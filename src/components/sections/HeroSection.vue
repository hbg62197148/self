<script setup>
import Staged from "../Staged.vue";
import { useBouncingDisc } from "../../composables/useBouncingDisc";

defineProps({
  hero: {
    type: Object,
    required: true
  },
  nameCn: {
    type: String,
    default: ""
  },
  nameEn: {
    type: String,
    default: ""
  },
  role: {
    type: String,
    default: ""
  }
});

// 让主视觉圆球在卡片内部缓慢漂移，并在触边时反弹。
const { portraitCardRef, portraitDiscRef, portraitDiscStyle } = useBouncingDisc();
</script>

<template>
  <section class="hero panel" id="home" data-reveal>
    <div class="hero-copy">
      <Staged as="p" class="section-kicker" :order="0">
        {{ hero.issue }}
      </Staged>
      <Staged as="p" class="hero-eyebrow" :order="1">
        {{ hero.eyebrow }}
      </Staged>

      <Staged as="h1" class="hero-title" :order="2">
        <span v-for="line in hero.title" :key="line" class="hero-line">
          {{ line }}
        </span>
      </Staged>

      <Staged as="p" class="hero-subtitle" :order="3">
        {{ hero.subtitle }}
      </Staged>

      <Staged class="hero-actions" :order="4">
        <a class="button button-primary" :href="hero.primaryCta.href">
          {{ hero.primaryCta.label }}
        </a>
        <a class="button button-secondary" :href="hero.secondaryCta.href">
          {{ hero.secondaryCta.label }}
        </a>
      </Staged>

      <div class="hero-stats">
        <Staged
          v-for="(item, index) in hero.stats"
          :key="item.label"
          as="article"
          class="stat-card"
          :order="5 + index"
        >
          <span>{{ item.label }}</span>
          <strong>{{ item.value }}</strong>
        </Staged>
      </div>
    </div>

    <div class="hero-stage">
      <Staged class="portrait-shell" :order="2">
        <div ref="portraitCardRef" class="portrait-card">
          <div class="portrait-glow portrait-glow-one" />
          <div class="portrait-glow portrait-glow-two" />
          <div class="portrait-grid" />
          <div ref="portraitDiscRef" class="portrait-disc" :style="portraitDiscStyle" />
          <div class="portrait-plate">
            <span>{{ nameCn }}</span>
            <strong>{{ nameEn }}</strong>
          </div>
        </div>
        <div class="floating-pill floating-pill-top">{{ role }}</div>
      </Staged>

      <Staged as="aside" class="hero-sidecard" :order="6">
        <p class="mini-label">Profile Pulse</p>
        <h2>{{ role }}</h2>
        <p class="hero-summary">{{ hero.summary }}</p>

        <div class="tag-strip">
          <span v-for="item in hero.tags" :key="item" class="tag-chip">
            {{ item }}
          </span>
        </div>
      </Staged>
    </div>
  </section>
</template>
